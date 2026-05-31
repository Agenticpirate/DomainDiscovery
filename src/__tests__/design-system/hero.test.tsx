import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';

// Feature: premium-glass-design-system, Task 11.2
// Hero, Stat_Strip, and Beginner_Entry example/interaction tests.
// Validates: Requirements 9.4, 10.1, 10.3, 10.4, 10.5, 11.1, 12.1, 12.2, 12.3,
//            12.4, 12.5, 13.1, 13.2, 13.5 (and the shipped copy of 10.2).
//
// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
// next/navigation: `useRouter` is read inside Hero render, so the factory reads
// `mockPush` lazily — it is assigned a fresh jest.fn() in beforeEach. The
// variable is `mock`-prefixed so jest's module-factory hoisting allows the
// reference.
let mockPush: jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// heroCopy: spread the REAL module (keeps HERO_HEADLINE / HERO_SUBHEAD /
// BEGINNER_ENTRY_DESTINATION authentic) but make `isReachable` overridable so a
// single test can exercise the unreachable Beginner_Entry guard (Req 12.4)
// without affecting the others. `null` (the default) defers to the real gate.
let mockReachableOverride: boolean | null = null;

jest.mock('@/components/home/heroCopy', () => {
  const actual = jest.requireActual('@/components/home/heroCopy');
  return {
    __esModule: true,
    ...actual,
    isReachable: (dest: string) =>
      mockReachableOverride === null ? actual.isReachable(dest) : mockReachableOverride,
  };
});

import { Hero } from '@/components/home/Hero';
import {
  HERO_HEADLINE,
  HERO_SUBHEAD,
  BEGINNER_ENTRY_DESTINATION,
} from '@/components/home/heroCopy';

/** The error-toast copy the Beginner_Entry guard surfaces on an unreachable dest. */
const UNREACHABLE_TOAST = 'That path is unavailable right now. Please try again.';

/** Render the Hero inside the real Theme + Toast providers it depends on. */
function renderHero(props?: Partial<React.ComponentProps<typeof Hero>>) {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <Hero onSearch={jest.fn()} onClear={jest.fn()} {...props} />
      </ToastProvider>
    </ThemeProvider>
  );
}

/** Collect the inline `style` attribute strings across a rendered subtree. */
function collectStyleAttrs(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .map((el) => el.getAttribute('style') ?? '')
    .filter(Boolean);
}

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  mockPush = jest.fn();
  mockReachableOverride = null;
});

afterEach(() => {
  // Restore matchMedia in case a test overrode it for the reduced-motion path.
  window.matchMedia = originalMatchMedia;
});

