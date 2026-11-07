'use client';

import React, { useEffect, useRef } from 'react';

export type OwlMood = 'idle' | 'happy' | 'shrug';

type OwlProps = {
  mood?: OwlMood;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech. */
  title?: string;
};

/** Max pupil travel in SVG units (eye radius 8.5, pupil radius 3.8). */
const MAX_LOOK = 3.6;
/** Cursor distance (px) at which the pupils reach full travel. */
const FULL_LOOK_DISTANCE = 220;

/**
 * DomainDiscovery mascot. Pure SVG, colored from the design-system tokens
 * (--ds-ink / --ds-canvas) so it reads in both light and dark themes.
 * Pupils follow the mouse cursor. Animation lives in globals.css (.owl-*)
 * and is disabled for reduced motion.
 */
export function Owl({ mood = 'idle', className = '', title }: OwlProps) {
  const happy = mood === 'happy';
  const shrug = mood === 'shrug';

  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (shrug) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const svg = svgRef.current;
    const pupils = pupilsRef.current;
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
      if (pupils) pupils.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    };

    const onMove = (e: PointerEvent) => {
      // Touch has no hover position; keep the idle glance animation there.
      if (e.pointerType === 'touch') return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      // Cursor left the window: settle back to center.
      if (pupils) pupils.style.transform = 'translate(0px, 0px)';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [shrug, happy]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 64 64"
      className={`owl owl--${mood} ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g className="owl-body">
        {/* feet */}
        <rect x="22" y="57" width="7" height="4" rx="2" fill="#f5a623" />
        <rect x="35" y="57" width="7" height="4" rx="2" fill="#f5a623" />

        {/* ear tufts */}
        <path d="M14 20 L16 6 L27 14 Z" fill="var(--ds-ink)" />
        <path d="M50 20 L48 6 L37 14 Z" fill="var(--ds-ink)" />

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
          {happy ? (
            <g fill="none" stroke="var(--ds-ink)" strokeWidth="2.6" strokeLinecap="round">
              <path d="M19.5 31.5 Q24 25.5 28.5 31.5" />
              <path d="M35.5 31.5 Q40 25.5 44.5 31.5" />
            </g>
          ) : (
            <g
              ref={pupilsRef}
              className="owl-pupils"
              style={shrug ? { transform: 'translateX(2.2px)' } : undefined}
            >
              <circle cx="24" cy="30.5" r="3.8" fill="var(--ds-ink)" />
              <circle cx="40" cy="30.5" r="3.8" fill="var(--ds-ink)" />
              <circle cx="25.3" cy="29" r="1.1" fill="var(--ds-canvas)" />
              <circle cx="41.3" cy="29" r="1.1" fill="var(--ds-canvas)" />
            </g>
          )}
        </g>

        {shrug && (
          <g stroke="var(--ds-ink)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M17.5 19.5 L26 22" />
            <path d="M46.5 21 L38 22.5" />
          </g>
        )}

        {/* beak */}
        <path d="M29 35 L35 35 L32 41 Z" fill="#f5a623" stroke="#ab570a" strokeWidth="0.6" strokeLinejoin="round" />

        {happy && (
          <g fill="#34d399">
            <circle cx="12" cy="14" r="1.6" className="owl-spark owl-spark--a" />
            <circle cx="53" cy="12" r="1.3" className="owl-spark owl-spark--b" />
          </g>
        )}
      </g>
    </svg>
  );
}
