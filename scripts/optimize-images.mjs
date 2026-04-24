#!/usr/bin/env node
/**
 * Generates AVIF + WebP siblings for every JPG/PNG under public/images and
 * src/assets/images. The hero image additionally gets responsive width
 * variants for use in <picture srcset>. Originals are kept untouched so
 * nothing breaks for clients that don't request next-gen formats.
 *
 * Re-run is cheap: existing outputs that are newer than their source are
 * skipped (mtime check).
 */
import { readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  path.join(ROOT, 'public/images'),
  path.join(ROOT, 'src/assets/images'),
];

// Files that benefit from responsive variants. Path is relative to ROOT.
const RESPONSIVE = {
  'public/images/hero.jpg': [768, 1280, 1920],
};

const QUALITY = { webp: 82, avif: 55 };

async function listImages(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await listImages(full)));
    } else if (/\.(jpe?g|png)$/i.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

async function isStale(srcPath, outPath) {
  if (!existsSync(outPath)) return true;
  const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
  return s.mtimeMs > o.mtimeMs;
}

async function ensureDir(p) {
  await mkdir(path.dirname(p), { recursive: true });
}

async function transcode(srcPath, outPath, format) {
  if (!(await isStale(srcPath, outPath))) return false;
  await ensureDir(outPath);
  const pipeline = sharp(srcPath);
  if (format === 'webp') await pipeline.webp({ quality: QUALITY.webp }).toFile(outPath);
  if (format === 'avif') await pipeline.avif({ quality: QUALITY.avif }).toFile(outPath);
  return true;
}

async function resizeAndTranscode(srcPath, outPath, width, format) {
  if (!(await isStale(srcPath, outPath))) return false;
  await ensureDir(outPath);
  const pipeline = sharp(srcPath).resize({ width, withoutEnlargement: true });
  if (format === 'webp') await pipeline.webp({ quality: QUALITY.webp }).toFile(outPath);
  if (format === 'avif') await pipeline.avif({ quality: QUALITY.avif }).toFile(outPath);
  if (format === 'jpg')  await pipeline.jpeg({ quality: 80, mozjpeg: true }).toFile(outPath);
  return true;
}

function withSuffix(srcPath, suffix, ext) {
  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath, path.extname(srcPath));
  return path.join(dir, `${base}${suffix}.${ext}`);
}

async function main() {
  const sources = (await Promise.all(TARGETS.map(listImages))).flat();
  let written = 0;
  let skipped = 0;

  for (const src of sources) {
    for (const fmt of ['webp', 'avif']) {
      const out = src.replace(/\.(jpe?g|png)$/i, `.${fmt}`);
      const did = await transcode(src, out, fmt);
      did ? written++ : skipped++;
    }

    const rel = path.relative(ROOT, src).replaceAll(path.sep, '/');
    const widths = RESPONSIVE[rel];
    if (widths) {
      for (const w of widths) {
        for (const fmt of ['webp', 'avif', 'jpg']) {
          const out = withSuffix(src, `-${w}`, fmt);
          const did = await resizeAndTranscode(src, out, w, fmt);
          did ? written++ : skipped++;
        }
      }
    }
  }

  console.log(`[optimize-images] wrote ${written}, skipped ${skipped}`);
}

main().catch((err) => {
  console.error('[optimize-images] failed', err);
  process.exit(1);
});
