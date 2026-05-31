/**
 * Public barrel for the glass component library.
 *
 * Re-exports the six reusable glass components (Req 4.1) plus the shared
 * elevation helper (`resolveElevation`, `LOWEST_ELEVATION`) and the `Elevation`
 * type, so consumers can import everything from a single entry point:
 *
 * ```ts
 * import { Glass_Card, Glass_Modal, resolveElevation } from '@/components/ui/glass';
 * ```
 *
 * The focus hooks are re-exported as well for callers composing their own
 * focus-managed surfaces.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — glass component set
 * Requirements: 4.1, 4.3, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

// --- Components ----------------------------------------------------------
export { Glass_Card, type GlassCardProps, type GlassBlur, type GlassPadding } from './Glass_Card';
export { Glass_Nav, type GlassNavProps, type GlassNavComponentProps } from './Glass_Nav';
export {
  Glass_Button,
  type GlassButtonProps,
  type GlassButtonVariant,
  type GlassButtonSize,
} from './Glass_Button';
export { Glass_Chip, type GlassChipProps, type GlassChipAs } from './Glass_Chip';
export { Glass_Stat, type GlassStatProps } from './Glass_Stat';
export { Glass_Modal, type GlassModalProps, type GlassModalBlur } from './Glass_Modal';

// --- Shared elevation helper ---------------------------------------------
export { resolveElevation, LOWEST_ELEVATION, type Elevation } from './elevation';

// --- Focus hooks ---------------------------------------------------------
export { useFocusTrap, getFocusableElements } from './hooks/useFocusTrap';
export { usePreviousFocus } from './hooks/usePreviousFocus';
