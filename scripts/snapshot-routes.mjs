#!/usr/bin/env node
/**
 * Static-Site Generation step. After `vite build` and `prerender-meta.mjs`
 * run, the per-route `dist/<route>/index.html` files contain correct meta
 * tags + JSON-LD but their <body> is just an empty <div id="root"></div>.
 *
 * This script spins up `vite preview`, drives a headless Chromium through
 * each route in `route-meta.mjs`, captures the fully-rendered DOM, and
 * inlines it back into the corresponding HTML file so non-JS crawlers
 * (Naver, Kakao, LinkedIn, LLM scrapers) see the actual content rather
 * than an empty shell.
 *
 * Real users still hit the same files. `main.jsx` uses `createRoot`, so
 * React replaces the prerendered DOM with its own render once the JS
 * bundle arrives; the snapshot earns SEO/LCP wins (crawlers and the
 * browser's first paint both see real content) at the cost of one quick
 * client re-render. Hydration was tried but every page is full of
 * `motion.div initial={{ opacity: 0, ... }}` instances that mismatch the
 * post-animation DOM the snapshot captures, so React error #418 fires
 * across the board and falls back to client rendering anyway. App.jsx
 * compresses those framer-motion enter animations to zero duration on
 * the first paint via `reducedMotion="always"`, so the visible flicker
 * between snapshot and React render is minimised.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import puppeteer from 'puppeteer';
import { routes } from './route-meta.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

async function main() {
  // Programmatic vite preview avoids juggling a separate static-server dep
  // and inherits the project's existing build config.
  const server = await preview({
    root: ROOT,
    preview: { port: 4173, strictPort: false, host: '127.0.0.1' },
    build: { outDir: 'dist' },
  });
  const address = server.httpServer.address();
  const port = typeof address === 'object' && address ? address.port : 4173;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const failures = [];
  let processed = 0;

  try {
    for (const meta of routes) {
      const page = await browser.newPage();
      const targetUrl = `${baseUrl}${meta.path}`;
      try {
        await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait until the page is fully settled:
        //   1. AppContent mounted (Header rendered)
        //   2. Intro LoadingScreen is gone (its signature `.circuit-bg`
        //      background element is removed when the splash exits — without
        //      this check we'd capture mid-exit-animation frames where the
        //      splash still overlays the content)
        //   3. Suspense lazy-route fallback ("Loading Page...") resolved
        await page.waitForFunction(
          () => {
            const root = document.getElementById('root');
            if (!root) return false;
            if (!root.querySelector('header')) return false;
            if (root.querySelector('.circuit-bg')) return false;
            return !root.textContent.includes('Loading Page...');
          },
          { timeout: 25000 }
        );

        // Buffer for framer-motion's per-page enter transition to settle.
        await new Promise((r) => setTimeout(r, 600));

        const rootContent = await page.evaluate(() => {
          const el = document.getElementById('root');
          return el ? el.innerHTML : '';
        });

        if (!rootContent || rootContent.length < 200) {
          throw new Error(`captured root content too small (${rootContent.length} bytes)`);
        }

        const outPath =
          meta.path === '/'
            ? path.join(DIST, 'index.html')
            : path.join(DIST, meta.path.replace(/^\//, ''), 'index.html');

        const html = await fs.readFile(outPath, 'utf-8');
        if (!html.includes('<div id="root"></div>')) {
          throw new Error(`no empty root div found in ${outPath}`);
        }
        const updated = html.replace(
          '<div id="root"></div>',
          `<div id="root">${rootContent}</div>`
        );
        await fs.writeFile(outPath, updated, 'utf-8');
        processed++;
      } catch (e) {
        failures.push({ path: meta.path, error: e.message });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
  }

  if (failures.length > 0) {
    console.error('[snapshot-routes] failures:');
    for (const f of failures) console.error(`  ${f.path}: ${f.error}`);
    process.exit(1);
  }

  console.log(`[snapshot-routes] hydrated ${processed} routes with rendered HTML`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
