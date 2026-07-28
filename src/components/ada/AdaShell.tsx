'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, LayoutGroup, useReducedMotion } from 'framer-motion';
import { ADA_BRAND } from '@/lib/adaConfig';
import { ParticleText } from '@/components/ui/ParticleText';
import { EvervaultHover } from '@/components/ui/EvervaultHover';
import { AdaChatFab } from '@/components/ada/AdaChatFab';
import { AdaLogo } from '@/components/ada/AdaLogo';
import { AdaPageTransition } from '@/components/ada/AdaPageTransition';
import { AdaThemeToggle } from '@/components/ada/AdaThemeToggle';
import { useAdaTheme } from '@/hooks/useAdaTheme';
import { SectionAmbient } from '@/components/ui/SectionAmbient';

type NavIconId = 'home' | 'chat' | 'app' | 'docs' | 'card' | 'industry' | 'registrars';

const NAV: {
  href: string;
  label: string;
  short: string;
  icon: NavIconId;
  match: (p: string) => boolean;
}[] = [
  {
    href: '/ada',
    label: 'Home',
    short: 'Home',
    icon: 'home',
    match: (p: string) => p === '/ada' || p === '/ada/',
  },
  {
    href: '/ada/chat',
    label: 'Chat',
    short: 'Chat',
    icon: 'chat',
    match: (p: string) => p.startsWith('/ada/chat'),
  },
  {
    href: '/ada/app',
    label: 'App',
    short: 'App',
    icon: 'app',
    match: (p: string) => p.startsWith('/ada/app'),
  },
  {
    href: '/ada/docs',
    label: 'Agent docs',
    short: 'Docs',
    icon: 'docs',
    match: (p: string) =>
      p.startsWith('/ada/docs') &&
      !p.startsWith('/ada/docs/industry') &&
      !p.startsWith('/ada/docs/registrars'),
  },
  {
    href: '/ada/agent-card',
    label: 'Agent Card',
    short: 'Card',
    icon: 'card',
    match: (p: string) => p.startsWith('/ada/agent-card'),
  },
];

const MOBILE_EXTRA: { href: string; label: string; icon: NavIconId; match: (p: string) => boolean }[] = [
  {
    href: '/ada/docs/industry',
    label: 'Industry research',
    icon: 'industry',
    match: (p) => p.startsWith('/ada/docs/industry'),
  },
  {
    href: '/ada/docs/registrars',
    label: 'Registrar matrix',
    icon: 'registrars',
    match: (p) => p.startsWith('/ada/docs/registrars'),
  },
];

const FOOTER_LINKS: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Product: [
    { label: 'Chat', href: '/ada/chat' },
    { label: 'Structured app', href: '/ada/app' },
    { label: 'Agent Card', href: '/ada/agent-card' },
  ],
  Docs: [
    { label: 'Agent docs', href: '/ada/docs' },
    { label: 'Industry', href: '/ada/docs/industry' },
    { label: 'Registrars', href: '/ada/docs/registrars' },
  ],
  Legal: [
    { label: 'Privacy', href: '/ada/privacy' },
    { label: 'Terms', href: '/ada/terms' },
    { label: 'Cookies', href: '/ada/cookies' },
    { label: 'Disclaimer', href: '/ada/disclaimer' },
  ],
  Network: [
    {
      label: 'DomainDiscovery',
      href: 'https://www.domainsdiscovery.com',
      external: true,
    },
  ],
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
      ) : (
        <>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  );
}

