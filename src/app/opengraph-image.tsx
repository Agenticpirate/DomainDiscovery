import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt =
  'DomainDiscovery — free domain name search, AI generator, and domain toolkit';
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

        {/* Logo — silver D + search mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e2e8f0, #f1f5f9, #cbd5e1)',
            marginBottom: '28px',
          }}
        >
          <svg width="42" height="42" viewBox="0 0 96 96" fill="none">
            <path
              fill="#334155"
              d="M18 12h26c22.091 0 40 17.909 40 40s-17.909 40-40 40H18V12zm14 12v56h12c15.464 0 28-12.536 28-28S59.464 24 44 24H32z"
            />
            <circle cx="46" cy="48" r="12" stroke="#334155" strokeWidth="6.5" fill="none"/>
            <path
              fill="#334155"
              d="M55.2 58.8a3.5 3.5 0 0 1 4.95 0l10.6 10.6a3.5 3.5 0 1 1-4.95 4.95L55.2 63.74a3.5 3.5 0 0 1 0-4.95z"
            />
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
