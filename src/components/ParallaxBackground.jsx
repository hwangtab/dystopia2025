import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const ParallaxBackground = ({ children, className }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Parallax effects for layers
  const gridY1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const gridX2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const hueRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const saturate = useTransform(scrollYProgress, [0, 1], [1, 2.5]);
  const filterMV = useTransform(
    [hueRotate, saturate],
    ([h, s]) => `hue-rotate(${h}deg) saturate(${s})`
  );

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 15, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 15, stiffness: 100 });
  const springX_grid1 = useTransform(springX, (v) => v * 0.5);
  const springY_grid2 = useTransform(springY, (v) => v * 1.2);

  useEffect(() => {
    // Skip mouse parallax on touch devices (no mouse) and when the user
    // has requested reduced motion. Both are common on mobile, where the
    // useTransform spring is the costliest part of this component.
    if (reduceMotion) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX.set((x / (rect.width / 2)) * 15);
      mouseY.set((y / (rect.height / 2)) * 15);
    };

    const currentRef = ref.current;
    currentRef?.addEventListener('mousemove', handleMouseMove);
    return () => currentRef?.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, reduceMotion]);

  return (
    <motion.div 
      ref={ref}
      className={`relative ${className}`} // Removed overflow-hidden
      // Remove perspective if not needed for children elements
      // Removed noise background style from here
    >
      {/* Layer 1: Subtle Grid */}
      <motion.div
        className="absolute inset-0 z-[-2] opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          x: reduceMotion ? 0 : springX_grid1,
          y: reduceMotion ? 0 : gridY1,
        }}
      />

      {/* Layer 2: Faster Abstract Pattern */}
      <motion.div
        className="absolute inset-0 z-[-1] opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(180, 60, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          x: reduceMotion ? 0 : gridX2,
          y: reduceMotion ? 0 : springY_grid2,
        }}
      />

      {/* Filter Layer (Hue/Saturation) — disabled under reduced-motion */}
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 z-[0]"
          style={{ filter: filterMV }}
        />
      )}
      
      {/* Scan line effect - Keep it subtle */}
      <div className="absolute inset-0 z-[2] pointer-events-none" style={{
        background: 'linear-gradient(transparent 49.8%, rgba(0, 255, 255, 0.05) 50%, rgba(0, 255, 255, 0.05) 50.2%, transparent 50.4%)', // Use accent-cyan color
        backgroundSize: '100% 5px',
        animation: 'scanline 12s linear infinite' // Slower scanline
      }} />
      
      
      {/* Vignette effect - Keep */}
      
      <div className="absolute inset-0 z-[3] pointer-events-none" style={{ 
        boxShadow: 'inset 0 0 120px 40px rgba(10, 10, 26, 0.95)' // Adjusted vignette
      }} />
      
      
      {/* Content */}
      <div className="relative z-10"> {/* Ensure content is above background layers */}
        {children}
      </div>
    </motion.div>
  );
};

export default ParallaxBackground;
