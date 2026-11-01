'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PageBackgroundProps {
  variant?: 'default' | 'hero' | 'minimal';
  showGrid?: boolean;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({
  variant = 'default',
  showGrid = false,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const wash = isLight
    ? 'radial-gradient(ellipse 72% 40% at 70% -8%, rgba(20,21,23,0.05), transparent 58%)'
    : 'radial-gradient(ellipse 72% 42% at 72% -10%, rgba(255,255,255,0.07), transparent 54%)';

  return (
    <div
      className="pointer-events-none fixed inset-0"
      aria-hidden
      data-variant={variant}
      data-grid={showGrid ? 'on' : 'off'}
      style={{ background: wash }}
    />
  );
};
