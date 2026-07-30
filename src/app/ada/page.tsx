import type { Metadata } from 'next';
import { AdaLanding } from '@/components/ada/AdaLanding';
import {ADA_BRAND, adaPath} from '@/lib/adaConfig';

export const metadata: Metadata = {
  title: {
    absolute: `${ADA_BRAND.name} — Ranked domains under budget`,
  },
  description: ADA_BRAND.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: ADA_BRAND.name,
    description: ADA_BRAND.tagline,
    url: '/',
    images: [{ url: '/ada/logo-512.png?v=4', width: 512, height: 512, alt: ADA_BRAND.name }],
  },
};

export default function AdaHomePage() {
  return <AdaLanding />;
}
