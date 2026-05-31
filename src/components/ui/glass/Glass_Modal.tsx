'use client';

/**
 * Glass_Modal — a dialog Glass_Surface with full focus management.
 *
 * Rendered into a portal at `document.body` (via `react-dom`'s `createPortal`)
 * so the dialog escapes any clipping/stacking context of its trigger. The
 * dialog panel itself is a token-only Glass_Surface: its background, border,
 * and shadow resolve exclusively from Token_Layer custom properties
 * (`--glass-bg`, `--card-border`, `var(--elev-*)`) with a `--blur-*` backdrop
 * (Req 4.3, 4.5) — there are no literal colors on the SURFACE.
 *
 * OVERLAY SCRIM NOTE: the design provides no dedicated scrim Token, and the
 * shipped `--shadow-color` (≈6% black in light theme) is far too faint to dim
 * the page behind a modal. Per the design's guidance, the dialog surface stays
 * strictly token-only while the OVERLAY backdrop uses a single documented,
 * neutral rgba scrim literal ({@link OVERLAY_SCRIM}); this is the only literal
 * color in the file and it applies to the dimming layer alone, never the panel.
 *
 * Focus & accessibility (Req 8):
 * - On open (Req 8.1): focus `initialFocusRef`, else the first focusable
 *   descendant (via `getFocusableElements`), else the `tabIndex={-1}` container.
 * - Focus trap (Req 8.2): `useFocusTrap(containerRef, open)` wraps Tab/Shift+Tab.
 * - Escape (Req 8.3): closes when `closeOnEscape`.
 * - On close (Req 8.4): `usePreviousFocus(open)` returns focus to the opener,
 *   falling back to `document.body` when the opener is gone/unfocusable.
 * - Semantics (Req 8.5): `role="dialog"`, `aria-modal="true"`, and exactly one
 *   of `aria-labelledby` (when a non-empty `title` is given) or `aria-label`
 *   (the `ariaLabel`, else a dev-warned `"Dialog"` fallback) so the accessible
 *   name is never empty.
 * - Outside content hidden (Req 8.6): while open, sibling top-level nodes of the
 *   portal container receive `aria-hidden="true"` and `inert` (where supported);
 *   the prior values are restored on close/unmount.
 *
 * Hooks are always called unconditionally; only RENDERING is gated on `open`
 * (and client mount), keeping hook order stable across renders.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Glass_Modal"
 * Requirements: 4.1, 4.3, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

import { resolveElevation, type Elevation } from './elevation';
import { getFocusableElements, useFocusTrap } from './hooks/useFocusTrap';
import { usePreviousFocus } from './hooks/usePreviousFocus';

/** Named blur scale steps consumed by Glass_Surface components (Req 4.5). */
export type GlassModalBlur = 'sm' | 'md' | 'lg' | 'xl';

/**
 * The single documented overlay scrim. There is no scrim Token in the design,
 * and `--shadow-color` is too faint to dim the page (≈6% black in light theme),
 * so the OVERLAY (and only the overlay) uses this neutral rgba literal. The
 * dialog panel surface remains strictly token-only.
 */
const OVERLAY_SCRIM = 'rgba(0, 0, 0, 0.5)';

/** Radius matches the shipped `.glass-card` (16px) for visual consistency. */
const MODAL_RADIUS = '16px';

/**
 * Token-driven focus-visible ring for the close button. Mirrors the ring used
 * by Glass_Button/Glass_Chip: `ring-2` (≥ 2px) referencing mapped design tokens
 * (`var(--accent)` / `var(--bg-main)`), so the indicator is token-only and
 * theme-aware (Req 7.1).
 */
const CLOSE_FOCUS_RING =
  'outline-none focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main';

export interface GlassModalProps {
  /** Controls visibility. Required. */
  open: boolean;
  /** Called on Escape / overlay click / close button. Required. */
  onClose: () => void;
  /** Rendered as a heading and used for `aria-labelledby`. Optional* */
  title?: string;
  /** Accessible name used when no `title` is provided. Optional* */
  ariaLabel?: string;
  /** First focus target override on open (Req 8.1). Optional. */
  initialFocusRef?: RefObject<HTMLElement>;
  /** When true, Escape closes the dialog (Req 8.3). Default `true`. */
  closeOnEscape?: boolean;
  /** When true, clicking the overlay closes the dialog. Default `true`. */
  closeOnOverlayClick?: boolean;
  /** Elevation tier resolved via {@link resolveElevation}. Default `3`. */
  elevation?: Elevation;
  /** Backdrop blur step mapped to `--blur-*`. Default `'lg'`. */
  blur?: GlassModalBlur;
  /** Extra classes merged onto the dialog panel via {@link cn}. */
  className?: string;
  /** Dialog contents. */
  children?: ReactNode;
}

