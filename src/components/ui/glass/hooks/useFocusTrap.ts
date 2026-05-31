'use client';

/**
 * Focus-trap hook for the glass component library.
 *
 * While `active`, this hook confines Tab / Shift+Tab keyboard traversal to the
 * focusable descendants of `containerRef`, wrapping focus at the boundaries:
 * Tab on the last focusable element moves to the first, and Shift+Tab on the
 * first moves to the last (Req 8.2). The focusable set is recomputed on every
 * Tab keystroke because the dialog's DOM may change while it is open.
 *
 * Consumed by Glass_Modal (Req 8.1–8.6). The `getFocusableElements` helper is
 * exported so other focus utilities (e.g. usePreviousFocus / the modal's
 * initial-focus logic) can reuse the same focusable definition.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Hooks"
 * Requirements: 8.2
 */

import { useEffect } from 'react';

/**
 * CSS selector for the standard set of natively focusable / tab-reachable
 * elements. Disabled form controls and elements explicitly removed from the
 * sequential tab order (`tabindex="-1"`) are excluded at the selector level;
 * {@link isFocusable} applies the remaining runtime checks (parsed tabindex,
 * hidden state).
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Runtime predicate that refines the {@link FOCUSABLE_SELECTOR} matches:
 * excludes disabled controls, any element whose `tabindex` parses to a negative
 * value (or is non-numeric), and elements hidden via the `hidden` attribute or
 * `display: none` / `visibility: hidden`.
 */
function isFocusable(el: HTMLElement): boolean {
  // Disabled form controls are never focusable.
  if ((el as HTMLButtonElement).disabled) return false;

  // Any element with tabindex >= 0 is reachable; negative / non-numeric is not.
  const tabindexAttr = el.getAttribute('tabindex');
  if (tabindexAttr !== null) {
    const tabIndexValue = Number(tabindexAttr);
    if (Number.isNaN(tabIndexValue) || tabIndexValue < 0) return false;
  }

  // Hidden elements cannot receive focus.
  if (el.hidden) return false;
  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }

  return true;
}

/**
 * Query the focusable descendants of `container`, in DOM order.
 *
 * Returns an empty array when `container` is `null`. The result honors the
 * standard focusable selector and excludes disabled / hidden / negative-tabindex
 * elements so callers receive only genuinely tab-reachable nodes.
 *
 * @param container the element to search within (or `null`)
 * @returns the focusable descendant elements in document order
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
  return candidates.filter(isFocusable);
}

/**
 * Trap keyboard focus within `containerRef` while `active` is `true`.
 *
 * Behavior (Req 8.2):
 * - Intercepts Tab / Shift+Tab keydown while active.
 * - Recomputes the focusable set on every Tab so a changing DOM is handled.
 * - Tab on the last focusable element (or focus currently outside the set)
 *   wraps to the first; Shift+Tab on the first (or focus outside the set)
 *   wraps to the last.
 * - Empty focusable set: prevents default and keeps focus on the container,
 *   so focus never escapes the trap.
 *
 * The keydown listener is attached only while `active`, and is removed on
 * deactivation or unmount.
 *
 * @param containerRef ref to the element whose focusable descendants are trapped
 * @param active whether the trap is currently engaged
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  active: boolean
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Tab') return;

      const node = containerRef.current;
      if (!node) return;

      // Recompute on each Tab — the dialog's DOM may have changed.
      const focusable = getFocusableElements(node);

      // Nothing focusable inside: keep focus on the container, do nothing else.
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl =
        typeof document !== 'undefined'
          ? (document.activeElement as HTMLElement | null)
          : null;
      const currentIndex = activeEl ? focusable.indexOf(activeEl) : -1;

      if (event.shiftKey) {
        // Shift+Tab on the first element (or from outside the set) wraps to last.
        if (currentIndex <= 0) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab on the last element (or from outside the set) wraps to first.
        if (currentIndex === -1 || currentIndex === focusable.length - 1) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [active, containerRef]);
}
