'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ADA_BRAND } from '@/lib/adaConfig';

/** Warm organic accents — sand / amber (no greens) */
const ORGANIC = {
  eye: '#c4a574',
  eyeBright: '#e8d4a8',
  eyeGlow: 'rgba(196, 165, 116, 0.55)',
  eyeGlowSoft: 'rgba(196, 165, 116, 0.28)',
  antenna: '#b8956a',
  status: '#c4a574',
  statusRing: 'rgba(196, 165, 116, 0.45)',
} as const;

/**
 * Tight bot mark — viewBox cropped so the head fills the circle
 * (no empty white padding around the glyph).
 */
function BotIcon({
  className,
  reducedMotion,
}: {
  className?: string;
  reducedMotion?: boolean;
}) {
  return (
    <svg className={className} viewBox="4 1 32 34" fill="none" aria-hidden>
      {/* Antenna */}
      <path d="M20 5.5v3.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <motion.circle
        cx="20"
        cy="3.8"
        r="2.4"
        fill={ORGANIC.antenna}
        animate={
          reducedMotion
            ? undefined
            : { scale: [1, 1.2, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '20px', originY: '3.8px' }}
      />

      {/* Head — fills most of the frame */}
      <rect
        x="6.5"
        y="10"
        width="27"
        height="21"
        rx="7.5"
        stroke="currentColor"
        strokeWidth="2.2"
      />

      {/* Ear nodes */}
      <path
        d="M6.5 18.5H4.2a1.7 1.7 0 0 0 0 3.4h2.3M33.5 18.5h2.3a1.7 1.7 0 0 1 0 3.4h-2.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Organic eyes */}
      <motion.g
        animate={
          reducedMotion
            ? undefined
            : { scaleY: [1, 1, 0.12, 1, 1, 1, 0.12, 1] }
        }
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.38, 0.42, 0.46, 0.72, 0.88, 0.92, 1],
        }}
        style={{ originX: '20px', originY: '19.2px' }}
      >
        <circle cx="14.6" cy="19.2" r="3.6" fill={ORGANIC.eyeGlowSoft} />
        <circle cx="25.4" cy="19.2" r="3.6" fill={ORGANIC.eyeGlowSoft} />
        <motion.circle
          cx="14.6"
          cy="19.2"
          r="2.5"
          fill={ORGANIC.eye}
          animate={
            reducedMotion
              ? undefined
              : { fill: [ORGANIC.eye, ORGANIC.eyeBright, ORGANIC.eye] }
          }
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="25.4"
          cy="19.2"
          r="2.5"
          fill={ORGANIC.eye}
          animate={
            reducedMotion
              ? undefined
              : { fill: [ORGANIC.eye, ORGANIC.eyeBright, ORGANIC.eye] }
          }
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.15,
          }}
        />
        <circle cx="13.7" cy="18.4" r="0.7" fill="white" opacity="0.55" />
        <circle cx="24.5" cy="18.4" r="0.7" fill="white" opacity="0.55" />
      </motion.g>

      {/* Mouth */}
      <motion.path
        d="M13.5 26.8h13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        animate={
          reducedMotion
            ? undefined
            : {
                d: ['M13.5 26.8h13', 'M15 26.8h10', 'M13.5 26.8h13'],
              }
        }
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/**
 * Floating ADA chat launcher — oversized icon, minimal white ring padding.
 * Hidden on the chat route itself.
 */
