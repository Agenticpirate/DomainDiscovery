'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { ADA_BRAND } from '@/lib/adaConfig';

type AdaLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show “AI Domain Assistant” wordmark beside the mark */
  showText?: boolean;
  /** Use full stacked asset (rare); default is compact mark */
  variant?: 'mark' | 'full';
  className?: string;
  priority?: boolean;
};

const MARK_PX = {
  sm: 40,
  md: 48,
  lg: 64,
  xl: 80,
} as const;

/** Mobile uses a smaller mark so full wordmark fits beside the menu control */
const MARK_PX_MOBILE = {
  sm: 32,
  md: 36,
  lg: 40,
  xl: 48,
} as const;

const TEXT = {
  sm: 'text-[11px] sm:text-[14px]',
  md: 'text-[12px] sm:text-[16px]',
  lg: 'text-[12.5px] sm:text-xl',
  xl: 'text-[13px] sm:text-2xl',
} as const;

/**
 * AI Domain Assistant brand mark — transparent PNG from design asset.
 * Mobile + desktop: single-line full wordmark; compact mark on small screens.
 */
export function AdaLogo({
  size = 'md',
  showText = true,
  variant = 'mark',
  className = '',
  priority = false,
}: AdaLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;
  const px = MARK_PX[size];
  const pxMobile = MARK_PX_MOBILE[size];

  const src = variant === 'full' ? ADA_BRAND.logoFull : ADA_BRAND.logoMark;

  const shadow = isLight
    ? 'drop-shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
    : 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]';

  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-3 min-w-0 ${className}`}>
      {/* Mobile mark */}
      <span className="relative shrink-0 sm:hidden" style={{ width: pxMobile, height: pxMobile }}>
        <Image
          src={src}
          alt={ADA_BRAND.name}
          width={pxMobile}
          height={pxMobile}
          priority={priority}
          unoptimized
          className={`h-full w-full object-contain ${shadow}`}
        />
      </span>
      {/* Desktop mark */}
      <span className="relative hidden sm:block shrink-0" style={{ width: px, height: px }}>
        <Image
          src={src}
          alt=""
          width={px}
          height={px}
          priority={priority}
          unoptimized
          aria-hidden
          className={`h-full w-full object-contain ${shadow}`}
        />
      </span>
      {showText && (
        <span className="min-w-0 flex flex-col leading-tight">
          <span
            className={`font-bold tracking-tight whitespace-nowrap ${TEXT[size]} ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {ADA_BRAND.name}
          </span>
          <span
            className={`hidden sm:block text-[9px] font-semibold uppercase tracking-[0.14em] ${
              isLight ? 'text-slate-500' : 'text-white/40'
            }`}
          >
            For AI agents · Domains
          </span>
        </span>
      )}
    </span>
  );
}
