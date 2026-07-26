import type { Metadata } from 'next';
import { AdaShell } from '@/components/ada/AdaShell';
import { ADA_BRAND } from '@/lib/adaConfig';

export const metadata: Metadata = {
  title: {
    // absolute base so root "| DomainDiscovery" does not stack; template for child pages
    absolute: `${ADA_BRAND.name} — Ranked domains under budget`,
    template: `%s | ${ADA_BRAND.name}`,
  },
  description:
    'AI Domain Assistant — domain research built for AI agents and operators. Budget-aware brand shortlists, MCP tools, Agent Card discovery. aidomainassistant.com',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_ADA_URL ||
      (process.env.NODE_ENV === 'production'
        ? `https://${ADA_BRAND.wwwHost}`
        : 'http://localhost:5001/ada')
  ),
  icons: {
    icon: [
      { url: '/ada/icon-32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/ada/icon-16.png?v=3', sizes: '16x16', type: 'image/png' },
      { url: '/ada/logo-192.png?v=3', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/ada/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' }],
    shortcut: '/ada/icon-32.png?v=3',
  },
  openGraph: {
    title: ADA_BRAND.name,
    description: ADA_BRAND.tagline,
    siteName: ADA_BRAND.name,
    images: [{ url: '/ada/logo-512.png?v=3', width: 512, height: 512, alt: ADA_BRAND.name }],
  },
};

export default function AdaLayout({ children }: { children: React.ReactNode }) {
  return <AdaShell>{children}</AdaShell>;
}
