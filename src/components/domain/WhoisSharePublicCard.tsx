'use client';

import React, { useCallback, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';

export type PublicWhoisCardData = {
  domain: string;
  registrar: string;
  status: string;
  registrationDate: string | null;
  expirationDate: string | null;
  nameServers: string[];
  dnssec?: boolean;
  available?: boolean;
};

/** Live 3D WHOIS card for the public share page (what people land on from social). */
export function WhoisSharePublicCard({ data }: { data: PublicWhoisCardData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 220, damping: 22, mass: 0.35 });
  const springY = useSpring(my, { stiffness: 220, damping: 22, mass: 0.35 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const glareX = useTransform(springX, [-0.5, 0.5], [15, 85]);
  const glareY = useTransform(springY, [-0.5, 0.5], [15, 85]);
  const glareBg = useMotionTemplate`radial-gradient(280px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2), transparent 55%)`;

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width - 0.5);
      my.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mx, my]
  );

  const onPointerLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/40 px-5 py-8"
      style={{ perspective: 900 }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(226,232,240,0.22), transparent 70%)',
        }}
      />

      <motion.div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } }}
        className="relative z-10 w-full cursor-grab active:cursor-grabbing select-none"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-[-6px] rounded-[22px] border border-white/15"
          style={{ transform: 'translateZ(-16px)' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#121216] via-[#0c0c0e] to-[#16161c] shadow-2xl">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{ background: glareBg }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ left: ['-40%', '120%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
          />

          <div className="relative p-5" style={{ transform: 'translateZ(24px)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  DomainDiscovery · WHOIS
                </div>
                <h2 className="mt-1.5 break-all text-2xl font-black tracking-tight text-white">
                  {data.domain}
                </h2>
              </div>
              <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                RDAP
              </span>
            </div>

            <div
              className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-white/10 bg-black/35 p-3"
              style={{ transform: 'translateZ(12px)' }}
            >
              <Field label="Status" value={data.status || '—'} />
              <Field label="Registrar" value={data.registrar || '—'} />
              <Field label="Registered" value={data.registrationDate || '—'} />
              <Field label="Expires" value={data.expirationDate || '—'} />
              {typeof data.dnssec === 'boolean' && (
                <Field label="DNSSEC" value={data.dnssec ? 'Signed' : 'Unsigned'} />
              )}
              {data.nameServers[0] && (
                <Field label="Name server" value={data.nameServers[0]} mono />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">{label}</div>
      <div
        className={`mt-0.5 truncate text-[12px] font-semibold text-white/85 ${mono ? 'font-mono' : ''}`}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
