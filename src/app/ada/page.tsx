import type { Metadata } from 'next';
import { AdaLanding } from '@/components/ada/AdaLanding';
import { ADA_BRAND } from '@/lib/adaConfig';

export const metadata: Metadata = {
  title: {
    absolute: `${ADA_BRAND.name} — Ranked domains under budget`,
  },
  description: ADA_BRAND.description,
  openGraph: {
    title: ADA_BRAND.name,
    description: ADA_BRAND.tagline,
  },
};

export default function AdaHomePage() {
  return <AdaLanding />;
}
