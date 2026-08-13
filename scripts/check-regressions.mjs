#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const failures = [];

const read = (file) => fs.readFileSync(file, 'utf-8');
const exists = (file) => fs.existsSync(file) && fs.statSync(file).size > 0;
const fail = (message) => failures.push(message);

const extractJsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (match) => JSON.parse(match[1])
  );

const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const albumHtml = read('dist/album/index.html');
const albumH1Count = (albumHtml.match(/<h1\b/g) || []).length;
if (albumH1Count !== 1) {
  fail(`album page should have exactly one h1, found ${albumH1Count}`);
}

const notFoundHtml = read('dist/404.html');
const notFoundText = stripTags(notFoundHtml);
if (!notFoundText.includes('페이지를 찾을 수 없습니다') || notFoundText.length < 100) {
  fail('404.html should contain visible not-found content for non-JS users');
}
if (/<meta[^>]+property="og:url"/.test(notFoundHtml)) {
  fail('404.html should not advertise /404 via og:url');
}

const faqData = JSON.parse(read('src/data/faq.json'));
const contactHtml = read('dist/contact/index.html');
const faqJsonLd = extractJsonLd(contactHtml).find((schema) => schema['@type'] === 'FAQPage');
const schemaQuestions = (faqJsonLd?.mainEntity || []).map((item) => item.name);
const visibleQuestions = faqData.map((item) => item.question);
if (JSON.stringify(schemaQuestions) !== JSON.stringify(visibleQuestions)) {
  fail('contact FAQ JSON-LD questions should match src/data/faq.json');
}

const events = JSON.parse(read('src/data/events.json')).events;
for (const event of events) {
  if (event.image && !exists(path.join('public', event.image))) {
    fail(`event image does not exist: ${event.image}`);
  }
}

const trackHtml = read('dist/album/track/track1/index.html');
for (const label of ['재생', '음소거', '볼륨']) {
  if (!trackHtml.includes(label)) {
    fail(`track audio player should expose ${label} label text`);
  }
}

const footerInputRegex = /<footer[\s\S]*<input[^>]+type="email"[^>]*(aria-label=|id=)/;
if (!footerInputRegex.test(read('dist/index.html'))) {
  fail('footer newsletter email input should have a label or aria-label');
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : file;
  });

const runtimeConsoleLogs = walk('src')
  .filter((file) => /\.(jsx?|tsx?)$/.test(file))
  .filter((file) => /\bconsole\.log\s*\(/.test(read(file)));

if (runtimeConsoleLogs.length > 0) {
  fail(`runtime source should not contain console.log: ${runtimeConsoleLogs.join(', ')}`);
}

// The intro splash used to be skipped entirely on prerendered routes, which
// meant it never played on the deployed site. It now overlays the app instead:
// the Router mounts immediately so the prerendered LCP candidate still paints,
// and the splash sits on top of it.
const appSource = read('src/App.jsx');
if (!/<LoadingScreen\b/.test(appSource)) {
  fail('App should still render the intro LoadingScreen');
}
if (/!wasPrerendered\.current/.test(appSource)) {
  fail('intro splash should not be disabled on prerendered routes');
}
if (/\{!initialLoading && \(?\s*<Router/.test(appSource)) {
  fail('Router should mount during the intro splash so the LCP candidate paints behind it');
}
if (!/inert=/.test(appSource)) {
  fail('app content behind the intro splash should be inert so it stays out of tab order');
}

// The scramble backdrop is a full-viewport character grid. A pre-allocation
// pass once filled it with NUL placeholders and never wrote the per-row line
// breaks, collapsing the whole effect onto a single visible line.
const loadingScreenSource = read('src/components/LoadingScreen.jsx');
if (/'\\0'\.repeat/.test(loadingScreenSource)) {
  fail('scramble buffer should hold real characters, not NUL placeholders');
}
if (!/'\\n'/.test(loadingScreenSource)) {
  fail('scramble buffer should terminate each row with a line break so it fills the viewport');
}

if (failures.length > 0) {
  console.error('[check-regressions] failures:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[check-regressions] ok');
