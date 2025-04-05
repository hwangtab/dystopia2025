import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const GlitchText = ({ 
  text, 
  className, 
  intensity = 'medium', 
  interactive = false, 
  glitchStyle = 'classic' // 'classic', 'blocky', 'subtle'
}) => {
  const [glitchedText, setGlitchedText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Set glitch intensity parameters
  const getIntensityParams = () => {
    switch (intensity) {
      case 'low':
        return { probability: 0.02, interval: 3000, duration: 80, charProbability: 0.15, maxOffset: 1 };
      case 'medium':
        return { probability: 0.05, interval: 1500, duration: 120, charProbability: 0.3, maxOffset: 2 };
      case 'high':
        // Increased probability and decreased interval for more frequent glitches
        return { probability: 0.3, interval: 400, duration: 180, charProbability: 0.5, maxOffset: 3 }; 
      case 'extreme':
        // Increased interval to slow down the glitch frequency
        return { probability: 0.5, interval: 400, duration: 250, charProbability: 0.7, maxOffset: 5 }; 
      default:
        return { probability: 0.05, interval: 1500, duration: 120, charProbability: 0.3, maxOffset: 2 };
    }
  };

  const { probability, interval, duration, charProbability, maxOffset } = getIntensityParams();

  // Create glitched version of text
  const glitchify = (originalText) => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,./<>?`~01█▓▒░';
    
    return originalText
      .split('')
      .map(char => {
        if (char === ' ') return ' '; // Keep spaces
        if (Math.random() < charProbability) {
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return char;
      })
      .join('');
  };

  const triggerGlitch = () => {
    if (isGlitching) return; // Prevent overlapping glitches

    setIsGlitching(true);
    
    const frames = Math.floor(Math.random() * 5) + 3; // More frames for more intense glitch
    let frameCount = 0;
    
    const glitchFrame = () => {
      setGlitchedText(glitchify(text));
      frameCount++;
      
      if (frameCount < frames) {
        timeoutRef.current = setTimeout(glitchFrame, Math.random() * 50 + 20); // Faster frame rate
      } else {
        timeoutRef.current = setTimeout(() => {
          setGlitchedText(text);
          setIsGlitching(false);
        }, duration);
      }
    };
    
    glitchFrame();
  };

  // Random glitch effect
  useEffect(() => {
    // Clear previous intervals/timeouts on parameter change
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsGlitching(false); // Reset glitch state
    setGlitchedText(text); // Reset text

    if (interactive) return; // Don't auto-glitch if interactive

    intervalRef.current = setInterval(() => {
      if (Math.random() < probability) {
        triggerGlitch();
      }
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, probability, interval, duration, charProbability, interactive, glitchStyle]); // Add glitchStyle to dependencies

  // Handle hover for interactive mode
  const handleMouseEnter = () => {
    if (!interactive) return;
    triggerGlitch();
  };

  // No handleMouseLeave needed as triggerGlitch resets itself

  const randomOffset = () => Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset;

  return (
    <motion.span
      className={`relative inline-block font-blender ${className}`} // Ensure Blender Pro font is applied if needed
      onMouseEnter={handleMouseEnter}
      // No onMouseLeave needed
      animate={{
        x: isGlitching ? randomOffset() : 0,
        y: isGlitching ? randomOffset() : 0,
      }}
      transition={{ duration: 0.05, ease: "linear" }} // Faster transition for glitch effect
    >
      <span className="relative z-10" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
        {glitchedText}
      </span>
      
      {/* Glitch Layers based on style */}
      {isGlitching && glitchStyle === 'classic' && (
        <>
          <motion.span
            aria-hidden="true"
            className="absolute top-0 left-0 w-full h-full text-accent-pink opacity-80 pointer-events-none"
            style={{ clipPath: `inset(${Math.random()*80}% 0 ${Math.random()*40}% 0)` }}
            animate={{ x: randomOffset(), y: randomOffset() }}
            transition={{ duration: 0.05, ease: "linear" }}
          >
            {glitchedText}
          </motion.span>
          <motion.span
            aria-hidden="true"
            className="absolute top-0 left-0 w-full h-full text-accent-cyan opacity-80 pointer-events-none"
            style={{ clipPath: `inset(${Math.random()*40}% 0 ${Math.random()*80}% 0)` }}
            animate={{ x: randomOffset(), y: randomOffset() }}
            transition={{ duration: 0.05, ease: "linear" }}
          >
            {glitchedText}
          </motion.span>
        </>
      )}
      {isGlitching && glitchStyle === 'blocky' && (
         <motion.span
            aria-hidden="true"
            className="absolute top-0 left-0 w-full h-full text-accent-green opacity-60 mix-blend-difference pointer-events-none"
            style={{ 
              transform: `translateX(${randomOffset()*2}px)`,
              clipPath: `polygon(0 0, 100% 0, 100% ${Math.random()*100}%, 0 ${Math.random()*100}%)`
            }}
            animate={{ scaleX: Math.random() * 0.5 + 0.8 }}
            transition={{ duration: 0.1, ease: "circOut" }}
          >
            {glitchedText}
          </motion.span>
      )}
       {isGlitching && glitchStyle === 'subtle' && (
         <motion.span
            aria-hidden="true"
            className="absolute top-0 left-0 w-full h-full text-gray-500 opacity-50 pointer-events-none"
            animate={{ x: randomOffset()/2, y: randomOffset()/2 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
          >
            {glitchedText}
          </motion.span>
      )}
    </motion.span>
  );
};

export default GlitchText;
