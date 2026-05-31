# Requirements Document

## Introduction

This spec defines the foundational visual language for the DomainDiscovery premium build, covering **Phase 0 (Design System & Glass Language)** and **Phase 1 (Home/Hero)** of the broader Premium Build & Growth Roadmap. Later roadmap phases (results redesign, beginner finder, trademark checker, SEO/AEO/GEO layers, and similar) are explicitly out of scope and will be authored as separate specs that consume this foundation.

The goal of Phase 0 is to define the premium visual vocabulary once, before any page is rebuilt: a consolidated, documented design-token system (color, elevation/blur, typography scale, spacing rhythm, and motion primitives) plus a small set of reusable glass components, all with full light and dark theme parity. The goal of Phase 1 is a first-impression hero that meets a premium reference bar (Linear/Vercel/Family) on desktop and mobile, states the value proposition more sharply than the current "Find the perfect domain" headline, and adds a beginner-facing entry point.

The existing token layer in `src/app/globals.css` (CSS custom properties on `:root` and `html.light`, including the signature gold accent system, elevation tiers, fluid type scale, and motion utilities) is the source of truth to **preserve and extend**, not replace. Existing pages that consume current token names and component class names must continue to render without visual regression.

### Source-of-Truth and Palette Decision (to confirm)

The roadmap audit text describes the brand accent as "yellow (#FFD600) / orange (#FF6B00)". The shipped palette instead uses a **gold** accent system (`--accent` = `#E9B44C` in dark, `#B8860B` in light). The user's Phase 0 scope explicitly states "keep current palette." This document treats the existing shipped gold token system as the authoritative palette to preserve and flags the yellow/orange-vs-gold mismatch for the stakeholder to confirm rather than silently changing (see Open Questions).

### Scope Boundaries

In scope:
- Consolidated, documented design-token system spanning color, elevation/blur, typography, spacing, and motion, with light/dark parity, built on the existing CSS-variable tokens.
- A Tailwind theme mapping so tokens are consumable as Tailwind utilities in addition to CSS variables.
- 5-6 reusable base glass components with documented APIs: Glass_Card, Glass_Nav, Glass_Modal, Glass_Button, Glass_Chip, and a Glass_Stat (stat tile) primitive.
- A demo/showcase page proving consistent rendering of tokens and components in both themes.
- Phase 1 hero rebuild: glass hero with depth, refined headline/subhead, single primary call to action, reduced-motion-aware ambient motion, glass-restyled stat strip, and a distinct beginner entry point.
- Accessibility (contrast, focus, keyboard, reduced motion) and responsive behavior for the above.
- Non-regression protection for existing token and class consumers.

Out of scope:
- Search results redesign, beginner domain finder flow, trademark checker, SEO/AEO/GEO layers, and all other roadmap phases.
- Changes to domain search/availability logic, data services, or API integrations.
- Net-new brand palette colors beyond consolidating and documenting the existing palette.

## Glossary

