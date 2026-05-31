'use client';

/**
 * Mandala — a decorative, token-driven tech-mandala used as an ambient backdrop
 * flourish (behind the hero and, subtly, site-wide via PageBackground).
 *
 * Three concentric layers rotate at different speeds and directions to compose a
 * slow kaleidoscopic drift:
 *   - Outer layer: a dashed perimeter ring, a solid ring, fine radial tick marks,
 *     and node dots on a polygon — the "tech HUD" frame.
 *   - Mid layer: a polygon frame, a dashed ring, and teardrop petals (the mandala
 *     heart) rotating the opposite way.
 *   - Inner layer: a tighter ring + polygon + petals around a softly pulsing core.
 *
 * Motion comes from the token-driven `.animate-mandala` / `.animate-mandala-reverse`
 * / `.animate-mandala-pulse` utilities, all neutralized under
 * `prefers-reduced-motion` (see globals.css), so it degrades to a crisp static
 * figure when reduced motion is preferred.
 *
 * Purely presentational: `aria-hidden`, `pointer-events-none`, drawn in the gold
 * `--accent` token via `currentColor`. The caller controls size/position/opacity
 * through `className`.
 */

import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/components/ui/glass/hooks/useReducedMotion';

export interface MandalaProps {
  /** Extra classes (positioning, sizing, color, opacity) merged via cn(). */
  className?: string;
  /** Number of radial petals/spokes + polygon sides per ring. Default 12. */
  petals?: number;
  /**
   * Whether the layers rotate/pulse. Default true (focal use, e.g. the hero).
   * Pass false for ambient/background instances so the motif renders as a crisp
   * static texture — no continuous compositor work and no `will-change` GPU
   * pinning on pages where the mandala is not the focal point. Reduced-motion
   * always forces static regardless of this flag.
   */
  animated?: boolean;
}

const C = 100; // center

/** Teardrop petals radiating outward from `radius` by `length`. */
function spokes(petals: number, radius: number, length: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const cx = C + Math.cos(angle) * radius;
    const cy = C + Math.sin(angle) * radius;
    const tx = C + Math.cos(angle) * (radius + length);
    const ty = C + Math.sin(angle) * (radius + length);
    const px = Math.cos(angle + Math.PI / 2) * (length * 0.32);
    const py = Math.sin(angle + Math.PI / 2) * (length * 0.32);
    paths.push(
      `M ${cx - px} ${cy - py} Q ${tx} ${ty} ${cx + px} ${cy + py} Q ${C + Math.cos(angle) * radius} ${C + Math.sin(angle) * radius} ${cx - px} ${cy - py} Z`
    );
  }
  return paths;
}

/** Regular polygon path with a vertex pointing up. */
function polygon(sides: number, radius: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(C + Math.cos(angle) * radius).toFixed(2)} ${(C + Math.sin(angle) * radius).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

/** Fine radial tick marks between two radii (tech-HUD detailing). */
function ticks(count: number, rInner: number, rOuter: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    lines.push({
      x1: C + Math.cos(angle) * rInner,
      y1: C + Math.sin(angle) * rInner,
      x2: C + Math.cos(angle) * rOuter,
      y2: C + Math.sin(angle) * rOuter,
    });
  }
  return lines;
}

/** Node dots at polygon vertices. */
function nodes(count: number, radius: number) {
  const dots: { cx: number; cy: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    dots.push({ cx: C + Math.cos(angle) * radius, cy: C + Math.sin(angle) * radius });
  }
  return dots;
}

export function Mandala({ className = '', petals = 12, animated = true }: MandalaProps) {
  const prefersReducedMotion = useReducedMotion();
  const innerPetals = Math.max(6, Math.round(petals / 2));
  // Animate only when requested AND the user hasn't asked for reduced motion.
  const move = animated && !prefersReducedMotion;

  return (
    <div aria-hidden="true" className={cn('pointer-events-none select-none', className)}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        className="h-full w-full"
        style={{ color: 'var(--accent)' }}
      >
        {/* ── Outer layer: tech-HUD frame (slow CW) ── */}
        <g
          className={cn(move && 'animate-mandala')}
          style={{ transformOrigin: 'center', opacity: 0.5 }}
        >
          <circle cx={C} cy={C} r="96" strokeWidth="0.4" strokeDasharray="0.6 3" />
          <circle cx={C} cy={C} r="89" strokeWidth="0.5" />
          {ticks(petals * 3, 89, 95).map((l, i) => (
            <line key={`t${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth="0.4" />
          ))}
          {nodes(petals, 89).map((d, i) => (
            <circle key={`n${i}`} cx={d.cx} cy={d.cy} r="1.1" fill="currentColor" stroke="none" />
          ))}
        </g>

        {/* ── Mid layer: polygon + petals (CCW) ── */}
        <g
          className={cn(move && 'animate-mandala-reverse')}
          style={{ transformOrigin: 'center', opacity: 0.62 }}
        >
          <path d={polygon(petals, 74)} strokeWidth="0.45" />
          <circle cx={C} cy={C} r="68" strokeWidth="0.45" strokeDasharray="1.5 2.5" />
          {spokes(petals, 66, 16).map((d, i) => (
            <path key={`m${i}`} d={d} strokeWidth="0.55" />
          ))}
        </g>

        {/* ── Inner layer: tighter ring + petals (CW) ── */}
        <g
          className={cn(move && 'animate-mandala')}
          style={{ transformOrigin: 'center', opacity: 0.72 }}
        >
          <path d={polygon(innerPetals, 44)} strokeWidth="0.5" />
          <circle cx={C} cy={C} r="44" strokeWidth="0.4" />
          {spokes(innerPetals, 26, 16).map((d, i) => (
            <path key={`i${i}`} d={d} strokeWidth="0.6" />
          ))}
        </g>

        {/* ── Core: a softly breathing center ── */}
        <g
          className={cn(move && 'animate-mandala-pulse')}
          style={{ transformOrigin: 'center' }}
        >
          <circle cx={C} cy={C} r="9" strokeWidth="0.6" />
          <circle cx={C} cy={C} r="3.2" fill="currentColor" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

export default Mandala;
