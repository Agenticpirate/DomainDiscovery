'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { isLabAutomation, prefersReducedMotion } from '@/lib/perfRuntime';

type Dot = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type Shock = { x: number; y: number; born: number };

/**
 * Giant halftone wordmark. Dots fill the band to the edges, spring away from
 * the pointer, and a click sends a ring through the letters.
 * Colours stay in the DomainDiscovery silver / ink palette.
 */
export function HalftoneWordmark({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLabAutomation() || prefersReducedMotion()) {
      setReduced(true);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const isLight = mounted && theme === 'light';

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dots: Dot[] = [];
    let running = true;
    let inView = true;
    let tabVisible = document.visibilityState === 'visible';
    let raf = 0;
    let shock: Shock | null = null;
    const pointer = { x: -9999, y: -9999, on: false };

    const build = (cssW: number, cssH: number) => {
      const off = document.createElement('canvas');
      off.width = cssW;
      off.height = cssH;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;
      octx.clearRect(0, 0, cssW, cssH);
      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'alphabetic';

      const isMobile = cssW < 640;
      const font = (n: number) =>
        `800 ${Math.max(12, n)}px "Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
      let size: number;
      if (isMobile) {
        const side = 14;
        const topPad = 22;
        octx.font = font(100);
        const sample = Math.max(1, octx.measureText(text).width);
        size = ((cssW - side * 2) / sample) * 100;
        const maxByHeight = (cssH - topPad - 8) / 0.9;
        size = Math.min(size, maxByHeight);
        octx.font = font(size);
        const fitted = octx.measureText(text).width;
        const maxW = cssW - side * 2;
        if (fitted > maxW) size *= (maxW / fitted) * 0.98;
        octx.font = font(size);
        const ascent = size * 0.72;
        const descent = size * 0.16;
        const top = Math.max(topPad, (cssH - ascent - descent) / 2);
        octx.fillText(text, cssW / 2, top + ascent);
      } else {
        const side = 10;
        octx.font = font(100);
        const sample = Math.max(1, octx.measureText(text).width);
        size = ((cssW - side * 2) / sample) * 100 * 1.18;
        octx.font = font(size);
        const fitted = octx.measureText(text).width;
        const maxW = cssW - side * 2;
        if (fitted > maxW) size *= maxW / fitted;
        octx.font = font(size);
        const ascent = size * 0.74;
        // Crop the bottom 15% so 85% of each letter stays visible.
        octx.fillText(text, cssW / 2, cssH + ascent * 0.15);
      }

      const gap = isMobile ? 3.6 : 4;
      const { data } = octx.getImageData(0, 0, cssW, cssH);
      const next: Dot[] = [];
      for (let y = 0; y < cssH; y += gap) {
        for (let x = 0; x < cssW; x += gap) {
          const ix = Math.min(cssW - 1, Math.floor(x));
          const iy = Math.min(cssH - 1, Math.floor(y));
          const a = data[(iy * cssW + ix) * 4 + 3];
          if (a < 140) continue;
          const r = gap * (0.28 + (a / 255) * 0.22);
          next.push({ ox: x, oy: y, x, y, vx: 0, vy: 0, r });
        }
      }
      dots = next;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const cssW = Math.max(rect.width < 640 ? 240 : 280, Math.floor(rect.width));
      const cssH = Math.max(rect.width < 640 ? 72 : 160, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(cssW, cssH);
      if (reduced) paint(performance.now());
    };

    const paint = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const idle = isLight ? '20, 21, 23' : '224, 226, 228';
      const hot = isLight ? '0, 0, 0' : '255, 255, 255';

      let ring = -1;
      if (shock) {
        const age = now - shock.born;
        if (age > 650) shock = null;
        else ring = age * 0.65;
      }

      // Sleek, minimalist motion parameters (critically damped, no heavy bounce)
      const reach = 60;
      const wavePhase = now * 0.0016;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (!reduced) {
          // Ambient sleek gentle flow across letters
          const wave = Math.sin(d.ox * 0.0075 - wavePhase) * 0.45;
          const targetOy = d.oy + wave;

          // Strongly damped spring: returns smoothly with zero bounce/oscillation
          let ax = (d.ox - d.x) * 0.12;
          let ay = (targetOy - d.y) * 0.12;

          if (pointer.on) {
            const mx = d.x - pointer.x;
            const my = d.y - pointer.y;
            const dist = Math.hypot(mx, my) || 0.001;
            if (dist < reach) {
              const norm = (reach - dist) / reach;
              const push = norm * norm * 0.45; // Subtle, elegant nudge
              ax += (mx / dist) * push;
              ay += (my / dist) * push;
            }
          }

          if (shock && ring > 0) {
            const sx = d.x - shock.x;
            const sy = d.y - shock.y;
            const dist = Math.hypot(sx, sy) || 0.001;
            const band = Math.max(0, 1 - Math.abs(dist - ring) / 20);
            if (band > 0) {
              ax += (sx / dist) * band * 0.9;
              ay += (sy / dist) * band * 0.9;
            }
          }

          d.vx = (d.vx + ax) * 0.74;
          d.vy = (d.vy + ay) * 0.74;

          // Velocity cap to ensure it stays ultra-sleek and controlled
          const speed = Math.hypot(d.vx, d.vy);
          if (speed > 2.0) {
            d.vx = (d.vx / speed) * 2.0;
            d.vy = (d.vy / speed) * 2.0;
          }

          d.x += d.vx;
          d.y += d.vy;
        }

        const shift = Math.min(1, Math.hypot(d.x - d.ox, d.y - d.oy) / 5);
        const rgb = shift > 0.45 ? hot : idle;
        const alpha = isLight ? 0.52 + shift * 0.35 : 0.40 + shift * 0.45;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.arc(d.x, d.y, d.r * (1 + shift * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      paint(now);
      if (!inView || !tabVisible || reduced) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf && running && inView && tabVisible && !reduced) {
        raf = requestAnimationFrame(tick);
      }
    };

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMove = (e: PointerEvent) => {
      const p = local(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.on = true;
      kick();
    };
    const onLeave = () => {
      pointer.on = false;
      pointer.x = -9999;
      pointer.y = -9999;
      kick();
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.on = true;
      shock = { x: p.x, y: p.y, born: performance.now() };
      kick();
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointercancel', onLeave);

    const onVis = () => {
      tabVisible = document.visibilityState === 'visible';
      kick();
    };
    document.addEventListener('visibilitychange', onVis);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          inView = entries.some((entry) => entry.isIntersecting);
          kick();
        },
        { rootMargin: '80px', threshold: 0.01 }
      );
      io.observe(wrap);
    }

    const ro = new ResizeObserver(() => resize());
    resize();
    ro.observe(wrap);
    kick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointercancel', onLeave);
    };
  }, [mounted, reduced, isLight, text]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className}`}>
      <span className="sr-only">{text}</span>
      <canvas ref={canvasRef} className="block h-full w-full" style={{ touchAction: 'pan-y' }} aria-hidden />
    </div>
  );
}