- **Design_System**: The complete set of design tokens, the Tailwind theme mapping, and the reusable glass components delivered by this spec.
- **Token_Layer**: The single documented source of design tokens, expressed as CSS custom properties, covering color, elevation, blur, typography, spacing, and motion.
- **Token**: A single named design value (for example `--accent`, `--elev-2`, `--space-4`, `--motion-duration-base`).
- **Theme**: One of exactly two visual modes, `dark` (default) or `light`, selected by the presence or absence of the `light` class on the document root element.
- **Theme_Controller**: The existing `ThemeContext` provider that sets the active Theme, toggles the `light` class on the document root element, and persists the selection to local storage.
- **Glass_Surface**: Any component surface rendered with a translucent background plus backdrop blur, including Glass_Card, Glass_Nav, and Glass_Modal.
- **Glass_Card**: A reusable container component rendered as a Glass_Surface with configurable padding and elevation.
- **Glass_Nav**: A reusable navigation bar component rendered as a Glass_Surface anchored to the top of the viewport.
- **Glass_Modal**: A reusable dialog component rendered as a Glass_Surface in an overlay, with focus management and keyboard dismissal.
- **Glass_Button**: A reusable action control with primary (gold) and secondary (glass) styling, built on the existing button token classes.
- **Glass_Chip**: A reusable small label/pill control built on the existing accent-chip token styling.
- **Glass_Stat**: A reusable stat tile that displays a value and a label, used to compose the stat strip.
- **Stat_Strip**: The grouped set of four Glass_Stat tiles in the hero displaying the values 20M+, 50K+, 1,600+, and 99.9%.
- **Hero**: The Phase 1 first-impression section at the top of the home page, containing the eyebrow, headline, subhead, primary call to action, beginner entry point, ambient motion, and Stat_Strip.
- **Primary_CTA**: The single primary action control in the Hero.
- **Beginner_Entry**: A distinct secondary entry point in the Hero labeled to guide unsure users toward the Domain Finder, with the prompt "Not sure where to start?".
- **Ambient_Motion**: Subtle continuous or entrance motion in the Hero background or foreground that conveys depth without distracting from content.
- **Motion_Primitive**: A named motion Token defining a duration or an easing curve used by animations and transitions.
- **Reduced_Motion**: The user agent state in which `prefers-reduced-motion` evaluates to `reduce`.
- **Showcase_Page**: A demo route that renders the Token_Layer values and every glass component in both Themes for visual verification.
- **Contrast_Ratio**: The WCAG 2.1 relative luminance contrast ratio between a foreground color and its effective background.
- **Focus_Indicator**: A visible outline or ring shown on an interactive element when it receives keyboard focus.
- **Existing_Consumer**: Any current page or component that references an existing Token name or component class name (for example `.glass-card`, `.btn-accent`, `.accent-chip`, `.premium-card`, `.display-1`, `--accent`).

## Requirements

### Requirement 1: Consolidated and documented design-token system

**User Story:** As a developer building premium pages, I want a single documented token system covering color, elevation, blur, typography, spacing, and motion, so that every page draws from one consistent visual vocabulary.

#### Acceptance Criteria

1. THE Token_Layer SHALL define Tokens for color, elevation, blur, typography scale, spacing rhythm, and motion within the existing CSS custom property layer in `src/app/globals.css`.
2. THE Token_Layer SHALL retain every existing Token name currently defined on `:root` and `html.light` without removing or renaming any existing Token.
3. THE Token_Layer SHALL define a named spacing scale Token set with at least six named steps, where every step is expressed in the same length unit.
4. THE Token_Layer SHALL define a blur scale Token set with at least three named blur radius steps used by Glass_Surface components.
5. THE Token_Layer SHALL define Motion_Primitive Tokens comprising at least three named durations and at least two named easing curves.
6. THE Design_System SHALL include a written reference document that lists, for every Token, its name and, for each color Token, both its dark-Theme value and its light-Theme value, and for each theme-independent Token (spacing, blur, motion, and typography), its single value.
7. WHERE a Token represents the gold accent system, THE Token_Layer SHALL preserve the existing gold values (`--accent` = `#E9B44C` in dark and `#B8860B` in light) as the authoritative accent palette.
8. THE Token_Layer SHALL define a named elevation scale Token set with at least three named elevation steps used by Glass_Surface components.
9. THE Token_Layer SHALL define a typography scale Token set with at least five named type-size steps.

### Requirement 2: Light and dark theme parity for all tokens

**User Story:** As a user who switches between light and dark mode, I want every styled surface to adapt correctly, so that the interface looks intentional in both themes.

#### Acceptance Criteria

