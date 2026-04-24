#!/usr/bin/env node
/**
 * Re-encodes every public/audio/*.mp3 into a 128kbps AAC sibling (.m4a).
 *
 * The originals are 320kbps mp3 with embedded cover art; AAC at 128kbps
 * is perceptually equivalent for spoken word + electronic music, and the
 * resulting files run roughly 40% the size. We strip embedded artwork
 * because the album cover is already served separately at /images/hero.*
 *
 * Outputs are skipped when newer than the source. Run manually with:
 *   npm run optimize-audio
 *
 * The AudioPlayer prefers <source type="audio/mp4"> first and falls
 * back to the original mp3, so any browser without AAC support (none
 * in practice) still plays the song.
 */
import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.resolve(__dirname, '../public/audio');
const BITRATE = '128k';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-400)}`));
    });
  });
}

async function isStale(srcPath, outPath) {
  if (!existsSync(outPath)) return true;
  const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
  return s.mtimeMs > o.mtimeMs;
}

async function main() {
  if (!existsSync(AUDIO_DIR)) {
    console.error(`[optimize-audio] missing ${AUDIO_DIR}`);
    process.exit(1);
  }

  const entries = await readdir(AUDIO_DIR, { withFileTypes: true });
  const mp3s = entries
    .filter((e) => e.isFile() && /\.mp3$/i.test(e.name))
    .map((e) => path.join(AUDIO_DIR, e.name));

  let written = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const src of mp3s) {
    const out = src.replace(/\.mp3$/i, '.m4a');
    if (!(await isStale(src, out))) { skipped++; continue; }

    // -vn drops the embedded artwork stream; -ac 2 forces stereo;
    // -movflags +faststart puts the moov atom at the front so playback
    // can start streaming before the file is fully downloaded.
    await run('ffmpeg', [
      '-y',
      '-i', src,
      '-vn',
      '-c:a', 'aac',
      '-b:a', BITRATE,
      '-ac', '2',
      '-movflags', '+faststart',
      out,
    ]);

    const [sStat, oStat] = await Promise.all([stat(src), stat(out)]);
    savedBytes += sStat.size - oStat.size;
    const pct = Math.round((1 - oStat.size / sStat.size) * 100);
    console.log(`[optimize-audio] ${path.basename(src)}: ${(sStat.size/1e6).toFixed(1)}MB → ${(oStat.size/1e6).toFixed(1)}MB (-${pct}%)`);
    written++;
  }

  console.log(`[optimize-audio] wrote ${written}, skipped ${skipped}, saved ${(savedBytes/1e6).toFixed(1)}MB`);
}

main().catch((err) => {
  console.error('[optimize-audio] failed', err);
  process.exit(1);
});
