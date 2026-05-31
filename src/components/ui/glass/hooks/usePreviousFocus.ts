'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * A node is "restorable" (safe to receive focus on modal close) when it:
 *  - exists,
 *  - is still connected to the document (Req 8.4: "no longer exists"),
 *  - exposes a `focus()` method, and
 *  - is not disabled.
 */
function isRestorable(el: Element | null | undefined): el is HTMLElement {
  if (!el) return false;
  if (!el.isConnected) return false;
  const candidate = el as HTMLElement & { disabled?: boolean };
  if (typeof candidate.focus !== 'function') return false;
  if (candidate.disabled === true) return false;
  return true;
}

/**
 * usePreviousFocus
 *
 * Captures the element that held focus immediately before `active` became
 * `true` (e.g. a modal opening) and restores focus to it when `active`
 * transitions back to `false` (the modal closing).
 *
 * On close, focus is returned to the previously focused element only if it is
 * still connected to the document and focusable. Otherwise focus falls back to
 * `fallbackRef.current` when supplied and focusable, and finally to
 * `document.body` (Req 8.4).
 *
 * SSR-safe: all DOM access is guarded by `typeof document !== 'undefined'`.
 *
 * @param active        Whether the focus-owning surface is currently active/open.
 * @param fallbackRef   Optional element to focus on close when the previously
 *                      focused element is gone or unfocusable.
 */
export function usePreviousFocus(
  active: boolean,
  fallbackRef?: RefObject<HTMLElement>
): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const wasActive = wasActiveRef.current;

    if (active && !wasActive) {
      // Transition to active (open): capture the currently focused element.
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    } else if (!active && wasActive) {
      // Transition to inactive (close): restore focus.
      const previous = previousFocusRef.current;

      if (isRestorable(previous)) {
        previous.focus();
      } else if (isRestorable(fallbackRef?.current)) {
        fallbackRef!.current!.focus();
      } else if (isRestorable(document.body)) {
        document.body.focus();
      }

      previousFocusRef.current = null;
    }

    wasActiveRef.current = active;
  }, [active, fallbackRef]);
}