1. FOR ALL Tokens that resolve to a color value, THE Token_Layer SHALL define a value under both the dark Theme on `:root` and the light Theme on `html.light`, such that the set of color Token names defined for the dark Theme is identical to the set defined for the light Theme (theme parity property).
2. WHILE the light Theme is active, THE Token_Layer SHALL resolve every color Token to the light-Theme value defined on `html.light`.
3. WHILE the dark Theme is active, THE Token_Layer SHALL resolve every color Token to the dark-Theme value defined on `:root`.
4. WHEN the Theme_Controller toggles the Theme to the opposite Theme and then back to the starting Theme with no intervening Token redefinition, THE Design_System SHALL resolve every color Token to the value it held before the two toggles (toggle round-trip property).
5. WHEN the Theme_Controller sets the Theme to the same target Theme two or more consecutive times, THE Design_System SHALL resolve every color Token to the same values as a single set to that target Theme (toggle idempotence property).
6. IF a color Token is defined for exactly one Theme and is missing from the other Theme (a theme parity violation), THEN THE Design_System SHALL flag the parity violation so that the missing Theme value is supplied before release rather than resolving the Token to an undefined value.

### Requirement 3: Tailwind theme mapping for tokens

**User Story:** As a developer, I want the design tokens exposed as Tailwind utilities, so that I can compose premium UI using utility classes that stay in sync with the CSS-variable source of truth.

#### Acceptance Criteria

1. THE Design_System SHALL map every color, spacing, blur, and elevation Token in each named category into the Tailwind theme in `tailwind.config.ts` by referencing the corresponding CSS custom property.
2. FOR ALL Tokens exposed through the Tailwind theme, THE resulting utility class SHALL resolve to the same CSS custom property value as direct Token usage in both the dark Theme and the light Theme (mapping equivalence property).
3. THE Design_System SHALL preserve the existing Tailwind `darkMode` class strategy and the existing `border` color mapping.
4. IF a Token is exposed as a Tailwind utility, THEN THE Tailwind theme SHALL reference the Token through its CSS custom property rather than duplicating the literal value.
5. WHEN the Theme_Controller changes the active Theme, THE Design_System SHALL resolve every mapped Tailwind utility class to the value defined for the newly active Theme.
6. IF a mapped Tailwind utility references a CSS custom property that is not defined in the Token_Layer, THEN THE Design_System SHALL surface the unresolved reference as a build or test failure rather than rendering an empty or invalid value.

### Requirement 4: Reusable glass component set

**User Story:** As a developer, I want a small set of reusable glass components with documented props, so that I can assemble premium pages consistently without re-implementing glass styling.

#### Acceptance Criteria

1. THE Design_System SHALL provide the following reusable components: Glass_Card, Glass_Nav, Glass_Modal, Glass_Button, Glass_Chip, and Glass_Stat.
2. THE Design_System SHALL provide a documented prop API for each glass component listing each prop name, its type, its default value, and whether the prop is required or optional.
3. FOR ALL glass components, THE component SHALL render its surface colors, borders, and shadows exclusively from Token_Layer values rather than hard-coded literal colors.
4. WHEN a glass component is rendered in the dark Theme and then in the light Theme with identical props, THE component SHALL apply the Theme-appropriate Token values in each Theme (component theme parity property).
5. THE Glass_Card, Glass_Nav, and Glass_Modal SHALL render as Glass_Surface elements using a translucent background Token and a blur scale Token.
6. WHERE an elevation prop is supplied to a glass component with a value that is one of the named elevation Tokens defined in the Token_Layer, THE component SHALL apply that corresponding elevation Token.
7. WHEN a glass component is rendered without an elevation prop, THE component SHALL apply the default elevation Token defined as the lowest elevation tier in the Token_Layer.
8. IF the elevation prop value is not one of the named elevation Tokens defined in the Token_Layer, THEN THE component SHALL render using the default lowest-tier elevation Token without throwing an error.
9. THE Design_System SHALL build Glass_Button and Glass_Chip on the existing accent Token styling such that the gold accent presentation resolves from the existing accent Tokens (`--accent`) rather than from new or literal accent color values.

