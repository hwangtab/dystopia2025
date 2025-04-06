import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

const ParallaxBackground = ({ children, className }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  // Parallax effects for layers
  const gridY1 = useTransform(scrollYProgress, [0, 1], [0, 150]); 
  const gridX1 = useTransform(scrollYProgress, [0, 1], [0, -75]);
  const gridY2 = useTransform(scrollYProgress, [0, 1], [0, 250]); // Faster scroll for second grid
  const gridX2 = useTransform(scrollYProgress, [0, 1], [0, 100]); // Different direction
  const noiseY = useTransform(scrollYProgress, [0, 1], [0, -200]); 
  // Add transforms for hue-rotate and saturate based on scroll
  const hueRotate = useTransform(scrollYProgress, [0, 1], [0, 90]); // Rotate hue up to 90 degrees
  const saturate = useTransform(scrollYProgress, [0, 1], [1, 2.5]); // Increase saturation up to 2.5

  // Mouse parallax effect setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Normalize mouse position relative to element center, scale for effect intensity
      mouseX.set(x / (rect.width / 2) * 15); // Adjust multiplier for intensity
      mouseY.set(y / (rect.height / 2) * 15); // Adjust multiplier for intensity
    };

    const currentRef = ref.current; // Capture ref value
    if (currentRef) {
      currentRef.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [mouseX, mouseY]); // Add mouseX, mouseY to dependency array

  return (
    <motion.div 
      ref={ref}
      className={`relative ${className}`} // Removed overflow-hidden
      // Remove perspective if not needed for children elements
      // Removed noise background style from here
    >
      {/* Layer 1: Subtle Grid */}
      <motion.div
        className="absolute inset-0 z-[-2] opacity-10" // Behind other layers, low opacity
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          x: useTransform(springX, (v) => v * 0.5), // Slower mouse parallax
          y: gridY1, // Use existing scroll transform
        }}
      />

      {/* Layer 2: Faster Abstract Pattern (Example using gradient) */}
      <motion.div
        className="absolute inset-0 z-[-1] opacity-15" // Above grid, slightly more opaque
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(180, 60, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          x: gridX2, // Use existing scroll transform (different direction)
          y: useTransform(springY, (v) => v * 1.2), // Faster mouse parallax
        }}
      />

      {/* Filter Layer (Hue/Saturation) - Applied to a container or specific layers if needed */}
      <motion.div
        className="absolute inset-0 z-[0]" // Ensure it's behind content but potentially above base bg
        style={{
          filter: useTransform(
            [hueRotate, saturate], 
            ([h, s]) => `hue-rotate(${h}deg) saturate(${s})`
          ) 
        }} 
      />
      
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
