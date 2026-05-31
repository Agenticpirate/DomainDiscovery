import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'domain' | 'circle';
  count?: number;
  className?: string;
}

/**
 * SkeletonLoader — token-driven loading placeholders that work in both themes.
 *
 * Surfaces use the `--card-bg` / `--card-border` tokens and shimmer blocks use a
 * neutral `--icon-bg` tint, so the skeleton resolves correctly under dark and
 * light themes via the CSS cascade (no hardcoded colors). The `animate-pulse`
 * utility is neutralized under `prefers-reduced-motion` (see globals.css).
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  className = '',
}) => {
  const surface: React.CSSProperties = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
  };
  const block = 'rounded animate-pulse';
  const blockStyle: React.CSSProperties = { background: 'var(--icon-bg)' };

  const renderSkeleton = () => {
    switch (variant) {
      case 'domain':
        return (
          <div className={`backdrop-blur-xl rounded-2xl p-4 ${className}`} style={surface}>
            <div className="flex items-center justify-between mb-3">
              <div className={`h-6 w-48 ${block}`} style={blockStyle}></div>
              <div className={`h-8 w-20 ${block}`} style={blockStyle}></div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-4 w-24 ${block}`} style={blockStyle}></div>
              <div className={`h-4 w-32 ${block}`} style={blockStyle}></div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className={`backdrop-blur-xl rounded-2xl p-6 ${className}`} style={surface}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl animate-pulse`} style={blockStyle}></div>
              <div className="flex-1">
                <div className={`h-5 w-3/4 mb-2 ${block}`} style={blockStyle}></div>
                <div className={`h-4 w-full ${block}`} style={blockStyle}></div>
              </div>
            </div>
          </div>
        );

      case 'circle':
        return <div className={`w-10 h-10 rounded-full animate-pulse ${className}`} style={blockStyle}></div>;

      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            <div className={`h-4 w-full ${block}`} style={blockStyle}></div>
            <div className={`h-4 w-5/6 ${block}`} style={blockStyle}></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
};
