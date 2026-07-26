'use client';

import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
  {
    k: 'MCP tools',
    v: '13',
    hint: 'find_brand_domains & more',
  },
  {
    k: 'Budget filter',
    v: 'USD',
    hint: 'Hard maxBudgetUsd cap',
  },
  {
    k: 'Agent Card',
    v: 'JSON',
    hint: 'ANS-style discovery',
  },
  {
    k: 'Auto-buy',
    v: 'Off',
    hint: 'Human confirm required',
  },
] as const;

export function AdaStatsStrip({ isLight }: { isLight: boolean }) {
  const ink = isLight ? 'text-slate-900' : 'text-white';
  const faint = isLight ? 'text-slate-500' : 'text-white/40';
  const muted = isLight ? 'text-slate-600' : 'text-white/50';
  const line = isLight ? 'border-slate-200' : 'border-white/[0.08]';
  const cellBorder = isLight ? 'border-slate-200' : 'border-white/[0.08]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`shine-border relative isolate max-w-3xl mx-auto rounded-2xl sm:rounded-[1.35rem] border overflow-hidden ${line} ${
        isLight
          ? 'bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]'
          : 'bg-[#0a0a0c] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)]'
      }`}
    >
      {/* Solid underlay — no ambient pattern bleed */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${
          isLight ? 'bg-white' : 'bg-[#0a0a0c]'
        }`}
      />

      {/* soft silver sheen */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isLight
            ? 'linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.65) 50%, transparent 58%)'
            : 'linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.045) 50%, transparent 58%)',
          backgroundSize: '220% 100%',
        }}
        animate={{ backgroundPosition: ['120% 0%', '-40% 0%'] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-[1] grid grid-cols-2 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.k}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.06 + i * 0.06,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              backgroundColor: isLight ? 'rgba(248,250,252,0.9)' : 'rgba(255,255,255,0.03)',
            }}
            className={`relative text-center px-2 sm:px-4 py-2.5 sm:py-6 transition-colors ${
              // dividers: silver only
              i % 2 === 0 ? `border-r ${cellBorder}` : ''
            } ${i < 2 ? `border-b sm:border-b-0 ${cellBorder}` : ''} ${
              i === 1 ? `sm:border-r ${cellBorder}` : ''
            } ${i === 2 ? `sm:border-r ${cellBorder}` : ''}`}
          >
            <motion.div
              className={`text-lg sm:text-[1.75rem] font-black tracking-tight tabular-nums ${ink}`}
              initial={{ opacity: 0.4 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            >
              {s.v}
            </motion.div>
            <div
              className={`mt-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] ${faint}`}
            >
              {s.k}
            </div>
            <div className={`mt-1 text-[10px] sm:text-[11px] leading-snug ${muted}`}>{s.hint}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
