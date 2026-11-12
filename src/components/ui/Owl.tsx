'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * idle      — bobs, blinks, glances, follows the cursor
 * happy     — hops with sparkles (something good happened)
 * shrug     — eyebrows + raised wings (nothing found)
 * searching — pupils scan side to side, head tilts (work in progress)
 * typing    — leans in and watches the search box; nods on each `nudge`
 * lost      — shrug with a "?" bubble (404 / empty states)
 */
export type OwlMood = 'idle' | 'happy' | 'shrug' | 'searching' | 'typing' | 'lost';

type Reaction = 'spin' | 'wink' | 'love' | 'flap' | 'wake' | 'nod' | null;

type OwlProps = {
  mood?: OwlMood;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech. */
  title?: string;
  /** Click / tap the owl for a reaction (spin, wink, heart, flap). */
  interactive?: boolean;
  /** Doze off after this many ms without page activity (0 = never). */
  sleepAfterMs?: number;
  /** Change this number to make the owl nod once (e.g. on each keystroke). */
  nudge?: number;
};

/** Max pupil travel in SVG units (eye radius 8.5, pupil radius 3.8). */
const MAX_LOOK = 3.6;
/** Cursor distance (px) at which the pupils reach full travel. */
const FULL_LOOK_DISTANCE = 220;
/** Where the owl looks while the user types (the search box sits below-left). */
const TYPING_LOOK = { x: -2.6, y: 2.4 };

const CLICK_REACTIONS: Exclude<Reaction, 'wake' | 'nod' | null>[] = ['spin', 'wink', 'love', 'flap'];
const REACTION_MS: Record<Exclude<Reaction, null>, number> = {
  spin: 800,
  wink: 750,
  love: 1300,
  flap: 900,
  wake: 900,
  nod: 320,
};

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * DomainDiscovery mascot. Pure SVG, colored from the design-system tokens
 * (--ds-ink / --ds-canvas) so it reads in both light and dark themes.
 * Animation lives in globals.css (.owl-*) and is disabled for reduced motion.
 */
