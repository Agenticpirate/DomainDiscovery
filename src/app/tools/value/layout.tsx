import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domain Value Estimator — Quick Domain Appraisal',
  description:
    'Estimate domain value with market-style signals. Free domain appraisal helper for brandable and keyword names.',
};

export default function ValueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
