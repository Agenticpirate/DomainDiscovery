# Implementation Plan: Premium Glass Design System (Phase 0 + Phase 1)

## Overview

This plan turns the design into incremental, test-first coding steps for **Phase 0 (Design System & Glass Language)** and **Phase 1 (Home/Hero)**. The work is layered exactly as the design's dependency graph requires: the CSS-variable Token_Layer and the `tokens.ts` manifest come first (most things consume them), then the pure helpers (theme algebra, contrast, elevation) and their property tests, then the focus hooks and glass components with their property/example tests, then the SearchInterface focus handle, then the Hero, then page integration, the Showcase page, and finally non-regression + build verification.

Stack: Next.js 14.2 App Router, TypeScript 5, Tailwind 3.4 (`darkMode: "class"`), Framer Motion 12, Jest 30 (jsdom) + `@testing-library/react` + fast-check 4.5. Tests live under `src/__tests__/design-system/` following the `*.property.test.ts(x)` precedent. Run tests with `npm test`, typecheck with `npm run typecheck`, build with `npm run build`. Surface styling is composed via the existing `cn()` helper at `src/lib/utils.ts`; error toasts use the already-wired `useToast()` from `src/components/ui/Toast.tsx`.

No existing token or component class is removed or renamed; new scales are additive.

## Tasks

- [x] 1. Establish the Token_Layer foundation (CSS variables + manifest)
  - [x] 1.1 Add new named token scales to `src/app/globals.css`
    - In `@layer base`, add to `:root` the spacing scale `--space-1..8` (rem), the blur scale `--blur-sm/md/lg/xl`, the motion primitives (`--motion-duration-fast/base/slow`, `--motion-ease-standard/entrance/float`), and the typography scale (`--text-size-xs..2xl` plus the breakpoint-pinned `--text-size-hero` clamp from the design)
    - Add scalar scales (spacing/blur/motion/typography) on `:root` only (theme-independent, single value); add any new color tokens to both `:root` and `html.light`
    - Do NOT remove or rename any existing token; reuse the shipped `--elev-1/2/3/gold` tiers as the named elevation scale (document, do not duplicate), and leave `.glass-card`'s literal `blur(20px)` untouched
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 1.9, 2.2, 2.3_
  - [x] 1.2 Create the token manifest module `src/design-system/tokens.ts`
    - Define `ColorTokenDef`, `ScalarTokenDef`, `ContrastPairing`, `TailwindTokenMap` interfaces and the `Elevation` type
    - Export `colorTokens` (every color token with non-empty `dark` and `light` values), `spacingTokens`, `blurTokens`, `motionTokens`, `elevationTokens`, `typographyTokens`, `contrastPairings`, `tailwindTokenMap`, a `motionClasses` list (new + existing animation classes), and a frozen `BASELINE_TOKENS` snapshot of existing (token, theme) resolved values
    - Implement `validateThemeParity(manifest)` (returns offending token names present in only one theme) and `validateTailwindMapping(map, manifest)` (returns dangling `var(--x)` references whose `--x` is absent from the manifest)
    - _Requirements: 1.6, 2.1, 2.6, 3.1, 3.6, 14.2_
  - [x]* 1.3 Write property test for token manifest completeness and theme parity
    - **Property 1: Token manifest completeness and theme parity** — file `src/__tests__/design-system/tokens.property.test.ts`
    - Generate over `colorTokens`: assert each has non-empty dark + light values and that the dark color-token name set equals the light set; assert each scalar token has a single non-empty value; assert a mutated manifest that drops one theme value is reported by `validateThemeParity`
    - **Validates: Requirements 1.6, 2.1, 2.6**