### Requirement 5: Showcase page proving consistent rendering

**User Story:** As a reviewer, I want a single demo page that renders all tokens and components in both themes, so that I can confirm the visual language is consistent before any production page is rebuilt.

#### Acceptance Criteria

1. THE Design_System SHALL provide a Showcase_Page route that renders the six glass components (Glass_Card, Glass_Nav, Glass_Modal, Glass_Button, Glass_Chip, and Glass_Stat) and at least one labeled sample for each Token_Layer category: color, typography, spacing, elevation, and motion.
2. WHEN the Showcase_Page is viewed in the dark Theme, THE Showcase_Page SHALL render every glass component using dark-Theme Token values.
3. WHEN the Showcase_Page is viewed in the light Theme, THE Showcase_Page SHALL render every glass component using light-Theme Token values.
4. THE Showcase_Page SHALL display, for each Motion_Primitive, a user-triggerable example associated with that Motion_Primitive.
5. WHEN a Motion_Primitive example is triggered, THE Showcase_Page SHALL play an animation that applies that Motion_Primitive's duration or easing value.
6. WHILE Reduced_Motion is active, THE Showcase_Page SHALL render each motion example in its final resting state with full opacity, no transform offset, and no animation in progress.

### Requirement 6: Text contrast on glass surfaces in both themes

**User Story:** As a user with low vision, I want readable text on translucent glass surfaces in both themes, so that I can use the interface without straining.

#### Acceptance Criteria

1. FOR ALL primary body text rendered on a Glass_Surface, THE Contrast_Ratio between the body text color Token and the effective surface background (as defined in criterion 5) SHALL be at least 4.5 to 1 in both the dark Theme and the light Theme (contrast invariant).
2. FOR ALL large text (at least 18.66px when bold, or at least 24px at regular weight) rendered on a Glass_Surface, THE Contrast_Ratio between the text color Token and the effective surface background (as defined in criterion 5) SHALL be at least 3 to 1 in both the dark Theme and the light Theme.
3. FOR ALL text rendered on the gold accent background, THE Contrast_Ratio between the accent-contrast text color Token and the gold accent background Token SHALL be at least 4.5 to 1 in both the dark Theme and the light Theme.
4. IF a text-on-surface Token pairing covered by criterion 1, 2, or 3 resolves to a Contrast_Ratio below its applicable threshold, THEN THE Design_System SHALL report a contrast verification failure that identifies the failing Token pairing, the active Theme, and the measured Contrast_Ratio.
5. FOR ALL Contrast_Ratio evaluations of text rendered on a Glass_Surface, THE Design_System SHALL compute the effective surface background as the opaque color produced by layering the Glass_Surface translucent background Token over the active Theme's base page background Token.
6. FOR ALL Contrast_Ratio comparisons against a threshold in this requirement, THE Design_System SHALL round the computed Contrast_Ratio to two decimal places before comparing it to the applicable threshold.

### Requirement 7: Visible focus and keyboard operability

**User Story:** As a keyboard user, I want every interactive glass component to be reachable and clearly focused, so that I can operate the interface without a pointer.

#### Acceptance Criteria

1. FOR ALL interactive glass components, WHEN the component receives keyboard focus, THE component SHALL display a Focus_Indicator rendered as an outline or ring at least 2 CSS pixels thick that fully surrounds the focusable element and differs from the unfocused state by a visual change other than color alone.
2. FOR ALL interactive glass components, THE keyboard focus order SHALL match the visual reading order of the components.
3. THE Focus_Indicator SHALL maintain a Contrast_Ratio of at least 3 to 1 against both the component's own background and the adjacent surface in both the dark Theme and the light Theme.
4. WHEN Glass_Button or Glass_Chip is activated via the Enter or Space key, THE component SHALL perform the same action as a pointer activation.
5. WHEN the Tab or Shift+Tab key is pressed while an interactive glass component has focus, THE Design_System SHALL move focus to another focusable element so that focus is never stuck on a single component.
6. WHILE an interactive glass component is in a disabled state, THE component SHALL be excluded from keyboard focus traversal and SHALL NOT activate in response to the Enter or Space key.

