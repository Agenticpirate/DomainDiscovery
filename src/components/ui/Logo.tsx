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

/**
 * Metal D mark + wordmark — silver / slate brand only (no orange).
 */
export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const px = iconPx[size];

  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ maxWidth: '100%' }}>
      <div
        className="logo-icon-wrapper relative shrink-0"
        style={{
          width: px,
          height: px,
          minWidth: px,
          maxWidth: px,
          // Kill any warm/orange ambient glow from filters or assets
          filter: 'none',
          boxShadow: 'none',
          background: 'transparent',
        }}
      >
        <Image
          src="/logo.png"
          alt="DomainDiscovery"
          width={px}
          height={px}
          priority
          className="h-full w-full object-contain"
          style={{ filter: 'none', boxShadow: 'none' }}
          unoptimized
        />
      </div>
      {showText && (
        <div className="flex min-w-0 flex-col text-left leading-none">
          <div className={`${textSizeClasses[size]} font-black tracking-tight`}>
            <span
              className="bg-clip-text text-transparent"
              style={{
                // Brand silver / slate only — never orange
                backgroundImage: isLight
                  ? 'linear-gradient(to right, #0f172a, #1e293b, #64748b)'
                  : 'linear-gradient(to right, #ffffff, #f1f5f9, #94a3b8)',
              }}
            >
              DomainDiscovery
            </span>
          </div>
          <span
            className="mt-0.5 text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: isLight ? '#64748b' : '#94a3b8' }}
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
  return (
    <Image
      src="/logo.png"
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
  return (
    <Image
      src="/logo.png"
      alt="DomainDiscovery"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      unoptimized
    />
  );
};
