'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { isLabAutomation } from '@/lib/perfRuntime';

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  phase: number;
  twinkle: number;
  isBrand: boolean;
  /** 0–1 how deep inside the letter stroke */
  core: number;
};

interface ParticleTextProps {
  text?: string;
  className?: string;
  height?: number;
}

/**
 * Premium particle wordmark:
 * sharp brand letters, subtle field, controlled silver twinkle.
 * No puffy glow / cotton-candy edges.
 */
export const ParticleText: React.FC<ParticleTextProps> = ({
  text = 'DomainDiscovery',
  className = '',
  height = 188,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const fontMetaRef = useRef({ size: 40, y: 56 });
  const rafRef = useRef(0);
  const pointerRef = useRef({
    x: -9999,
    y: -9999,
    px: -9999,
    py: -9999,
    active: false,
    down: false,
  });
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lab tools + reduced-motion users get static text (no endless rAF)
    if (isLabAutomation()) {
      setReducedMotion(true);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const isLight = mounted ? theme === 'light' : false;

  useEffect(() => {
    if (!mounted || reducedMotion) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let running = true;
    let inView = true;
    let tabVisible = document.visibilityState === 'visible';

    const buildParticles = (cssW: number, cssH: number) => {
      const isMobile = cssW < 480;
      const list: Particle[] = [];

      // —— Field: sparse, tiny, low-contrast (professional backdrop) ——
      const fieldGap = isMobile ? 9 : 8;
      const padX = 10;
      const padY = 10;
      for (let y = padY; y < cssH - padY; y += fieldGap) {
        for (let x = padX; x < cssW - padX; x += fieldGap) {
          const jx = (Math.random() - 0.5) * fieldGap * 0.7;
          const jy = (Math.random() - 0.5) * fieldGap * 0.7;
          // thin out center so brand stays clean
          const nx = (x - cssW / 2) / (cssW * 0.5);
          const ny = (y - cssH / 2) / (cssH * 0.5);
          const centerDist = Math.sqrt(nx * nx + ny * ny * 2.2);
          // skip most particles in brand zone
          if (centerDist < 0.55 && Math.random() > 0.22) continue;

          list.push({
            x: x + jx,
            y: y + jy,
            ox: x + jx,
            oy: y + jy,
            vx: 0,
            vy: 0,
            size: 0.55 + Math.random() * 0.4,
            baseAlpha: 0.12 + Math.random() * 0.1,
            phase: Math.random() * Math.PI * 2,
            twinkle: 0.4 + Math.random() * 0.9,
            isBrand: false,
            core: 0,
          });
        }
      }

      // —— Brand: larger, centered, dense fine dots ——
      const off = document.createElement('canvas');
      off.width = cssW;
      off.height = cssH;
      const octx = off.getContext('2d');
      if (octx) {
        octx.clearRect(0, 0, cssW, cssH);
        octx.fillStyle = '#ffffff';
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';

        // Fit full brand name — larger on mobile, still never crop left/right
        const sidePad = isMobile ? 10 : 20;
        const maxTextW = Math.max(80, cssW - sidePad * 2);
        const maxByH = cssH * (isMobile ? 0.58 : 0.62);
        const maxByCap = isMobile ? 56 : 96;
        let fontSize = Math.min(maxByH, maxByCap, cssW / Math.max(6, text.length * 0.32));
        fontSize = Math.max(isMobile ? 28 : 28, fontSize);

        const applyFont = (size: number) => {
          octx.font = `800 ${size}px "Inter", "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif`;
        };
        // Shrink until the full string measures within the safe width
        const floor = isMobile ? 24 : 22;
        for (let guard = 0; guard < 24; guard++) {
          applyFont(fontSize);
          const w = octx.measureText(text).width;
          if (w <= maxTextW || fontSize <= floor) break;
          fontSize = Math.max(floor, fontSize * (maxTextW / w) * 0.98);
        }
        applyFont(fontSize);

        const midX = cssW / 2;
        const midY = cssH / 2;
        const metrics = octx.measureText(text);
        const opticalY =
          midY +
          ((metrics.actualBoundingBoxAscent || fontSize * 0.7) -
            (metrics.actualBoundingBoxDescent || fontSize * 0.2)) *
            0.08;
        fontMetaRef.current = { size: fontSize, y: opticalY };
        octx.fillText(text, midX, opticalY);

        const { data } = octx.getImageData(0, 0, cssW, cssH);
        // Slightly larger brand dots for big type, still crisp
        const brandGap = isMobile ? 2.2 : 2.15;

        for (let y = 0; y < cssH; y += brandGap) {
          for (let x = 0; x < cssW; x += brandGap) {
            const ix = Math.floor(x);
            const iy = Math.floor(y);
            const a = data[(iy * cssW + ix) * 4 + 3];
            if (a < 160) continue;

            let edge = 0;
            const offsets = [
              [brandGap, 0],
              [-brandGap, 0],
              [0, brandGap],
              [0, -brandGap],
            ];
            for (const [ox, oy] of offsets) {
              const nx = Math.floor(x + ox);
              const ny = Math.floor(y + oy);
              if (nx < 0 || ny < 0 || nx >= cssW || ny >= cssH) {
                edge += 1;
                continue;
              }
              if (data[(ny * cssW + nx) * 4 + 3] < 120) edge += 1;
            }
            const isEdge = edge >= 1;
            const core = isEdge ? 0.25 : a > 220 ? 1 : 0.7;

            const jx = (Math.random() - 0.5) * 0.4;
            const jy = (Math.random() - 0.5) * 0.4;

            list.push({
              x: x + jx + (Math.random() - 0.5) * 6,
              y: y + jy + (Math.random() - 0.5) * 5,
              ox: x + jx,
              oy: y + jy,
              vx: 0,
              vy: 0,
              size: isEdge
                ? 0.85 + Math.random() * 0.35
                : 1.05 + Math.random() * 0.4,
              baseAlpha: isEdge ? 0.5 + Math.random() * 0.22 : 0.86 + Math.random() * 0.14,
              phase: Math.random() * Math.PI * 2,
              twinkle: 0.55 + Math.random() * 1.1,
              isBrand: true,
              core,
            });
          }
        }
      }

      particlesRef.current = list;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const cssW = Math.max(240, Math.floor(rect.width));
      // Room for larger mobile wordmark; desktop uses full height
      const cssH = cssW < 480 ? Math.min(height, 128) : height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles(cssW, cssH);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    const localPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const softPush = (bx: number, by: number, power: number) => {
      const parts = particlesRef.current;
      const radius = 64;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const mx = p.x - bx;
        const my = p.y - by;
        const dist2 = mx * mx + my * my;
        if (dist2 >= radius * radius || dist2 < 0.01) continue;
        const dist = Math.sqrt(dist2);
        const mult = p.isBrand ? 0.45 : 1;
        const force = ((radius - dist) / radius) * power * mult;
        p.vx += (mx / dist) * force;
        p.vy += (my / dist) * force;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture?.(e.pointerId);
      const pt = localPoint(e);
      pointerRef.current = {
        x: pt.x,
        y: pt.y,
        px: pt.x,
        py: pt.y,
        active: true,
        down: true,
      };
      softPush(pt.x, pt.y, 1.25);
    };

    const onPointerMove = (e: PointerEvent) => {
      const pt = localPoint(e);
      const p = pointerRef.current;
      p.px = p.x;
      p.py = p.y;
      p.x = pt.x;
      p.y = pt.y;
      p.active = true;
      if (p.down) {
        const spd = Math.hypot(p.x - p.px, p.y - p.py);
        softPush(pt.x, pt.y, 0.4 + Math.min(1.1, spd * 0.1));
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      pointerRef.current.down = false;
      try {
        canvas.releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerLeave = () => {
      if (!pointerRef.current.down) {
        pointerRef.current.active = false;
        pointerRef.current.x = -9999;
        pointerRef.current.y = -9999;
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    let t0 = performance.now();

    const tick = (now: number) => {
      if (!running) return;
      const rawDt = (now - t0) / 16.67;
      const dt = Math.min(1.25, Math.max(0.4, rawDt));
      t0 = now;
      const time = now * 0.0004;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Brand palette — light: crisp slate wordmark on pale page
      const brandBright = isLight ? '15, 23, 42' : '248, 250, 252';
      const brandMid = isLight ? '30, 41, 59' : '203, 213, 225';
      const brandGlow = isLight ? '100, 116, 139' : '226, 232, 240';
      const fieldCol = isLight ? '148, 163, 184' : '88, 96, 112';

      const pointer = pointerRef.current;
      const parts = particlesRef.current;

      // Physics — calm
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const amp = p.isBrand ? 0.35 : 0.85;
        const floatX = Math.sin(time * 0.85 + p.phase) * amp;
        const floatY = Math.cos(time * 1.0 + p.phase * 1.1) * amp * 0.8;

        const dx = p.ox + floatX - p.x;
        const dy = p.oy + floatY - p.y;
        const spring = p.isBrand ? 0.035 : 0.018;
        p.vx += dx * spring * dt;
        p.vy += dy * spring * dt;

        if (pointer.active && !pointer.down) {
          const mx = p.x - pointer.x;
          const my = p.y - pointer.y;
          const dist2 = mx * mx + my * my;
          const radius = 50;
          if (dist2 < radius * radius && dist2 > 0.1) {
            const dist = Math.sqrt(dist2);
            const force = ((radius - dist) / radius) * (p.isBrand ? 0.55 : 0.95);
            p.vx += (mx / dist) * force * dt;
            p.vy += (my / dist) * force * dt;
          }
        }

        p.vx *= 0.94;
        p.vy *= 0.94;
        const maxV = p.isBrand ? 1.8 : 2.2;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > maxV) {
          p.vx = (p.vx / sp) * maxV;
          p.vy = (p.vy / sp) * maxV;
        }
        p.x += p.vx * dt * 0.7;
        p.y += p.vy * dt * 0.7;
      }

      // —— Field dots (no heavy glow) ——
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.isBrand) continue;
        // gentle twinkle only
        const tw = 0.55 + 0.45 * Math.sin(time * p.twinkle * 1.8 + p.phase);
        // Field quieter in light so brand stays the focus
        const fieldCap = isLight ? 0.18 : 0.35;
        const a = p.baseAlpha * (isLight ? 0.4 + tw * 0.35 : 0.55 + tw * 0.55);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${fieldCol}, ${Math.min(fieldCap, a)})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Diagonal shine sweep across brand — full L→R pass every 2 seconds
      const SHINE_PERIOD_MS = 2000;
      const shineProgress = (now % SHINE_PERIOD_MS) / SHINE_PERIOD_MS; // 0 → 1
      // Start slightly left of text, end slightly past right edge
      const shineX = (shineProgress * 1.35 - 0.15) * w;

      // —— Soft shine halo on brand core (controlled) ——
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p.isBrand || p.core < 0.5) continue;

        const distToShine = Math.abs(p.x - shineX);
        const shineBand = Math.max(0, 1 - distToShine / (w * 0.1));
        const tw =
          0.5 + 0.5 * Math.sin(time * p.twinkle * 1.5 + p.phase);

        // base micro-glow + stronger when shine passes
        const glowA =
          p.baseAlpha *
          (isLight
            ? 0.03 + tw * 0.04 + shineBand * 0.14
            : 0.04 + tw * 0.06 + shineBand * 0.28);
        if (glowA < 0.02) continue;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${brandGlow}, ${Math.min(isLight ? 0.2 : 0.34, glowA)})`;
        ctx.arc(p.x, p.y, p.size * (1.8 + shineBand * 1.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // —— Brand solid dots (sharp, larger wordmark) ——
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p.isBrand) continue;

        const distToShine = Math.abs(p.x - shineX);
        const shineBand = Math.max(0, 1 - distToShine / (w * 0.11));
        const tw =
          0.78 +
          0.22 *
            Math.pow(0.5 + 0.5 * Math.sin(time * p.twinkle * 1.6 + p.phase), 1.6);

        // Light: solid slate wordmark; dark: bright silver
        let rgb = p.core > 0.6 ? brandBright : brandMid;
        if (shineBand > 0.3 && p.core > 0.5) {
          rgb = isLight ? '2, 6, 23' : '255, 255, 255';
        }
        const a = Math.min(
          1,
          p.baseAlpha * tw +
            shineBand * (isLight ? 0.16 : 0.36) +
            (tw > 0.95 ? 0.08 : 0)
        );

        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${a})`;
        ctx.arc(p.x, p.y, p.size * (1 + shineBand * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }

      // Pause when off-screen or tab hidden — required for Lighthouse CPU idle
      if (!running) return;
      if (!inView || !tabVisible) {
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      tabVisible = document.visibilityState === 'visible';
      if (tabVisible && inView && running && !rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          inView = entries.some((e) => e.isIntersecting);
          if (inView && tabVisible && running && !rafRef.current) {
            rafRef.current = requestAnimationFrame(tick);
          }
        },
        { rootMargin: '80px', threshold: 0.05 }
      );
      io.observe(wrap);
    }

    if (tabVisible && inView) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [mounted, reducedMotion, isLight, text, height]);

  if (!mounted) {
    return (
      <div
        ref={wrapRef}
        className={`relative w-full flex items-center justify-center ${className}`}
        style={{ height }}
        aria-hidden
      />
    );
  }

  if (reducedMotion) {
    return (
      <div
        ref={wrapRef}
        className={`relative w-full flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p
          className="footer-brand-shine text-[1.35rem] sm:text-[1.85rem] font-extrabold tracking-tight text-center"
          style={{
            letterSpacing: '-0.02em',
            backgroundImage: isLight
              ? 'linear-gradient(90deg, #94a3b8 0%, #0f172a 35%, #64748b 50%, #0f172a 65%, #94a3b8 100%)'
              : 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, #fff 35%, rgba(255,255,255,0.55) 50%, #fff 65%, rgba(255,255,255,0.4) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {text}
        </p>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`relative w-full select-none ${className}`} style={{ height }}>
      <span className="sr-only">{text}</span>
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
        aria-hidden
      />
    </div>
  );
};
