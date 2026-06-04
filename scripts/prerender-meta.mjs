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
    // Function replacement: a literal string replacement would treat `$` in the
    // escaped value as a special pattern ($&, $1, ...). escape() doesn't encode
    // `$`, so a value containing it would corrupt the attribute.
    tag.replace(new RegExp(`${attr}="[^"]*"`), () => `${attr}="${escape(value)}"`)
  );
}

function rewrite(templateHtml, meta) {
  const canonical = `${SITE.url}${meta.path === '/' ? '/' : meta.path}`;
  let html = templateHtml;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${escape(meta.title)}</title>`);

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

  // Inject per-route JSON-LD directly before </head>. Non-JS crawlers
  // (LinkedIn, Naver, most LLM scrapers) only parse raw HTML, so shipping
  // structured data purely via Helmet at runtime is invisible to them.
  // The `</` inside a JSON string is escaped to avoid prematurely closing
  // the <script> element per the HTML spec.
  if (Array.isArray(meta.jsonLd) && meta.jsonLd.length > 0) {
    const scripts = meta.jsonLd
      .map((schema) => {
        const body = JSON.stringify(schema).replace(/<\/(script)/gi, '<\\/$1');
        return `<script type="application/ld+json">${body}</script>`;
      })
      .join('\n    ');
    // Regex literal (not a global flag) replaces only the first </head>,
    // making the single-match behaviour explicit rather than implicit.
    html = html.replace(/<\/head>/, () => `    ${scripts}\n  </head>`);
  }

  return html;
}

// HTML comments are stripped before rewriting so the meta-matching regexes
// can't accidentally anchor on a commented-out tag (e.g. if someone leaves
// `<!-- <meta property="og:title" content="draft" /> -->` in index.html,
// replaceAttr would otherwise rewrite the first match — the commented one).
// The comments are developer-only; removing them from production HTML is
// harmless and shaves a few bytes.
// Remove HTML comments along with the surrounding whitespace so that
// deleted blocks don't leave empty lines behind.
const stripHtmlComments = (html) =>
  html.replace(/[ \t]*<!--[\s\S]*?-->[ \t]*\n?/g, '');

async function main() {
  const templatePath = path.join(DIST, 'index.html');
  const rawTemplate = await fs.readFile(templatePath, 'utf-8');
  const template = stripHtmlComments(rawTemplate);
  const notFoundRoot = `
    <div class="flex flex-col min-h-screen bg-primary">
      <header class="fixed top-0 left-0 right-0 z-50 bg-primary-dark/80 py-3 border-b border-accent-blue/30">
        <div class="container-custom mx-auto px-4 flex justify-between items-center">
          <a href="/" class="flex items-center">
            <span class="text-2xl font-blender text-white"><span class="text-accent-magenta">DYSTOPIA</span><span class="text-accent-blue">2025</span></span>
          </a>
        </div>
      </header>
      <main class="flex-grow min-h-screen pt-24 pb-16">
        <div class="container-custom mx-auto py-24 text-center">
          <p class="text-accent-magenta font-blender text-sm tracking-wider mb-4">404</p>
          <h1 class="text-3xl md:text-5xl font-blender mb-6">페이지를 찾을 수 없습니다</h1>
          <p class="text-gray-300 max-w-xl mx-auto mb-8 break-keep">요청하신 주소가 존재하지 않거나 이동되었습니다. 앨범과 공연 정보는 아래 링크에서 다시 확인할 수 있습니다.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/" class="btn-primary">홈으로 돌아가기</a>
            <a href="/album" class="btn-secondary">앨범 보기</a>
          </div>
        </div>
      </main>
    </div>`;

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
  })
    .replace('<div id="root"></div>', `<div id="root">${notFoundRoot}</div>`)
    // Both robots and googlebot must say noindex — leaving googlebot as
    // "index, follow" creates a conflicting directive that Search Console
    // flags.
    .replace(
      /<meta name="robots"[^>]*>/,
      '<meta name="robots" content="noindex, follow" />'
    )
    .replace(
      /<meta name="googlebot"[^>]*>/,
      '<meta name="googlebot" content="noindex, follow" />'
    )
    // GitHub Pages serves 404.html for any unknown path. A self-canonical
    // pointing at "/404" would invite Google to index that phantom URL.
    // Drop the canonical entirely for this file so nothing consolidates
    // toward it.
    .replace(/\s*<link[^>]*rel="canonical"[^>]*>/, '')
    .replace(/\s*<meta[^>]*property="og:url"[^>]*>/, '');
  await fs.writeFile(path.join(DIST, '404.html'), notFound, 'utf-8');

  // Trim millisecond precision from sitemap <lastmod>. The plugin accepts
  // our YYYY-MM-DD inputs but re-serialises via Date#toISOString, which
  // emits `.000Z`. Strict sitemap validators warn on that, so we strip it.
  const sitemapPath = path.join(DIST, 'sitemap.xml');
  try {
    const xml = await fs.readFile(sitemapPath, 'utf-8');
    const cleaned = xml.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d{3}Z/g, '$1Z');
    if (cleaned !== xml) {
      await fs.writeFile(sitemapPath, cleaned, 'utf-8');
    }
  } catch {
    // Sitemap may not exist during partial builds; non-fatal.
  }

  console.log(`[prerender-meta] wrote ${written} route html files + 404.html`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
