import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, MotionConfig } from 'framer-motion';

// Static Components
import Header from './components/Header'; // Keep static imports for always visible components
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary
import ScrollToTop from './components/ScrollToTop'; // Import ScrollToTop

// Dynamically import page components
const MainPage = lazy(() => import('./pages/MainPage'));
const AlbumPage = lazy(() => import('./pages/AlbumPage'));
const TrackDetailPage = lazy(() => import('./pages/TrackDetailPage'));
const ArtistPage = lazy(() => import('./pages/ArtistPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const MediaPage = lazy(() => import('./pages/MediaPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage')); // Import Privacy Policy Page
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage')); // Import Terms of Service Page

// Simple fallback component for Suspense
const RouteFallback = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
    {/* Changed text color to cyan */}
    <div className="text-accent-cyan animate-pulse">Loading Page...</div>
  </div>
);

// Define page transition variants. The chromatic-aberration SVG filter is
// expensive on mobile (forces the entire layer through a multi-pass color
// matrix) so we drop it under prefers-reduced-motion and keep just the
// fade. The animated variant set is selected at render time.
const buildPageTransition = (reduceMotion) => ({
  initial: {
    opacity: 0,
    filter: reduceMotion ? 'none' : 'url(#chromatic-aberration)',
  },
  animate: {
    opacity: 1,
    filter: 'none',
    transition: { duration: reduceMotion ? 0.2 : 0.5, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    filter: reduceMotion ? 'none' : 'url(#chromatic-aberration)',
    transition: { duration: reduceMotion ? 0.15 : 0.3, ease: 'easeIn' }
  }
});

// Main App component structure
function AppContent() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const pageTransitionVariants = buildPageTransition(reduceMotion);

  return (
    // Ensure the outer div takes full height
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Removed Scanline Overlay Div */}

      <Header />

      {/* Let main grow naturally */}
      <main className="flex-grow">
        <ErrorBoundary> {/* Wrap Suspense with ErrorBoundary */}
          <Suspense fallback={<RouteFallback />}>
            {/* AnimatePresence initial={false} skips the enter animation on
                the very first render so that hydration sees the same end-
                state styles (opacity:1, filter:none) the snapshot captured.
                Without this, framer-motion would briefly apply the "initial"
                variant (opacity:0, chromatic filter) on mount, mismatch the
                prerendered DOM, and trigger React error #418. Subsequent
                client-side navigations still animate normally because by
                then AnimatePresence is past its initial render. */}
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              className="flex-grow" // Added flex-grow
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              // Removed flex-grow, let content dictate height within flex-grow main
            >
              {/* Routes are direct child */}
              <Routes location={location}>
                <Route path="/" element={<MainPage />} />
                <Route path="/album" element={<AlbumPage />} />
                <Route path="/album/track/:trackId" element={<TrackDetailPage />} />
                <Route path="/artist" element={<ArtistPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/media" element={<MediaPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} /> {/* Add Privacy Policy Route */}
                <Route path="/terms" element={<TermsOfServicePage />} /> {/* Add Terms of Service Route */}
                  {/* Add a 404 or fallback route if needed */}
                  {/* <Route path="*" element={<NotFoundPage />} /> */}
                </Routes>
              {/* Removed extra closing div */}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
      </main>

      <Footer />

      {/* SVG Filter Definition for Chromatic Aberration. Skipped entirely
          under prefers-reduced-motion since nothing references it. */}
      {!reduceMotion && (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <filter id="chromatic-aberration">
              <feColorMatrix type="matrix" result="red_" in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feOffset in="red_" dx="-3" dy="0" result="red" />
              <feColorMatrix type="matrix" result="green_" in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feOffset in="green_" dx="0" dy="0" result="green" />
              <feColorMatrix type="matrix" result="blue_" in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
              <feOffset in="blue_" dx="3" dy="0" result="blue" />
              <feBlend mode="screen" in="red" in2="green" result="blend1" />
              <feBlend mode="screen" in="blend1" in2="blue" />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  );
}


function App() {
  // Skip the intro splash on prerendered routes — the content is already
  // baked into the HTML by `scripts/snapshot-routes.mjs`, so playing a
  // loader on top would only obscure visible content with a black overlay.
  // Detect via the root having children: the snapshot inlines them at
  // build time, while a fresh container (dev server, non-prerendered
  // route) still has an empty root.
  const wasPrerendered = useRef(
    typeof document !== 'undefined' &&
      !!document.getElementById('root') &&
      document.getElementById('root').children.length > 0
  );
  const [initialLoading, setInitialLoading] = useState(() => !wasPrerendered.current);

  // Compress the framer-motion enter animations to zero duration on the
  // first React paint of a prerendered route. createRoot still discards
  // the prerendered DOM and re-renders, so without this every motion
  // component would briefly snap from its `initial` variant (opacity:0,
  // y:30, scale:0.9, etc.) before animating in — a visible flicker between
  // the painted snapshot and the React-rendered output. `reducedMotion`
  // makes those transforms skip and opacity transitions go instantly to
  // the animate state, so the React frame matches the snapshot frame.
  // After the first commit we flip back so navigations within the SPA
  // animate as designed.
  const [staticFirstPaint, setStaticFirstPaint] = useState(wasPrerendered.current);
  useEffect(() => {
    if (staticFirstPaint) {
      const id = requestAnimationFrame(() => setStaticFirstPaint(false));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [staticFirstPaint]);

  // Hard cap so the intro can never exceed ~1.6s, even if LoadingScreen's
  // internal progress timer is throttled (background tab, slow CPU). The
  // normal flow ends via onLoadingComplete; this is just a safety net.
  useEffect(() => {
    if (!initialLoading) return undefined;
    const timer = setTimeout(() => setInitialLoading(false), 1600);
    return () => clearTimeout(timer);
  }, [initialLoading]);

  return (
    <MotionConfig reducedMotion={staticFirstPaint ? 'always' : 'user'}>
      <AnimatePresence>
        {initialLoading && <LoadingScreen onLoadingComplete={() => setInitialLoading(false)} />}
      </AnimatePresence>

      {!initialLoading && (
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      )}
    </MotionConfig>
  );
}

export default App;
