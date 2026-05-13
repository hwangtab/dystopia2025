import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import GlitchText from './GlitchText';

// Pre-allocated scramble buffer to avoid per-frame string allocation.
// We generate a flat string once and mutate it in-place via indices.
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?`~';
const CHAR_POOL = new Uint32Array(
  Array.from(chars, (c) => c.charCodeAt(0))
);

let scrambleBuffer = '';
let scrambleIndices = null; // Flat array of indices into scrambleBuffer

/**
 * Rebuild (or grow) the scramble buffer to cover the given viewport size.
 * Mutates global state — safe because it runs during mount / resize only.
 */
const initScrambleBuffer = (width, height, charWidth = 5, charHeight = 11) => {
  const cols = Math.max(240, Math.ceil(width / charWidth) + 60);
  const rows = Math.max(60, Math.ceil(height / charHeight) + 10);
  // Each line = cols chars + newline
  const lineLen = cols + 1;
  const totalLen = lineLen * rows;
  scrambleBuffer = '\0'.repeat(totalLen);
  scrambleIndices = new Int32Array(cols * rows);
  // Fill indices to point into scrambleBuffer
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      scrambleIndices[r * cols + c] = r * lineLen + c;
    }
  }
};

/**
 * Mutate ~30% of the buffer in-place and return the new string.
 * No intermediate strings are created per-cell.
 */
const mutateScramble = () => {
  if (!scrambleBuffer) return '';
  const buf = scrambleBuffer.split('');
  const len = scrambleIndices.length;
  const mutCount = Math.floor(len * 0.3);
  for (let i = 0; i < mutCount; i++) {
    const idx = scrambleIndices[Math.floor(Math.random() * len)];
    buf[idx] = chars[Math.floor(Math.random() * chars.length)];
  }
  return buf.join('');
};

/**
 * Full refresh (called on resize).
 */
const fullRefreshScramble = (width, height) => {
  initScrambleBuffer(width, height);
  return mutateScramble();
};

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING SYSTEM...");
  const [showContent, setShowContent] = useState(false);
  const [isScrambling, setIsScrambling] = useState(true);
  const [scrambleText, setScrambleText] = useState('');
  const intervalRef = useRef(null);
  const scrambleIntervalRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Start showing main content almost immediately
    const showTimer = setTimeout(() => setShowContent(true), 100);

    const updateScramble = () => {
      setScrambleText(fullRefreshScramble(window.innerWidth, window.innerHeight));
    };

    // Skip the per-frame scramble repaint when the user has asked for
    // reduced motion. We still draw it once so the layout matches the
    // standard intro, but we don't burn 20fps painting random characters.
    updateScramble();
    if (!reduceMotion) {
      scrambleIntervalRef.current = setInterval(() => {
        if (isScrambling) {
          updateScramble();
        } else {
          clearInterval(scrambleIntervalRef.current);
        }
      }, 50);
    }

    window.addEventListener('resize', updateScramble);

    // Main Progress Timer (starts almost immediately)
    // Tightened so the intro completes in roughly 1s of progress + 300ms
    // of exit animation. Visual rhythm preserved (same status messages,
    // same scramble overlay) while LCP is no longer blocked for ~3s.
    intervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        const randomIncrement = Math.random() * 8 + 6;
        const newProgress = Math.min(prevProgress + randomIncrement, 100);

        if (newProgress < 30) {
          setLoadingText("INITIALIZING CORE MODULES...");
        } else if (newProgress < 60) {
          setLoadingText("DECRYPTING DATA STREAMS...");
        } else if (newProgress < 90) {
          setLoadingText("ESTABLISHING NEURAL LINK...");
        } else {
          setLoadingText("SYSTEM ONLINE. WELCOME.");
        }

        if (newProgress >= 100) {
          clearInterval(intervalRef.current);
          setTimeout(() => {
            setIsScrambling(false);
            onLoadingComplete();
          }, 300);
          return 100;
        }
        return newProgress;
      });
    }, 80);

    return () => {
      clearTimeout(showTimer);
      clearInterval(intervalRef.current);
      clearInterval(scrambleIntervalRef.current);
      window.removeEventListener('resize', updateScramble);
    };
  }, [onLoadingComplete, isScrambling, reduceMotion]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeIn" }
    },
    exit: {
      opacity: 0,
      y: -50, // Add a slight upward movement on exit
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-primary z-[100] flex flex-col items-center justify-center overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Add some background visual noise/patterns */}
      <div className="absolute inset-0 circuit-bg opacity-30 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/80 to-primary z-[1]"></div>

      {/* Scramble Effect Overlay - Use fixed positioning and viewport units */}
      <motion.div
        key="scramble"
        // Ensure the container covers the full screen and hides overflow
        className="fixed inset-0 z-[5] overflow-hidden font-mono text-xs text-accent-cyan pointer-events-none leading-tight" 
        initial={{ opacity: 0.3 }} 
        animate={{ opacity: isScrambling ? 0.15 : 0 }} 
        transition={{ duration: isScrambling ? 0.1 : 0.5 }} 
      >
        {/* Pre fills the viewport; parent overflow-hidden clips excess columns/rows */}
        <pre className="w-screen h-screen whitespace-pre m-0 p-0">{scrambleText}</pre>
      </motion.div>

      {/* Main Loading Content */}
      <AnimatePresence>
        {showContent && ( // Show content immediately after initial delay
          <motion.div
            key="content"
            className="w-full max-w-lg px-4 relative z-10 text-center" // Ensure this is above scramble (z-10)
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.div variants={itemVariants}>
              {/* Apply new text shadow color */}
              <GlitchText
                text="DYSTOPIA 2025"
                className="text-5xl md:text-7xl font-blender mb-10 text-shadow-neon-magenta"
                intensity="high"
                glitchStyle="classic"
              />
            </motion.div>

            {/* Update progress bar border and gradient */}
            <motion.div variants={itemVariants} className="relative h-2 bg-primary-darker rounded-full overflow-hidden mb-3 border border-accent-blue/30 shadow-inner">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-magenta to-accent-blue" /* Magenta to Blue gradient */
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
              {/* Update glow color */}
              <motion.div
                 className="absolute top-0 left-0 h-full bg-accent-blue blur-sm" /* Blue glow */
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 transition={{ duration: 0.15, ease: "linear" }}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-between text-sm text-gray-400 font-mono mb-6">
              <span>SYSTEM STATUS:</span>
              <span>{Math.floor(progress)}%</span>
            </motion.div>

            <motion.div variants={itemVariants} className="h-6"> {/* Fixed height to prevent layout shift */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingText} // Key change triggers animation
                  className="text-accent-blue text-md font-mono tracking-widest" /* Use blue for loading text */
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {loadingText}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-24">
              <p className="text-gray-600 text-xs font-mono">
                TRIANGLE WAVER SYSTEMS © {new Date().getFullYear()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoadingScreen;
