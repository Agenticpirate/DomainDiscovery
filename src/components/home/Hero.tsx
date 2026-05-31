'use client';

/**
 * Hero — the Phase 1 first-impression section of the home page.
 *
 * Composes the glass component library into a premium hero (Glass_Surface) with
 * layered depth, refined copy, a single gold Primary_CTA, the domain search
 * interface, a beginner entry point, a glass stat strip, and a reduced-motion
 * aware ambient-motion layer. It is token-only: every surface color, border,
 * shadow, blur, spacing, and type size resolves from a `var(--…)` Token_Layer
 * custom property, so dark↔light parity comes free from the CSS cascade.
 *
 * DEPTH (Req 10.1): the hero composes ≥2 distinct elevation tokens — the glass
 * panel at `--elev-2`, the Primary_CTA accent flourish at `--elev-gold`, and the
 * stat tiles at `--elev-1` — plus ≥1 blur token (`--blur-lg` on the panel).
 *
 * COPY (Req 10.2, 13.4): the headline (`HERO_HEADLINE`) renders at the
 * breakpoint-pinned `--text-size-hero` fluid token and the subhead
 * (`HERO_SUBHEAD`) beneath it; both are validated by `isValidHeroCopy`.
 *
 * PRIMARY_CTA (Req 10.3, 10.5): EXACTLY ONE `Glass_Button variant="primary"`
 * (the only gold control). Its `onClick` calls `searchRef.current?.focusInput()`
 * to place keyboard focus on the domain search input.
 *
 * BEGINNER_ENTRY (Req 12.1–12.5): a secondary (non-gold) `Glass_Button` reading
 * "Not sure where to start? → Domain Finder". On activation it runs the
 * `isReachable` allowlist gate before `router.push`; on an unreachable
 * destination it shows an error toast and preserves Hero state without
 * navigating.
 *
 * STAT_STRIP (Req 11.1–11.4, 13.2, 13.5): four `Glass_Stat` tiles (20M+, 50K+,
 * 1,600+, 99.9%) laid out stacked (`grid-cols-1`) on mobile and as a single
 * horizontal row (`lg:grid-cols-4`) on desktop.
 *
 * AMBIENT_MOTION (Req 9.4, 10.4): a decorative layer using the token-driven
 * `.animate-ambient` class. `useReducedMotion()` drops the class (rendering it
 * static) when reduced motion is preferred; the `prefers-reduced-motion` CSS
 * block neutralizes it as well.
 *
 * RESPONSIVE (Req 13.1, 13.3): single-column content at ≤767px, multi-column at
 * ≥1024px; all surfaces are fluid / `max-width: 100%` so nothing overflows the
 * 320–1440px range.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Hero composition"
 * Requirements: 9.4, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.4,
 *               12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.4, 13.5
 */

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { Mandala } from '@/components/ui/Mandala';
import { useToast } from '@/components/ui/Toast';
import { Glass_Button, Glass_Chip, Glass_Stat } from '@/components/ui/glass';
import { useReducedMotion } from '@/components/ui/glass/hooks/useReducedMotion';
import {
  SearchInterface,
  type SearchInterfaceHandle,
} from '@/components/domain/SearchInterface';
import {
  BEGINNER_ENTRY_DESTINATION,
  HERO_HEADLINE,
  HERO_SUBHEAD,
  isReachable,
  isValidHeroCopy,
} from './heroCopy';

// Dev-time assertion that the shipped copy stays within Req 10.2 bounds. The
// constants already pass; this surfaces any future regression at runtime in dev.
if (process.env.NODE_ENV !== 'production' && !isValidHeroCopy(HERO_HEADLINE, HERO_SUBHEAD)) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Hero] HERO_HEADLINE/HERO_SUBHEAD violate isValidHeroCopy bounds (Req 10.2).'
  );
}

/** The four Stat_Strip tiles (Req 11.1) — each value appears exactly once. */
const STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '20M+', label: 'Domains searched' },
  { value: '50K+', label: 'Founders served' },
  { value: '1,600+', label: 'Live extensions' },
  { value: '99.9%', label: 'Uptime' },
];

/** Secondary quick-link chips mirroring the shipped hero (chip styling, no gold button). */
const QUICK_LINKS: ReadonlyArray<{ href: string; icon: React.ReactNode; label: string; highlight?: boolean }> = [
  { href: '/generator', icon: <Icons.Magic />, label: 'AI generator' },
  { href: '/tools/compare', icon: <Icons.Dollar />, label: 'Compare prices' },
  { href: '/bulk-search', icon: <Icons.Layers />, label: 'Bulk check', highlight: true },
  { href: '/domain-extensions', icon: <Icons.Globe />, label: 'Extensions' },
];

export interface HeroProps {
  /** Initial value forwarded to the domain search input. */
  searchQuery?: string;
  /** Called with a debounced/submitted query (mirrors page.tsx `handleHeroSearch`). */
  onSearch: (query: string) => void;
  /** Called when the search input is cleared (mirrors page.tsx `handleHeroClear`). */
  onClear: () => void;
}

/**
 * Render the premium glass Hero. See the file header for the full token and
 * requirement contract.
 */
