'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  REGISTRARS,
  getEffectiveRegisterRegistrar,
  resolveRegisterUrl,
  type RegistrarName,
} from '@/lib/registrars';

const MENU_WIDTH = 220;
const MENU_GAP = 8;
const MENU_MARGIN = 12;

export function PreferredRegistrarSelect({
  selectedRegistrar,
  onSelectRegistrar,
  label = 'Preferred registrar',
  className,
}: {
  selectedRegistrar: RegistrarName;
  onSelectRegistrar: (registrar: RegistrarName) => void;
  label?: string;
  className?: string;
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <label className={cn('flex items-center gap-2 text-xs font-medium', className)}>
      <span className={isLight ? 'text-slate-500' : 'text-white/45'}>{label}</span>
      <select
        value={selectedRegistrar}
        onChange={(event) => onSelectRegistrar(event.target.value as RegistrarName)}
        className={cn(
          'min-w-[150px] rounded-lg border px-3 py-2 text-xs font-semibold outline-none transition-colors',
          isLight
            ? 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
            : 'border-white/10 bg-[#121316] text-white/85 hover:border-white/20'
        )}
      >
        {REGISTRARS.map((registrar) => (
          <option key={registrar.name} value={registrar.name}>
            {registrar.host}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RegistrarActionMenu({
  domain,
  selectedRegistrar,
  onSelectRegistrar,
  canRegister,
  primaryLabel,
  primaryButtonClassName,
  chevronButtonClassName,
  fallbackButtonClassName,
  shellClassName,
  premiumUrl,
  premiumLabel,
  isPremium = false,
}: {
  domain: string;
  selectedRegistrar: RegistrarName;
  onSelectRegistrar: (registrar: RegistrarName) => void;
  canRegister: boolean;
  primaryLabel: React.ReactNode;
  primaryButtonClassName?: string;
  chevronButtonClassName?: string;
  fallbackButtonClassName?: string;
  /** Extra classes on the joined pill shell (e.g. quieter border for dense grids) */
  shellClassName?: string;
  premiumUrl?: string;
  premiumLabel?: string;
  /** Premium / aftermarket — primary Go routes to GoDaddy (listing source) */
  isPremium?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number; visibility: 'hidden' | 'visible' }>({
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    visibility: 'hidden',
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 320;
    const menuWidth = Math.min(MENU_WIDTH, window.innerWidth - MENU_MARGIN * 2);
    const showAbove =
      window.innerHeight - rect.bottom < menuHeight + MENU_GAP &&
      rect.top > menuHeight + MENU_GAP;

    const top = showAbove
      ? Math.max(MENU_MARGIN, rect.top - menuHeight - MENU_GAP)
      : Math.min(window.innerHeight - menuHeight - MENU_MARGIN, rect.bottom + MENU_GAP);

    const left = Math.min(
      Math.max(MENU_MARGIN, rect.right - menuWidth),
      window.innerWidth - menuWidth - MENU_MARGIN
    );

    setMenuStyle({
      top,
      left,
      width: menuWidth,
      visibility: 'visible',
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeIfOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleViewportChange = () => updateMenuPosition();
    const raf = requestAnimationFrame(updateMenuPosition);

    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) {
      setMenuStyle((prev) => ({ ...prev, visibility: 'hidden' }));
    }
  }, [open]);

  /**
   * Primary register partner is Spaceship Impact affiliate by default.
   * Premium pricing may be from GoDaddy (label only) — Go still uses affiliate
   * unless the user picks GoDaddy/other in the menu.
   */
  const hrefFor = (registrar: RegistrarName) =>
    resolveRegisterUrl(domain, registrar, premiumUrl, { premium: isPremium });

  // Prefer Spaceship for primary Go (affiliate) even when domain is premium
  const effectivePrimaryRegistrar = getEffectiveRegisterRegistrar(
    selectedRegistrar,
    isPremium
  );

  const handleFallbackClick = () => {
    const nextUrl =
      resolveRegisterUrl(domain, selectedRegistrar, premiumUrl, { premium: isPremium }) ||
      `https://who.is/whois/${encodeURIComponent(domain)}`;
    window.open(nextUrl, '_blank', 'noopener,noreferrer');
  };

  const primaryHref = hrefFor(effectivePrimaryRegistrar);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuStyle.top,
            left: menuStyle.left,
            width: menuStyle.width,
            visibility: menuStyle.visibility,
          }}
          className={cn(
            'z-[100] max-h-[min(70vh,22rem)] overflow-y-auto overscroll-contain rounded-2xl border p-2 shadow-2xl',
            isLight
              ? 'border-slate-200 bg-white shadow-slate-900/15'
              : 'border-white/12 bg-[#0c0c0e] shadow-black/70'
          )}
        >
          <div
            className={cn(
              'px-2.5 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.16em]',
              isLight ? 'text-slate-400' : 'text-white/40'
            )}
          >
            {isPremium ? 'Premium · open at registrar' : 'Open at registrar'}
          </div>
          {isPremium && (
            <p
              className={cn(
                'px-2.5 pb-2 text-[10px] leading-snug',
                isLight ? 'text-amber-700/90' : 'text-amber-400/85'
              )}
            >
              Premium pricing data from GoDaddy. Default Go uses our Spaceship
              affiliate link — choose GoDaddy below to open the GoDaddy listing.
            </p>
          )}
          <div className="space-y-0.5">
            {REGISTRARS.map((registrar) => {
              const selected = registrar.name === effectivePrimaryRegistrar;
              return (
                <a
                  key={registrar.name}
                  href={hrefFor(registrar.name)}
                  target="_blank"
                  rel={
                    registrar.name === 'Spaceship'
                      ? 'sponsored noopener noreferrer'
                      : 'noopener noreferrer'
                  }
                  data-affiliate={registrar.name === 'Spaceship' ? 'spaceship' : undefined}
                  data-registrar={registrar.name}
                  data-placement="register-menu"
                  data-premium={isPremium ? 'true' : undefined}
                  onClick={() => {
                    onSelectRegistrar(registrar.name);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 text-left text-[13px] font-medium transition-colors',
                    selected
                      ? isLight
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-black'
                      : isLight
                        ? 'text-slate-700 hover:bg-slate-50'
                        : 'text-white/80 hover:bg-white/[0.06]'
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={registrar.logo}
                      alt=""
                      width={20}
                      height={20}
                      className={cn(
                        'h-5 w-5 shrink-0 rounded-md object-contain p-0.5',
                        isLight ? 'bg-white ring-1 ring-slate-200' : 'bg-white ring-1 ring-black/5'
                      )}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="truncate">{registrar.host}</span>
                  </span>
                  {selected && (
                    <svg
                      className={cn('h-4 w-4 shrink-0', isLight ? 'text-white/80' : 'text-black/70')}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </a>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  // Unified pill: primary action + chevron share one rounded control (no messy split blobs)
  const joinedShell = cn(
    'inline-flex items-stretch overflow-hidden rounded-full',
    isLight ? 'ring-1 ring-black/5' : 'ring-1 ring-white/10',
    shellClassName
  );

  return (
    <div className="relative z-10 shrink-0 max-w-full" ref={containerRef}>
      {canRegister ? (
        <div className={joinedShell}>
          <a
            href={primaryHref}
            target="_blank"
            rel={
              effectivePrimaryRegistrar === 'Spaceship'
                ? 'sponsored noopener noreferrer'
                : 'noopener noreferrer'
            }
            data-affiliate={
              effectivePrimaryRegistrar === 'Spaceship' ? 'spaceship' : undefined
            }
            data-registrar={effectivePrimaryRegistrar}
            data-premium={isPremium ? 'true' : undefined}
            data-placement="register-go"
            onClick={() => {
              // Persist menu choice for free domains; premium default stays GoDaddy until user picks
              if (!isPremium) onSelectRegistrar(selectedRegistrar);
            }}
            className={cn(
              'inline-flex items-center justify-center gap-1 pl-3 pr-2 py-1.5 text-[11px] sm:text-[12px] font-bold transition-colors',
              primaryButtonClassName
            )}
            title={
              isPremium
                ? `Premium (GoDaddy data) · register via ${effectivePrimaryRegistrar}`
                : `Register on ${effectivePrimaryRegistrar}`
            }
          >
            {primaryLabel}
          </a>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className={cn(
              'inline-flex items-center justify-center border-l px-2 py-1.5 transition-colors',
              isLight ? 'border-black/10' : 'border-black/15',
              chevronButtonClassName
            )}
            title="Choose registrar"
            aria-label="Choose registrar"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleFallbackClick}
          className={cn(
            'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] sm:text-[12px] font-bold transition-colors',
            fallbackButtonClassName
          )}
          title={premiumLabel || (premiumUrl ? 'View premium listing' : 'View WHOIS')}
        >
          {premiumUrl ? 'View' : 'WHOIS'}
        </button>
      )}
      {menu}
    </div>
  );
}
