'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group shrink-0">
        <div className={`absolute inset-0 rounded-2xl blur-lg transition-opacity ${
          isLight
            ? 'bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 opacity-50 group-hover:opacity-70'
            : 'bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 opacity-40 group-hover:opacity-60'
        }`} />
        <div className={`relative ${sizeClasses[size]} rounded-2xl flex items-center justify-center transition-all ${
          isLight
            ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 shadow-xl shadow-slate-900/30 group-hover:shadow-slate-900/40 border border-slate-500/30'
            : 'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 shadow-xl shadow-slate-900/20 group-hover:shadow-slate-900/30 border border-white/40'
        }`}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className={`w-[65%] h-[65%] ${isLight ? 'text-slate-100' : 'text-slate-700'}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
            <circle 
              cx="12" 
              cy="12" 
              r="4" 
              fill="currentColor"
              opacity="0.9"
            />
            <circle cx="12" cy="12" r="1.5" fill={isLight ? '#475569' : 'white'} fillOpacity="0.6" />
          </svg>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <div className={`${textSizeClasses[size]} font-black tracking-tight leading-none flex items-center gap-[1px]`}>
            <span className={`bg-clip-text text-transparent ${
              isLight
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600'
                : 'bg-gradient-to-r from-white via-slate-100 to-slate-300'
            }`}>
              DomainsDisc
            </span>
            <div className="relative inline-flex items-center justify-center" style={{ width: '0.65em', height: '0.65em', marginTop: '0.05em' }}>
              <div className={`absolute inset-0 rounded-full blur-[3px] ${
                isLight
                  ? 'bg-gradient-to-br from-slate-500 via-slate-400 to-slate-600 opacity-40'
                  : 'bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 opacity-30'
              }`} />
              <div className={`relative w-full h-full rounded-full flex items-center justify-center shadow-md ${
                isLight
                  ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 border border-slate-500/30'
                  : 'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 border border-white/30'
              }`}>
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className={`w-[55%] h-[55%] ${isLight ? 'text-slate-100' : 'text-slate-700'}`}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 4L5 8V16L12 20L19 16V8L12 4Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="3.5" 
                    fill="currentColor"
                    opacity="0.85"
                  />
                  <circle cx="12" cy="12" r="1.2" fill={isLight ? '#475569' : 'white'} fillOpacity="0.5" />
                </svg>
              </div>
            </div>
            <span className={`bg-clip-text text-transparent ${
              isLight
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600'
                : 'bg-gradient-to-r from-white via-slate-100 to-slate-300'
            }`}>
              very
            </span>
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            AI-Powered
          </span>
        </div>
      )}
    </div>
  );
};

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 rounded-2xl blur-lg opacity-40" />
      <div 
        className="relative rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 flex items-center justify-center shadow-xl shadow-slate-900/20 border border-white/40"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-slate-700"
          style={{ width: size * 0.65, height: size * 0.65 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" 
            stroke="currentColor" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          <circle 
            cx="12" 
            cy="12" 
            r="4" 
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
};
