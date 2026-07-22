import { ImageResponse } from 'next/og';
import { normalizeShareDomain } from '@/lib/whoisShareMeta';

export const runtime = 'edge';
export const alt = 'WHOIS card — DomainDiscovery';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function fetchWhois(domain: string, origin: string) {
  try {
    const res = await fetch(
      `${origin}/api/domains/whois?domain=${encodeURIComponent(domain)}`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return null;
    return (await res.json()) as {
      domain?: string;
      registrar?: string;
      status?: string;
      registrationDate?: string | null;
      expirationDate?: string | null;
      nameServers?: string[];
      dnssec?: boolean;
      available?: boolean;
      success?: boolean;
    };
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ domain: string }> | { domain: string };
}) {
  const resolved = await Promise.resolve(params);
  const domain = normalizeShareDomain(decodeURIComponent(resolved.domain || 'example.com'));

  const origin = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:5001')
  ).replace(/\/$/, '');

  const data = await fetchWhois(domain, origin);
  const registrar = data?.registrar || '—';
  const status = data?.status || (data?.available ? 'Available / not in RDAP' : '—');
  const registered = data?.registrationDate || '—';
  const expires = data?.expirationDate || '—';
  const ns = data?.nameServers?.[0] || '—';
  const dnssec =
    typeof data?.dnssec === 'boolean' ? (data.dnssec ? 'Signed' : 'Unsigned') : '—';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #07070a 0%, #0c0c10 50%, #121218 100%)',
          position: 'relative',
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 80,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(203,213,225,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 60,
            width: 400,
            height: 400,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(148,163,184,0.14) 0%, transparent 70%)',
          }}
        />

        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 1040,
            height: 500,
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'linear-gradient(145deg, #16161c 0%, #0f0f14 55%, #14141a 100%)',
            padding: '40px 44px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.55)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shine */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 80,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.42)',
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                }}
              >
                DomainDiscovery · WHOIS
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: -1.5,
                  marginTop: 8,
                  lineHeight: 1.05,
                }}
              >
                {domain}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              RDAP
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              marginTop: 8,
              padding: 28,
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.35)',
            }}
          >
            {[
              ['Status', status],
              ['Registrar', registrar],
              ['Registered', registered],
              ['Expires', expires],
              ['DNSSEC', dnssec],
              ['Name server', ns],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '30%',
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.38)',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.92)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {String(value).slice(0, 42)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'auto',
              paddingTop: 20,
              fontSize: 14,
              color: 'rgba(255,255,255,0.32)',
              fontWeight: 600,
            }}
          >
            <span>Free public RDAP · share-ready card</span>
            <span>domainsdiscovery.com</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