### Requirement 8: Glass modal accessibility and keyboard behavior

**User Story:** As a keyboard and screen-reader user, I want the glass modal to manage focus and dismissal correctly, so that I am not trapped or lost when a dialog opens.

#### Acceptance Criteria

1. WHEN the Glass_Modal opens, THE Glass_Modal SHALL move keyboard focus to the first focusable element inside the Glass_Modal, or to the Glass_Modal container itself when no focusable element exists inside it.
2. WHILE the Glass_Modal is open, THE Glass_Modal SHALL confine Tab and Shift+Tab focus traversal to elements inside the Glass_Modal, wrapping focus from the last focusable element to the first on Tab and from the first to the last on Shift+Tab (focus trap).
3. WHEN the Escape key is pressed while the Glass_Modal is open, THE Glass_Modal SHALL close.
4. WHEN the Glass_Modal closes, THE Glass_Modal SHALL return keyboard focus to the element that was focused immediately before the Glass_Modal opened, or to a defined fallback element when that previously focused element no longer exists or is not focusable.
5. WHILE the Glass_Modal is open, THE Glass_Modal SHALL expose a dialog role and a non-empty accessible name to assistive technology.
6. WHILE the Glass_Modal is open, THE Glass_Modal SHALL hide all content outside the Glass_Modal from assistive technology.

### Requirement 9: Reduced-motion support for all motion primitives

**User Story:** As a user sensitive to motion, I want animations to respect my reduced-motion preference, so that the interface does not trigger discomfort.

#### Acceptance Criteria

1. WHILE Reduced_Motion is active, THE Design_System SHALL render all entrance, ambient, and transition animations driven by Motion_Primitive Tokens with no perceptible motion, defined as no positional movement, scaling, rotation, or opacity change over time.
2. WHILE Reduced_Motion is active, THE Design_System SHALL render each animated element in its final resting state, defined as the visual state the element holds after its animation would have completed, with zero transform offset (no translation, scaling, or rotation applied) and at its final-state opacity, which for entrance animations is full opacity.
3. FOR ALL Motion_Primitive-driven animations, WHILE Reduced_Motion is active, THE Design_System SHALL present content visually equivalent to the element's non-animated final state with no animation in progress (reduced-motion completeness property).
4. WHILE Reduced_Motion is active, THE Ambient_Motion in the Hero SHALL render as a static background with no continuous, looping, or entrance motion.
5. WHEN the Reduced_Motion state changes from inactive to active while a page is displayed, THE Design_System SHALL apply the reduced-motion presentation to all currently displayed Motion_Primitive-driven elements without requiring a page reload.

### Requirement 10: Phase 1 glass hero with depth and refined messaging

**User Story:** As a first-time visitor, I want a striking hero that immediately communicates the product value, so that the first impression meets a premium bar.

#### Acceptance Criteria

1. THE Hero SHALL render as a Glass_Surface composed from at least two distinct elevation Tokens and at least one blur scale Token from the Token_Layer.
2. THE Hero SHALL display a headline of 1 to 80 characters and a supporting subhead of 1 to 160 characters as visible text, and THE headline text SHALL NOT equal the phrase "Find Your Perfect Domain in Seconds".
3. THE Hero SHALL display exactly one Primary_CTA, and THE Primary_CTA SHALL be the only control in the Hero rendered with the primary gold Glass_Button styling.
4. THE Hero SHALL render Ambient_Motion driven exclusively by Motion_Primitive Tokens from the Token_Layer.
5. WHEN the Primary_CTA is activated by pointer or by the Enter or Space key, THE Hero SHALL begin the domain search entry flow by placing keyboard focus on the domain search input.
6. WHEN the Hero is rendered in the dark Theme or the light Theme, THE Hero SHALL apply the Theme-appropriate Token_Layer values, and THE headline and subhead text SHALL meet the applicable Contrast_Ratio thresholds from Requirement 6 in the active Theme.