export function Owl({
  mood = 'idle',
  className = '',
  title,
  interactive = false,
  sleepAfterMs = 0,
  nudge,
}: OwlProps) {
  const [reaction, setReaction] = useState<Reaction>(null);
  const [asleep, setAsleep] = useState(false);
  const clickIndex = useRef(0);
  const reactionTimer = useRef<number>(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  const happy = mood === 'happy';
  const shrug = mood === 'shrug' || mood === 'lost';
  const typing = mood === 'typing';
  const searching = mood === 'searching';
  const busy = typing || searching || happy;

  const react = useCallback((next: Exclude<Reaction, null>) => {
    if (reducedMotion()) return;
    window.clearTimeout(reactionTimer.current);
    // Restart the CSS animation even when the same reaction repeats.
    setReaction(null);
    window.requestAnimationFrame(() => {
      setReaction(next);
      reactionTimer.current = window.setTimeout(() => setReaction(null), REACTION_MS[next]);
    });
  }, []);

  useEffect(() => () => window.clearTimeout(reactionTimer.current), []);

  // Nod once whenever `nudge` changes (skip the first render).
  const firstNudge = useRef(true);
  useEffect(() => {
    if (nudge === undefined) return;
    if (firstNudge.current) {
      firstNudge.current = false;
      return;
    }
    react('nod');
  }, [nudge, react]);

  // Doze off after inactivity; any activity wakes the owl with a startled hop.
  useEffect(() => {
    if (!sleepAfterMs || reducedMotion()) return;
    let timer = 0;
    let sleeping = false;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        sleeping = true;
        setAsleep(true);
      }, sleepAfterMs);
    };
    const onActivity = () => {
      if (sleeping) {
        sleeping = false;
        setAsleep(false);
        react('wake');
      }
      arm();
    };
    const events: (keyof WindowEventMap)[] = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [sleepAfterMs, react]);

  // A mood change (typing, searching, happy) always wakes the owl.
  useEffect(() => {
    if (busy) setAsleep(false);
  }, [busy]);

  // Pupils follow the cursor (or the search box while typing).
  useEffect(() => {
    const pupils = pupilsRef.current;
    if (shrug || searching || reducedMotion()) return;
    if (typing) {
      if (pupils) pupils.style.transform = `translate(${TYPING_LOOK.x}px, ${TYPING_LOOK.y}px)`;
      return;
    }

    const svg = svgRef.current;
    if (!svg) return;

    let frame = 0;
    let lastX = 0;
    let lastY = 0;

    const apply = () => {
      frame = 0;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;

      // Eye line sits ~47% down the 64-unit viewBox.
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.47;
      const dx = lastX - cx;
      const dy = lastY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const strength = Math.min(dist / FULL_LOOK_DISTANCE, 1) * MAX_LOOK;
      const x = (dx / dist) * strength;
      const y = (dy / dist) * strength;

      svg.classList.add('owl--tracking');
      if (pupilsRef.current) {
        pupilsRef.current.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      // Touch has no hover position; keep the idle glance animation there.
      if (e.pointerType === 'touch') return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (pupilsRef.current) pupilsRef.current.style.transform = 'translate(0px, 0px)';
    };

    if (pupils) pupils.style.transform = 'translate(0px, 0px)';
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [shrug, searching, typing, happy, asleep]);

  const onClick = interactive
    ? () => {
        if (asleep) {
          setAsleep(false);
          react('wake');
          return;
        }
        react(CLICK_REACTIONS[clickIndex.current % CLICK_REACTIONS.length]);
        clickIndex.current += 1;
      }
    : undefined;

  const showSleep = asleep && !busy;
  const winking = reaction === 'wink';
  const bubble =
    reaction === 'love' ? '♥' : reaction === 'wake' ? '!' : mood === 'lost' && !reaction ? '?' : null;

  const classes = [
    'owl',
    `owl--${mood === 'lost' ? 'shrug owl--lost' : mood}`,
    showSleep ? 'owl--asleep' : '',
    reaction ? `owl--react-${reaction}` : '',
    interactive ? 'owl--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={`owl-wrap ${className}`} onClick={onClick}>
      {bubble && (
        <span
          key={`${bubble}-${reaction ?? mood}`}
          className={`owl-bubble ${bubble === '♥' ? 'owl-bubble--love' : ''}`}
          aria-hidden
        >
          {bubble}
        </span>
      )}
      <svg
        ref={svgRef}
        viewBox="0 0 64 64"
        className={classes}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        focusable="false"
      >
        <g className="owl-body">
          {/* feet */}
          <rect x="22" y="57" width="7" height="4" rx="2" fill="#f5a623" />
          <rect x="35" y="57" width="7" height="4" rx="2" fill="#f5a623" />

          <g className="owl-head">
            {/* ear tufts */}
            <path className="owl-tuft owl-tuft--l" d="M14 20 L16 6 L27 14 Z" fill="var(--ds-ink)" />
            <path className="owl-tuft owl-tuft--r" d="M50 20 L48 6 L37 14 Z" fill="var(--ds-ink)" />
          </g>

          {/* body */}
          <ellipse cx="32" cy="37" rx="19" ry="21" fill="var(--ds-ink)" />

          {/* belly + feather chevrons */}
          <ellipse cx="32" cy="46" rx="11.5" ry="12" fill="var(--ds-canvas)" opacity="0.16" />
          <path
            d="M26 44 l3 3 3-3 3 3 3-3 M27 51 l3 3 2-2 2 2 3-3"
            fill="none"
            stroke="var(--ds-canvas)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />

          {/* wings */}
          <path
            className="owl-wing owl-wing--l"
            d="M13.5 34 C8 40 9 52 17 54 C18 47 17.5 40 13.5 34 Z"
            fill="var(--ds-ink)"
            stroke="var(--ds-canvas)"
            strokeOpacity="0.28"
            strokeWidth="1"
          />
          <path
            className="owl-wing owl-wing--r"
            d="M50.5 34 C56 40 55 52 47 54 C46 47 46.5 40 50.5 34 Z"
            fill="var(--ds-ink)"
            stroke="var(--ds-canvas)"
            strokeOpacity="0.28"
            strokeWidth="1"
          />

          {/* eyes */}
          <g className="owl-eyes">
            <circle cx="24" cy="30" r="8.5" fill="var(--ds-canvas)" />
            <circle cx="40" cy="30" r="8.5" fill="var(--ds-canvas)" />
            {showSleep ? (
              <g fill="none" stroke="var(--ds-ink)" strokeWidth="2.4" strokeLinecap="round">
                <path d="M19.5 30 Q24 34 28.5 30" />
                <path d="M35.5 30 Q40 34 44.5 30" />
              </g>
            ) : happy ? (
              <g fill="none" stroke="var(--ds-ink)" strokeWidth="2.6" strokeLinecap="round">
                <path d="M19.5 31.5 Q24 25.5 28.5 31.5" />
                <path d="M35.5 31.5 Q40 25.5 44.5 31.5" />
              </g>
            ) : (
              <>
                <g
                  ref={pupilsRef}
                  className="owl-pupils"
                  style={shrug ? { transform: 'translateX(2.2px)' } : undefined}
                >
                  <circle cx="24" cy="30.5" r="3.8" fill="var(--ds-ink)" />
                  <circle cx="25.3" cy="29" r="1.1" fill="var(--ds-canvas)" />
                  {!winking && (
                    <>
                      <circle cx="40" cy="30.5" r="3.8" fill="var(--ds-ink)" />
                      <circle cx="41.3" cy="29" r="1.1" fill="var(--ds-canvas)" />
                    </>
                  )}
                </g>
                {winking && (
                  <path
                    d="M35.5 30.5 Q40 34.5 44.5 30.5"
                    fill="none"
                    stroke="var(--ds-ink)"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
          </g>

          {shrug && (
            <g stroke="var(--ds-ink)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M17.5 19.5 L26 22" />
              <path d="M46.5 21 L38 22.5" />
            </g>
          )}

          {/* beak */}
          <path
            className="owl-beak"
            d="M29 35 L35 35 L32 41 Z"
            fill="#f5a623"
            stroke="#ab570a"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />

          {(happy || reaction === 'love' || reaction === 'flap') && (
            <g fill="#34d399">
              <circle cx="12" cy="14" r="1.6" className="owl-spark owl-spark--a" />
              <circle cx="53" cy="12" r="1.3" className="owl-spark owl-spark--b" />
              <circle cx="57" cy="30" r="1.1" className="owl-spark owl-spark--c" />
            </g>
          )}
        </g>

        {showSleep && (
          <g className="owl-zzz" fill="var(--ds-ink)" fontWeight="800" fontFamily="system-ui, sans-serif">
            <text x="50" y="14" fontSize="8" className="owl-z owl-z--a">z</text>
            <text x="55" y="7" fontSize="6" className="owl-z owl-z--b">z</text>
          </g>
        )}
      </svg>
    </span>
  );
}
