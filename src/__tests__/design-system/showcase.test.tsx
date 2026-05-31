import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { DesignSystemShowcase } from '@/app/design-system/Showcase.client';
import {
  colorTokens,
  typographyTokens,
  spacingTokens,
  elevationTokens,
  motionTokens,
} from '@/design-system/tokens';

// Feature: premium-glass-design-system, Task 13.2
// Showcase content example tests.
// Validates: Requirements 5.1, 5.4, 5.5, 5.6 (and 1.6 for the per-category
// labeled token samples).
//
// The component is `'use client'`, so we render <DesignSystemShowcase /> directly
// instead of the server `page.tsx` (which owns the `metadata` export). The
// showcase reads ThemeContext via `useTheme`, so every render is wrapped in
// <ThemeProvider>.

/**
 * Install a `window.matchMedia` mock (jsdom lacks one). `jest.setup.ts` already
 * defines a default mock, but it always reports `matches: false`; we override it
 * per test so the reduced-motion test can force `(prefers-reduced-motion: reduce)`
 * to match. The setup defines the property as `writable: true` (but not
 * `configurable`), so we reassign the value directly instead of redefining the
 * property descriptor.
 */
function mockMatchMedia(matches: boolean): void {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;
}

function renderShowcase() {
  return render(
    <ThemeProvider>
      <DesignSystemShowcase />
    </ThemeProvider>
  );
}

describe('DesignSystemShowcase', () => {
  beforeEach(() => {
    // Tests 1-3 run with reduced motion OFF; test 4 overrides to ON.
    mockMatchMedia(false);
  });

  // ── Test 1 — all six glass components render (Req 5.1) ──────────────────
  it('renders all six glass components live, including an openable Glass_Modal', () => {
    renderShowcase();

    // Glass_Nav — the live nav renders its title.
    expect(screen.getByText('Glass Design System')).toBeInTheDocument();

    // Glass_Card — the labeled card sample.
    expect(screen.getByText('Glass_Card')).toBeInTheDocument();

    // Glass_Button — both a primary and a secondary button are rendered.
    expect(screen.getByRole('heading', { name: 'Buttons' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();

    // Glass_Chip — a static chip plus an interactive (button) chip.
    expect(screen.getByRole('heading', { name: 'Chips' })).toBeInTheDocument();
    expect(screen.getByText('Static chip')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Interactive chip example' })
    ).toBeInTheDocument();

    // Glass_Stat — a stat tile value and its label.
    expect(screen.getByText('20M+')).toBeInTheDocument();
    expect(screen.getByText('Domains scanned')).toBeInTheDocument();

    // Glass_Modal — the trigger exists and the dialog appears only after opening.
    const openModal = screen.getByRole('button', { name: 'Open modal' });
    expect(openModal).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(openModal);

    // Glass_Modal renders into a portal on open with role="dialog".
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // ── Test 2 — one labeled sample per token category (Req 5.1, 1.6) ───────
  it('renders one labeled sample per token category, sourced from the manifest', () => {
    renderShowcase();

    // Each token-category section heading is present.
    expect(screen.getByRole('heading', { name: 'Color tokens' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Typography scale' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Spacing scale' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Elevation tiers' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Motion primitives' })
    ).toBeInTheDocument();

    // At least one token NAME from each manifest category is rendered as a
    // labeled sample (the name appears in a <code>/label element as text).
    expect(screen.getByText(colorTokens[0].name)).toBeInTheDocument();
    expect(screen.getByText(typographyTokens[0].name)).toBeInTheDocument();
    expect(screen.getByText(spacingTokens[0].name)).toBeInTheDocument();
    expect(screen.getByText(elevationTokens[0].name)).toBeInTheDocument();
    expect(screen.getByText(motionTokens[0].name)).toBeInTheDocument();

    // Spot-check a couple of specific named tokens to confirm the samples are
    // the real manifest tokens, not placeholders.
    expect(screen.getByText('--text-size-hero')).toBeInTheDocument();
    expect(screen.getByText('--motion-duration-fast')).toBeInTheDocument();
  });

  // ── Test 3 — a Replay trigger per Motion_Primitive (Req 5.4, 5.5) ───────
  it('renders exactly one user-triggerable Replay control per motion primitive', () => {
    renderShowcase();

    // Each MotionExample exposes a button whose accessible name is
    // `Replay <token> animation`, so every replay control matches /Replay/.
    const replayButtons = screen.getAllByRole('button', { name: /Replay/i });
    expect(replayButtons).toHaveLength(motionTokens.length);

    // Triggering one remounts the animated node (key bump) and must not throw.
    expect(() => fireEvent.click(replayButtons[0])).not.toThrow();
  });

  // ── Test 4 — reduced-motion final resting state (Req 5.6) ───────────────
  it('renders every motion example in its final resting state under reduced motion', () => {
    // Force `(prefers-reduced-motion: reduce)` to match BEFORE render so
    // `useReducedMotion()` resolves to true and each MotionExample applies the
    // resting style (no `animation` shorthand, full opacity).
    mockMatchMedia(true);

    renderShowcase();

    // Each motion example is a Glass_Card carrying `data-motion-example`; the
    // animated box is the single `aria-hidden` descendant inside it.
    const examples = Array.from(
      document.querySelectorAll<HTMLElement>('[data-motion-example]')
    );
    expect(examples).toHaveLength(motionTokens.length);

    // Assertion approach: under reduced motion the animated node receives the
    // resting style only — there is NO `animation` shorthand applied — and it
    // sits at its final-state opacity (1). We read the inline style of the
    // animated node directly: with no animation set, `style.animation` is the
    // empty string in jsdom; the resting state pins opacity to '1'.
    for (const example of examples) {
      const animated = example.querySelector<HTMLElement>('[aria-hidden="true"]');
      expect(animated).not.toBeNull();
      expect(animated!.style.animation).toBe('');
      expect(animated!.style.opacity).toBe('1');
    }

    // Sanity: the showcase acknowledges the active reduced-motion state.
    const main = examples[0];
    expect(main).toBeInTheDocument();
    // The first motion example still labels its token name (rendering intact).
    expect(within(main).getByText(motionTokens[0].name)).toBeInTheDocument();
  });
});
