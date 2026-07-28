'use client';

import React from 'react';

type SolidPlateProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Fully opaque fill (required for ambient-dot pages) */
  fill: string;
  as?: 'div' | 'section' | 'article';
  id?: string;
};

/**
 * Opaque surface so SectionAmbient / dotted glow never paints through
 * cards, titles, or badges. Prefer inline `fill` over Tailwind bg-* alone.
 */
export function SolidPlate({
  children,
  className = '',
  contentClassName = '',
  fill,
  as: Tag = 'div',
  id,
}: SolidPlateProps) {
  return (
    <Tag
      id={id}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundColor: fill }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ backgroundColor: fill }}
      />
      <div className={`relative z-[1] h-full ${contentClassName}`}>{children}</div>
    </Tag>
  );
}

/** Soft radial scrim under free-standing titles (center clear under type) */
export function TitleScrim({
  isLight,
  children,
  className = '',
}: {
  isLight: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative isolate ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -mx-3 -my-2 rounded-3xl sm:-mx-6 sm:-my-3"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse 95% 85% at 50% 45%, #f8fafc 0%, #f8fafc 52%, rgba(248,250,252,0) 100%)'
            : 'radial-gradient(ellipse 95% 85% at 50% 45%, #050505 0%, #050505 52%, rgba(5,5,5,0) 100%)',
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
