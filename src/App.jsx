import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { AnimatePresence, motion } from 'framer-motion'; // Import motion

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

// Define page transition variants with chromatic aberration effect
const pageTransitionVariants = {
  initial: {
    opacity: 0,
    filter: 'url(#chromatic-aberration)', // Apply filter on initial/exit
    // filter: 'blur(10px) saturate(1.5)', // Alternative effect
  },
  animate: {
    opacity: 1,
    filter: 'none', // No filter when page is active
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    filter: 'url(#chromatic-aberration)', // Apply filter on initial/exit
    // filter: 'blur(10px) saturate(0.5)', // Alternative effect
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

// Main App component structure
function AppContent() {
  const location = useLocation();

  return (
    // Ensure the outer div takes full height
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Removed Scanline Overlay Div */}

      <Header />

      {/* Let main grow naturally */}
      <main className="flex-grow">
        <ErrorBoundary> {/* Wrap Suspense with ErrorBoundary */}
          <Suspense fallback={<RouteFallback />}>
            <AnimatePresence mode="wait">
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

      {/* SVG Filter Definition for Chromatic Aberration */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
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
    </div>
  );
}


function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Keep the initial loading screen simulation
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000); // Keep or adjust duration as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {initialLoading && <LoadingScreen onLoadingComplete={() => setInitialLoading(false)} />}
      </AnimatePresence>

      {!initialLoading && (
        <Router>
          <ScrollToTop /> {/* Add ScrollToTop component here */}
          {/* Moved content into AppContent to use useLocation hook */}
          <AppContent />
        </Router>
      )}
    </>
  );
}

export default App;