- [x] 2. Implement theme resolution algebra
  - [x] 2.1 Create `src/design-system/theme.ts` with pure theme helpers
    - `resolveColorTokens(theme, manifest)` returning a name→value map for the given `'dark' | 'light'`; `toggleTheme(theme)` and `setTheme(current, target)` as pure functions
    - Helpers read only from the manifest (no DOM dependency) so they are property-testable
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  - [x]* 2.2 Write property test for theme toggle round-trip
    - **Property 2: Theme toggle round-trip** — file `src/__tests__/design-system/theme-algebra.property.test.ts`
    - For any starting theme, `resolveColorTokens(toggle(toggle(t)))` deep-equals `resolveColorTokens(t)`
    - **Validates: Requirements 2.4**
  - [x]* 2.3 Write property test for theme toggle idempotence
    - **Property 3: Theme toggle idempotence** — file `src/__tests__/design-system/theme-algebra.property.test.ts`
    - For any target theme and any repetition count n ≥ 1, applying `setTheme(target)` n times resolves identically to applying it once
    - **Validates: Requirements 2.5**

- [x] 3. Map tokens into the Tailwind theme
  - [x] 3.1 Extend `tailwind.config.ts` to consume the manifest
    - Import `tailwindTokenMap` from `src/design-system/tokens.ts`; map `colors`, `spacing`, `blur` (backdropBlur), and `boxShadow` by referencing `var(--token)` (never duplicating literal values)
    - Preserve `darkMode: "class"` and the existing `border: var(--border-color)` color mapping
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  - [x]* 3.2 Write property test for Tailwind mapping equivalence
    - **Property 4: Tailwind mapping equivalence** — file `src/__tests__/design-system/tokens.property.test.ts`
    - For every entry in `tailwindTokenMap`, assert the value is exactly `var(--<name>)` and `<name>` exists in the manifest; assert a dangling-reference fixture is rejected by `validateTailwindMapping`
    - **Validates: Requirements 3.2, 3.4, 3.6**

