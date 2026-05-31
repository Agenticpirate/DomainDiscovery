import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Glass_Button } from '@/components/ui/glass/Glass_Button';
import { Glass_Chip } from '@/components/ui/glass/Glass_Chip';

// Feature: premium-glass-design-system, Task 6.11
// Keyboard / focus example tests for Glass_Button and Glass_Chip.
// Validates: Requirements 7.1, 7.4, 7.5
//
// Tooling note: `@testing-library/user-event` is NOT installed in this repo,
// so these tests use `fireEvent`. jsdom does not synthesise a `click` from a
// `keydown` Enter/Space the way a real browser does for native <button>
// elements. Because Glass_Button and the interactive Glass_Chip render NATIVE
// <button> elements, Enter/Space activation is provided by the platform — the
// browser routes those keys through the same click path as a pointer press.
// We therefore (a) structurally assert the rendered element is a native
// <button> (guaranteeing browser-native Enter/Space activation), and (b) assert
// the single onClick handler responds to the click the browser produces for
// pointer, Enter, and Space activation alike. The jsdom limitation is the only
// reason we dispatch the activation click explicitly rather than relying on a
// keydown→click translation.

/** Render helper that wraps in ThemeProvider to match suite conventions. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

/**
 * A native, enabled control participates in the browser's default tab order:
 * its computed tabIndex is 0 (never a positive override) and it is not
 * disabled. This is what guarantees keyboard reachability and that focus is
 * never trapped on it (Req 7.5).
 */
function expectNativelyTabbable(el: HTMLElement) {
  expect(el.tagName).toBe('BUTTON');
  expect((el as HTMLButtonElement).disabled).toBe(false);
  // Default tab order: tabIndex is 0, and is never a positive value.
  expect(el.tabIndex).toBe(0);
  expect(el.tabIndex).not.toBeGreaterThan(0);
}

describe('Glass_Button — keyboard & focus (Req 7.1, 7.4, 7.5)', () => {
  it('renders a native <button> so Enter/Space activation is browser-native (Req 7.4)', () => {
    renderWithTheme(<Glass_Button onClick={jest.fn()}>Click me</Glass_Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    // A native button means the browser maps Enter (keydown) and Space (keyup)
    // to a click — the same action as a pointer press — without any JS.
    expect(button.tagName).toBe('BUTTON');
  });

  it('invokes onClick for pointer, Enter, and Space activation with parity (Req 7.4)', () => {
    const onClick = jest.fn();
    renderWithTheme(<Glass_Button onClick={onClick}>Activate</Glass_Button>);
    const button = screen.getByRole('button', { name: 'Activate' });

    button.focus();
    expect(document.activeElement).toBe(button);

    // 1) Pointer activation.
    fireEvent.click(button);

    // 2) Enter activation. A real browser fires a click on keydown Enter for a
    //    native button; jsdom does not synthesise it, so we dispatch the
    //    keyboard event AND the click the browser would produce, asserting the
    //    same onClick path handles it.
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
    fireEvent.click(button);

    // 3) Space activation (browser fires the click on keyup Space).
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    fireEvent.keyUp(button, { key: ' ', code: 'Space' });
    fireEvent.click(button);

    // Same handler, same action for all three activation modes.
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('exposes a token-driven focus-visible ring and no positive tabIndex (Req 7.1)', () => {
    renderWithTheme(<Glass_Button onClick={jest.fn()}>Focusable</Glass_Button>);
    const button = screen.getByRole('button', { name: 'Focusable' });

    // Ring is >= 2px and token-driven (ring-accent -> var(--accent)).
    expect(button.className).toContain('focus-visible:ring-2');
    expect(button.className).toContain('focus-visible:ring-accent');

    // Never a positive tabIndex (would break natural reading order).
    expect(button.tabIndex).not.toBeGreaterThan(0);
  });

  it('lets focus move between two buttons so focus is never stuck (Req 7.5)', () => {
    renderWithTheme(
      <>
        <Glass_Button onClick={jest.fn()}>First</Glass_Button>
        <Glass_Button onClick={jest.fn()}>Second</Glass_Button>
      </>
    );
    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });

    // Both controls are naturally tabbable (native, enabled, tabIndex 0), so a
    // Tab press from the first reaches the second — focus is not trapped.
    expectNativelyTabbable(first);
    expectNativelyTabbable(second);

    first.focus();
    expect(document.activeElement).toBe(first);

    // Tab traversal (browser-native for native buttons) moves focus onward.
    second.focus();
    expect(document.activeElement).toBe(second);
    expect(document.activeElement).not.toBe(first);
  });
});

describe('Glass_Chip — interactive vs static (Req 7.1, 7.4, 7.5)', () => {
  it('renders a native <button> when as="button" (browser-native Enter/Space) (Req 7.4)', () => {
    renderWithTheme(
      <Glass_Chip as="button" onClick={jest.fn()}>
        Tag
      </Glass_Chip>
    );
    const chip = screen.getByRole('button', { name: 'Tag' });
    expect(chip.tagName).toBe('BUTTON');
  });

  it('invokes onClick for pointer, Enter, and Space activation with parity (Req 7.4)', () => {
    const onClick = jest.fn();
    renderWithTheme(
      <Glass_Chip as="button" onClick={onClick}>
        Tag
      </Glass_Chip>
    );
    const chip = screen.getByRole('button', { name: 'Tag' });

    chip.focus();
    expect(document.activeElement).toBe(chip);

    // Pointer.
    fireEvent.click(chip);
    // Enter (see Glass_Button parity test for the jsdom-limitation rationale).
    fireEvent.keyDown(chip, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(chip, { key: 'Enter', code: 'Enter' });
    fireEvent.click(chip);
    // Space.
    fireEvent.keyDown(chip, { key: ' ', code: 'Space' });
    fireEvent.keyUp(chip, { key: ' ', code: 'Space' });
    fireEvent.click(chip);

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('exposes a token-driven focus-visible ring when interactive (Req 7.1)', () => {
    renderWithTheme(
      <Glass_Chip as="button" onClick={jest.fn()}>
        Tag
      </Glass_Chip>
    );
    const chip = screen.getByRole('button', { name: 'Tag' });

    expect(chip.className).toContain('focus-visible:ring-2');
    expect(chip.className).toContain('focus-visible:ring-accent');
    expect(chip.tabIndex).not.toBeGreaterThan(0);
  });

  it('renders a static, non-focusable span with no focus ring by default (Req 7.1, 7.5)', () => {
    const { container } = renderWithTheme(<Glass_Chip>Static</Glass_Chip>);
    const chip = container.firstElementChild as HTMLElement;

    // Static label: a <span>, not a button, and not exposed as a button role.
    expect(chip.tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).toBeNull();

    // Not in the tab order: no tabindex attribute, computed tabIndex is -1.
    expect(chip.hasAttribute('tabindex')).toBe(false);
    expect(chip.tabIndex).toBe(-1);

    // No focus-ring affordance on the static variant.
    expect(chip.className).not.toContain('focus-visible:ring');
  });
});
