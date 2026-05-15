import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Glitch intensity parameters as constants
const INTENSITY_PARAMS = {
  low: { probability: 0.02, interval: 3000, duration: 80, charProbability: 0.15, maxOffset: 1 },
  medium: { probability: 0.05, interval: 1500, duration: 120, charProbability: 0.3, maxOffset: 2 },
  high: { probability: 0.3, interval: 400, duration: 180, charProbability: 0.5, maxOffset: 3 },
  extreme: { probability: 0.5, interval: 400, duration: 250, charProbability: 0.7, maxOffset: 5 },
};

// Glitch characters pool
const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,./<>?`~01█▓▒░';

/**
 * Glitch effect — single source of truth for the glitchify logic.
 */
const glitchify = (text, charProbability) =>
  text
    .split('')
    .map((c) =>
      c === ' ' ? ' ' : Math.random() < charProbability ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c
    )
    .join('');

const GlitchText = ({
  text,
  className,
  intensity = 'medium',
  interactive = false,
  glitchStyle = 'classic',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [glitchedText, setGlitchedText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const glitchingRef = useRef(false);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Memoize intensity params to avoid recreating on every render
  const params = useMemo(
    () => INTENSITY_PARAMS[intensity] || INTENSITY_PARAMS.medium,
    [intensity]
  );

  const { probability, interval, duration, charProbability, maxOffset } = params;

  // useCallback: stable function reference
  const triggerGlitch = useCallback(() => {
    if (glitchingRef.current || shouldReduceMotion) return;
    glitchingRef.current = true;
    setIsGlitching(true);

    const frames = Math.floor(Math.random() * 5) + 3;
    let frameCount = 0;

    const glitchFrame = () => {
      setGlitchedText(glitchify(text, charProbability));
      frameCount++;

      if (frameCount < frames) {
        timeoutRef.current = setTimeout(glitchFrame, Math.random() * 50 + 20);
      } else {
        timeoutRef.current = setTimeout(() => {
          setGlitchedText(text);
          setIsGlitching(false);
          glitchingRef.current = false;
        }, duration);
      }
    };

    glitchFrame();
  }, [text, charProbability, duration, shouldReduceMotion]);

  // Random glitch effect — only when not interactive
  useEffect(() => {
    // Cleanup previous timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsGlitching(false);
    setGlitchedText(text);

    if (interactive || shouldReduceMotion) return;

    const intervalId = setInterval(() => {
      if (glitchingRef.current) return;
      if (Math.random() < probability) {
        setIsGlitching(true);
        glitchingRef.current = true;

        const frames = Math.floor(Math.random() * 5) + 3;
        let frameCount = 0;

        const glitchFrame = () => {
          setGlitchedText(glitchify(text, charProbability));
          frameCount++;

          if (frameCount < frames) {
            timeoutRef.current = setTimeout(glitchFrame, Math.random() * 50 + 20);
          } else {
            timeoutRef.current = setTimeout(() => {
              setGlitchedText(text);
              setIsGlitching(false);
              glitchingRef.current = false;
            }, duration);
          }
        };

        glitchFrame();
      }
    }, interval);

    intervalRef.current = intervalId;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      glitchingRef.current = false;
    };
  }, [text, probability, interval, duration, charProbability, interactive, shouldReduceMotion]);

  // Stable event handler
  const handleMouseEnter = useCallback(() => {
    if (!interactive) return;
    triggerGlitch();
  }, [interactive, triggerGlitch]);

  // Stable offset generator (memoized for consistency)
  const randomOffset = useCallback(
    () => Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset,
    [maxOffset]
  );

  // Skip motion animation when reduced motion is preferred
  const motionProps = shouldReduceMotion
    ? { animate: {}, transition: {} }
    : {
        animate: {
          x: isGlitching ? randomOffset() : 0,
          y: isGlitching ? randomOffset() : 0,
        },
        transition: { duration: 0.05, ease: 'linear' },
      };

  return (
    <motion.span
      className={`relative inline-block font-blender ${className}`}
      onMouseEnter={handleMouseEnter}
      {...motionProps}
    >
      <span className="relative z-10" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
        {glitchedText}
      </span>

      {/* Glitch Layers based on style */}
      {isGlitching && !shouldReduceMotion && glitchStyle === 'classic' && (
        <>
          <motion.span
            aria-hidden="true"
            className="absolute top-0 left-0 w-full h-full text-accent-pink opacity-80 pointer-events-none"
            style={{ clipPath: `inset(${Math.random() * 80}% 0 ${Math.random() * 40}% 0)` }}
            animate={{ x: randomOffset(), y: randomOffset() }}
            transition={{ duration: 0.05, ease: 'linear' }}
          >
            {glitchedText}
          </motion.span>
          <motion.span
            aria-hidden="true"
            className="absolute top-0 left-0 w-full h-full text-accent-cyan opacity-80 pointer-events-none"
            style={{ clipPath: `inset(${Math.random() * 40}% 0 ${Math.random() * 80}% 0)` }}
            animate={{ x: randomOffset(), y: randomOffset() }}
            transition={{ duration: 0.05, ease: 'linear' }}
          >
            {glitchedText}
          </motion.span>
        </>
      )}
      {isGlitching && !shouldReduceMotion && glitchStyle === 'blocky' && (
        <motion.span
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full text-accent-green opacity-60 mix-blend-difference pointer-events-none"
          style={{
            transform: `translateX(${randomOffset() * 2}px)`,
            clipPath: `polygon(0 0, 100% 0, 100% ${Math.random() * 100}%, 0 ${Math.random() * 100}%)`,
          }}
          animate={{ scaleX: Math.random() * 0.5 + 0.8 }}
          transition={{ duration: 0.1, ease: 'circOut' }}
        >
          {glitchedText}
        </motion.span>
      )}
      {isGlitching && !shouldReduceMotion && glitchStyle === 'subtle' && (
        <motion.span
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full text-gray-500 opacity-50 pointer-events-none"
          animate={{ x: randomOffset() / 2, y: randomOffset() / 2 }}
          transition={{ duration: 0.08, ease: 'easeOut' }}
        >
          {glitchedText}
        </motion.span>
      )}
    </motion.span>
  );
};

export default GlitchText;
