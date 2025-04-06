import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlitchText from './GlitchText'; // Import GlitchText component

// Helper function to generate random scramble text for multiple lines
const generateScrambleText = (width, height, charWidth = 8, charHeight = 14) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?`~';
  // Ensure enough columns are generated regardless of calculation accuracy
  const cols = Math.max(200, Math.floor(width / charWidth) + 30); // Generate at least 200 columns or more if needed
  const rows = Math.floor(height / charHeight);
  let result = '';
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '\n'; // Add newline for next row
  }
  return result;
};

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING SYSTEM...");
  const [showContent, setShowContent] = useState(false); // Controls visibility of main loading elements
  const [isScrambling, setIsScrambling] = useState(true); // Scramble effect runs initially
  const [scrambleText, setScrambleText] = useState(''); // Holds the scramble text
  const intervalRef = useRef(null);
  const scrambleIntervalRef = useRef(null);

  useEffect(() => {
    // Start showing main content almost immediately
    const showTimer = setTimeout(() => setShowContent(true), 100);

    // Scramble Effect Timer (runs continuously until progress is 100)
    const scrambleUpdateRate = 50;
    const updateScramble = () => { // Function to update scramble text based on window size
      setScrambleText(generateScrambleText(window.innerWidth, window.innerHeight));
    };

    // Initial scramble text generation
    updateScramble(); 

    scrambleIntervalRef.current = setInterval(() => {
      if (isScrambling) {
        updateScramble(); // Call the update function
      } else {
        clearInterval(scrambleIntervalRef.current);
      }
    }, scrambleUpdateRate);

    // Add resize listener to update scramble on window resize
    window.addEventListener('resize', updateScramble);

    // Main Progress Timer (starts almost immediately)
    intervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        const randomIncrement = Math.random() * 5 + 1; // Smaller, more frequent increments
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
          // Add a slight delay before calling onLoadingComplete for final animation
          setTimeout(() => {
            setIsScrambling(false); // Stop scrambling before completing
            onLoadingComplete();
          }, 800);
          return 100;
        }
        return newProgress;
      });
    }, 150); // Faster interval for progress

    return () => {
      clearTimeout(showTimer); // Clear show timer
      clearInterval(intervalRef.current);
      clearInterval(scrambleIntervalRef.current);
      window.removeEventListener('resize', updateScramble); // Remove resize listener
    };
  }, [onLoadingComplete, isScrambling]); // Add isScrambling to dependencies

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
        {/* Let pre tag expand horizontally, parent div handles overflow */}
        <pre className="min-w-full h-full whitespace-pre">{scrambleText}</pre> 
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
