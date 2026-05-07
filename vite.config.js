import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import Sitemap from 'vite-plugin-sitemap';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const albumData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './src/data/albums.json'), 'utf-8')
);

/**
 * Return the most recent commit date (ISO) across a list of files.
 * Falls back to "now" if git isn't available (e.g. fresh clone without
 * history, or running in an export tarball).
 */
function latestCommitDate(files) {
  try {
    const dates = files
      .map((f) => {
        try {
          return execFileSync('git', ['log', '-1', '--format=%cI', '--', f], {
            cwd: __dirname,
            encoding: 'utf-8',
          }).trim();
        } catch {
          return '';
        }
      })
      .filter(Boolean)
      .map((s) => new Date(s))
      .filter((d) => !Number.isNaN(d.getTime()));
    const latest = dates.length === 0
      ? new Date()
      : new Date(Math.max(...dates.map((d) => d.getTime())));
    // Return ISO date string (YYYY-MM-DD) — plugin handles Date objects
    // inconsistently across versions, while a plain string always renders.
    return latest.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

// Per-route source files that should drive <lastmod>. Each route's
// freshness reflects when its actual content or template last changed.
const routeSources = {
  '/': ['src/pages/MainPage.jsx', 'index.html'],
  '/album': ['src/pages/AlbumPage.jsx', 'src/data/albums.json'],
  '/artist': ['src/pages/ArtistPage.jsx'],
  '/events': ['src/pages/EventsPage.jsx', 'src/data/events.json'],
  '/gallery': ['src/pages/GalleryPage.jsx'],
  '/media': ['src/pages/MediaPage.jsx', 'src/data/media.json'],
  '/contact': ['src/pages/ContactPage.jsx'],
  '/privacy': ['src/pages/PrivacyPolicyPage.jsx'],
  '/terms': ['src/pages/TermsOfServicePage.jsx'],
};
const trackLastmodSources = ['src/pages/TrackDetailPage.jsx', 'src/data/albums.json'];

// Note: '/' is emitted automatically by the plugin from index.html, so we
// only list additional routes here to avoid a duplicate <url> entry.
const staticRoutes = [
  '/album',
  '/artist',
  '/events',
  '/gallery',
  '/media',
  '/contact',
  '/privacy',
  '/terms',
];

const trackRoutes = albumData.album.tracks.map((t) => `/album/track/${t.id}`);

// Per-route priority. Higher = more important to the site's SEO goals.
const priorityMap = {
  '/': 1.0,
  '/album': 0.9,
  '/artist': 0.9,
  '/events': 0.8,
  '/media': 0.6,
  '/gallery': 0.6,
  '/contact': 0.5,
  '/privacy': 0.3,
  '/terms': 0.3,
  ...Object.fromEntries(trackRoutes.map((r) => [r, 0.7])),
};

const changefreqMap = {
  '/': 'weekly',
  '/album': 'monthly',
  '/artist': 'monthly',
  '/events': 'weekly',
  '/media': 'weekly',
  '/gallery': 'monthly',
  '/contact': 'yearly',
  '/privacy': 'yearly',
  '/terms': 'yearly',
  ...Object.fromEntries(trackRoutes.map((r) => [r, 'monthly'])),
};

const lastmodMap = {
  ...Object.fromEntries(
    Object.entries(routeSources).map(([route, files]) => [route, latestCommitDate(files)])
  ),
  ...Object.fromEntries(trackRoutes.map((r) => [r, latestCommitDate(trackLastmodSources)])),
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [
      react(),
      Sitemap({
        hostname: 'https://dystopia2025.kr/',
        dynamicRoutes: [...staticRoutes, ...trackRoutes],
        changefreq: changefreqMap,
        priority: priorityMap,
        lastmod: lastmodMap,
        readable: true,
        exclude: ['/404'],
        generateRobotsTxt: false,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      rollupOptions: {
        output: {
          // Splitting heavy vendors into stable chunks improves cache
          // hit-rate across deploys and lets the browser parallelize
          // download/parse with the (small) app shell.
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion': ['framer-motion'],
            'helmet': ['react-helmet-async'],
          },
        },
      },
    },
  }

  // Base path is '/' by default, which works for both dev and custom domain deployment
  
  return config
})
