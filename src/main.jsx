import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';

const rootEl = document.getElementById('root');

// `scripts/snapshot-routes.mjs` writes the fully-rendered DOM into the
// root div at build time so non-JS crawlers (Naver, Kakao, LinkedIn,
// most LLM scrapers) and the browser's first paint both see real content
// instead of an empty shell. We deliberately use `createRoot`, not
// `hydrateRoot`: the framer-motion components scattered across the pages
// each apply their own `initial={{ opacity: 0, ... }}` styles on mount,
// and there is no clean global way to skip those initial states only
// during hydration. Trying to hydrate against the post-animation DOM
// triggers React error #418 on every mismatched motion component, after
// which React falls back to a full client render anyway. By committing
// to `createRoot` up front we get the same final UX (one quick re-render
// after JS arrives) without the console noise, while still keeping the
// SEO/LCP win from the prerendered markup.
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
