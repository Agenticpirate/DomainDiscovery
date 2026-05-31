/**
 * Design System Showcase route (`/design-system`).
 *
 * This is the human-readable companion to the machine-readable token manifest
 * (`src/design-system/tokens.ts`): it renders every glass component live and a
 * labeled sample for each Token_Layer category, so a reviewer can confirm the
 * visual language is consistent in both themes before any production page is
 * rebuilt (Req 5, Req 1.6).
 *
 * EXPOSURE (per the design's Open-Questions resolution): the route is
 * dev-reachable but excluded from search indexing via route-segment
 * `metadata.robots = { index: false, follow: false }`, and it is intentionally
 * NOT added to `src/app/sitemap.ts`. It is not linked from production nav.
 *
 * STRUCTURE: a `'use client'` file cannot export `metadata`, and the showcase
 * needs interactivity (modal open/close, motion "Replay", theme toggle). So
 * this stays a server component that owns the `metadata` export and renders the
 * client `<DesignSystemShowcase />`, which holds all interactive state.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Showcase page"
 * Requirements: 1.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import type { Metadata } from 'next';

import { DesignSystemShowcase } from './Showcase.client';

/**
 * Route-segment metadata. `robots: { index: false, follow: false }` keeps this
 * dev-facing page out of search engines (Req: noindex). The route is also
 * omitted from `sitemap.ts` (left untouched).
 */
export const metadata: Metadata = {
  title: 'Design System',
  description:
    'Internal showcase of the premium glass design system — every glass component and design token rendered in both themes.',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