/**
 * Render a glass dialog. See the file header for the full focus/accessibility
 * contract. Hooks run unconditionally; the portal renders only while `open`
 * and after the client has mounted.
 */
export function Glass_Modal({
  open,
  onClose,
  title,
  ariaLabel,
  initialFocusRef,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  elevation = 3,
  blur = 'lg',
  className = '',
  children,
}: GlassModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const titleId = useId();
  const hasTitle = typeof title === 'string' && title.trim().length > 0;
  const hasAriaLabel = typeof ariaLabel === 'string' && ariaLabel.trim().length > 0;

  // --- Focus management hooks (always called; internally gated on `open`) ---
  useFocusTrap(containerRef, open); // Req 8.2
  usePreviousFocus(open); // Req 8.1 capture / Req 8.4 restore

  // --- Create the portal container once on the client (SSR-safe) ----------
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.setAttribute('data-glass-modal-portal', '');
    document.body.appendChild(el);
    portalRef.current = el;
    setMounted(true);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
      portalRef.current = null;
    };
  }, []);

  // --- Dev warning when no accessible name source is provided (Req 8.5) ----
  useEffect(() => {
    if (
      open &&
      !hasTitle &&
      !hasAriaLabel &&
      process.env.NODE_ENV !== 'production'
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        'Glass_Modal: provide a `title` or `ariaLabel` for an accessible name. Falling back to aria-label="Dialog".'
      );
    }
  }, [open, hasTitle, hasAriaLabel]);

  // --- Initial focus on open (Req 8.1) ------------------------------------
  useEffect(() => {
    if (!open) return;
    if (typeof document === 'undefined') return;
    const target =
      initialFocusRef?.current ??
      getFocusableElements(containerRef.current)[0] ??
      containerRef.current;
    target?.focus();
  }, [open, initialFocusRef]);

  // --- Escape to close (Req 8.3) ------------------------------------------
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    if (typeof document === 'undefined') return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  // --- Hide sibling top-level content from AT while open (Req 8.6) --------
  useEffect(() => {
    if (!open) return;
    if (typeof document === 'undefined') return;
    const container = portalRef.current;

    const siblings = Array.from(document.body.children).filter(
      (child) => child !== container
    ) as Array<HTMLElement & { inert?: boolean }>;

    // Snapshot prior state so it can be faithfully restored on close/unmount.
    const previous = siblings.map((el) => ({
      el,
      ariaHidden: el.getAttribute('aria-hidden'),
      inert: el.inert === true,
    }));

    siblings.forEach((el) => {
      el.setAttribute('aria-hidden', 'true');
      // `inert` removes the subtree from focus + the accessibility tree where
      // supported; assigning the property is a no-op on engines that lack it.
      el.inert = true;
    });

    return () => {
      previous.forEach(({ el, ariaHidden, inert }) => {
        if (ariaHidden === null) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', ariaHidden);
        el.inert = inert;
      });
    };
  }, [open]);

  // RENDER GATE (hooks above already ran): nothing while closed / pre-mount.
  if (!open || !mounted || !portalRef.current) return null;

  // Token-only dialog SURFACE: every value references a CSS custom property so
  // the cascade resolves the correct per-theme value (Req 4.3, 4.4, 4.5).
  const surfaceStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '32rem',
    maxHeight: 'calc(100vh - var(--space-6))',
    overflowY: 'auto',
    background: 'var(--glass-bg)',
    backdropFilter: `blur(var(--blur-${blur}))`,
    WebkitBackdropFilter: `blur(var(--blur-${blur}))`,
    border: '1px solid var(--card-border)',
    boxShadow: resolveElevation(elevation),
    borderRadius: MODAL_RADIUS,
    padding: 'var(--space-6)',
    color: 'var(--text-primary)',
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
    background: OVERLAY_SCRIM,
  };

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>): void {
    // Only a click on the overlay itself (not bubbled from the panel) closes.
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }

  const content = (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : hasAriaLabel ? ariaLabel : 'Dialog'}
        tabIndex={-1}
        className={cn('outline-none', className)}
        style={surfaceStyle}
      >
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className={cn(
            'absolute flex h-8 w-8 items-center justify-center rounded-full leading-none transition-colors',
            CLOSE_FOCUS_RING
          )}
          style={{
            top: 'var(--space-3)',
            right: 'var(--space-3)',
            background: 'var(--icon-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--card-border)',
            fontSize: 'var(--text-size-lg)',
          }}
        >
          {'\u00D7'}
        </button>

        {hasTitle && (
          <h2
            id={titleId}
            className="font-bold leading-tight"
            style={{
              margin: 0,
              marginBottom: 'var(--space-4)',
              paddingRight: 'var(--space-6)',
              fontSize: 'var(--text-size-xl)',
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );

  return createPortal(content, portalRef.current);
}

export default Glass_Modal;
