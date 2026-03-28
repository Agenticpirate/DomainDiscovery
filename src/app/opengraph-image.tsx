import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DomainDiscovery — Find Your Perfect Domain in Seconds';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          position: 'relative',
        }}
      >
        {/* Subtle top glow */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '350px',
            background: 'radial-gradient(ellipse, rgba(148,163,184,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #e2e8f0, #f1f5f9, #cbd5e1)',
            marginBottom: '32px',
          }}
        >
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="12" cy="12" r="4" fill="#334155" opacity="0.9"/>
            <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.6"/>
          </svg>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: '64px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, textAlign: 'center' }}>
          Find Your Perfect Domain
        </div>
        <div style={{ fontSize: '36px', fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginTop: '8px' }}>
          in Seconds
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', marginTop: '24px' }}>
          domainsdiscovery.com
        </div>
      </div>
    ),
    { ...size }
  );
}
