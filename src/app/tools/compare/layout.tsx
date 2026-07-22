import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domain Price Comparison — Registrar Pricing by TLD',
  description:
    'Compare regular domain registration prices across registrars by TLD. Research .com and other extensions before you buy.',
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
