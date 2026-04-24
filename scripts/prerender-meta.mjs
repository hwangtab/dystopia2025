#!/usr/bin/env node
/**
 * Lightweight prerender: writes per-route index.html copies with the
 * correct <title>, <meta description>, <meta og:*>, <link canonical> and
 * <meta twitter:*> baked into the static HTML.
 *
 * Why not a real SSR/SSG? React Helmet already rewrites these tags on the
 * client, which is enough for Google (it runs JS). But non-JS crawlers —
 * Facebook, LinkedIn, Kakao, Slack, Naver, etc. — only read the raw HTML
 * they get back. By emitting route-specific HTML files at build time,
 * those crawlers see the right preview without bringing in Puppeteer.
 *
 * GitHub Pages serves `/<route>/index.html` when the URL is `/<route>`,
 * so the React app still boots from the same bundle and takes over.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes, SITE } from './route-meta.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Replace a single attribute value inside a tag. Matches the *first*
 * occurrence that also contains the given anchor string, so we don't
 * accidentally rewrite unrelated tags.
 */
function replaceAttr(html, anchorRegex, attr, value) {
  return html.replace(anchorRegex, (tag) =>
    tag.replace(new RegExp(`${attr}="[^"]*"`), `${attr}="${escape(value)}"`)
  );
}

function rewrite(templateHtml, meta) {
  const canonical = `${SITE.url}${meta.path === '/' ? '/' : meta.path}`;
  let html = templateHtml;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`);

  // <meta name="description">
  html = replaceAttr(
    html,
    /<meta[^>]*name="description"[^>]*>/,
    'content',
    meta.description
  );

  // <link rel="canonical">
  html = replaceAttr(
    html,
    /<link[^>]*rel="canonical"[^>]*>/,
    'href',
    canonical
  );

  // og:title / og:description / og:url / og:type
  html = replaceAttr(html, /<meta[^>]*property="og:title"[^>]*>/, 'content', meta.title);
  html = replaceAttr(
    html,
    /<meta[^>]*property="og:description"[^>]*>/,
    'content',
    meta.description
  );
  html = replaceAttr(html, /<meta[^>]*property="og:url"[^>]*>/, 'content', canonical);
  html = replaceAttr(html, /<meta[^>]*property="og:type"[^>]*>/, 'content', meta.ogType);

  // og:image & siblings
  html = replaceAttr(html, /<meta[^>]*property="og:image"(?![:])[^>]*>/, 'content', meta.og.url);
  html = replaceAttr(
    html,
    /<meta[^>]*property="og:image:width"[^>]*>/,
    'content',
    String(meta.og.width)
  );
  html = replaceAttr(
    html,
    /<meta[^>]*property="og:image:height"[^>]*>/,
    'content',
    String(meta.og.height)
  );
  html = replaceAttr(
    html,
    /<meta[^>]*property="og:image:type"[^>]*>/,
    'content',
    meta.og.type
  );
  html = replaceAttr(
    html,
    /<meta[^>]*property="og:image:alt"[^>]*>/,
    'content',
    meta.og.alt
  );

  // twitter:*
  html = replaceAttr(
    html,
    /<meta[^>]*name="twitter:card"[^>]*>/,
    'content',
    meta.og.twitterCard
  );
  html = replaceAttr(html, /<meta[^>]*name="twitter:title"[^>]*>/, 'content', meta.title);
  html = replaceAttr(
    html,
    /<meta[^>]*name="twitter:description"[^>]*>/,
    'content',
    meta.description
  );
  html = replaceAttr(
    html,
    /<meta[^>]*name="twitter:image"(?![:])[^>]*>/,
    'content',
    meta.og.url
  );
  html = replaceAttr(
    html,
    /<meta[^>]*name="twitter:image:alt"[^>]*>/,
    'content',
    meta.og.alt
  );

  return html;
}

// HTML comments are stripped before rewriting so the meta-matching regexes
// can't accidentally anchor on a commented-out tag (e.g. if someone leaves
// `<!-- <meta property="og:title" content="draft" /> -->` in index.html,
// replaceAttr would otherwise rewrite the first match — the commented one).
// The comments are developer-only; removing them from production HTML is
// harmless and shaves a few bytes.
const stripHtmlComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

async function main() {
  const templatePath = path.join(DIST, 'index.html');
  const rawTemplate = await fs.readFile(templatePath, 'utf-8');
  const template = stripHtmlComments(rawTemplate);

  let written = 0;
  for (const meta of routes) {
    const html = rewrite(template, meta);
    // '/' → dist/index.html (overwrite with canonicalized values)
    // '/album' → dist/album/index.html
    // '/album/track/track1' → dist/album/track/track1/index.html
    const outPath =
      meta.path === '/'
        ? path.join(DIST, 'index.html')
        : path.join(DIST, meta.path.replace(/^\//, ''), 'index.html');

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, html, 'utf-8');
    written++;
  }

  // Replace 404.html with a minimal, noindex version that still boots the
  // SPA (so deep links keep working on GitHub Pages) but doesn't leak a
  // duplicate of the homepage into the index.
  const notFound = rewrite(template, {
    path: '/404',
    title: '페이지를 찾을 수 없습니다 | 삼각전파사',
    description: '요청하신 페이지를 찾을 수 없습니다.',
    ogType: 'website',
    og: {
      url: `${SITE.url}/images/hero.jpg`,
      width: 1181,
      height: 1181,
      alt: '삼각전파사 Dystopia 2025',
      type: 'image/jpeg',
      twitterCard: 'summary',
    },
  }).replace(
    /<meta name="robots"[^>]*>/,
    '<meta name="robots" content="noindex, follow" />'
  );
  await fs.writeFile(path.join(DIST, '404.html'), notFound, 'utf-8');

  console.log(`[prerender-meta] wrote ${written} route html files + 404.html`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
