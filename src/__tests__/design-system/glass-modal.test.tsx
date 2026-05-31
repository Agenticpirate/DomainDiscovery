import React, { useRef, useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  within,
} from '@testing-library/react';

import { Glass_Modal } from '@/components/ui/glass/Glass_Modal';
import { getFocusableElements } from '@/components/ui/glass/hooks/useFocusTrap';

// Feature: premium-glass-design-system, Task 6.10
// Example tests for Glass_Modal focus management, keyboard behavior, and
// accessibility semantics.
//
// Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
//
// Tooling note: this repo ships Jest 30 (jsdom) + @testing-library/react but
// does NOT include @testing-library/user-event, so keyboard/pointer events are
// driven with `fireEvent`. Glass_Modal does not consume ThemeContext (it styles
// purely from CSS custom properties), so no ThemeProvider wrapper is required.
//
// Each test exercises a realistic closed -> open transition via a trigger
// button so that the modal's internal `mounted` / focus-capture effects run the
// way they do in production (open from the very first render is not a real
// usage and would bypass the previous-focus capture).

/**
 * Compute the accessible name of a dialog node the way assistive tech would:
 * `aria-labelledby` (dereferenced) wins over `aria-label`.
 */
function getAccessibleName(el: HTMLElement): string {
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim();
  }
  return (el.getAttribute('aria-label') ?? '').trim();
}

/**
 * Generic harness: a trigger button that opens the modal, plus the modal
 * itself. `onCloseSpy` is invoked in addition to flipping the open state so
 * tests can assert the `onClose` contract while keeping realistic close
 * behavior.
 */
function ModalHarness({
  onCloseSpy,
  closeOnEscape,
  title,
  ariaLabel,
  children,
}: {
  onCloseSpy?: () => void;
  closeOnEscape?: boolean;
  title?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Glass_Modal
        open={open}
        onClose={() => {
          onCloseSpy?.();
          setOpen(false);
        }}
        closeOnEscape={closeOnEscape}
        title={title}
        ariaLabel={ariaLabel}
      >
        {children}
      </Glass_Modal>
    </>
  );
}

/** Open the modal via its trigger and return the live dialog node. */
async function openModal(): Promise<HTMLElement> {
  const trigger = screen.getByRole('button', { name: 'Open modal' });
  act(() => {
    trigger.focus();
  });
  fireEvent.click(trigger);
  return await screen.findByRole('dialog');
}

describe('Glass_Modal — initial focus on open (Req 8.1)', () => {
  it('moves focus to the first focusable element inside the modal', async () => {
    render(
      <ModalHarness ariaLabel="Settings">
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    const dialog = await openModal();
    const firstFocusable = getFocusableElements(dialog)[0];

    expect(firstFocusable).toBeDefined();
    await waitFor(() => expect(firstFocusable).toHaveFocus());
    // The dialog always renders a close control, so the first focusable is it.
    expect(firstFocusable).toBe(
      within(dialog).getByRole('button', { name: 'Close dialog' })
    );
  });

  it('renders the dialog container as a focusable fallback (tabIndex=-1)', async () => {
    // The close button is always present, so the "no focusable child" branch is
    // not reachable through the public API; the structural guarantee for that
    // fallback is that the container itself can receive focus.
    render(
      <ModalHarness ariaLabel="Empty">
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    const dialog = await openModal();
    expect(dialog).toHaveAttribute('tabindex', '-1');
  });

  it('honors initialFocusRef, focusing the referenced element on open', async () => {
    function InitialFocusHarness() {
      const inputRef = useRef<HTMLInputElement>(null);
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open modal
          </button>
          <Glass_Modal
            open={open}
            onClose={() => setOpen(false)}
            ariaLabel="Form"
            initialFocusRef={inputRef}
          >
            <button type="button">Decoy first</button>
            <input ref={inputRef} aria-label="target input" />
          </Glass_Modal>
        </>
      );
    }

    render(<InitialFocusHarness />);
    await openModal();

    const target = screen.getByLabelText('target input');
    await waitFor(() => expect(target).toHaveFocus());
  });
});

describe('Glass_Modal — focus trap wrapping (Req 8.2)', () => {
  it('wraps focus from the last element to the first on Tab', async () => {
    render(
      <ModalHarness ariaLabel="Trap">
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </ModalHarness>
    );

    const dialog = await openModal();
    const closeButton = within(dialog).getByRole('button', {
      name: 'Close dialog',
    });
    const last = within(dialog).getByRole('button', { name: 'Second action' });

    act(() => {
      last.focus();
    });
    expect(last).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });

    // First focusable in DOM order is the close button.
    await waitFor(() => expect(closeButton).toHaveFocus());
  });

  it('wraps focus from the first element to the last on Shift+Tab', async () => {
    render(
      <ModalHarness ariaLabel="Trap">
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </ModalHarness>
    );

    const dialog = await openModal();
    const closeButton = within(dialog).getByRole('button', {
      name: 'Close dialog',
    });
    const last = within(dialog).getByRole('button', { name: 'Second action' });

    act(() => {
      closeButton.focus();
    });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    await waitFor(() => expect(last).toHaveFocus());
  });
});

