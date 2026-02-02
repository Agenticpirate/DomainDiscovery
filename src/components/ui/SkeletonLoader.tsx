import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'domain' | 'circle';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text', 
  count = 1,
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'domain':
        return (
          <div className={`bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 animate-pulse ${className}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="h-6 bg-white/[0.06] rounded-lg w-48"></div>
              <div className="h-8 bg-white/[0.06] rounded-lg w-20"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 bg-white/[0.04] rounded w-24"></div>
              <div className="h-4 bg-white/[0.04] rounded w-32"></div>
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div className={`bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 animate-pulse ${className}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/[0.06] rounded-xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-white/[0.06] rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/[0.04] rounded w-full"></div>
              </div>
            </div>
          </div>
        );
      
      case 'circle':
        return (
          <div className={`w-10 h-10 bg-white/[0.06] rounded-full animate-pulse ${className}`}></div>
        );
      
      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            <div className="h-4 bg-white/[0.06] rounded w-full animate-pulse"></div>
            <div className="h-4 bg-white/[0.06] rounded w-5/6 animate-pulse"></div>
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
