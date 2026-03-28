import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DomainDiscovery - Find Your Perfect Domain in Seconds';
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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(148,163,184,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #e2e8f0, #f1f5f9, #cbd5e1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            marginBottom: '24px',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="12" cy="12" r="4" fill="#334155" opacity="0.9"/>
            <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.6"/>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Find Your Perfect Domain
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'rgba(148,163,184,0.8)',
              lineHeight: 1,
            }}
          >
            in Seconds
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '20px',
            display: 'flex',
            gap: '16px',
          }}
        >
          <span>1,600+ TLDs</span>
          <span>·</span>
          <span>Real-time Results</span>
          <span>·</span>
          <span>Compare Prices</span>
        </div>

        {/* Search bar mockup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '32px',
            padding: '14px 28px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            width: '500px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>
            Search domain names...
          </span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            marginTop: '36px',
          }}
        >
          {[
            { value: '20M+', label: 'Searches' },
            { value: '50K+', label: 'Users' },
            { value: '1,600+', label: 'TLDs' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>{stat.value}</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
            DomainDiscovery
          </span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
            AI-Powered
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