### Requirement 11: Glass-restyled stat strip

**User Story:** As a visitor evaluating credibility, I want a polished stat strip, so that the product's scale is communicated with premium presentation.

#### Acceptance Criteria

1. THE Stat_Strip SHALL display exactly four Glass_Stat tiles presenting the values 20M+, 50K+, 1,600+, and 99.9%, with each listed value displayed exactly once.
2. THE Stat_Strip SHALL render each Glass_Stat tile as a Glass_Surface using a translucent background Token and a blur scale Token from the Token_Layer, with no hard-coded literal colors.
3. THE Stat_Strip SHALL display, beneath each statistic value, exactly one non-empty text label that describes that value, with one label associated with each Glass_Stat tile.
4. WHEN the Stat_Strip is rendered in the dark Theme and then in the light Theme with identical content, THE Stat_Strip SHALL apply the Theme-appropriate Token values in each Theme.

### Requirement 12: Beginner entry point in the hero

**User Story:** As a visitor who does not know where to start, I want a clear guided entry point, so that I can be routed to a beginner-friendly path.

#### Acceptance Criteria

1. THE Hero SHALL display a Beginner_Entry rendered with secondary glass styling that does not use the gold accent background applied to the Primary_CTA.
2. THE Beginner_Entry SHALL display the prompt text "Not sure where to start?" together with a visible text label directing the user to the Domain Finder.
3. WHEN the Beginner_Entry is activated by pointer click or by the Enter or Space key, THE Hero SHALL navigate the user to the Domain Finder destination.
4. IF the Domain Finder destination is unreachable when the Beginner_Entry is activated, THEN THE Hero SHALL present an error indication and SHALL preserve the current Hero state without navigating away.
5. THE Beginner_Entry SHALL be operable using the keyboard alone and SHALL display a Focus_Indicator with a Contrast_Ratio of at least 3 to 1 against the adjacent surface in both the dark Theme and the light Theme when focused.

### Requirement 13: Responsive behavior for hero and components

**User Story:** As a mobile and desktop user, I want the hero and glass components to adapt to my screen, so that the premium experience holds across devices.

#### Acceptance Criteria

1. WHILE the viewport width is at or below the mobile breakpoint of 767px, THE Hero SHALL render its content in a single-column layout such that the rendered content width does not exceed the viewport width and no horizontal scrolling is required.
2. WHILE the viewport width is at or above the desktop breakpoint of 1024px, THE Hero SHALL render using the desktop multi-column layout with the Stat_Strip displayed as a single horizontal row of four Glass_Stat tiles.
3. FOR ALL glass components, WHILE the viewport width is from 320px through 1440px inclusive, THE component SHALL render such that no part of the component extends beyond the viewport width and no horizontal scrolling is required.
4. THE Hero SHALL apply the fluid typography scale Tokens to the headline such that the computed headline font size is held at its minimum scale Token value at or below the mobile breakpoint of 767px, never decreases as the viewport width increases from the mobile breakpoint toward the desktop breakpoint, and is held at its maximum scale Token value at or above the desktop breakpoint of 1024px.
5. WHILE the viewport width is at or below the mobile breakpoint of 767px, THE Stat_Strip SHALL render its four Glass_Stat tiles stacked vertically in a single column such that the rendered content width does not exceed the viewport width and no horizontal scrolling is required.

### Requirement 14: Non-regression for existing token and class consumers

**User Story:** As a maintainer, I want existing pages to keep rendering correctly, so that introducing the design system does not visually break shipped pages.

#### Acceptance Criteria

