'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { REGISTRARS, getRegistrarUrl, type RegistrarName } from '@/lib/registrars';

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
  premiumUrl,
  premiumLabel,
}: {
  domain: string;
  selectedRegistrar: RegistrarName;
  onSelectRegistrar: (registrar: RegistrarName) => void;
  canRegister: boolean;
  primaryLabel: string;
  primaryButtonClassName?: string;
  chevronButtonClassName?: string;
  fallbackButtonClassName?: string;
  premiumUrl?: string;
  premiumLabel?: string;
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

  const openRegistrar = (registrar: RegistrarName) => {
    onSelectRegistrar(registrar);
    // Always open the registrar's search page for this exact domain name
    window.open(getRegistrarUrl(domain, registrar), '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const handleFallbackClick = () => {
    // Prefer registrar search so users can still find/buy premium or aftermarket names
    const nextUrl =
      premiumUrl || getRegistrarUrl(domain, selectedRegistrar) || `https://who.is/whois/${encodeURIComponent(domain)}`;
    window.open(nextUrl, '_blank', 'noopener,noreferrer');
  };

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
            'z-[90] rounded-xl border p-1.5 shadow-2xl',
            isLight
              ? 'border-slate-200 bg-white/96 shadow-slate-900/10 backdrop-blur-xl'
              : 'border-white/10 bg-[#111214]/96 shadow-black/60 backdrop-blur-xl'
          )}
        >
          <div className={cn('px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.22em]', isLight ? 'text-slate-400' : 'text-white/35')}>
            Register at
          </div>
          {REGISTRARS.map((registrar) => (
            <button
              key={registrar.name}
              type="button"
              onClick={() => openRegistrar(registrar.name)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition-colors',
                isLight
                  ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  : 'text-white/78 hover:bg-white/[0.05] hover:text-white'
              )}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={registrar.logo}
                  alt=""
                  width={18}
                  height={18}
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 rounded-md object-contain',
                    isLight ? 'bg-white ring-1 ring-slate-200' : 'bg-white/95 ring-1 ring-white/10'
                  )}
                  loading="lazy"
                  decoding="async"
                />
                <span className="truncate">{registrar.host}</span>
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                {registrar.name === selectedRegistrar && (
                  <svg className={cn('h-3.5 w-3.5', isLight ? 'text-slate-400' : 'text-white/60')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <svg className={cn('h-3.5 w-3.5', isLight ? 'text-slate-300' : 'text-white/20')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative z-10" ref={containerRef}>
      {canRegister ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openRegistrar(selectedRegistrar)}
            className={primaryButtonClassName}
            title={`Register on ${selectedRegistrar}`}
          >
            {primaryLabel}
          </button>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className={chevronButtonClassName}
            title="Choose registrar"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleFallbackClick}
          className={fallbackButtonClassName}
          title={premiumLabel || (premiumUrl ? 'View premium listing' : 'View WHOIS')}
        >
          {premiumUrl ? 'View Listing' : 'WHOIS'}
        </button>
      )}
      {menu}
    </div>
  );
}