describe('Hero', () => {
  it('renders the shipped headline and subhead copy (Req 10.2)', () => {
    renderHero();

    expect(screen.getByText(HERO_HEADLINE)).toBeInTheDocument();
    expect(screen.getByText(HERO_SUBHEAD)).toBeInTheDocument();
  });

  it('exposes exactly one gold Primary_CTA (Req 10.3)', () => {
    renderHero();

    const goldButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.className.includes('btn-accent'));

    expect(goldButtons).toHaveLength(1);
    // The single gold control is the Primary_CTA.
    expect(goldButtons[0]).toHaveAccessibleName(/start your search/i);
  });

  it('focuses the search input when the Primary_CTA is activated (Req 10.5)', () => {
    renderHero();

    const input = screen.getByRole('textbox');
    const primaryCta = screen.getByRole('button', { name: /start your search/i });

    // Clear any autoFocus the SearchInterface applied on mount so the assertion
    // genuinely reflects the CTA-driven focus, not the initial mount state.
    act(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    expect(document.activeElement).not.toBe(input);

    fireEvent.click(primaryCta);

    // The CTA's onClick routes through the forwarded handle's focusInput().
    expect(document.activeElement).toBe(input);
  });

  it('renders the four Stat_Strip values each once with a non-empty label (Req 11.1)', () => {
    renderHero();

    const expected: Array<{ value: string; label: string }> = [
      { value: '20M+', label: 'Domains searched' },
      { value: '50K+', label: 'Founders served' },
      { value: '1,600+', label: 'Live extensions' },
      { value: '99.9%', label: 'Uptime' },
    ];

    for (const { value, label } of expected) {
      // Each value appears exactly once.
      expect(screen.getAllByText(value)).toHaveLength(1);

      const labelEl = screen.getByText(label);
      expect(labelEl).toBeInTheDocument();
      expect(labelEl.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('renders an ambient-motion layer using the token-driven animate class by default (Req 9.4, 10.4)', () => {
    const { container } = renderHero();

    const ambient = container.querySelector('.animate-ambient');
    expect(ambient).not.toBeNull();
    // The ambient layer is token-driven: its filter references a blur token.
    expect(ambient?.getAttribute('style') ?? '').toContain('var(--blur-');
  });

  it('drops the ambient animation class when reduced motion is preferred (Req 9.4)', () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { container } = renderHero();

    // useReducedMotion syncs the preference in a mount effect (flushed by
    // render's act), so the animate-ambient class is dropped without a reload.
    expect(container.querySelector('.animate-ambient')).toBeNull();
  });

  it('composes depth from multiple elevation tokens plus a blur token (Req 10.1)', () => {
    const { container } = renderHero();

    const styles = collectStyleAttrs(container);
    const joined = styles.join('\n');

    // ≥2 distinct --elev-* references in the subtree (inline styles).
    const elevTokens = new Set(
      (joined.match(/var\(--elev-[a-z0-9]+\)/g) ?? []).map((s) => s)
    );
    expect(elevTokens.size).toBeGreaterThanOrEqual(2);

    // The gold CTA flourish (--elev-gold) and the stat tiles (--elev-1) layer
    // depth; the search panel adds further depth via the .glass-premium class.
    expect(joined).toContain('var(--elev-gold)');
    expect(joined).toContain('var(--elev-1)');

    // The premium glass search panel is present as the focal lifted surface.
    expect(container.querySelector('.glass-premium')).not.toBeNull();

    // ≥1 --blur-* reference (the ambient layer's filter blur).
    expect(joined).toMatch(/var\(--blur-[a-z]+\)/);
  });
});

describe('Hero Beginner_Entry', () => {
  it('renders the prompt + Domain Finder label as a non-gold control (Req 12.1, 12.2)', () => {
    renderHero();

    expect(screen.getByText('Not sure where to start?')).toBeInTheDocument();
    expect(screen.getByText('Domain Finder')).toBeInTheDocument();

    const entry = screen.getByRole('button', { name: /domain finder/i });
    // The Beginner_Entry is secondary glass — never the gold button.
    expect(entry.className).not.toContain('btn-accent');
  });

  it('navigates to the reachable destination when activated (Req 12.2, 12.3)', () => {
    renderHero();

    const entry = screen.getByRole('button', { name: /domain finder/i });
    fireEvent.click(entry);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(BEGINNER_ENTRY_DESTINATION);
    expect(BEGINNER_ENTRY_DESTINATION).toBe('/generator');
  });

  it('shows an error toast and does not navigate when the destination is unreachable (Req 12.4)', async () => {
    // Approach: override the reachability gate (the simplest reliable path) so
    // the guard takes the unreachable branch, then assert the real ToastProvider
    // surfaces the error message in the DOM and no navigation occurs.
    mockReachableOverride = false;

    renderHero();

    const entry = screen.getByRole('button', { name: /domain finder/i });
    fireEvent.click(entry);

    // The error toast message rendered by ToastProvider appears in the DOM.
    expect(await screen.findByText(UNREACHABLE_TOAST)).toBeInTheDocument();
    // Hero state is preserved without navigating.
    expect(mockPush).not.toHaveBeenCalled();
  });
});
