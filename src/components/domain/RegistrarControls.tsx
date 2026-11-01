'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  REGISTRARS,
  getSpaceshipAffiliateUrl,
  type RegistrarName,
} from '@/lib/registrars';

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
            : 'border-white/10 bg-[#111111] text-white/85 hover:border-white/20'
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

/**
 * Register / Go control. Always the Spaceship Impact hop — the chevron that
 * used to open GoDaddy and other registrars is not part of this button.
 */
export function RegistrarActionMenu({
  domain,
  onSelectRegistrar,
  canRegister,
  primaryLabel,
  primaryButtonClassName,
  fallbackButtonClassName,
  shellClassName,
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
  shellClassName?: string;
  premiumUrl?: string;
  premiumLabel?: string;
  isPremium?: boolean;
}) {
  const href = getSpaceshipAffiliateUrl(domain);

  return (
    <div className="relative z-10 shrink-0 max-w-full">
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        data-affiliate="spaceship"
        data-affiliate-network="impact"
        data-affiliate-url={href}
        data-registrar="Spaceship"
        data-premium={isPremium ? 'true' : undefined}
        data-placement="register-go"
        onClick={() => onSelectRegistrar('Spaceship')}
        className={cn(
          'inline-flex items-center justify-center gap-1 rounded-full text-[11px] sm:text-[12px] font-bold transition-colors',
          canRegister
            ? 'pl-3 pr-2.5 py-1.5'
            : 'px-3 py-1.5',
          canRegister ? primaryButtonClassName : fallbackButtonClassName,
          shellClassName
        )}
        title={isPremium ? 'Premium name · open on Spaceship' : 'Register on Spaceship'}
      >
        {canRegister ? primaryLabel : 'Go'}
      </a>
    </div>
  );
}
