'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const iconPx = {
  sm: 34,
  md: 38,
  lg: 52,
} as const;

const textSizeClasses = {
  sm: 'text-[13px]',
  md: 'text-[14px] sm:text-[15px]',
  lg: 'text-lg',
} as const;

/** Cache-bust — white mark (dark UI) + black mark (light UI). */
const LOGO_WHITE = '/logo.png?v=20260729light';
const LOGO_BLACK = '/logo-black.png?v=20260729light';

/**
 * DomainDiscovery monogram + wordmark.
 * Light mode uses a solid black mark; dark mode uses silver/white.
 * Separate assets — no CSS invert (was washing out on light nav).
 */
export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // Avoid wrong mark flash: default dark-nav mark until theme hydrates
  const isLight = mounted && theme === 'light';
  const px = iconPx[size];
  const markSrc = isLight ? LOGO_BLACK : LOGO_WHITE;

  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ maxWidth: '100%' }}>
      <div
        className="logo-icon-wrapper relative shrink-0 overflow-hidden"
        style={{
          width: px,
          height: px,
          minWidth: px,
          maxWidth: px,
          background: 'transparent',
        }}
      >
        <Image
          key={markSrc}
          src={markSrc}
          alt="DomainDiscovery"
          width={px}
          height={px}
          priority
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>
      {showText && (
        <div className="flex min-w-0 flex-col text-left leading-none">
          <div className={`${textSizeClasses[size]} font-black tracking-tight`}>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: isLight
                  ? 'linear-gradient(to right, #0f172a, #1e293b, #334155)'
                  : 'linear-gradient(to right, #ffffff, #f1f5f9, #94a3b8)',
              }}
            >
              DomainDiscovery
            </span>
          </div>
          <span
            className="mt-0.5 text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: isLight ? '#475569' : '#94a3b8' }}
          >
            AI-Powered
          </span>
        </div>
      )}
    </div>
  );
};

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === 'light';
  const markSrc = isLight ? LOGO_BLACK : LOGO_WHITE;

  return (
    <Image
      key={markSrc}
      src={markSrc}
      alt="DomainDiscovery"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      unoptimized
    />
  );
};

export const LogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === 'light';
  const markSrc = isLight ? LOGO_BLACK : LOGO_WHITE;

  return (
    <Image
      key={markSrc}
      src={markSrc}
      alt="DomainDiscovery"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      unoptimized
    />
  );
};