export function AdaChatFab() {
  const pathname = usePathname() || '';
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [hint, setHint] = React.useState(true);
  const [hovered, setHovered] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  /** Prefer brand logo mark when available; fall back to tight SVG */
  const [useLogo, setUseLogo] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.('change', onChange);

    const t = window.setTimeout(() => setHint(false), 7000);
    return () => {
      mq.removeEventListener?.('change', onChange);
      window.clearTimeout(t);
    };
  }, []);

  if (pathname.startsWith('/ada/chat')) return null;

  const isLight = mounted ? theme === 'light' : false;
  const showHint = hint || hovered;

  return (
    <div className="fixed bottom-4 right-3.5 sm:bottom-8 sm:right-7 z-[60] flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none">
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8, scale: 0.96, filter: 'blur(3px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-none relative max-w-[13.5rem] overflow-hidden rounded-2xl border px-3.5 py-2.5 shadow-2xl backdrop-blur-xl ${
              isLight
                ? 'border-slate-200/80 bg-white/95 text-slate-800 shadow-slate-900/10'
                : 'border-white/10 bg-[#0a0a0c]/95 text-white/90 shadow-black/60'
            }`}
          >
            <span
              aria-hidden
              className={`absolute inset-x-4 top-0 h-px ${
                isLight
                  ? 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
              }`}
            />
            <div className="flex items-start gap-2.5">
              <span
                className={`relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                  isLight ? 'bg-slate-900' : 'bg-white'
                }`}
              >
                {useLogo ? (
                  <Image
                    src={ADA_BRAND.fabIcon}
                    alt=""
                    width={30}
                    height={30}
                    unoptimized
                    className="h-[30px] w-[30px] object-contain"
                    onError={() => setUseLogo(false)}
                  />
                ) : (
                  <BotIcon
                    className={`h-6 w-6 ${isLight ? 'text-white' : 'text-black'}`}
                    reducedMotion
                  />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-tight leading-snug">
                  Talk to ADA
                </p>
                <p
                  className={`mt-0.5 text-[10px] font-medium leading-snug ${
                    isLight ? 'text-slate-600' : 'text-white/50'
                  }`}
                >
                  AI domain assistant · free
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href="/ada/chat"
        className="pointer-events-auto relative block"
        aria-label="Open AI Domain Assistant chat"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {/* Ambient glow */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 sm:h-20 sm:w-20 rounded-full blur-2xl"
          style={{
            background: isLight
              ? 'radial-gradient(circle, rgba(196,165,116,0.22) 0%, rgba(15,23,42,0.12) 55%, transparent 70%)'
              : 'radial-gradient(circle, rgba(196,165,116,0.22) 0%, rgba(255,255,255,0.12) 50%, transparent 70%)',
          }}
          animate={
            reducedMotion
              ? { opacity: 0.4 }
              : { opacity: [0.35, 0.65, 0.35], scale: [0.9, 1.08, 0.9] }
          }
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Soft ripple rings */}
        {!reducedMotion && (
          <>
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: isLight
                  ? '0 0 0 1px rgba(15,23,42,0.12)'
                  : '0 0 0 1px rgba(255,255,255,0.22)',
              }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.95, opacity: 0 }}
              transition={{ duration: 2.6, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: isLight
                  ? '0 0 0 1px rgba(196,165,116,0.28)'
                  : '0 0 0 1px rgba(196,165,116,0.4)',
              }}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.55, opacity: 0 }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.7,
              }}
            />
          </>
        )}

        {/* Orbit ring — thin, outside button so it doesn't eat icon space */}
        {!reducedMotion && (
          <motion.span
            aria-hidden
            className="absolute -inset-[3px] rounded-full pointer-events-none"
            style={{
              background: isLight
                ? `conic-gradient(from 0deg, transparent 0%, rgba(15,23,42,0.28) 14%, transparent 30%, ${ORGANIC.eyeGlow} 50%, transparent 64%, rgba(15,23,42,0.16) 80%, transparent 100%)`
                : `conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.45) 14%, transparent 30%, ${ORGANIC.eyeGlow} 50%, transparent 64%, rgba(255,255,255,0.22) 80%, transparent 100%)`,
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/*
          Main button — compact on mobile, slightly larger on desktop
        */}
        <motion.span
          className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full overflow-hidden ${
            isLight
              ? 'bg-slate-900 text-white shadow-[0_10px_28px_-8px_rgba(15,23,42,0.5),0_0_0_1px_rgba(15,23,42,0.08)]'
              : 'bg-gradient-to-b from-white via-[#f7f7f9] to-[#ebebef] text-black shadow-[0_12px_32px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.14)]'
          }`}
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
          animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
          transition={
            reducedMotion
              ? { type: 'spring', stiffness: 400, damping: 24 }
              : {
                  y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
                  scale: { type: 'spring', stiffness: 400, damping: 24 },
                }
          }
        >
          {/* Soft top sheen only — no heavy white wash covering the icon */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 rounded-full ${
              isLight
                ? 'bg-gradient-to-br from-white/12 via-transparent to-transparent'
                : 'bg-gradient-to-br from-white/70 via-transparent to-transparent opacity-60'
            }`}
          />

          {/* Icon — fill most of the compact face */}
          <motion.span
            className="relative z-[1] flex h-[82%] w-[82%] items-center justify-center"
            animate={
              reducedMotion
                ? undefined
                : {
                    rotate: [0, -2, 2, -1.5, 0],
                  }
            }
            transition={{
              duration: 5.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {useLogo ? (
              <Image
                src={ADA_BRAND.fabIcon}
                alt=""
                width={48}
                height={48}
                unoptimized
                priority
                className="h-full w-full object-contain scale-[1.05]"
                onError={() => setUseLogo(false)}
              />
            ) : (
              <BotIcon
                className="h-full w-full"
                reducedMotion={reducedMotion}
              />
            )}
          </motion.span>
        </motion.span>

        {/* Status pill — organic sand-gold */}
        <motion.span
          className={`absolute -top-0.5 -right-0.5 z-[3] flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full ring-2 ${
            isLight ? 'bg-slate-900 ring-slate-900' : 'bg-[#0a0a0c] ring-[#0a0a0c]'
          }`}
          animate={reducedMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="relative flex h-2 w-2 items-center justify-center">
            {!reducedMotion && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: ORGANIC.statusRing }}
                animate={{ scale: [1, 1.85, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            <span
              className="relative h-1.5 w-1.5 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${ORGANIC.eyeBright}, ${ORGANIC.status})`,
                boxShadow: `0 0 6px ${ORGANIC.eyeGlow}`,
              }}
            />
          </span>
        </motion.span>
      </Link>
    </div>
  );
}
