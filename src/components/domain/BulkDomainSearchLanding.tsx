'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
// Feature card with hover animation
const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay?: number;
}> = ({ icon, title, description, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref}
      className={`group p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-500 cursor-pointer transform ${
        isLight ? 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md' : 'bg-white/[0.03] border border-white/10 hover:border-white/16 hover:bg-white/[0.05]'
      } ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-300 [&>svg]:w-5 [&>svg]:h-5 ${isLight ? 'bg-slate-100 text-slate-800 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900' : 'bg-white/[0.06] text-white/80 border border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'}`}>
        {icon}
      </div>
      <h3 className={`font-semibold text-sm sm:text-lg mb-1 sm:mb-2 transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</h3>
      <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
    </div>
  );
};

// Step card component
const StepCard: React.FC<{ 
  number: string; 
  title: string; 
  description: string;
  isLast?: boolean;
}> = ({ number, title, description, isLast = false }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`shine-border relative group rounded-2xl border p-4 sm:p-5 ${isLight ? 'border-slate-200 bg-white/80 shadow-sm' : 'border-white/10 bg-white/[0.02]'}`}>
      <div className={`absolute right-3 top-2 text-5xl sm:text-6xl font-black transition-colors duration-500 ${isLight ? 'text-slate-100 group-hover:text-blue-100' : 'text-white/[0.03] group-hover:text-slate-400/10'}`}>
        {number}
      </div>
      <div className="relative">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-sm font-bold text-white mb-3 shadow-lg shadow-slate-400/20">
          {number}
        </div>
        <h3 className={`text-lg sm:text-[1.15rem] font-bold mb-2 transition-colors ${isLight ? 'group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h3>
        <p className={`text-sm sm:text-[15px] leading-relaxed max-w-[26rem] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
      </div>
      {!isLast && (
        <div className="hidden md:block absolute top-1/2 left-full w-8 h-px bg-gradient-to-r from-slate-400/30 via-white/10 to-transparent -translate-x-2" />
      )}
    </div>
  );
};

// Industry solution card
const IndustryCard: React.FC<{
  title: string;
  description: string;
  features: string[];
  icon: string;
}> = ({ title, description, features, icon }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`group p-4 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 ${isLight ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md' : 'bg-white/[0.02] border border-white/10 hover:border-slate-400/20 hover:bg-white/[0.04]'}`}>
      <div className="flex items-start justify-between mb-2.5 sm:mb-3">
        <div>
          <span className="text-[22px] sm:text-[28px] mb-2 sm:mb-2.5 block">{icon}</span>
          <h3 className={`text-base sm:text-lg font-bold transition-colors ${isLight ? 'text-slate-900 group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h3>
        </div>
        <svg className={`w-5 h-5 group-hover:translate-x-1 transition-all ${isLight ? 'text-slate-300 group-hover:text-blue-500' : 'text-white/20 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
      <p className={`mb-3 sm:mb-4 leading-relaxed text-[13px] sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {features.map((f, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] transition-colors ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-500 group-hover:border-blue-300' : 'bg-white/5 border border-white/10 text-white/60 group-hover:border-slate-400/20'}`}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
};

// Expert tip card
const TipCard: React.FC<{
  number: number;
  title: string;
  description: string;
}> = ({ number, title, description }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`group flex gap-4 p-6 rounded-xl transition-all duration-300 ${isLight ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-slate-400/20 hover:bg-white/[0.04]'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isLight ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-slate-400/10 group-hover:bg-slate-400/20'}`}>
        <span className={`text-sm font-bold ${isLight ? 'text-blue-500' : 'text-slate-300'}`}>{number}</span>
      </div>
      <div>
        <h4 className={`font-semibold mb-2 transition-colors ${isLight ? 'group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h4>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
      </div>
    </div>
  );
};

// Tool link card
const ToolCard: React.FC<{
  href: string;
  icon: string;
  title: string;
  description: string;
}> = ({ href, icon, title, description }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <Link href={href} className={`group block p-4 sm:p-6 rounded-lg sm:rounded-xl transition-all duration-300 ${isLight ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-slate-400/30 hover:bg-white/[0.04]'}`}>
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className={`font-semibold text-sm sm:text-base mb-1 sm:mb-2 transition-colors ${isLight ? 'group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h3>
      <p className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
    </Link>
  );
};

// Domain tag type
interface DomainTag { 
  domain: string; 
  status: 'checking' | 'available' | 'taken' | 'premium' | 'error'; 
  price?: string; 
}

interface BulkSearchSnapshot {
  id: string;
  createdAt: number;
  domains: DomainTag[];
}

export type BulkAddOptions = {
  defaultTld?: string;
  autoAppendTld?: boolean;
  stripWww?: boolean;
  maxDomains?: number;
};

/** Prominent brandable domains used for sample load + UI examples */
export const BULK_SAMPLE_DOMAINS = [
  'ystartups.com',
  'cultbuddy.com',
  'foundersprime.com',
  'foundersblog.com',
  'startuphub.io',
  'venturelist.co',
  'brandforge.com',
  'northstar.ai',
  'launchpad.io',
  'getacme.com',
  'trybuddy.com',
] as const;

export const BULK_SAMPLE_TEXT = BULK_SAMPLE_DOMAINS.join('\n');

// Premium bulk input — paste, multi-import, advanced options
const SearchInputSection: React.FC<{
  input: string;
  setInput: (v: string) => void;
  domains: DomainTag[];
  setDomains: React.Dispatch<React.SetStateAction<DomainTag[]>>;
  onAdd: (text: string, options?: BulkAddOptions) => void;
  onLoadSample?: (options?: BulkAddOptions) => void;
  onCheck: () => void;
  onReset: () => void;
  onFileUpload: (file: File, options?: BulkAddOptions) => void;
  checking: boolean;
  progress: { done: number; total: number };
  counts: { available: number; taken: number; checking: number; premium?: number; all?: number };
}> = ({ input, setInput, domains, setDomains, onAdd, onLoadSample, onCheck, onReset, onFileUpload, checking, progress, counts }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHowTo, setShowHowTo] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [defaultTld, setDefaultTld] = useState('com');
  const [autoAppendTld, setAutoAppendTld] = useState(true);
  const [stripWww, setStripWww] = useState(true);
  const [maxDomains, setMaxDomains] = useState(1000);

  const bulkOptions: BulkAddOptions = {
    defaultTld,
    autoAppendTld,
    stripWww,
    maxDomains,
  };

  const commitInput = () => {
    if (!input.trim()) return;
    onAdd(input, bulkOptions);
    setInput('');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text?.trim()) {
        onAdd(text, bulkOptions);
        setInput('');
      }
    } catch {
      textareaRef.current?.focus();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileUpload(file, bulkOptions);
    const text = e.dataTransfer.getData('text');
    if (text?.trim() && !file) onAdd(text, bulkOptions);
  };

  const chipClass = (active?: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors duration-150 ${
      active
        ? isLight
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-black border-white'
        : isLight
          ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          : 'bg-[#121214] text-white/70 border-white/10 hover:bg-[#16161a] hover:text-white'
    }`;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 animate-fade-in">
      <div
        className={`relative isolate overflow-hidden rounded-2xl border transition-colors duration-200 ${
          isDragging
            ? isLight
              ? 'border-slate-400 bg-slate-50 ring-2 ring-slate-300/50'
              : 'border-white/30 ring-2 ring-white/15'
            : isLight
              ? 'bg-white border-slate-200 shadow-xl shadow-slate-900/[0.05]'
              : 'border-white/[0.12]'
        }`}
        style={{
          backgroundColor: isLight
            ? undefined
            : isDragging
              ? '#121214'
              : '#0c0c0e',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Opaque plate — ambient dots never show through the search card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
        />
        {/* Header */}
        <div
          className={`relative z-[1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b ${
            isLight ? 'border-slate-100' : 'border-white/[0.06]'
          }`}
        >
          <div className="text-left">
            <div className={`text-[13px] sm:text-[14px] font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bulk domain list
            </div>
            <p className="text-[11px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Paste, type, or import up to {maxDomains.toLocaleString()} domains · live .com checks
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => setShowHowTo((v) => !v)} className={chipClass(showHowTo)}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to add
            </button>
            <button type="button" onClick={() => setShowAdvanced((v) => !v)} className={chipClass(showAdvanced)}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Advanced
            </button>
          </div>
        </div>

        {/* Instructions */}
        {showHowTo && (
          <div
            className={`relative z-[1] px-4 sm:px-5 py-3 border-b animate-fade-in ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
            style={{ backgroundColor: isLight ? '#f8fafc' : '#0c0c0e' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left">
              {[
                {
                  step: '01',
                  title: 'Copy & paste',
                  text: 'Paste a list from Excel, Notes, or email. New lines, commas, or spaces all work.',
                },
                {
                  step: '02',
                  title: 'Or type / import',
                  text: 'Type names one by one, or import CSV, TXT, TSV, or JSON files. Drag & drop supported.',
                },
                {
                  step: '03',
                  title: 'Search all',
                  text: 'We strip http:// and www, append .com when missing, then check availability live.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-2.5">
                  <span
                    className={`text-[10px] font-black tabular-nums shrink-0 mt-0.5 ${
                      isLight ? 'text-slate-300' : 'text-white/25'
                    }`}
                  >
                    {item.step}
                  </span>
                  <div>
                    <div className={`text-[12px] font-bold ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                      {item.title}
                    </div>
                    <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p
              className={`mt-2.5 text-[10px] sm:text-[11px] font-mono leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-white/40'
              }`}
            >
              Example:&nbsp;
              <span className={isLight ? 'text-slate-700' : 'text-white/60'}>
                ystartups.com, cultbuddy.com, foundersprime.com
              </span>
            </p>
          </div>
        )}

        {/* Advanced options */}
        {showAdvanced && (
          <div
            className={`relative z-[1] px-4 sm:px-5 py-3 border-b animate-fade-in ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
            style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              <label className="block">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  Default TLD
                </span>
                <select
                  value={defaultTld}
                  onChange={(e) => setDefaultTld(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-[12px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#121214] border-white/10 text-white'
                  }`}
                >
                  {['com', 'net', 'org', 'io', 'ai', 'co', 'app', 'dev', 'xyz'].map((t) => (
                    <option key={t} value={t}>
                      .{t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  Max domains
                </span>
                <select
                  value={maxDomains}
                  onChange={(e) => setMaxDomains(Number(e.target.value))}
                  className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-[12px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#121214] border-white/10 text-white'
                  }`}
                >
                  {[100, 250, 500, 1000].map((n) => (
                    <option key={n} value={n}>
                      {n.toLocaleString()}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer mt-auto ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={autoAppendTld}
                  onChange={(e) => setAutoAppendTld(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span className={`text-[12px] font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                  Auto-append .{defaultTld}
                </span>
              </label>
              <label
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer mt-auto ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={stripWww}
                  onChange={(e) => setStripWww(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span className={`text-[12px] font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                  Strip www / http
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="relative z-[1] p-4 sm:p-5">
          {domains.length === 0 ? (
            <div className="relative text-left">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={(e) => {
                  e.preventDefault();
                  onAdd(e.clipboardData.getData('text'), bulkOptions);
                  setInput('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    commitInput();
                    return;
                  }
                  if ((e.key === 'Enter' || e.key === ',') && input.trim() && !e.shiftKey) {
                    e.preventDefault();
                    commitInput();
                  }
                }}
                placeholder={`Paste or type domains here…\n\nystartups.com\ncultbuddy.com\nfoundersprime.com\nfoundersblog.com`}
                className={`w-full rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 focus:outline-none focus:ring-2 min-h-[140px] sm:min-h-[168px] resize-y transition-all text-[13px] sm:text-[14px] font-mono leading-relaxed ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400/15'
                    : 'bg-black/40 border border-white/10 text-white placeholder:text-white/25 focus:border-white/25 focus:ring-white/10'
                }`}
                autoFocus
              />
              {isDragging && (
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none ${
                    isLight ? 'bg-white/80 text-slate-700' : 'bg-black/60 text-white'
                  }`}
                >
                  <span className="text-sm font-bold">Drop file or text to import</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-left space-y-3">
              <div
                className={`flex flex-wrap gap-1.5 max-h-52 sm:max-h-64 overflow-y-auto p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/[0.06]'
                }`}
              >
                {domains.map((d, i) => (
                  <span
                    key={d.domain}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-[12px] font-medium select-none animate-fade-in ${
                      isLight
                        ? 'bg-white text-slate-700 border border-slate-200'
                        : 'text-white/85 border border-white/10'
                    }`}
                    style={{
                      animationDelay: `${Math.min(i, 20) * 20}ms`,
                      userSelect: 'none',
                      backgroundColor: isLight ? undefined : '#121214',
                    }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        d.status === 'available'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]'
                          : d.status === 'taken'
                            ? 'bg-red-400/90'
                            : d.status === 'premium'
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'bg-white/40 animate-pulse'
                      }`}
                    />
                    <span className="font-mono">{d.domain}</span>
                    <button
                      type="button"
                      onClick={() => setDomains((p) => p.filter((x) => x.domain !== d.domain))}
                      className={`ml-0.5 rounded px-0.5 ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/10 text-white/40'}`}
                      aria-label={`Remove ${d.domain}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    onAdd(e.clipboardData.getData('text'), bulkOptions);
                    setInput('');
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ',') && input.trim() && !e.shiftKey) {
                      e.preventDefault();
                      commitInput();
                    }
                  }}
                  placeholder="Add more domains…"
                  rows={2}
                  className={`flex-1 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 resize-none text-[12px] sm:text-[13px] font-mono ${
                    isLight
                      ? 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400/15'
                      : 'bg-black/30 border border-white/10 text-white placeholder:text-white/25 focus:border-white/25 focus:ring-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={commitInput}
                  disabled={!input.trim()}
                  className={`shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors disabled:opacity-40 ${
                    isLight
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {checking && (
            <div
              className={`mt-4 p-3 rounded-xl border animate-fade-in ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex justify-between text-[12px] sm:text-[13px] mb-2">
                <span className={`flex items-center gap-2 font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Checking availability…
                </span>
                <span className={`font-mono tabular-nums ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                  {progress.done}/{progress.total}
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-white/70 to-white transition-all duration-300 ease-out"
                  style={{
                    width: `${(progress.done / Math.max(progress.total, 1)) * 100}%`,
                    background: isLight
                      ? 'linear-gradient(90deg, #0f172a, #334155)'
                      : 'linear-gradient(90deg, rgba(255,255,255,0.5), #fff)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Import options */}
          <div
            className={`mt-4 pt-4 border-t flex flex-col gap-3 ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,.tsv,.json,text/csv,text/plain,application/json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileUpload(f, bulkOptions);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <button type="button" onClick={() => fileRef.current?.click()} className={chipClass()}>
                <Icons.Upload />
                Import file
              </button>
              <button type="button" onClick={handlePasteFromClipboard} className={chipClass()}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Paste clipboard
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onLoadSample) {
                    onLoadSample(bulkOptions);
                  } else {
                    onAdd(BULK_SAMPLE_TEXT, bulkOptions);
                  }
                }}
                className={chipClass()}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Load sample
              </button>
              {input.trim() && domains.length === 0 && (
                <button type="button" onClick={commitInput} className={chipClass()}>
                  Add list
                </button>
              )}
              {domains.length > 0 && (
                <button type="button" onClick={onReset} className={chipClass()}>
                  Clear all
                </button>
              )}
            </div>
            <div
              className={`flex flex-wrap gap-1.5 text-[10px] font-medium ${
                isLight ? 'text-slate-400' : 'text-white/30'
              }`}
            >
              {['CSV', 'TXT', 'TSV', 'JSON', 'Drag & drop', 'Copy-paste'].map((f) => (
                <span
                  key={f}
                  className={`rounded-md border px-1.5 py-0.5 ${
                    isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-white/[0.03]'
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-1">
              <div className={`text-[11px] sm:text-[12px] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                {domains.length > 0 ? (
                  <span className="font-medium">
                    <span className={isLight ? 'text-slate-800' : 'text-white/80'}>{domains.length}</span> domains
                    {(counts.available > 0 || (counts.premium ?? 0) > 0) && (
                      <span className="ml-2">
                        · <span className="text-emerald-500">{counts.available} free</span>
                        {(counts.premium ?? 0) > 0 && (
                          <span className="text-amber-500"> · {counts.premium} premium</span>
                        )}
                        · {counts.taken} taken
                      </span>
                    )}
                    {counts.checking > 0 && (
                      <span className="ml-1 opacity-70">· {counts.checking} checking</span>
                    )}
                  </span>
                ) : input.trim() ? (
                  <span className="font-medium">
                    Draft ready · tap <span className={isLight ? 'text-slate-800' : 'text-white/80'}>Search all</span>
                  </span>
                ) : (
                  <span className="sm:hidden">Paste domains, then Search all</span>
                )}
                {!domains.length && !input.trim() && (
                  <span className="hidden sm:inline">⌘/Ctrl + Enter to add · Shift + Enter for new line</span>
                )}
              </div>
              {(() => {
                const draft = input.trim();
                const canSearch = domains.length > 0 || draft.length > 0;
                const countHint = domains.length > 0 ? domains.length : undefined;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (draft) {
                        onAdd(draft, bulkOptions);
                        setInput('');
                      }
                      onCheck();
                    }}
                    disabled={!canSearch || (checking && counts.checking === domains.length && domains.length > 0)}
                    aria-disabled={!canSearch}
                    className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      canSearch
                        ? isLight
                          ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 focus-visible:ring-slate-400 focus-visible:ring-offset-white'
                          : 'bg-white text-black hover:bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.45)] ring-1 ring-white/20 focus-visible:ring-white focus-visible:ring-offset-[#0c0c0e]'
                        : isLight
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15 cursor-not-allowed'
                          : 'bg-white text-black shadow-lg shadow-black/30 ring-1 ring-white/15 cursor-not-allowed'
                    } disabled:cursor-not-allowed`}
                  >
                    {checking && domains.length > 0 && counts.checking === domains.length ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Checking…
                      </>
                    ) : (
                      <>
                        <Icons.Search className="w-3.5 h-3.5" />
                        Search all{countHint != null ? ` (${countHint})` : draft ? '' : ''}
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main landing component
export const BulkDomainSearchLanding: React.FC<{ 
  onStartSearch: () => void;
  input?: string;
  setInput?: (v: string) => void;
  domains?: DomainTag[];
  setDomains?: React.Dispatch<React.SetStateAction<DomainTag[]>>;
  onAdd?: (text: string, options?: BulkAddOptions) => void;
  onLoadSample?: (options?: BulkAddOptions) => void;
  onCheck?: () => void;
  onReset?: () => void;
  onFileUpload?: (file: File, options?: BulkAddOptions) => void;
  checking?: boolean;
  progress?: { done: number; total: number };
  counts?: { available: number; taken: number; checking: number };
  showSearchInput?: boolean;
  recentSearches?: BulkSearchSnapshot[];
  onLoadPreviousSearch?: (snapshot: BulkSearchSnapshot) => void;
  onDeletePreviousSearch?: (snapshotId: string) => void;
}> = ({ 
  onStartSearch, 
  input = '', 
  setInput = () => {}, 
  domains = [], 
  setDomains = () => {},
  onAdd = () => {},
  onLoadSample,
  onCheck = () => {},
  onReset = () => {},
  onFileUpload = () => {},
  checking = false,
  progress = { done: 0, total: 0 },
  counts = { available: 0, taken: 0, checking: 0 },
  showSearchInput = false,
  recentSearches = [],
  onLoadPreviousSearch = () => {},
  onDeletePreviousSearch = () => {},
}) => {
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSearch = () => {
    if (searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const formatRecentTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getSnapshotCounts = (domainsToCount: DomainTag[]) => ({
    available: domainsToCount.filter((domain) => domain.status === 'available').length,
    premium: domainsToCount.filter((domain) => domain.status === 'premium').length,
    taken: domainsToCount.filter((domain) => domain.status === 'taken').length,
  });

  return (
    <div className="w-full">
      {/* Hero — aligned with home page (no solid blank scrim plate) */}
      <section className="relative text-center pb-6 sm:pb-12 pt-2 sm:pt-6">
        <div
          className={`relative z-[1] w-full max-w-[42rem] sm:max-w-[58rem] mx-auto transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge — same language as home hero */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 mb-2.5 sm:mb-5 text-[10px] sm:text-[12px] font-semibold tracking-wide ${
              isLight
                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                : 'bg-white/[0.04] text-white/65 border border-white/10'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${
                  isLight ? 'bg-slate-400' : 'bg-white/50'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isLight ? 'bg-slate-600' : 'bg-white/80'
                }`}
              />
            </span>
            <span className="sm:hidden">Multi-domain availability</span>
            <span className="hidden sm:inline">
              Multi-domain availability · Up to 1,000 names · Live checks
            </span>
          </div>

          <h1 className="text-[1.7rem] leading-[1.08] sm:text-[3.65rem] md:text-[4.35rem] font-black tracking-tight mb-1.5 sm:mb-3.5">
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage: isLight
                  ? 'linear-gradient(to right, #0f172a, #1e293b, #475569)'
                  : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
              }}
            >
              Bulk domain search
            </span>
            <span
              className="block text-[0.88rem] sm:text-[1.55rem] md:text-[1.95rem] mt-0.5 sm:mt-1.5 font-bold"
              style={{ color: 'var(--gradient-subtitle)' }}
            >
              Check thousands of names at once
            </span>
          </h1>

          <p
            className={`text-[13px] sm:text-lg max-w-2xl mx-auto mb-4 sm:mb-7 leading-relaxed px-1 ${
              isLight ? 'text-slate-500' : 'text-white/50'
            }`}
          >
            Paste a list, import a file, or type names — live availability, premium flags, and registrar links.
          </p>

          {/* Feature chips — freestanding like home (no outer blank dock) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-5 sm:mb-8 px-1">
            {(
              [
                {
                  label: 'Copy & paste',
                  icon: (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6.5A1.5 1.5 0 0 0 5 6.5v12A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 17.5 5H16M9 5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1H9V5Z" />
                    </svg>
                  ),
                },
                {
                  label: 'CSV · TXT · JSON',
                  icon: (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 12-3.5-3.5M12 16l3.5-3.5M5 18.5h14" />
                    </svg>
                  ),
                },
                {
                  label: 'Live checks',
                  icon: (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                      <circle cx="12" cy="12" r="3" />
                      <path strokeLinecap="round" d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2" />
                    </svg>
                  ),
                },
                {
                  label: 'Export results',
                  icon: (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0-12 3.5 3.5M12 4 8.5 7.5M5 18.5h14" />
                    </svg>
                  ),
                },
              ] as const
            ).map((item) => (
              <span
                key={item.label}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[10px] sm:text-[12px] font-semibold transition-colors ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-600 shadow-sm'
                    : 'border-white/10 bg-[#0c0c0e] text-white/70'
                }`}
                style={{ backgroundColor: isLight ? undefined : '#0c0c0e' }}
              >
                <span
                  className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/[0.08] text-white/80'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </span>
            ))}
          </div>

          {/* Search Input Section */}
          <div ref={searchRef} className="relative z-[1] mb-4 sm:mb-8 text-left">
            <SearchInputSection
              input={input}
              setInput={setInput}
              domains={domains}
              setDomains={setDomains}
              onAdd={onAdd}
              onLoadSample={onLoadSample}
              onCheck={onCheck}
              onReset={onReset}
              onFileUpload={onFileUpload}
              checking={checking}
              progress={progress}
              counts={counts}
            />
          </div>

          {recentSearches.length > 0 && (
            <div className="relative z-[1] mx-auto max-w-5xl px-2 sm:px-0">
              <div
                className={`shine-border relative isolate overflow-hidden rounded-2xl border p-3 sm:p-4 text-left ${
                  isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'
                }`}
                style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
                />
                <div className="relative z-[1]">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className={`text-sm sm:text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Recent bulk searches</h3>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                      Resume a previous domain set without pasting the same list again.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToSearch}
                    className={`text-xs sm:text-sm font-medium ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-white/60 hover:text-white'}`}
                  >
                    Add a new list
                  </button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {recentSearches.slice(0, 6).map((snapshot) => {
                    const snapshotCounts = getSnapshotCounts(snapshot.domains);
                    return (
                      <div
                        key={snapshot.id}
                        className={`rounded-xl border p-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}
                        style={{ backgroundColor: isLight ? '#f8fafc' : '#121214' }}
                      >
                        <button type="button" onClick={() => onLoadPreviousSearch(snapshot)} className="w-full text-left">
                          <div className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white/90'}`}>
                            {snapshot.domains.length} domains
                          </div>
                          <div className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                            {snapshotCounts.available} available • {snapshotCounts.premium} premium • {snapshotCounts.taken} taken
                          </div>
                          <div className={`mt-2 text-xs ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                            Saved {formatRecentTime(snapshot.createdAt)}
                          </div>
                        </button>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <Button onClick={() => onLoadPreviousSearch(snapshot)} variant="secondary" size="sm" className="flex-1 text-xs">
                            Load search
                          </Button>
                          <button
                            type="button"
                            onClick={() => onDeletePreviousSearch(snapshot.id)}
                            className={`text-xs ${isLight ? 'text-slate-400 hover:text-red-500' : 'text-white/35 hover:text-red-400'}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section: The most advanced bulk domain search tool */}
      <section className={`py-8 sm:py-14 border-t relative ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-5 sm:mb-8">
            <p
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Built for scale
            </p>
            <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              The most advanced bulk<br className="hidden sm:block" /> domain search tool
            </h2>
            <p
              className="max-w-xl mx-auto text-[13px] sm:text-[15px] leading-relaxed"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
            >
              Paste thousands of names, stream live availability, and register winners — without the spreadsheet grind.
            </p>
          </div>

          {/* Stat strip */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl border overflow-hidden mb-3 sm:mb-4 ${
              isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
            }`}
          >
            {[
              { value: '1,000', label: 'Domains / run' },
              { value: 'Live', label: 'Availability' },
              { value: '8', label: 'Registrars' },
              { value: 'CSV', label: 'Import & export' },
            ].map((s) => (
              <div
                key={s.label}
                className={`px-3 py-3.5 sm:py-4 text-center ${isLight ? 'bg-white' : 'bg-[#0c0c0e]'}`}
              >
                <div className="text-base sm:text-xl font-black tracking-tight tabular-nums">{s.value}</div>
                <div className="text-[9px] sm:text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Feature grid — solid panel, no sheen lines */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl border overflow-hidden mb-4 sm:mb-6 ${
              isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
            }`}
          >
            {[
              {
                step: '01',
                title: 'Lightning fast',
                description: 'Progressive live checks for up to 1,000 domains with clear status as results land.',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Smart filtering',
                description: 'Slice by available, premium, taken, TLD, and sort A–Z or by length in one view.',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Flexible import',
                description: 'Paste lists or drop CSV, TXT, TSV, JSON — then export winners as CSV or PDF.',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: '04',
                title: 'Registrar ready',
                description: 'Open available and premium names on GoDaddy, Namecheap, Porkbun, and more.',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`group flex flex-col p-4 sm:p-5 transition-colors duration-200 ${
                  isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                        : 'bg-white/[0.06] text-white/75 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-[11px] font-black tabular-nums ${
                      isLight ? 'text-slate-300' : 'text-white/20'
                    }`}
                  >
                    {item.step}
                  </span>
                </div>
                <h3 className={`text-[13px] sm:text-[14px] font-bold tracking-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {item.title}
                </h3>
                <p className="text-[12px] leading-relaxed" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Live preview + free premium value */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-px rounded-2xl border overflow-hidden ${
              isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
            }`}
          >
            <div className={`p-4 sm:p-6 ${isLight ? 'bg-white' : 'bg-[#0c0c0e]'}`}>
              <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                <div>
                  <div className={`text-[12px] sm:text-[13px] font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Live result preview
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    How bulk results look — free forever, no account
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                      isLight
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                        : 'border-emerald-500/25 text-emerald-400 bg-emerald-500/10'
                    }`}
                  >
                    Free
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                      isLight ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-white/10 text-white/40 bg-white/[0.04]'
                    }`}
                  >
                    Demo
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { domain: 'ystartups.com', status: 'taken' as const },
                  { domain: 'cultbuddy.com', status: 'available' as const, price: '$12.99' },
                  { domain: 'foundersprime.com', status: 'premium' as const, price: 'Premium' },
                  { domain: 'foundersblog.com', status: 'available' as const, price: '$12.99' },
                  { domain: 'startuphub.io', status: 'available' as const, price: '$49.99' },
                ].map((d, i) => (
                  <div
                    key={d.domain}
                    className={`group flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-colors duration-200 animate-fade-in ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/14 hover:bg-white/[0.05]'
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          d.status === 'available'
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]'
                            : d.status === 'premium'
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'bg-red-400/80'
                        }`}
                      />
                      <span className={`font-mono text-[12px] sm:text-[13px] truncate ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                        {d.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {d.price && (
                        <span className={`text-[10px] sm:text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                          {d.price}
                        </span>
                      )}
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold ${
                          d.status === 'available'
                            ? 'text-emerald-500'
                            : d.status === 'premium'
                              ? 'text-amber-500'
                              : isLight
                                ? 'text-slate-400'
                                : 'text-white/35'
                        }`}
                      >
                        {d.status === 'available' ? 'Available' : d.status === 'premium' ? 'Premium' : 'Taken'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className={`mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium ${
                  isLight ? 'text-slate-400' : 'text-white/30'
                }`}
              >
                {[
                  { label: 'Available', color: 'bg-emerald-400' },
                  { label: 'Premium', color: 'bg-amber-400' },
                  { label: 'Taken', color: 'bg-red-400/80' },
                ].map((l) => (
                  <span
                    key={l.label}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${
                      isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-white/[0.03]'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${l.color}`} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            <div className={`p-4 sm:p-6 flex flex-col justify-center ${isLight ? 'bg-white' : 'bg-[#0c0c0e]'}`}>
              <p
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Premium results · free tool
              </p>
              <h3 className={`text-lg sm:text-2xl font-black tracking-tight mb-2 sm:mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Real-time availability checking
              </h3>
              <p
                className="text-[13px] sm:text-[14px] leading-relaxed mb-4 sm:mb-5"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
              >
                Every name is checked live — free registrations, premium listings, and taken domains are labeled so you only chase what you can buy. No account, no paywall.
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {[
                  'Instant status with color indicators',
                  'Premium detection with listing context',
                  'Multi-TLD support across major extensions',
                  'One-click open on preferred registrars',
                ].map((item) => (
                  <li
                    key={item}
                    className={`flex items-center gap-2.5 text-[12px] sm:text-[13px] font-medium ${
                      isLight ? 'text-slate-700' : 'text-white/75'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-white/[0.06] border-white/10 text-white'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={scrollToSearch}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] sm:text-[13px] font-bold transition-colors ${
                    isLight
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  Try bulk search free
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onLoadSample) onLoadSample();
                    scrollToSearch();
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold transition-colors ${
                    isLight
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'border-white/12 text-white/75 hover:bg-white/[0.05]'
                  }`}
                >
                  Load sample list
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Powerful bulk domain search features */}
      <section className={`py-8 sm:py-14 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-5 sm:mb-8">
            <p
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Free · full power
            </p>
            <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Powerful bulk domain<br className="hidden sm:block" /> search features
            </h2>
            <p
              className="max-w-xl mx-auto text-[13px] sm:text-[15px] leading-relaxed"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
            >
              Everything you need to find and register multiple domains — premium workflow, zero cost to use.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl border overflow-hidden ${
              isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
            }`}
          >
            {[
              {
                step: '01',
                title: 'Smart parsing',
                desc: 'Paste CSV, text, URLs, or mixed lists — we normalize names, strip www/http, and append TLDs.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'TLD filtering',
                desc: 'Focus on .com, .io, .ai, and more after the check — only the extensions you care about.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Availability stats',
                desc: 'Live counts for available, premium, and taken so you know your hit rate at a glance.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                step: '04',
                title: 'Export results',
                desc: 'Download CSV or PDF of your full list for sharing, portfolios, or offline review.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
              },
              {
                step: '05',
                title: 'Batch processing',
                desc: 'Up to 1,000 domains per run with progressive checks — keep working while results stream in.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
              },
              {
                step: '06',
                title: 'One-click register',
                desc: 'Open available or premium names on GoDaddy, Namecheap, Porkbun, and more in one click.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                ),
              },
            ].map((f) => (
              <article
                key={f.step}
                className={`group flex flex-col p-4 sm:p-5 transition-colors duration-200 ${
                  isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                        : 'bg-white/[0.06] text-white/75 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'
                    }`}
                  >
                    {f.icon}
                  </div>
                  <span
                    className={`text-[11px] font-black tabular-nums ${
                      isLight ? 'text-slate-300' : 'text-white/20'
                    }`}
                  >
                    {f.step}
                  </span>
                </div>
                <h3 className={`text-[13px] sm:text-[14px] font-bold tracking-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {f.title}
                </h3>
                <p className="text-[12px] leading-relaxed flex-1" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                  {f.desc}
                </p>
              </article>
            ))}
          </div>

          <div
            className={`mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 ${
              isLight ? 'border-slate-200 bg-white' : 'border-white/[0.1] bg-[#0c0c0e]'
            }`}
          >
            <div className="text-center sm:text-left">
              <div className={`text-[13px] font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Premium bulk tooling — free for everyone
              </div>
              <p className="text-[11px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                No account · No credit card · Up to 1,000 domains per search
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToSearch}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-colors ${
                isLight
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              Start free bulk search
            </button>
          </div>
        </div>
      </section>

      {/* Section: Bulk domain search made simple */}
      <section className={`py-8 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-5 sm:mb-7">
            <p
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              3 steps
            </p>
            <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bulk domain search made simple
            </h2>
            <p
              className="max-w-lg mx-auto text-[13px] sm:text-[14px] leading-relaxed"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
            >
              Paste a list, stream live status, register winners — free and fast.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl border overflow-hidden mb-3 sm:mb-4 ${
              isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
            }`}
          >
            {[
              {
                step: '01',
                title: 'Enter domains',
                description:
                  'Type, paste, or import CSV / TXT / JSON. Supports commas, new lines, and full URLs.',
              },
              {
                step: '02',
                title: 'Check availability',
                description:
                  'Live checks stream in batches — available, premium, and taken are marked clearly.',
              },
              {
                step: '03',
                title: 'Register or export',
                description:
                  'Open registrars in one click or export CSV / PDF for your team or portfolio.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-4 sm:p-5 ${isLight ? 'bg-white' : 'bg-[#0c0c0e]'}`}
              >
                <div
                  className={`text-[11px] font-black tabular-nums mb-2 ${
                    isLight ? 'text-slate-300' : 'text-white/20'
                  }`}
                >
                  {item.step}
                </div>
                <h3 className={`text-[14px] sm:text-[15px] font-bold tracking-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {item.title}
                </h3>
                <p className="text-[12px] leading-relaxed" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight ? 'border-slate-200 bg-slate-900' : 'border-white/[0.1] bg-[#0a0a0c]'
            }`}
          >
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 border-b border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="text-[11px] sm:text-xs text-white/40 ml-2 font-mono">domains.txt</span>
              <span className="ml-auto text-[10px] font-semibold text-white/30">Example paste</span>
            </div>
            <pre className="p-3.5 sm:p-5 text-[11px] sm:text-[13px] font-mono text-white/65 overflow-x-auto leading-relaxed">
              <code>{`# Paste prominent names in any format
ystartups.com
cultbuddy.com, foundersprime.com
foundersblog.com startuphub.io

# Mixed with URLs — we clean them
https://startuphub.io/about → startuphub.io

# Bare names get .com when auto-append is on
venturelist
brandforge`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Section: Bulk domain search solutions by industry */}
      <section className={`py-8 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-5 sm:mb-7">
            <p
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Who it&apos;s for
            </p>
            <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Built for teams that search in bulk
            </h2>
            <p
              className="max-w-lg mx-auto text-[13px] sm:text-[14px] leading-relaxed"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
            >
              Same free premium workflow whether you&apos;re investing, protecting a brand, or launching a product.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-px rounded-2xl border overflow-hidden ${
              isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
            }`}
          >
            {[
              {
                title: 'Domain investors',
                description:
                  'Scan large lists for free registrations and premium flips. Export winners for your portfolio.',
                tags: ['Portfolio lists', 'Premium flags', 'CSV export'],
              },
              {
                title: 'Agencies & brands',
                description:
                  'Protect clients with bulk brand variations — .com, .io, .ai, and more in one pass.',
                tags: ['Brand variants', 'Multi-TLD', 'Registrar handoff'],
              },
              {
                title: 'Startups',
                description:
                  'Test a shortlist of names in minutes. Available vs premium is clear before you pitch.',
                tags: ['Fast shortlist', 'Live status', 'No account'],
              },
              {
                title: 'Operators',
                description:
                  'Keep domain hygiene high — paste inventory, re-check availability, share results with the team.',
                tags: ['Batch re-check', 'PDF report', 'History'],
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`p-4 sm:p-5 transition-colors ${
                  isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                }`}
              >
                <h3 className={`text-[14px] sm:text-[15px] font-bold tracking-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {card.title}
                </h3>
                <p className="text-[12px] sm:text-[13px] leading-relaxed mb-3" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                  {card.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                        isLight
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-white/[0.04] text-white/50 border-white/[0.08]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Master bulk domain searching — expert tips */}
      <section className={`py-8 sm:py-14 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
            {/* Intro column */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <p
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Playbook
              </p>
              <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Master bulk domain searching
              </h2>
              <p
                className="text-[13px] sm:text-[14px] leading-relaxed mb-1"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
              >
                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-white/75'}`}>Expert tips</span>
                {' '}to move faster from a raw list to names you can actually register — free on DomainDiscovery.
              </p>
              <p className="text-[12px] leading-relaxed mb-4 sm:mb-5" style={{ color: 'var(--text-muted)' }}>
                Use bulk search with the generator and export tools for a full naming workflow.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={scrollToSearch}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] sm:text-[13px] font-bold transition-colors ${
                    isLight
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  Try bulk search
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
                <Link
                  href="/generator"
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold transition-colors ${
                    isLight
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'border-white/12 text-white/75 hover:bg-white/[0.05]'
                  }`}
                >
                  Domain generator
                </Link>
              </div>
            </div>

            {/* Tips grid */}
            <div className="lg:col-span-8">
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-px rounded-2xl border overflow-hidden ${
                  isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
                }`}
              >
                {[
                  {
                    step: '01',
                    title: 'Use keyword variations',
                    description:
                      'Expand each brand word with prefixes, suffixes, and compounds before you paste. More variants = more available hits.',
                    tags: ['Prefixes', 'Suffixes'],
                  },
                  {
                    step: '02',
                    title: 'Check multiple TLDs',
                    description:
                      'Don’t stop at .com. Run the same stems on .io, .ai, .co, and .app — bulk search surfaces winners across extensions.',
                    tags: ['.com', '.io', '.ai'],
                  },
                  {
                    step: '03',
                    title: 'Export and analyze',
                    description:
                      'Download CSV or PDF after a run. Share shortlists, compare batches over time, and keep a record of free vs premium.',
                    tags: ['CSV', 'PDF'],
                  },
                  {
                    step: '04',
                    title: 'Act fast on good finds',
                    description:
                      'Available names can disappear in minutes. When status turns green, open your preferred registrar immediately.',
                    tags: ['Register', 'Live'],
                  },
                  {
                    step: '05',
                    title: 'Start with strong seeds',
                    description:
                      'Paste brandable shortlists (e.g. cultbuddy, foundersprime) rather than random noise — quality seeds beat volume alone.',
                    tags: ['Brandable', 'Shortlist'],
                  },
                  {
                    step: '06',
                    title: 'Filter before you buy',
                    description:
                      'After the check, filter available / premium / taken and by TLD so you only open registrars for real candidates.',
                    tags: ['Filter', 'TLD'],
                  },
                ].map((tip) => (
                  <article
                    key={tip.step}
                    className={`group flex flex-col p-4 sm:p-5 transition-colors duration-200 ${
                      isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-black tabular-nums transition-colors duration-200 ${
                          isLight
                            ? 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                            : 'bg-white/[0.06] text-white/70 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'
                        }`}
                      >
                        {tip.step}
                      </span>
                    </div>
                    <h3
                      className={`text-[13px] sm:text-[14px] font-bold tracking-tight mb-1.5 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {tip.title}
                    </h3>
                    <p
                      className="text-[12px] leading-relaxed flex-1 mb-3"
                      style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}
                    >
                      {tip.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tip.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                            isLight
                              ? 'bg-slate-50 text-slate-600 border-slate-200'
                              : 'bg-white/[0.04] text-white/50 border-white/[0.08]'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Complete your domain search toolkit */}
      <section className={`py-8 sm:py-14 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-5 sm:mb-8">
            <p
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Free toolkit
            </p>
            <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Complete your domain<br className="hidden sm:block" /> search toolkit
            </h2>
            <p
              className="max-w-lg mx-auto text-[13px] sm:text-[15px] leading-relaxed"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
            >
              Bulk search pairs with our other free tools — invent names, verify ownership, and compare prices in one place.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl border overflow-hidden ${
              isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
            }`}
          >
            {[
              {
                href: '/',
                step: '01',
                title: 'Domain search',
                description: 'Instant single-name checks with live availability and registrar links.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                href: '/generator',
                step: '02',
                title: 'AI generator',
                description: 'Expand one keyword into thousands of brandable .com ideas with live status.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                href: '/tools/whois',
                step: '03',
                title: 'WHOIS lookup',
                description: 'Inspect ownership, registrar, and registration details for any domain.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                href: '/tools/compare',
                step: '04',
                title: 'Price compare',
                description: 'Compare registrar pricing side by side before you buy.',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group flex flex-col p-4 sm:p-5 transition-colors duration-200 ${
                  isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                        : 'bg-white/[0.06] text-white/75 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'
                    }`}
                  >
                    {tool.icon}
                  </div>
                  <span
                    className={`text-[11px] font-black tabular-nums ${
                      isLight ? 'text-slate-300' : 'text-white/20'
                    }`}
                  >
                    {tool.step}
                  </span>
                </div>
                <h3
                  className={`text-[13px] sm:text-[14px] font-bold tracking-tight mb-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {tool.title}
                </h3>
                <p
                  className="text-[12px] leading-relaxed flex-1 mb-3"
                  style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}
                >
                  {tool.description}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                    isLight
                      ? 'text-slate-500 group-hover:text-slate-900'
                      : 'text-white/40 group-hover:text-white'
                  }`}
                >
                  Open tool
                  <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
