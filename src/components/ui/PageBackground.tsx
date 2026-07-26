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

  return (
    <>
      {showGrid && !isLight && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0a_70%)]" />
        </div>
      )}

      {showGrid && isLight && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(245,247,250,0.9)_70%)]" />
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {variant === 'hero' && !isLight && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[280px] sm:w-[960px] sm:h-[420px] bg-gradient-to-b from-slate-400/[0.07] via-slate-500/[0.03] to-transparent rounded-full blur-[90px]" />
            <div className="absolute top-20 left-1/4 w-[280px] h-[160px] bg-slate-400/[0.04] rounded-full blur-[90px]" />
            <div className="absolute top-24 right-1/4 w-[260px] h-[140px] bg-slate-500/[0.03] rounded-full blur-[80px]" />
          </>
        )}

        {variant === 'hero' && isLight && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_45%)]" />
            {/* Colorful soft orbs — light mode only */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[300px] sm:w-[1000px] sm:h-[440px] bg-gradient-to-b from-indigo-300/35 via-sky-200/20 to-transparent rounded-full blur-[90px]" />
            <div className="absolute top-16 left-[8%] w-[280px] h-[200px] bg-violet-300/25 rounded-full blur-[90px]" />
            <div className="absolute top-24 right-[10%] w-[260px] h-[180px] bg-sky-300/30 rounded-full blur-[80px]" />
            <div className="absolute top-[40%] left-1/3 w-[200px] h-[140px] bg-emerald-200/15 rounded-full blur-[70px]" />
          </>
        )}

        {variant === 'default' && !isLight && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-slate-500/[0.05] via-slate-400/[0.02] to-transparent rounded-full blur-[80px]" />
        )}

        {variant === 'default' && isLight && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-indigo-200/30 via-sky-100/20 to-transparent rounded-full blur-[80px]" />
            <div className="absolute top-32 right-[15%] w-[220px] h-[160px] bg-violet-200/20 rounded-full blur-[70px]" />
          </>
        )}

        {variant === 'minimal' && !isLight && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[240px] bg-gradient-to-b from-slate-500/[0.04] to-transparent rounded-full blur-[70px]" />
        )}
      </div>
    </>
  );
};
