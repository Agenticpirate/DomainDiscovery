import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-full whitespace-nowrap';

  // Solid fills so ambient dots never show through badges
  const variants = {
    default: 'bg-[#121214] text-white border border-white/20',
    success: 'bg-emerald-950 text-emerald-300 border border-emerald-500/30',
    error: 'bg-rose-950 text-rose-300 border border-rose-500/30',
    warning: 'bg-amber-950 text-amber-200 border border-amber-500/30',
    info: 'bg-sky-950 text-sky-300 border border-sky-500/30',
    neutral: 'bg-[#121214] text-white/55 border border-white/12',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
