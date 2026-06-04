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

if (failures.length > 0) {
  console.error('[check-regressions] failures:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[check-regressions] ok');
