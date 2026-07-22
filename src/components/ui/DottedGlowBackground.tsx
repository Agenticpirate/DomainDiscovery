'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type Dot = {
  x: number;
  y: number;
  phase: number;
  speed: number;
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
}

/**
 * Aceternity-style dotted glow background — brand silver/slate palette.
 * Canvas dots with staggered opacity pulse + soft glow.
 */
export const DottedGlowBackground: React.FC<DottedGlowBackgroundProps> = ({
  className = '',
  gap = 16,
  radius = 1.25,
  opacity = 0.28,
  speedMin = 0.25,
  speedMax = 0.7,
  speedScale = 0.55,
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

    const build = (w: number, h: number) => {
      const dots: Dot[] = [];
      const startX = (w % gap) / 2;
      const startY = (h % gap) / 2;
      for (let y = startY; y < h; y += gap) {
        for (let x = startX; x < w; x += gap) {
          dots.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            speed: (speedMin + Math.random() * (speedMax - speedMin)) * speedScale,
          });
        }
      }
      dotsRef.current = dots;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    // Brand palette — light: soft slate dots; dark: silver (unchanged feel)
    const baseRgb = isLight ? '71, 85, 105' : '226, 232, 240';
    const glowRgb = isLight ? '148, 163, 184' : '255, 255, 255';

    let last = performance.now();

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = opacity;

      // Very soft radial wash (low shine)
      const grd = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.08,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.55
      );
      if (isLight) {
        grd.addColorStop(0, 'rgba(148, 163, 184, 0.02)');
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.phase += d.speed * dt;

        // Gentle pulse — low amplitude so it doesn’t overpower UI
        const pulse = 0.22 + 0.45 * (0.5 + 0.5 * Math.sin(d.phase));
        const glowPeak = Math.pow(0.5 + 0.5 * Math.sin(d.phase * 1.2 + 0.6), 4);

        const a = pulse * (isLight ? 0.18 : 0.38);
        const r = radius * (0.85 + pulse * 0.25);

        // Minimal glow — only rare soft peaks (softer in light)
        if (glowPeak > 0.72) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${glowRgb}, ${glowPeak * (isLight ? 0.035 : 0.06)})`;
          ctx.arc(d.x, d.y, r * 2.1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${baseRgb}, ${a})`;
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [mounted, isLight, gap, radius, opacity, speedMin, speedMax, speedScale]);

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};
