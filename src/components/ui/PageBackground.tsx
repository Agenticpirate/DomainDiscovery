'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PageBackgroundProps {
  variant?: 'default' | 'hero' | 'minimal';
  showGrid?: boolean;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({ 
  variant = 'default',
  showGrid = false 
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <>
      {showGrid && !isLight && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:1rem_1rem]" />
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[320px] sm:w-[1000px] sm:h-[500px] bg-gradient-to-b from-slate-400/[0.08] via-slate-500/[0.04] to-transparent rounded-full blur-[90px] sm:blur-[100px]" />
            <div className="absolute top-16 left-1/4 -translate-x-1/2 w-[320px] h-[180px] sm:top-20 sm:w-[600px] sm:h-[300px] bg-slate-400/[0.06] rounded-full blur-[90px] sm:blur-[120px]" />
            <div className="absolute top-28 right-1/4 translate-x-1/2 w-[280px] h-[160px] sm:top-32 sm:w-[500px] sm:h-[250px] bg-slate-500/[0.05] rounded-full blur-[80px] sm:blur-[100px]" />
            <div className="absolute bottom-[-4rem] left-1/2 -translate-x-1/2 w-[560px] h-[150px] sm:bottom-[-6rem] sm:w-[900px] sm:h-[240px] bg-white/[0.03] rounded-full blur-[90px] sm:blur-[130px]" />
          </>
        )}

        {variant === 'hero' && isLight && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_40%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[360px] sm:w-[1100px] sm:h-[540px] bg-gradient-to-b from-slate-200/[0.5] via-slate-100/[0.24] to-transparent rounded-full blur-[95px] sm:blur-[120px]" />
            <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[340px] h-[170px] sm:w-[640px] sm:h-[320px] bg-slate-200/[0.3] rounded-full blur-[90px] sm:blur-[110px]" />
            <div className="absolute top-24 right-1/4 translate-x-1/2 w-[320px] h-[160px] sm:w-[560px] sm:h-[280px] bg-slate-300/[0.18] rounded-full blur-[80px] sm:blur-[100px]" />
          </>
        )}

        {variant === 'default' && !isLight && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-slate-500/[0.06] via-slate-400/[0.03] to-transparent rounded-full blur-[80px]" />
            <div className="absolute top-40 left-1/3 -translate-x-1/2 w-[400px] h-[200px] bg-slate-400/[0.04] rounded-full blur-[100px]" />
            <div className="absolute top-60 right-1/3 translate-x-1/2 w-[350px] h-[180px] bg-slate-500/[0.03] rounded-full blur-[90px]" />
          </>
        )}

        {variant === 'default' && isLight && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[320px] sm:w-[900px] sm:h-[450px] bg-gradient-to-b from-slate-200/[0.28] via-slate-100/[0.14] to-transparent rounded-full blur-[80px]" />
            <div className="absolute top-36 left-1/3 -translate-x-1/2 w-[320px] h-[160px] sm:w-[500px] sm:h-[250px] bg-slate-200/[0.16] rounded-full blur-[90px] sm:blur-[100px]" />
          </>
        )}

        {variant === 'minimal' && !isLight && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-slate-500/[0.04] to-transparent rounded-full blur-[80px]" />
        )}
      </div>
    </>
  );
};
