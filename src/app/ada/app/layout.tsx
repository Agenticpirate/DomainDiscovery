import type { Metadata } from 'next';
import { ADA_BRAND } from '@/lib/adaConfig';

export const metadata: Metadata = {
  title: 'Structured app',
  description: `${ADA_BRAND.name} structured shortlist app: describe your brand, set a hard budget, get ranked available domains. Research only — you confirm registration.`,
  alternates: { canonical: '/app' },
  openGraph: {
    title: `Structured app | ${ADA_BRAND.name}`,
    description: 'Budget-aware domain shortlists for founders and operators.',
    url: '/app',
  },
};

export default function AdaAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
