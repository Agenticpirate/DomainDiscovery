/**
 * Premium motion tokens — Vercel product polish + Apple-like springs.
 * Use with Framer Motion / CSS custom properties.
 */

/** Apple-style soft spring (slight overshoot feel without bounce noise) */
export const APPLE_EASE = [0.22, 1, 0.36, 1] as const;

/** Vercel-style snappy ease (Geist / product UI) */
export const VERCEL_EASE = [0.16, 1, 0.3, 1] as const;

/** Framer spring — refined product feel (Apple HIG–inspired) */
export const SPRING_SOFT = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const SPRING_SNAPPY = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 36,
  mass: 0.7,
};

export const SPRING_PRESS = {
  type: 'spring' as const,
  stiffness: 600,
  damping: 28,
  mass: 0.55,
};

/** Entrance fades */
export const FADE_UP = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: APPLE_EASE },
};

export const FADE_SCALE = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { ...SPRING_SOFT },
};

export const STAGGER_CHILDREN = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/**
 * Full-page route enter — short enough to feel snappy, soft enough to feel premium.
 * Avoid large Y / heavy blur (mobile jank + layout shift).
 */
export const PAGE_ENTER = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  duration: 0.42,
};