- [x] 4. Implement the contrast utility
  - [x] 4.1 Create `src/design-system/contrast.ts`
    - Implement `parseColor` (#hex / rgb() / rgba()), `alphaComposite(fg, bg)`, `relativeLuminance(c)`, `contrastRatio(fg, bg)` (rounded to 2 decimals), and `effectiveSurface(surfaceToken, baseToken)`
    - Implement `verifyContrast(pairings, manifest)` returning failure records `{ pairingId, theme, measuredRatio }` for any pairing below its threshold
    - _Requirements: 6.4, 6.5, 6.6_
  - [x]* 4.2 Write unit tests for the contrast math
    - File `src/__tests__/design-system/contrast.property.test.ts`: pin `relativeLuminance`/`contrastRatio` against WCAG reference pairs (black/white = 21:1), verify two-decimal rounding, and assert `alphaComposite` identity at α=1 and base passthrough at α=0
    - _Requirements: 6.5, 6.6_
  - [x]* 4.3 Write property test for the contrast invariant on glass surfaces
    - **Property 5: Contrast invariant on glass surfaces** — file `src/__tests__/design-system/contrast.property.test.ts`
    - Iterate `contrastPairings` × {dark, light}: composite the translucent surface over the theme base, round to 2dp, assert ≥ threshold; additionally assert any translucent-over-opaque composite is opaque with each channel in [0, 255]
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5, 6.6, 7.3, 10.6**

- [x] 5. Build the shared elevation helper and focus hooks
  - [x] 5.1 Create `src/components/ui/glass/elevation.ts`
    - Export the `Elevation` type, `LOWEST_ELEVATION`, and the total `resolveElevation(value?)` function (valid tier → its `var(--elev-*)`; `undefined`/`null`/unrecognized → `var(--elev-1)`; never throws)
    - _Requirements: 4.6, 4.7, 4.8_
  - [x] 5.2 Create `useFocusTrap` at `src/components/ui/glass/hooks/useFocusTrap.ts`
    - Query focusable descendants of a container ref and, while active, intercept Tab/Shift+Tab to wrap last→first and first→last
    - _Requirements: 8.2_
  - [x] 5.3 Create `usePreviousFocus` at `src/components/ui/glass/hooks/usePreviousFocus.ts`
    - On activation capture `document.activeElement`; on deactivation restore it, falling back to a supplied fallback or `document.body` when the saved node is disconnected/unfocusable
    - _Requirements: 8.1, 8.4_
  - [x]* 5.4 Write unit test for `resolveElevation` totality
    - File `src/__tests__/design-system/elevation.test.ts`: assert valid tiers map correctly and that `undefined`, `null`, and arbitrary values return `var(--elev-1)` without throwing
    - _Requirements: 4.6, 4.7, 4.8_

- [x] 6. Build the glass component library
  - [x] 6.1 Implement `Glass_Card` at `src/components/ui/glass/Glass_Card.tsx`
    - Polymorphic `as`; `elevation` via `resolveElevation`; `blur` → `--blur-*`; `padding` → `--space-*`; surface from `--glass-bg` / `--card-border`; merge `className` with `cn()`; token-only styling
    - _Requirements: 4.1, 4.3, 4.5, 4.6, 4.7, 4.8, 7.1_
  - [x] 6.2 Implement `Glass_Nav` at `src/components/ui/glass/Glass_Nav.tsx`
    - Sticky top Glass_Surface from `--nav-bg`/`--glass-bg` + blur + elevation; `role="navigation"` when `as` is not `nav`; keyboard order follows DOM order
    - _Requirements: 4.1, 4.3, 4.5, 7.2_
  - [x] 6.3 Implement `Glass_Button` at `src/components/ui/glass/Glass_Button.tsx`
    - Native `<button>`; `variant="primary"` composes the shipped `.btn-accent` (gold from `--accent` family), `secondary` is a glass surface (default); token-driven focus-visible ring ≥ 2px; disabled excluded from tab order and not activated by Enter/Space
    - _Requirements: 4.1, 4.3, 4.9, 7.1, 7.4, 7.6_
  - [x] 6.4 Implement `Glass_Chip` at `src/components/ui/glass/Glass_Chip.tsx`
    - Built on `.accent-chip` token styling; static `span` by default, interactive (focus ring + Enter/Space activation) when `as="button"`/`as="a"`
    - _Requirements: 4.1, 4.3, 4.9, 7.1, 7.4_
  - [x] 6.5 Implement `Glass_Stat` at `src/components/ui/glass/Glass_Stat.tsx`
    - Glass surface (translucent bg + blur token); renders required `value` (fluid type token) and exactly one non-empty `label` beneath it (`--text-tertiary`); token-only, no literal colors
    - _Requirements: 4.1, 4.3, 4.5, 11.2, 11.3_
  - [x] 6.6 Implement `Glass_Modal` and the barrel `src/components/ui/glass/index.ts`
    - Portal to `document.body`; on open focus first focusable or the `tabIndex={-1}` container; trap focus via `useFocusTrap`; close on Escape/overlay/close button; restore focus via `usePreviousFocus`; `role="dialog"` + `aria-modal` + `aria-labelledby`/`aria-label` (dev warning + `"Dialog"` fallback when both omitted); mark sibling top-level nodes `aria-hidden`/`inert` while open and restore on close
    - Create `index.ts` re-exporting all six components, `Elevation`, and `resolveElevation`
    - _Requirements: 4.1, 4.3, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [x]* 6.7 Write property test for component theme parity and token-only surfaces
    - **Property 6: Component theme parity and token-only surfaces** — file `src/__tests__/design-system/glass-components.property.test.tsx`
    - For each component with generated valid props: assert surface color/border/shadow reference only `var(--…)` (no hex/rgb literals), values switch dark↔light on toggling `light`, Card/Nav/Modal/Stat use a translucent bg + blur token, and the gold presentation resolves from the `--accent` family
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.9, 10.6, 11.2, 11.4**
  - [x]* 6.8 Write property test for prop totality, elevation totality, and disabled exclusion
    - **Property 8: Glass component prop totality and elevation totality** — file `src/__tests__/design-system/glass-components.property.test.tsx`
    - For each component, rendering with any combination of documented prop values never throws; `resolveElevation` over arbitrary input always returns a valid `var(--elev-*)`; disabled interactive components are not tabbable and do not activate on Enter/Space
    - **Validates: Requirements 4.2, 4.6, 4.7, 4.8, 7.6**
  - [x]* 6.9 Write property test for stat tile label rendering
    - **Property 11: Stat tile label rendering** — file `src/__tests__/design-system/glass-components.property.test.tsx`
    - For any non-empty value and label strings, `Glass_Stat` renders exactly one non-empty label element positioned beneath the value containing the provided label text
    - **Validates: Requirements 11.3**
  - [x]* 6.10 Write example tests for `Glass_Modal` behavior
    - File `src/__tests__/design-system/glass-modal.test.tsx`: open focuses first focusable / container; Tab & Shift+Tab wrap; Escape closes; close returns focus to opener and to fallback when opener removed; exposes `role="dialog"` + non-empty accessible name; siblings `aria-hidden` while open and restored after
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [x]* 6.11 Write keyboard/focus example tests for `Glass_Button` and `Glass_Chip`
    - File `src/__tests__/design-system/glass-interactive.test.tsx`: fire Enter/Space and assert handler parity with click; assert a focus-ring class is present and no positive `tabIndex`; assert Tab moves focus away (never stuck)
    - _Requirements: 7.1, 7.4, 7.5_

- [x] 7. Checkpoint — design-system primitives complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Add reduced-motion support across motion primitives
  - [x] 8.1 Extend the `prefers-reduced-motion` block in `src/app/globals.css`
    - Add the new motion utility classes and the Hero ambient-motion class to the `@media (prefers-reduced-motion: reduce)` rule so they resolve to `animation: none; opacity: 1; transform: none`; preserve every existing class already in the block
    - _Requirements: 9.1, 9.2, 9.3, 14.5_
  - [x] 8.2 Implement runtime reduced-motion media-query handling
    - Add a hook/util (e.g. `src/components/ui/glass/hooks/useReducedMotion.ts`) that subscribes to `(prefers-reduced-motion: reduce)` `change` events and applies the static resting state to JS-driven ambient motion without a page reload
    - _Requirements: 9.5_
  - [x]* 8.3 Write property test for reduced-motion completeness
    - **Property 7: Reduced-motion completeness** — file `src/__tests__/design-system/reduced-motion.property.test.ts`
    - For every class in `motionClasses` (new utilities, Hero ambient class, and existing `animate-rise`/`animate-rise-sm`/`animate-scale-in`/`animate-fade-in`/`animate-slide-up`/`animate-float-soft`/`animate-shimmer`), assert under reduced motion: animation none, opacity 1, transform none
    - **Validates: Requirements 9.1, 9.2, 9.3, 14.5**

- [x] 9. Expose a focus handle on SearchInterface for the Primary_CTA
  - [x] 9.1 Convert `src/components/domain/SearchInterface.tsx` to `forwardRef`
    - Export `SearchInterfaceHandle { focusInput(): void }` and wire `useImperativeHandle(ref, () => ({ focusInput: () => inputRef.current?.focus() }))`; keep the change additive so existing call sites that pass no ref are unaffected
    - _Requirements: 10.5_
  - [x]* 9.2 Write unit test for the `focusInput` handle
    - File `src/__tests__/design-system/search-interface-handle.test.tsx`: render with a ref, call `focusInput()`, assert the input receives focus
    - _Requirements: 10.5_

- [x] 10. Implement hero copy constants, reachability gate, and fluid sizing model
  - [x] 10.1 Create `src/components/home/heroCopy.ts`
    - Export `HERO_HEADLINE`, `HERO_SUBHEAD`, `isValidHeroCopy(headline, subhead)` (headline 1–80 chars and ≠ "Find Your Perfect Domain in Seconds"; subhead 1–160 chars), `BEGINNER_ENTRY_DESTINATION` (default `'/generator'`), `isReachable(dest)` (route allowlist matching the sitemap set), and a `headlineSizeAt(viewportWidth)` model matching the `--text-size-hero` clamp
    - _Requirements: 10.2, 12.3, 12.4, 13.4_
  - [x]* 10.2 Write property test for hero copy validity bounds
    - **Property 9: Hero copy validity bounds** — file `src/__tests__/design-system/hero.property.test.ts`
    - For generated headline/subhead strings (incl. boundary lengths and the forbidden phrase), assert `isValidHeroCopy` accepts iff within bounds and ≠ forbidden phrase; assert the shipped `HERO_HEADLINE`/`HERO_SUBHEAD` pass
    - **Validates: Requirements 10.2**
  - [x]* 10.3 Write property test for headline fluid sizing
    - **Property 10: Headline fluid sizing is monotonic and breakpoint-pinned** — file `src/__tests__/design-system/hero.property.test.ts`
    - For viewport widths 200–2000, assert `headlineSizeAt` equals the minimum at ≤767px, equals the maximum at ≥1024px, and never decreases as width increases
    - **Validates: Requirements 13.4**

- [x] 11. Build the Hero
  - [x] 11.1 Implement `src/components/home/Hero.tsx`
    - Compose a Glass_Surface using ≥2 distinct elevation tokens (`--elev-2` panel, `--elev-gold` accent, `--elev-1` stat tiles) and ≥1 blur token (`--blur-lg`); render eyebrow `Glass_Chip`, headline (`--text-size-hero` token) + subhead from the copy constants, exactly one `Glass_Button variant="primary"` whose `onClick` calls `searchRef.current?.focusInput()`, and the `SearchInterface` wired with `const searchRef = useRef<SearchInterfaceHandle>(null)`
    - Render the `Stat_Strip` of four `Glass_Stat` tiles (20M+, 50K+, 1,600+, 99.9%, each once) and a secondary `Glass_Button` `Beginner_Entry` ("Not sure where to start? → Domain Finder") whose handler runs `isReachable(BEGINNER_ENTRY_DESTINATION)` then `router.push`, else `useToast().showToast(..., 'error')` and returns without navigating
    - Render an Ambient_Motion layer driven only by `--motion-*` tokens (reduced-motion aware via the extended CSS block + `useReducedMotion`); responsive single column at ≤767px (`grid-cols-1`) and multi-column at ≥1024px with the strip as `lg:grid-cols-4`; all surfaces fluid/`max-width:100%`
    - _Requirements: 9.4, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.4, 13.5_
  - [x]* 11.2 Write Hero, Stat_Strip, and Beginner_Entry example/interaction tests
    - File `src/__tests__/design-system/hero.test.tsx`: assert ≥2 distinct `--elev-*` and ≥1 `--blur-*` in the subtree; exactly one primary/gold button; ambient motion references `--motion-*`; activating the Primary_CTA focuses the search input via the forwarded handle; the four stat values each appear once with a non-empty label; Beginner_Entry shows the prompt + Domain Finder label, navigates when reachable, and shows a toast without navigating when unreachable; assert mobile/desktop responsive layout classes
    - _Requirements: 9.4, 10.1, 10.3, 10.4, 10.5, 11.1, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.5_

- [x] 12. Integrate the Hero into the home page
  - [x] 12.1 Wire `<Hero/>` into `src/app/page.tsx`
    - Replace the inline `activeTool === 'search'` hero block with `<Hero searchQuery={searchQuery} onSearch={handleHeroSearch} onClear={handleHeroClear} />`; keep `activeTool` switching, the `/` keyboard shortcut, all other tool branches, and `HomePageContent` untouched
    - _Requirements: 10.1, 14.1_
  - [x]* 12.2 Write integration test for page tool switching non-regression
    - File `src/__tests__/design-system/page-integration.test.tsx`: assert the search branch renders the Hero, switching `activeTool` still swaps tool sections, and the `/` shortcut path is preserved
    - _Requirements: 14.1_

- [x] 13. Build the Showcase page
  - [x] 13.1 Create `src/app/design-system/page.tsx`
    - Set route-segment `metadata.robots = { index: false, follow: false }` and do NOT add the route to `src/app/sitemap.ts`; render all six glass components live; render one labeled sample per token category (color swatches, typography scale, spacing scale, elevation tiers, motion primitives) sourced from the manifest so it doubles as the human-readable token reference; add a per-motion-primitive "Replay" trigger; ensure reduced motion renders each example in its final resting state
    - _Requirements: 1.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [x]* 13.2 Write Showcase content example tests
    - File `src/__tests__/design-system/showcase.test.tsx`: assert all six components render, one labeled sample exists per token category, a trigger exists per motion primitive, and reduced-motion final-state rendering applies
    - _Requirements: 5.1, 5.4, 5.5, 5.6_

- [x] 14. Non-regression protection and build verification
  - [x]* 14.1 Write non-regression class-presence tests
    - File `src/__tests__/design-system/non-regression.test.ts`: assert every existing `globals.css` class selector remains (`.glass-card`, `.theme-card`, `.premium-card`, `.btn-accent`, `.btn-primary`, `.btn-secondary`, `.accent-chip`, `.text-gradient-gold`, `.display-1`, `.display-2`, `.heading-1`, `.heading-2`, `.eyebrow`) and each baseline class is still available
    - _Requirements: 14.1, 14.4_
  - [x]* 14.2 Write property test for non-regression value preservation
    - **Property 12: Non-regression value preservation** — file `src/__tests__/design-system/tokens.property.test.ts`
    - For all `BASELINE_TOKENS` (token, theme) pairs assert the current resolved value equals the frozen baseline in both themes; assert a mismatch fixture is flagged with token, theme, and differing value
    - **Validates: Requirements 14.2, 14.6**
  - [x] 14.3 Verify typecheck, build, and full test suite
    - Run `npm run typecheck`, `npm run build`, and `npm test`; resolve any new compile/type/build errors so the suite completes with zero new errors (final wiring gate)
    - _Requirements: 14.3_

- [x] 15. Final checkpoint — Phase 0 + Phase 1 complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation and wiring tasks are never optional.
- Each property test sub-task names the exact design property number, its target test file, and the requirement clauses it validates. All 12 correctness properties (P1–P12) are covered: P1→1.3, P2→2.2, P3→2.3, P4→3.2, P5→4.3, P6→6.7, P7→8.3, P8→6.8, P9→10.2, P10→10.3, P11→6.9, P12→14.2.
- Sequencing is test-first and incremental: the manifest + globals.css tokens + contrast utility (and their property tests) precede components; `resolveElevation` and the focus hooks precede the glass components; glass components (and their property/example tests) precede the Hero; the SearchInterface `forwardRef` conversion precedes Primary_CTA wiring; the Hero precedes page integration; the Showcase follows; non-regression + build verification close the plan, so no code is left orphaned.
- Out of automated scope (per design): real-viewport overflow sweeps at arbitrary widths 320–1440px (Req 13.3) and the "premium first-impression" gut-check (Req 10) are verified by manual review against the Linear/Vercel/Family reference set on desktop and mobile; they are intentionally not checkbox tasks.
- The Showcase route is dev-reachable but `noindex` and excluded from `sitemap.ts`; it is not linked from production navigation.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "2.1", "3.1", "4.1", "5.1", "5.2", "5.3", "8.1", "8.2", "9.1", "10.1"] },
    { "id": 3, "tasks": ["2.2", "3.2", "4.2", "5.4", "6.1", "6.2", "6.3", "6.4", "6.5", "9.2", "10.2"] },
    { "id": 4, "tasks": ["2.3", "4.3", "6.6", "8.3", "10.3", "14.2"] },
    { "id": 5, "tasks": ["6.7", "6.10", "6.11", "11.1"] },
    { "id": 6, "tasks": ["6.8", "11.2", "12.1", "13.1"] },
    { "id": 7, "tasks": ["6.9", "12.2", "13.2", "14.1"] },
    { "id": 8, "tasks": ["14.3"] }
  ]
}
```