describe('Glass_Modal — Escape to close (Req 8.3)', () => {
  it('closes and calls onClose when Escape is pressed (closeOnEscape default)', async () => {
    const onCloseSpy = jest.fn();
    render(
      <ModalHarness onCloseSpy={onCloseSpy} ariaLabel="Closable">
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    await openModal();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('does NOT close on Escape when closeOnEscape is false', async () => {
    const onCloseSpy = jest.fn();
    render(
      <ModalHarness
        onCloseSpy={onCloseSpy}
        closeOnEscape={false}
        ariaLabel="Sticky"
      >
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    await openModal();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('Glass_Modal — return focus on close (Req 8.4)', () => {
  it('returns focus to the opener that was focused before opening', async () => {
    render(
      <ModalHarness ariaLabel="Returns">
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    const trigger = screen.getByRole('button', { name: 'Open modal' });
    act(() => {
      trigger.focus();
    });
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    await screen.findByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('falls back to document.body when the opener is gone, without throwing', async () => {
    function FallbackHarness() {
      const [open, setOpen] = useState(false);
      const [showTrigger, setShowTrigger] = useState(true);
      return (
        <>
          {showTrigger && (
            <button type="button" onClick={() => setOpen(true)}>
              Open modal
            </button>
          )}
          <Glass_Modal
            open={open}
            onClose={() => setOpen(false)}
            ariaLabel="Fallback"
          >
            <button type="button" onClick={() => setShowTrigger(false)}>
              Remove opener
            </button>
          </Glass_Modal>
        </>
      );
    }

    render(<FallbackHarness />);

    const trigger = screen.getByRole('button', { name: 'Open modal' });
    act(() => {
      trigger.focus();
    });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');

    // Remove the opener from the DOM while the modal is open: the captured
    // previous-focus node is now disconnected and therefore not restorable.
    const removeOpener = within(dialog).getByRole('button', {
      name: 'Remove opener',
    });
    expect(() => fireEvent.click(removeOpener)).not.toThrow();
    expect(
      screen.queryByRole('button', { name: 'Open modal' })
    ).not.toBeInTheDocument();

    expect(() =>
      fireEvent.keyDown(document, { key: 'Escape' })
    ).not.toThrow();

    await waitFor(() => expect(document.body).toHaveFocus());
  });
});

describe('Glass_Modal — dialog semantics and accessible name (Req 8.5)', () => {
  it('exposes role="dialog" + aria-modal and labels via the title heading', async () => {
    render(
      <ModalHarness title="Account settings">
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    const dialog = await openModal();
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // With a title, the name comes from aria-labelledby, not aria-label.
    expect(dialog).not.toHaveAttribute('aria-label');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(getAccessibleName(dialog)).toBe('Account settings');
  });

  it('uses aria-label for the accessible name when only ariaLabel is given', async () => {
    render(
      <ModalHarness ariaLabel="Cookie preferences">
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    const dialog = await openModal();
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Cookie preferences');
    expect(getAccessibleName(dialog)).toBe('Cookie preferences');
  });

  it('falls back to a non-empty "Dialog" name when neither title nor ariaLabel is given', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ModalHarness>
        <button type="button">Inside action</button>
      </ModalHarness>
    );

    const dialog = await openModal();
    expect(dialog).toHaveAttribute('aria-label', 'Dialog');
    expect(getAccessibleName(dialog).length).toBeGreaterThan(0);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});

describe('Glass_Modal — hides outside content from AT (Req 8.6)', () => {
  it('marks sibling top-level nodes aria-hidden while open and restores on close', async () => {
    const outside = document.createElement('div');
    outside.setAttribute('data-testid', 'outside-content');
    outside.textContent = 'Outside content';
    document.body.appendChild(outside);

    try {
      const onCloseSpy = jest.fn();
      render(
        <ModalHarness onCloseSpy={onCloseSpy} ariaLabel="Modal">
          <button type="button">Inside action</button>
        </ModalHarness>
      );

      // Before opening, the outside node has no aria-hidden override.
      expect(outside).not.toHaveAttribute('aria-hidden');

      await openModal();

      // While open, outside content is hidden from assistive technology.
      await waitFor(() =>
        expect(outside).toHaveAttribute('aria-hidden', 'true')
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      // After close, the prior (absent) state is restored.
      await waitFor(() =>
        expect(outside).not.toHaveAttribute('aria-hidden')
      );
    } finally {
      outside.remove();
    }
  });
});
