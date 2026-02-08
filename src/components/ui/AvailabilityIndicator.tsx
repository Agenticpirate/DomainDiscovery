'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

type AvailabilityStatus = 'available' | 'unavailable' | 'loading' | 'unknown';

interface AvailabilityIndicatorProps {
  status: AvailabilityStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  tooltipText?: string;
  className?: string;
}

export const AvailabilityIndicator: React.FC<AvailabilityIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  tooltipText,
  className,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const statusConfig = {
    available: {
      icon: (
        <svg
          data-icon="checkmark"
          className={cn(sizeClasses[size], 'text-emerald-400')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      label: 'Available',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      tooltip: tooltipText || 'This domain is available for registration',
    },
    unavailable: {
      icon: (
        <svg
          data-icon="x-mark"
          className={cn(sizeClasses[size], 'text-red-400')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      label: 'Taken',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      tooltip: tooltipText || 'This domain is already registered',
    },
    loading: {
      icon: (
        <svg
          data-icon="spinner"
          className={cn(sizeClasses[size], isLight ? 'text-slate-400 animate-spin' : 'text-white/40 animate-spin')}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ),
      label: 'Checking...',
      color: isLight ? 'text-slate-400' : 'text-white/40',
      bgColor: isLight ? 'bg-slate-100' : 'bg-white/5',
      tooltip: tooltipText || 'Checking domain availability',
    },
    unknown: {
      icon: (
        <svg
          data-icon="question"
          className={cn(sizeClasses[size], 'text-gray-400')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: 'Unknown',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      tooltip: tooltipText || 'Unable to determine availability',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      title={config.tooltip}
      role="status"
      aria-label={config.label}
    >
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full p-1',
          config.bgColor
        )}
      >
        {config.icon}
      </div>
      {showLabel && (
        <span className={cn('font-medium', textSizeClasses[size], config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
};
