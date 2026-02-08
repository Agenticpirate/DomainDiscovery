'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator';
import { Tooltip } from '@/components/ui/Tooltip';
import { useTheme } from '@/contexts/ThemeContext';

export interface DomainResultCardProps {
  domain: string;
  availability: 'available' | 'unavailable' | 'loading' | 'unknown';
  pricing?: {
    amount: number;
    currency: string;
    registrar: string;
  };
  premium?: boolean;
  onBuyClick?: () => void;
  onWhoisClick?: () => void;
  onSaveClick?: () => void;
  isHighlighted?: boolean;
  isSaved?: boolean;
}

export function DomainResultCard({
  domain,
  availability,
  pricing,
  premium = false,
  onBuyClick,
  onWhoisClick,
  onSaveClick,
  isHighlighted = false,
  isSaved = false,
}: DomainResultCardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isAvailable = availability === 'available';
  const isLoading = availability === 'loading';

  return (
    <div
      className={`
        group relative p-4 rounded-xl border transition-all duration-200
        ${isHighlighted 
          ? `${isLight ? 'bg-slate-100' : 'bg-white/[0.08]'} ${isLight ? 'border-slate-300' : 'border-white/30'} shadow-lg` 
          : `${isLight ? 'bg-slate-50/50' : 'bg-white/[0.02]'} ${isLight ? 'border-slate-200' : 'border-white/10'} ${isLight ? 'hover:border-slate-300' : 'hover:border-white/20'} ${isLight ? 'hover:bg-slate-100/50' : 'hover:bg-white/[0.04]'}`
        }
        ${isAvailable ? 'hover:shadow-emerald-500/10' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AvailabilityIndicator 
            status={availability}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-mono font-bold text-lg truncate ${
                isAvailable ? (isLight ? 'text-slate-900' : 'text-white') : (isLight ? 'text-slate-600' : 'text-white/60')
              }`}>
                {domain}
              </h3>
              {premium && (
                <Tooltip content="Premium domain with higher pricing">
                  <Badge variant="warning" size="sm">
                    Premium
                  </Badge>
                </Tooltip>
              )}
            </div>
            
            {/* Availability Status */}
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={isAvailable ? 'success' : 'neutral'}
                size="sm"
              >
                {isLoading ? 'Checking...' : isAvailable ? 'Available' : 'Taken'}
              </Badge>
              
              {pricing && isAvailable && (
                <>
                  <span className={isLight ? 'text-slate-300' : 'text-white/30'}>•</span>
                  <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                    {pricing.currency}{pricing.amount.toFixed(2)}/year
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {onSaveClick && (
          <Tooltip content={isSaved ? 'Remove from saved' : 'Save domain'}>
            <button
              onClick={onSaveClick}
              className={`p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' 
                  : `${isLight ? 'text-slate-500' : 'text-white/40'} ${isLight ? 'hover:text-slate-700' : 'hover:text-white/80'} ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save domain'}
            >
              <svg
                className="w-5 h-5"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>

      {/* Pricing Details */}
      {pricing && isAvailable && (
        <div className={`mb-3 p-3 ${isLight ? 'bg-slate-50' : 'bg-white/[0.02]'} rounded-lg border ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center justify-between text-sm">
            <span className={isLight ? 'text-slate-500' : 'text-white/50'}>Best price at</span>
            <span className={`${isLight ? 'text-slate-700' : 'text-white/80'} font-medium`}>{pricing.registrar}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {isAvailable ? (
          <>
            <Button
              onClick={onBuyClick}
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Buy Now'}
            </Button>
            {onWhoisClick && (
              <Button
                onClick={onWhoisClick}
                variant="secondary"
                size="sm"
              >
                WHOIS
              </Button>
            )}
          </>
        ) : (
          <>
            {onWhoisClick && (
              <Button
                onClick={onWhoisClick}
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={isLoading}
              >
                View WHOIS
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              Find Similar
            </Button>
          </>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
    </div>
  );
}
