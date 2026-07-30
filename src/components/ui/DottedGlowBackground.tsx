'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type Dot = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  /** Sharp twinkle phase (independent of soft pulse) */
  twinkle: number;
  twinkleSpeed: number;
  /** Chance this dot does bright sparkles */
  sparkle: boolean;
};

interface DottedGlowBackgroundProps {
  className?: string;
  /** Distance between dot centers (px) */
  gap?: number;
  /** Base radius of each dot (css px) */
  radius?: number;
  /** Global opacity of the layer */
  opacity?: number;
  /** Min / max pulse speed (rad/s) */
  speedMin?: number;
  speedMax?: number;
  /** Global speed multiplier */
  speedScale?: number;
  /** Slight sparkle / twinkle on a subset of dots (default true) */
  sparkle?: boolean;
}

/**
 * Aceternity-style dotted glow background — brand silver/slate palette.
 * Soft pulse + optional sharp sparkle so the field feels alive without washing text.
 */
export const DottedGlowBackground: React.FC<DottedGlowBackgroundProps> = ({
  className = '',
  gap = 16,
  radius = 1.25,
  opacity = 0.32,
  speedMin = 0.25,
  speedMax = 0.7,
  speedScale = 0.55,
  sparkle = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef(0);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let dpr = 1;
    let tabVisible = document.visibilityState === 'visible';
    let lastFrame = 0;

    // Lab / reduced motion: one static paint, no continuous rAF (PageSpeed TBT)
    let reduced = false;
    try {
      reduced =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !!(navigator as Navigator & { webdriver?: boolean }).webdriver;
    } catch {
      /* ignore */
    }

    const build = (w: number, h: number) => {
      const dots: Dot[] = [];
      const startX = (w % gap) / 2;
      const startY = (h % gap) / 2;
      for (let y = startY; y < h; y += gap) {
        for (let x = startX; x < w; x += gap) {
          // ~14% of dots get occasional bright sparkles
          const isSparkler = sparkle && Math.random() < 0.14;
          dots.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            speed: (speedMin + Math.random() * (speedMax - speedMin)) * speedScale,
            twinkle: Math.random() * Math.PI * 2,
            // Slower twinkle rates → occasional flashes, not constant glitter
            twinkleSpeed: (0.35 + Math.random() * 0.9) * speedScale,
            sparkle: isSparkler,
          });
        }
      }
      dotsRef.current = dots;
    };

    const resize = () => {
      // clientWidth/Height avoid forced layout thrash vs getBoundingClientRect in loops
      const w = Math.max(1, wrap.clientWidth || 1);
      const h = Math.max(1, wrap.clientHeight || 1);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(w, h);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    // Brand palette — light: soft indigo/sky sparkles; dark: silver (unchanged)
    const baseRgb = isLight ? '99, 102, 241' : '236, 240, 248';
    const sparkRgb = isLight ? '14, 165, 233' : '255, 255, 255';

    let last = performance.now();

    const paintFrame = (now: number, animate: boolean) => {
      const dt = animate ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      // Keep canvas transparent — page black shows through
      ctx.globalAlpha = opacity;

      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (animate) {
          d.phase += d.speed * dt;
          d.twinkle += d.twinkleSpeed * dt;
        }

        // Soft ambient pulse (always on)
        const pulse = 0.42 + 0.48 * (0.5 + 0.5 * Math.sin(d.phase));
        let a = pulse * (isLight ? 0.28 : 0.58);
        let r = radius * (0.92 + pulse * 0.22);

        // Sharp sparkle — pow keeps peaks brief and bright
        if (d.sparkle) {
          const tw = Math.pow(Math.max(0, Math.sin(d.twinkle)), 10);
          if (tw > 0.08) {
            a = Math.min(1, a + tw * (isLight ? 0.45 : 0.75));
            r = radius * (1.05 + tw * 0.85);

            // Soft glow halo for the flash only
            const glow = tw * (isLight ? 3.5 : 5.5);
            ctx.save();
            ctx.shadowBlur = glow;
            ctx.shadowColor = `rgba(${sparkRgb}, ${0.35 + tw * 0.55})`;
            ctx.beginPath();
            ctx.fillStyle = `rgba(${sparkRgb}, ${0.55 + tw * 0.45})`;
            ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
          }
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${baseRgb}, ${a})`;
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (!running) return;
      if (!tabVisible) {
        rafRef.current = 0;
        return;
      }
      // ~15fps is enough for soft ambient pulse (huge main-thread win vs 60fps)
      if (now - lastFrame < 66) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;
      paintFrame(now, true);
      rafRef.current = requestAnimationFrame(tick);
    };

    const onVis = () => {
      tabVisible = document.visibilityState === 'visible';
      if (tabVisible && running && !rafRef.current && !reduced) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    if (reduced) {
      paintFrame(performance.now(), false);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
    };
  }, [mounted, isLight, gap, radius, opacity, speedMin, speedMax, speedScale, sparkle]);

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />
    </div>
  );
};