1. THE Design_System SHALL preserve every existing component class currently defined in `src/app/globals.css`, including `.glass-card`, `.theme-card`, `.premium-card`, `.btn-accent`, `.btn-primary`, `.btn-secondary`, `.accent-chip`, `.text-gradient-gold`, `.display-1`, `.display-2`, `.heading-1`, `.heading-2`, and `.eyebrow`.
2. FOR ALL Existing_Consumers, THE Design_System SHALL resolve referenced Token names and class names to the same computed value they resolved to before the Design_System changes, in both the dark Theme and the light Theme.
3. THE Design_System SHALL produce a build that completes with zero build errors and zero new compile or type errors introduced by the Token_Layer or Tailwind theme changes.
4. IF a glass component is implemented to replace an existing inline pattern, THEN THE Design_System SHALL keep the original class name available so Existing_Consumers continue to resolve to the same computed value.
5. WHILE Reduced_Motion is active, THE Design_System SHALL resolve the existing motion utilities to no animation, matching the pre-change `prefers-reduced-motion` behavior.
6. IF a referenced Token name or class name resolves to a different computed value than it produced before the Design_System changes, THEN THE Design_System SHALL flag the regression so the value is corrected before release.

## Correctness Properties (for property-based testing)

The following properties are candidates for property-based tests using the already-configured fast-check and Jest tooling. They are written to be verifiable against the Token_Layer and component implementations.

1. **Theme parity completeness** (Req 2.1): For every color Token name in the dark Theme set, a corresponding Token of the same name exists in the light Theme set. Generated over the full Token name list.
2. **Theme toggle round-trip** (Req 2.4): For any starting Theme, applying toggle twice returns the resolved Token map to the original Theme's values.
3. **Theme toggle idempotence** (Req 2.5): For any Theme, setting the Theme to a fixed target value repeatedly yields the same resolved Token map as setting it once.
4. **Tailwind mapping equivalence** (Req 3.2): For every Token exposed via the Tailwind theme, the Tailwind value string references the same CSS custom property name as the canonical Token.
5. **Contrast invariant on glass surfaces** (Req 6.1, 6.2, 6.3): For each defined text-on-surface Token pairing, across both Themes, the computed Contrast_Ratio meets or exceeds its applicable WCAG threshold. Generated over the enumerated set of text/surface pairings.
6. **Component theme parity** (Req 4.4): For each glass component rendered with a generated set of valid props, the rendered token references switch from dark to light values when the `light` class is toggled, with no hard-coded color literals present.
7. **Reduced-motion completeness** (Req 9.3): For every Motion_Primitive-driven animation class, when Reduced_Motion is active, the element resolves to the non-animated final state (animation none, full opacity, no transform).
8. **Glass component prop totality** (Req 4.2): For each glass component, rendering with any combination of documented prop values within their declared domains produces a valid element without throwing.

Note on testing scope: contrast and token-mapping properties test deterministic data derived from the Token_Layer and are well suited to property-based testing. Pure visual "premium gut check" judgments (Req 10 first-impression bar) are not automatable and will be verified by manual review against the reference set on desktop and mobile.

## Open Questions

1. **Accent palette confirmation**: The roadmap audit references a yellow (`#FFD600`) / orange (`#FF6B00`) accent, but the shipped palette uses gold (`#E9B44C` dark / `#B8860B` light) and Phase 0 says "keep current palette." This spec preserves the gold system as authoritative. Please confirm gold is correct, or specify whether a migration toward yellow/orange is intended in a later phase.
2. **Beginner entry destination**: The Beginner_Entry points "toward the Domain Finder," but the Domain Finder itself is a later roadmap phase. Should the Phase 1 link target an interim destination (for example the existing generator or search) until the dedicated finder ships?
3. **Showcase page exposure**: Should the Showcase_Page be a public route, a development-only route, or excluded from sitemap and search indexing?
