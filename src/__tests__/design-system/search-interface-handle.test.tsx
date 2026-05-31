import React, { createRef } from 'react';
import { render, act, screen } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import {
  SearchInterface,
  type SearchInterfaceHandle,
} from '@/components/domain/SearchInterface';

// Feature: premium-glass-design-system, Task 9.2
// Unit test for the SearchInterface `focusInput` imperative handle.
// Validates: Requirements 10.5

describe('SearchInterface focusInput handle', () => {
  it('exposes a focusInput function via the forwarded ref', () => {
    const ref = createRef<SearchInterfaceHandle>();

    render(
      <ThemeProvider>
        <SearchInterface
          ref={ref}
          onSearch={jest.fn()}
          onClear={jest.fn()}
          showRecentSearches={false}
        />
      </ThemeProvider>
    );

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current!.focusInput).toBe('function');
  });

  it('focuses the search input when focusInput() is called', () => {
    const ref = createRef<SearchInterfaceHandle>();

    render(
      <ThemeProvider>
        <SearchInterface
          ref={ref}
          onSearch={jest.fn()}
          onClear={jest.fn()}
          showRecentSearches={false}
        />
      </ThemeProvider>
    );

    const input = screen.getByRole('textbox');

    // The input should not be focused before invoking the handle.
    expect(document.activeElement).not.toBe(input);

    act(() => {
      ref.current!.focusInput();
    });

    expect(document.activeElement).toBe(input);
  });
});