function NavGlyph({ id }: { id: NavIconId }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'block',
    'aria-hidden': true as const,
  };

  switch (id) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5" />
          <path d="M9.5 20v-6h5v6" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case 'app':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'docs':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
      );
    case 'card':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );
    case 'industry':
      return (
        <svg {...common}>
          <path d="M3 21h18M5 21V8l6 3V8l6 3V3h2v18" />
        </svg>
      );
    case 'registrars':
      return (
        <svg {...common}>
          <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 12h8M8 16h5" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const reduce = useReducedMotion();
  const t = useAdaTheme();
  const { isLight, pageBg, muted, faint, hair, header } = t;
  const currentYear = new Date().getFullYear();
  const surfaceEase = 'transition-colors duration-300 ease-out';
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on outside tap / Escape
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = menuRef.current;
      if (el && !el.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [menuOpen]);

  // Always land at the top of ADA routes (nav / CTA → chat was landing on footer)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash && window.location.hash.length > 1) return;
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {
      /* ignore */
    }
    const jump = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    jump();
    const r1 = window.requestAnimationFrame(jump);
    const t1 = window.setTimeout(jump, 0);
    const t2 = window.setTimeout(jump, 80);
    const t3 = window.setTimeout(jump, 200);
    return () => {
      window.cancelAnimationFrame(r1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname]);

  return (
    <div
      className={`min-h-screen flex flex-col ${surfaceEase}`}
      style={{
        backgroundColor: pageBg,
        color: isLight ? '#0f172a' : '#fff',
        isolation: 'isolate',
      }}
    >
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${hair} ${header} ${surfaceEase}`}
      >
        <div
          ref={menuRef}
          className="relative max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-[4.25rem] flex items-center justify-between gap-2 sm:gap-3"
        >
          <Link href="/ada" className="flex items-center min-w-0 shrink" onClick={() => setMenuOpen(false)}>
            <AdaLogo size="lg" showText priority />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden sm:flex items-center gap-1 min-w-0"
            aria-label="Primary"
          >
            <LayoutGroup id="ada-nav">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    className={`group relative rounded-lg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                      active
                        ? isLight
                          ? 'text-white'
                          : 'text-black'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId={reduce ? undefined : 'ada-nav-pill'}
                        className={`absolute inset-0 rounded-lg ${
                          isLight ? 'bg-slate-900 shadow-sm' : 'bg-white'
                        }`}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                        }
                        style={{ zIndex: 0 }}
                      />
                    )}
                    {!active && (
                      <span
                        className={`absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                          isLight ? 'bg-slate-100' : 'bg-white/10'
                        }`}
                        aria-hidden
                      />
                    )}
                    <span className="relative z-[1]">{item.label}</span>
                  </Link>
                );
              })}
            </LayoutGroup>

            <AdaThemeToggle isLight={isLight} />
          </nav>

          {/* Mobile: theme + hamburger dropdown */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <AdaThemeToggle isLight={isLight} />
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="ada-mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  : 'border-white/12 bg-[#0a0a0c] text-white/90 hover:bg-[#121214]'
              }`}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>

          {/* Mobile dropdown panel */}
          <div
            id="ada-mobile-nav"
            className={`sm:hidden absolute left-3 right-3 top-[calc(100%+0.4rem)] z-[60] origin-top transition-all duration-200 ${
              menuOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <nav
              aria-label="Mobile primary"
              className={`overflow-hidden rounded-2xl border shadow-2xl ${
                isLight
                  ? 'border-slate-200 bg-white shadow-slate-900/10'
                  : 'border-white/10 bg-[#0a0a0c] shadow-black/60'
              }`}
              style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
            >
              <ul className="p-1.5 space-y-0.5">
                {NAV.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold transition ${
                          active
                            ? isLight
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-black'
                            : isLight
                              ? 'text-slate-700 hover:bg-slate-50'
                              : 'text-white/85 hover:bg-[#121214]'
                        }`}
                      >
                        <span
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            active
                              ? isLight
                                ? 'bg-white/12 text-white'
                                : 'bg-black/8 text-black'
                              : isLight
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-[#121214] text-white/65'
                          }`}
                          style={
                            !active
                              ? { backgroundColor: isLight ? undefined : '#121214' }
                              : undefined
                          }
                        >
                          <NavGlyph id={item.icon} />
                        </span>
                        <span className="min-w-0 flex-1 text-left leading-tight">{item.label}</span>
                        {active ? (
                          <span
                            className={`shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] ${
                              isLight ? 'text-white/65' : 'text-black/45'
                            }`}
                          >
                            Current
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className={`shrink-0 text-[14px] font-light leading-none ${
                              isLight ? 'text-slate-300' : 'text-white/20'
                            }`}
                          >
                            ›
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div
                className={`border-t px-1.5 py-1.5 ${
                  isLight ? 'border-slate-100' : 'border-white/[0.08]'
                }`}
              >
                <p
                  className={`px-2.5 pt-1 pb-1 text-[9px] font-bold uppercase tracking-[0.16em] ${
                    isLight ? 'text-slate-400' : 'text-white/30'
                  }`}
                >
                  More
                </p>
                <ul className="space-y-0.5">
                  {MOBILE_EXTRA.map((item) => {
                    const active = item.match(pathname);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition ${
                            active
                              ? isLight
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-[#121214] text-white'
                              : isLight
                                ? 'text-slate-600 hover:bg-slate-50'
                                : 'text-white/55 hover:bg-[#121214] hover:text-white/85'
                          }`}
                        >
                          <span
                            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                              isLight
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-[#121214] text-white/45'
                            }`}
                            style={{ backgroundColor: isLight ? undefined : '#121214' }}
                          >
                            <NavGlyph id={item.icon} />
                          </span>
                          <span className="min-w-0 flex-1 text-left leading-tight">{item.label}</span>
                          {active && (
                            <span
                              className={`shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] ${
                                isLight ? 'text-slate-400' : 'text-white/35'
                              }`}
                            >
                              Current
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/*
        Ambient bubbles:
        - ADA home (/ada): intensity=hero — same as DomainDiscovery landing
          (radial mask clears center under badge / title / CTAs; dots in gutters)
        - Other ADA routes: intensity=page — full field with solid cards covering dots
      */}
      <SectionAmbient
        intensity={
          pathname === '/ada' || pathname === '/ada/' ? 'hero' : 'page'
        }
        className="flex-1 w-full min-h-0 flex flex-col"
        contentClassName="flex-1 w-full min-h-0 flex flex-col"
      >
        <AdaPageTransition>{children}</AdaPageTransition>
      </SectionAmbient>

      <AdaChatFab />

      <footer className={`relative overflow-hidden border-t ${hair} ${surfaceEase}`} style={{ backgroundColor: pageBg }}>
        <div className={`relative z-[2] ${surfaceEase}`} style={{ backgroundColor: pageBg }}>
          <div className="max-w-6xl mx-auto px-3 sm:px-5 pt-5 sm:pt-8 pb-4 sm:pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-8">
              <div className="max-w-[17rem]">
                <Link href="/ada" className="inline-flex items-center mb-2">
                  <AdaLogo size="md" showText />
                </Link>
                <p className={`text-[11px] sm:text-[12px] leading-snug mb-1.5 sm:mb-2 ${muted}`}>{ADA_BRAND.tagline}</p>
                <p className={`text-[10px] leading-snug mb-2.5 sm:mb-3 ${faint}`}>
                  {ADA_BRAND.domain} · Research only — not a registrar
                </p>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide border ${
                    isLight
                      ? 'bg-white text-slate-600 border-slate-200 shadow-sm'
                      : 'bg-[#121214] text-white/65 border-white/12'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-slate-500' : 'bg-white/55'}`} />
                  Agents · Budget · Free
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 flex-1 sm:max-w-3xl">
                {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                  <div key={category}>
                    <h3 className={`text-[10px] sm:text-[11px] font-bold mb-1.5 sm:mb-2 tracking-wide uppercase ${faint}`}>
                      {category}
                    </h3>
                    <ul className="space-y-1 sm:space-y-1.5">
                      {links.map((link) => (
                        <li key={`${category}-${link.href}-${link.label}`}>
                          {link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-[12px] font-medium transition-colors duration-200 ${
                                isLight
                                  ? 'text-slate-600 hover:text-slate-900'
                                  : 'text-white/60 hover:text-white'
                              }`}
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              prefetch
                              className={`text-[12px] font-medium transition-colors duration-200 ${
                                isLight
                                  ? 'text-slate-600 hover:text-slate-900'
                                  : 'text-white/60 hover:text-white'
                              }`}
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Brand band — larger mobile wordmark, full name always visible */}
        <div className={`relative z-[1] min-h-[8.5rem] sm:min-h-[11rem] border-t ${hair}`}>
          {t.ready ? (
            <EvervaultHover className="w-full" radius={280}>
              <div className="relative z-[1] max-w-6xl mx-auto px-2 sm:px-5 py-4 sm:py-8 flex items-center justify-center overflow-hidden">
                <ParticleText
                  key={`particle-${isLight ? 'l' : 'd'}`}
                  text={ADA_BRAND.name}
                  height={148}
                  className="w-full max-w-full"
                />
              </div>
            </EvervaultHover>
          ) : (
            <div className="relative z-[1] flex min-h-[8.5rem] sm:min-h-[11rem] items-center justify-center px-4">
              <p
                className={`text-2xl sm:text-5xl font-black tracking-tight text-center leading-snug px-1 ${
                  isLight ? 'text-slate-300' : 'text-white/20'
                }`}
              >
                {ADA_BRAND.name}
              </p>
            </div>
          )}
        </div>

        <div
          className={`relative z-[2] border-t ${hair} ${surfaceEase}`}
          style={{ backgroundColor: isLight ? '#fff' : pageBg }}
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className={`text-[10px] text-center sm:text-left ${faint}`}>
              &copy; {currentYear} {ADA_BRAND.name}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {[
                { label: 'Terms', href: '/ada/terms' },
                { label: 'Privacy', href: '/ada/privacy' },
                { label: 'Cookies', href: '/ada/cookies' },
                { label: 'Disclaimer', href: '/ada/disclaimer' },
                { label: 'Chat', href: '/ada/chat' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`text-[10px] transition-colors duration-200 hover:underline underline-offset-4 ${
                    isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
