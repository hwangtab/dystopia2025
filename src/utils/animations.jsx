/**
 * Shared animation variants for Framer Motion components.
 * Centralized to avoid duplication across page components.
 */

/**
 * Stagger container — children animate with delay between each.
 *
 * Note: whole-page enter/exit fades are owned by the route-level
 * AnimatePresence in App.jsx. Pages must NOT re-wrap their content in another
 * opacity fade or the two stack into a visible double fade on navigation.
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
