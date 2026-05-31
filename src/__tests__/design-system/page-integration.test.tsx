import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { HERO_HEADLINE } from '@/components/home/heroCopy';

// Feature: premium-glass-design-system, Task 12.2
// Integration test for home-page tool-switching non-regression.
// Validates: Requirements 14.1
//
// ---------------------------------------------------------------------------
// MOCKING APPROACH (documented per task 12.2)
// ---------------------------------------------------------------------------
// `src/app/page.tsx` (default export `Home`) pulls in a large surface area:
// the Navigation bar, six heavy tool components, the footer, the page
// background, and the marketing `HomePageContent`. To keep this a focused
// INTEGRATION test of the page's `activeTool` switching + the `/` keyboard
// shortcut (Req 14.1) we mock the heavy, non-essential children to trivial
// stubs and assert behaviour against them:
//
//   - `next/navigation` → `useRouter` returns `{ push: mockPush }` so we can
//     assert the `/` shortcut navigates to `/search`. `mockPush` is referenced
//     ONLY inside the lazily-invoked `useRouter` arrow (so it is initialised by
//     render time, never at factory-execution time) and is prefixed `mock*` so
//     the jest hoist transform permits the reference. It is cleared per test.
//   - `Navigation` → a stub exposing one button per tool id that calls the real
//     `onToolSelect` prop, letting us drive `activeTool` exactly as the live nav
//     would.
//   - The six tool components (DomainGenerator, BrandableDomainFinder,
//     KeywordDomainFinder, WHOISLookup, BulkDomainSearch, DomainExtensionsView),
//     plus Footer, PageBackground, and HomePageContent → lightweight `data-testid`
//     stubs (each requires React locally so the jest hoist whitelist is honoured).
//
// We deliberately DO NOT mock `Hero`: the real component renders in the
// `activeTool === 'search'` branch and we assert its presence via the shipped
// `HERO_HEADLINE` copy constant. The real Hero needs `ThemeProvider` +
// `ToastProvider` (it calls `useToast`), so the page is wrapped in both.
// ---------------------------------------------------------------------------

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  // `mockPush` is dereferenced only when `useRouter()` is called (at render
  // time), so it is safely initialised; the `mock` prefix satisfies the hoist
  // transform's out-of-scope allowlist.
  useRouter: () => ({ push: mockPush }),
}));

// Navigation stub: buttons that invoke the real `onToolSelect` prop, mirroring
// how the production nav drives `activeTool` in page.tsx.
jest.mock('@/components/layout/Navigation', () => ({
  Navigation: ({ onToolSelect }: { onToolSelect: (tool: string) => void }) => {
    const React = require('react');
    return React.createElement(
      'nav',
      { 'data-testid': 'mock-nav' },
      React.createElement(
        'button',
        { 'data-testid': 'nav-search', onClick: () => onToolSelect('search') },
        'search'
      ),
      React.createElement(
        'button',
        { 'data-testid': 'nav-generator', onClick: () => onToolSelect('generator') },
        'generator'
      )
    );
  },
}));

// Heavy tool components → trivial stubs identified by data-testid.
jest.mock('@/components/generator/DomainGenerator', () => ({
  DomainGenerator: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'tool-generator' });
  },
}));
jest.mock('@/components/domain/BrandableDomainFinder', () => ({
  BrandableDomainFinder: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'tool-brandable' });
  },
}));
jest.mock('@/components/domain/KeywordDomainFinder', () => ({
  KeywordDomainFinder: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'tool-keyword' });
  },
}));
jest.mock('@/components/domain/WHOISLookup', () => ({
  WHOISLookup: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'tool-whois' });
  },
}));
jest.mock('@/components/domain/BulkDomainSearch', () => ({
  BulkDomainSearch: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'tool-bulk' });
  },
}));
jest.mock('@/components/domain/DomainExtensionsView', () => ({
  DomainExtensionsView: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'tool-extensions' });
  },
}));

// Non-essential layout/content children → trivial stubs.
jest.mock('@/components/layout/Footer', () => ({
  Footer: () => {
    const React = require('react');
    return React.createElement('footer', { 'data-testid': 'mock-footer' });
  },
}));
jest.mock('@/components/ui/PageBackground', () => ({
  PageBackground: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mock-page-background' });
  },
}));
jest.mock('@/components/home/HomePageContent', () => ({
  HomePageContent: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mock-home-content' });
  },
}));

// Imported AFTER the mocks above are declared (jest hoists the mock factories,
// so page.tsx resolves to the stubbed dependencies).
import Home from '@/app/page';

function renderHome() {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <Home />
      </ToastProvider>
    </ThemeProvider>
  );
}

describe('Home page integration — tool switching non-regression (Req 14.1)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the real Hero in the default search branch', () => {
    renderHome();

    // The search branch is active by default (activeTool === 'search'); the real
    // Hero renders, proven by its shipped headline copy.
    expect(screen.getByText(HERO_HEADLINE)).toBeInTheDocument();
    // The search branch also renders the marketing content section.
    expect(screen.getByTestId('mock-home-content')).toBeInTheDocument();
    // No tool section is shown while searching.
    expect(screen.queryByTestId('tool-generator')).not.toBeInTheDocument();
  });

  it('swaps tool sections when activeTool changes and restores the Hero', () => {
    renderHome();

    // Baseline: Hero shown, generator tool hidden.
    expect(screen.getByText(HERO_HEADLINE)).toBeInTheDocument();
    expect(screen.queryByTestId('tool-generator')).not.toBeInTheDocument();

    // Switch to the generator tool via the (stubbed) navigation.
    fireEvent.click(screen.getByTestId('nav-generator'));

    // The generator section now renders and the Hero is no longer shown.
    expect(screen.getByTestId('tool-generator')).toBeInTheDocument();
    expect(screen.queryByText(HERO_HEADLINE)).not.toBeInTheDocument();

    // Switching back to search restores the Hero and removes the tool section.
    fireEvent.click(screen.getByTestId('nav-search'));

    expect(screen.getByText(HERO_HEADLINE)).toBeInTheDocument();
    expect(screen.queryByTestId('tool-generator')).not.toBeInTheDocument();
  });

  it("preserves the '/' keyboard shortcut to the search page", () => {
    renderHome();

    // A non-input element as the event target so the page handler does not skip
    // it (the handler ignores INPUT/TEXTAREA targets).
    const target = document.createElement('div');
    document.body.appendChild(target);

    // The page registers a window-level keydown listener; the event bubbles
    // from the target up to window.
    fireEvent.keyDown(target, { key: '/' });

    expect(mockPush).toHaveBeenCalledWith('/search');

    document.body.removeChild(target);
  });
});
