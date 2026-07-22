import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Domain Name Generator — Free Brandable Ideas',
  description:
    'Free AI domain name generator: turn a keyword into brandable short names with live availability checks. No account required.',
};

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