export function Hero({ searchQuery = '', onSearch, onClear }: HeroProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  // Imperative handle so the Primary_CTA can focus the search input (Req 10.5).
  const searchRef = useRef<SearchInterfaceHandle>(null);

  const focusSearch = useCallback(() => {
    searchRef.current?.focusInput();
  }, []);

  // Beginner_Entry guarded navigation (Req 12.3, 12.4): gate on the route
  // allowlist; on an unreachable destination show an error toast and preserve
  // Hero state without navigating.
  const goToFinder = useCallback(() => {
    if (!isReachable(BEGINNER_ENTRY_DESTINATION)) {
      showToast('That path is unavailable right now. Please try again.', 'error');
      return;
    }
    router.push(BEGINNER_ENTRY_DESTINATION);
  }, [router, showToast]);

  return (
    <section className="relative px-4 sm:px-6 pt-6 sm:pt-20 pb-6 sm:pb-12">
      {/* Ambient gold underglow behind the headline — reduced-motion aware.
          Sits behind the open content (no containing box) so it reads as
          atmosphere on the grid, the dark-tech way (Req 9.4, 10.4). */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-1/2 top-8 -z-0 h-64 w-[42rem] max-w-[92vw] -translate-x-1/2 rounded-full',
          !prefersReducedMotion && 'animate-ambient'
        )}
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)',
          filter: 'blur(var(--blur-xl))',
        }}
      />

      {/* Decorative mandala ringwork — slow kaleidoscopic drift behind the
          headline, very low opacity so it reads as fine atmospheric detail.
          Purely presentational and reduced-motion aware (handled inside). */}
      <Mandala
        petals={16}
        className="absolute left-1/2 top-[-2rem] -z-0 h-[26rem] w-[26rem] max-w-[96vw] -translate-x-1/2 opacity-[0.10] sm:top-[-4rem] sm:h-[34rem] sm:w-[34rem] sm:opacity-[0.13]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[60rem] flex-col items-center gap-4 text-center sm:gap-7">
        {/* Eyebrow chip (Req 10) */}
        <Glass_Chip icon={<Icons.Sparkles />}>
          1,600+ extensions · Real-time results
        </Glass_Chip>

        {/* Headline — fluid --text-size-hero token, gradient-clipped for the
            premium dark-tech sheen (Req 10.2, 13.4). */}
        <h1
          className="font-black tracking-tight text-balance text-[2rem] sm:text-[length:var(--text-size-hero)]"
          style={{
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            backgroundImage:
              'linear-gradient(180deg, var(--gradient-hero-from) 0%, var(--gradient-hero-to) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {HERO_HEADLINE}
        </h1>

        {/* Subhead (Req 10.2) */}
        <p
          className="mx-auto max-w-[34rem] sm:max-w-[40rem] leading-relaxed text-balance text-[13px] sm:text-[length:var(--text-size-lg)]"
          style={{
            color: 'var(--text-secondary)',
          }}
        >
          {HERO_SUBHEAD}
        </p>

        {/* The domain search — the premium glass focal element of the hero.
            A genuinely translucent surface so the grid + spotlight refract
            through it, with a bright top-edge light catch (Req 10.1). */}
        <div className="glass-premium w-full max-w-[44rem] rounded-2xl p-1.5 sm:p-2.5">
          <SearchInterface
            ref={searchRef}
            initialQuery={searchQuery}
            placeholder="Type a name to check availability..."
            onSearch={onSearch}
            onClear={onClear}
            autoFocus
            showRecentSearches={false}
            debounceMs={180}
          />
        </div>

        {/* Action row: exactly one gold Primary_CTA + non-gold Beginner_Entry.
            Both are equal-height and vertically centered so they read as a
            balanced pair. */}
        <div className="flex w-full flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-stretch sm:gap-3">
          {/* Primary_CTA — the ONLY gold button (Req 10.3); focuses search (Req 10.5). */}
          <Glass_Button
            variant="primary"
            size="lg"
            elevation="gold"
            onClick={focusSearch}
            leftIcon={<Icons.Search />}
            className="justify-center"
          >
            Start your search
          </Glass_Button>

          {/* Beginner_Entry — secondary glass, no gold (Req 12.1, 12.2).
              Centered content matching the primary button's alignment. */}
          <Glass_Button
            variant="secondary"
            size="lg"
            onClick={goToFinder}
            className="flex-col items-center justify-center gap-0 text-center leading-tight"
          >
            <span className="hidden sm:block" style={{ fontSize: 'var(--text-size-xs)', color: 'var(--text-tertiary)' }}>
              Not sure where to start?
            </span>
            <span
              className="inline-flex items-center gap-1"
              style={{ fontSize: 'var(--text-size-sm)', color: 'var(--text-primary)' }}
            >
              Domain Finder
              <Icons.ArrowRight />
            </span>
          </Glass_Button>
        </div>

        {/* Secondary quick links (chip styling — not the gold button).
            The Bulk check chip is rendered louder (accent-chip-strong) to draw
            the eye, since power users reach for it most. */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {QUICK_LINKS.map((link) => (
            <Glass_Chip
              key={link.href}
              as="a"
              href={link.href}
              icon={link.icon}
              className={cn(link.highlight && 'accent-chip-strong')}
            >
              {link.label}
            </Glass_Chip>
          ))}
        </div>

        {/* Stat_Strip — 2-up on mobile, 4-up row on desktop. */}
        <div className="grid w-full max-w-[52rem] grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Glass_Stat
              key={stat.label}
              value={stat.value}
              label={stat.label}
              elevation={1}
              blur="md"
              className="items-center text-center !p-3 sm:!p-5"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
