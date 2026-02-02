'use client';

import React from 'react';

interface PageBackgroundProps {
  variant?: 'default' | 'hero' | 'minimal';
  showGrid?: boolean;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({ 
  variant = 'default',
  showGrid = true 
}) => {
  return (
    <>
      {/* Enhanced Grid Background */}
      {showGrid && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Primary grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          {/* Secondary finer grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:1rem_1rem]" />
          {/* Radial fade overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0a_70%)]" />
        </div>
      )}

      {/* Gradient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {variant === 'hero' && (
          <>
            {/* Top center glow - main hero highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-slate-400/[0.08] via-slate-500/[0.04] to-transparent rounded-full blur-[100px]" />
            {/* Left accent glow */}
            <div className="absolute top-20 left-1/4 -translate-x-1/2 w-[600px] h-[300px] bg-slate-400/[0.06] rounded-full blur-[120px]" />
            {/* Right accent glow */}
            <div className="absolute top-32 right-1/4 translate-x-1/2 w-[500px] h-[250px] bg-slate-500/[0.05] rounded-full blur-[100px]" />
          </>
        )}

        {variant === 'default' && (
          <>
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-slate-500/[0.06] via-slate-400/[0.03] to-transparent rounded-full blur-[80px]" />
            {/* Side accents */}
            <div className="absolute top-40 left-1/3 -translate-x-1/2 w-[400px] h-[200px] bg-slate-400/[0.04] rounded-full blur-[100px]" />
            <div className="absolute top-60 right-1/3 translate-x-1/2 w-[350px] h-[180px] bg-slate-500/[0.03] rounded-full blur-[90px]" />
          </>
        )}

        {variant === 'minimal' && (
          <>
            {/* Very subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-slate-500/[0.04] to-transparent rounded-full blur-[80px]" />
          </>
        )}
      </div>
    </>
  );
};
