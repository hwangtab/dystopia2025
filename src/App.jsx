import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';

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

// Main App component structure
function AppContent() {
  const location = useLocation();

  const pageTransitionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    // Ensure the outer div takes full height
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Removed Scanline Overlay Div */}

      <Header />

      {/* Let main grow naturally */}
      <main className="flex-grow">
        <ErrorBoundary> {/* Wrap Suspense with ErrorBoundary */}
          <Suspense fallback={<RouteFallback />}>
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              className="flex-grow"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
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
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                </Routes>
            </motion.div>
            </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}


function App() {
  // Skip the intro splash on prerendered routes — the content is already
  // baked into the HTML by `scripts/snapshot-routes.mjs`, so playing a
  // loader on top would only obscure visible content with a black overlay.
  // Detect via the root's children count (captured in a single
  // getElementById call to avoid any race between checks).
  const wasPrerendered = useRef(
    typeof document !== 'undefined' &&
      (() => {
        const root = document.getElementById('root');
        return root != null && root.children.length > 0;
      })()
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
