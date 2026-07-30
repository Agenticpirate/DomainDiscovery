/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN,
    '127.0.0.1',
  ].filter(Boolean),
  // Production: enable type checking and linting
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Performance: compress responses
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HSTS only meaningful over HTTPS in production; browsers ignore on localhost
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Brand icons / favicons — long cache; SERP refetch uses ?v= cache-bust in HTML
        source: '/:file(favicon.ico|favicon.svg|favicon-48.png|favicon-96.png|icon-16.png|icon-32.png|icon-48.png|icon-96.png|icon-192.png|icon-512.png|icon.png|apple-touch-icon.png|app-icon.png|logo-solid.png|logo.png|site.webmanifest)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Crawlable LLM indexes + AI discovery
        source: '/:file(llms.txt|llms-full.txt|robots.txt|sitemap.xml|ai.txt|humans.txt)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        // Markdown tool mirrors for AI crawlers
        source: '/:file(search.md|generator.md|ai-generator.md|geo.md|whois.md|bulk-search.md|pricing.md|extensions.md|keyword.md|about.md)',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
