'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator';
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
  const showMarketPrice = !!pricing && (isAvailable || premium);

  const statusSurface = (() => {
    if (isHighlighted) {
      return isLight
        ? 'bg-slate-100 border-slate-300 shadow-lg'
        : 'bg-[#141418] border-white/30 shadow-lg';
    }
    if (isLoading || availability === 'unknown') {
      return isLight
        ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        : 'bg-[#0c0c0e] border-white/10 hover:border-white/20 hover:bg-[#101014]';
    }
    if (premium) {
      return isLight
        ? 'bg-amber-50 border-amber-200/90 hover:border-amber-300'
        : 'bg-amber-500/[0.08] border-amber-500/25 hover:bg-amber-500/[0.12]';
    }
    if (isAvailable) {
      return isLight
        ? 'bg-emerald-50 border-emerald-200/90 hover:border-emerald-300 hover:shadow-emerald-500/10'
        : 'bg-emerald-500/[0.08] border-emerald-500/25 hover:bg-emerald-500/[0.12]';
    }
    return isLight
      ? 'bg-rose-50/90 border-rose-200/80 hover:border-rose-300'
      : 'bg-rose-500/[0.07] border-rose-500/20 hover:bg-rose-500/[0.1]';
  })();

  return (
    <div
      className={`
        shine-border group relative isolate overflow-hidden p-2.5 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200
        ${statusSurface}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <AvailabilityIndicator 
            status={availability}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-mono font-bold text-xs sm:text-base truncate ${
                isAvailable ? (isLight ? 'text-slate-900' : 'text-white') : (isLight ? 'text-slate-600' : 'text-white/60')
              }`}>
                {domain}
              </h3>
              {premium && (
                <span title="Premium listing from GoDaddy">
                  <Badge variant="warning" size="sm">
                    Premium · GoDaddy
                  </Badge>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge 
                variant={premium ? 'warning' : isAvailable ? 'success' : 'neutral'}
                size="sm"
              >
                {isLoading
                  ? 'Checking...'
                  : premium
                    ? 'Premium · GoDaddy'
                    : isAvailable
                      ? 'Available'
                      : 'Taken'}
              </Badge>
              {showMarketPrice && (
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                  {pricing.currency}{pricing.amount.toFixed(2)}{isAvailable ? '/yr' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {onSaveClick && (
          <button
            onClick={onSaveClick}
            className={`p-1 sm:p-1.5 rounded-lg transition-colors shrink-0 ${
              isSaved 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : `${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/30 hover:text-white/70'} ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`
            }`}
            aria-label={isSaved ? 'Remove from saved' : 'Save domain'}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {isAvailable ? (
          <>
            <Button
              onClick={onBuyClick}
              variant="primary"
              size="sm"
              className="flex-1 min-h-[34px]"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Buy Now'}
            </Button>
            {onWhoisClick && (
              <Button
                onClick={onWhoisClick}
                variant="secondary"
                size="sm"
                className="min-h-[34px]"
              >
                WHOIS
              </Button>
            )}
          </>
        ) : premium ? (
          <>
            <Button
              onClick={onBuyClick}
              variant="primary"
              size="sm"
              className="flex-1 min-h-[34px]"
              disabled={isLoading}
            >
              Buy Premium
            </Button>
            {onWhoisClick && (
              <Button
                onClick={onWhoisClick}
                variant="secondary"
                size="sm"
                className="min-h-[34px]"
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
                className="flex-1 min-h-[34px]"
                disabled={isLoading}
              >
                View WHOIS
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 min-h-[34px]"
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
