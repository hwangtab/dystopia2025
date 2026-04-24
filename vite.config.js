import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Sitemap from 'vite-plugin-sitemap';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const albumData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './src/data/albums.json'), 'utf-8')
);

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

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [
      react(),
      Sitemap({
        hostname: 'https://www.dystopia2025.kr/',
        dynamicRoutes: [...staticRoutes, ...trackRoutes],
        changefreq: changefreqMap,
        priority: priorityMap,
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
