'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

/** Minimal sun / moon toggle — no text labels */
export function AdaThemeToggle({ isLight }: { isLight: boolean }) {
  const { toggleTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      className={`relative ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
        isLight
          ? 'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300'
          : 'border-white/12 bg-[#0a0a0c] text-white/75 hover:bg-[#121214] hover:text-white'
      }`}
    >
      <span className="relative flex h-[18px] w-[18px] items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {mounted && isLight ? (
            <motion.span
              key="moon"
              initial={reduce ? false : { opacity: 0, rotate: -40, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, rotate: 40, scale: 0.6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Moon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={reduce ? false : { opacity: 0, rotate: 40, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, rotate: -40, scale: 0.6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Sun */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M12 2.75v1.8M12 19.45v1.8M2.75 12h1.8M19.45 12h1.8M5.05 5.05l1.27 1.27M17.68 17.68l1.27 1.27M18.95 5.05l-1.27 1.27M6.32 17.68l-1.27 1.27"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
