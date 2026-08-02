'use client';

import { PageTransition } from '@/components/ui/motion/PageTransition';

/**
 * Next.js re-mounts template on every navigation — ideal place for enter motion.
 * Layout stays stable (providers); only the page shell animates in.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
