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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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

  // Single source of truth for page transitions. Each page used to wrap its
  // content in its own opacity fade too, which stacked on top of this one and
  // produced a visible double fade on navigation. Pages now only animate their
  // inner content blocks; this wrapper owns the whole-page enter/exit fade.
  const pageTransitionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }
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
                <Route path="*" element={<NotFoundPage />} />
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
  // Detect whether `scripts/snapshot-routes.mjs` baked this route's DOM into
  // the HTML. Used only to suppress the first-paint animation flicker below —
  // the intro splash itself plays either way, layered on top of the app.
  // Captured in a single getElementById call to avoid any race between checks.
  const wasPrerendered = useRef(
    typeof document !== 'undefined' &&
      (() => {
        const root = document.getElementById('root');
        return root != null && root.children.length > 0;
      })()
  );
  const [initialLoading, setInitialLoading] = useState(true);

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

  // The splash covers the viewport, so any scrolling that happens underneath it
  // is invisible to the user but would leave them mid-page once it lifts.
  useEffect(() => {
    if (!initialLoading) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [initialLoading]);

  return (
    <MotionConfig reducedMotion={staticFirstPaint ? 'always' : 'user'}>
      {/* The app mounts immediately rather than waiting for the splash to
          finish. The prerendered snapshot already painted this content, so
          gating the Router on `!initialLoading` would blank it out and push
          LCP past the whole intro. `inert` keeps the covered content out of
          tab order and the accessibility tree while the splash is up. */}
      <div inert={initialLoading ? '' : undefined}>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </div>

      <AnimatePresence>
        {initialLoading && <LoadingScreen onLoadingComplete={() => setInitialLoading(false)} />}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
