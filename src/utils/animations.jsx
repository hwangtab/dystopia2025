/**
 * Shared animation variants for Framer Motion components.
 * Centralized to avoid duplication across page components.
 */

/**
 * Page transition variants — fade in/out for route changes.
 */
export const PAGE_VARIANTS = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeIn' },
  },
};

/**
 * Stagger container — children animate with delay between each.
 */
export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Fade-in-up variant — used for individual content blocks.
 */
export const FADE_IN_UP = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * Hero fade-in-up variant — larger initial y offset for hero sections.
 */
export const HERO_FADE_IN_UP = {
  initial: { opacity: 0, y: 60 },
  animate: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      delay: custom * 0.2,
    },
  }),
};
