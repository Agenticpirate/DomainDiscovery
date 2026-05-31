/**
 * Property tests for the glass component library.
 * @module __tests__/design-system/glass-components.property.test
 *
 * This single file implements THREE design correctness properties for the
 * premium-glass-design-system spec, all exercising the six glass components
 * (Glass_Card, Glass_Nav, Glass_Button, Glass_Chip, Glass_Stat, Glass_Modal):
 *
 *   • Property 6  (task 6.7) — Component theme parity and token-only surfaces.
 *       Validates: Requirements 4.3, 4.4, 4.5, 4.9, 10.6, 11.2, 11.4
 *   • Property 8  (task 6.8) — Prop totality, elevation totality, disabled exclusion.
 *       Validates: Requirements 4.2, 4.6, 4.7, 4.8, 7.6
 *   • Property 11 (task 6.9) — Stat tile label rendering.
 *       Validates: Requirements 11.3
 *
 * Tooling: Jest 30 (jsdom) + @testing-library/react + fast-check 4.5.
 *
 * IMPLEMENTATION NOTES
 * --------------------
 * 1. jsdom (cssstyle) does NOT serialize `backdrop-filter` into the element's
 *    `style` attribute string, but it IS readable via `el.style.backdropFilter`
 *    (e.g. "blur(var(--blur-lg))"). {@link styleText} therefore combines the
 *    serialized `style` attribute with the backdrop-filter read off the DOM
 *    style object so blur-token assertions and the no-literal scan see it.
 *
 * 2. Glass_Modal renders into a PORTAL appended to `document.body` and only
 *    renders content while `open`. The OVERLAY scrim element (the dialog's
 *    parent) intentionally uses a single documented `rgba(0,0,0,0.5)` literal
 *    (there is no scrim Token in the design); the DIALOG PANEL surface is
 *    strictly token-only. Every token-only / no-literal assertion is therefore
 *    SCOPED to the `role="dialog"` panel and its descendants and EXCLUDES the
 *    overlay node.
 *
 * 3. Some glass components are `'use client'` and a couple of consumers rely on
 *    ThemeContext, so every render is wrapped in {@link ThemeProvider} to be
 *    safe even though the primitives themselves read tokens via the CSS cascade.
 *
 * 4. Theme parity (Req 4.4): the components style themselves entirely through
 *    `var(--…)` references, so toggling the `light` class on
 *    `document.documentElement` does NOT change which token names a component
 *    references — the cascade resolves them to the per-theme value. The
 *    pragmatic, render-level assertion is that the SET of `var(--x)` references
 *    in a component's styles is identical with and without the `light` class
 *    (token-driven styling is theme-agnostic by construction). The `light`
 *    class is always cleaned up afterward.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — Correctness Properties 6, 8, 11
 */

import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import fc from 'fast-check';

import { ThemeProvider } from '@/contexts/ThemeContext';
import {
  Glass_Card,
  Glass_Nav,
  Glass_Button,
  Glass_Chip,
  Glass_Stat,
  Glass_Modal,
  resolveElevation,
} from '@/components/ui/glass';

// ---------------------------------------------------------------------------
// Run configuration
// ---------------------------------------------------------------------------

/** Component-render properties (heavier): 60 runs (≥ 50 required). */
const RENDER_RUNS = { numRuns: 60 } as const;
/** Pure `resolveElevation` property (cheap): 100 runs (≥ 100 required). */
const PURE_RUNS = { numRuns: 100 } as const;

// ---------------------------------------------------------------------------
// Generators over the documented prop domains
// ---------------------------------------------------------------------------

const elevationArb = fc.constantFrom<1 | 2 | 3 | 'gold'>(1, 2, 3, 'gold');
const blurArb = fc.constantFrom<'sm' | 'md' | 'lg' | 'xl'>('sm', 'md', 'lg', 'xl');
const paddingArb = fc.constantFrom<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1, 2, 3, 4, 5, 6, 7, 8);
const sizeArb = fc.constantFrom<'sm' | 'md' | 'lg'>('sm', 'md', 'lg');
/** Non-empty, non-whitespace text for required string props / children. */
const textArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

/**
 * Non-empty, normalization-stable display text (no leading/trailing whitespace,
 * single internal spaces) so that Testing Library's `getByText` — which
 * normalizes the NODE text but compares it to the raw search string — matches
 * deterministically for arbitrary generated labels/values.
 */
const statTextArb = fc
  .string({ minLength: 1 })
  .map((s) => s.replace(/\s+/g, ' ').trim())
  .filter((s) => s.length > 0);

// ---------------------------------------------------------------------------
// Style / token helpers
// ---------------------------------------------------------------------------

/** A hard-coded hex color literal (#rgb … #rrggbbaa). */
const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;
/** A hard-coded rgb()/rgba() color literal. */
const RGB_LITERAL = /rgba?\(/;
/** A single `var(--token-name)` custom-property reference. */
const VAR_REF = /var\(--[A-Za-z0-9-]+\)/g;
/** A blur backdrop driven by the `--blur-*` scale. */
const BLUR_TOKEN = /blur\(\s*var\(--blur-(sm|md|lg|xl)\)\s*\)/;

/**
 * Color-bearing CSS declarations. We assert these reference only `var(--…)`
 * (never a literal). `border-radius` is deliberately excluded — it contains the
 * substring "border" but is a length, not a color.
 */
const COLOR_PROPS = [
  'background',
  'background-color',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-color',
  'box-shadow',
  'color',
  'outline',
  'outline-color',
];

/**
 * The full inline styling of an element as a single searchable string: the
 * serialized `style` attribute PLUS the backdrop-filter (which jsdom keeps off
 * the attribute but exposes on the style object).
 */
function styleText(el: Element): string {
  const attr = el.getAttribute('style') ?? '';
  const s = (el as HTMLElement).style;
  const backdrop = s.backdropFilter || s.getPropertyValue('backdrop-filter') || '';
  // Some engines expose the webkit-prefixed property name in camelCase.
  const webkitBackdrop =
    (s as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter ||
    s.getPropertyValue('-webkit-backdrop-filter') ||
    '';
  return [attr, backdrop, webkitBackdrop].filter(Boolean).join('; ');
}

/** Parse an element's serialized `style` attribute into a prop→value map. */
function styleMap(el: Element): Record<string, string> {
  const attr = el.getAttribute('style') ?? '';
  const map: Record<string, string> = {};
  for (const decl of attr.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const key = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (key) map[key] = value;
  }
  return map;
}

/** Read the backdrop-filter value from an element's style object. */
function backdropFilterOf(el: Element): string {
  const s = (el as HTMLElement).style;
  return s.backdropFilter || s.getPropertyValue('backdrop-filter') || '';
}

/** The sorted, de-duplicated set of `var(--x)` references across elements. */
function collectVarRefs(els: Element[]): string[] {
  const set = new Set<string>();
  for (const el of els) {
    const matches = styleText(el).match(VAR_REF);
    if (matches) matches.forEach((m) => set.add(m));
  }
  return Array.from(set).sort();
}

/** Normalize whitespace the way Testing Library's text matcher does. */
function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

// ---------------------------------------------------------------------------
// Per-component render adapters
// ---------------------------------------------------------------------------

interface SurfaceHandle {
  /** The primary token-styled surface element. */
  surface: HTMLElement;
  /** Every styled element to scan for literals / var refs (overlay excluded). */
  styledEls: HTMLElement[];
  /** The surface element's composed className. */
  className: string;
  /** Tear down this render (also cleans up modal portals). */
  unmount: () => void;
}

interface SurfaceCase {
  name: string;
  /** True when the surface is styled inline via `var(--…)` declarations. */
  inlineSurface: boolean;
  /** True when the surface must show a translucent bg token + a blur token. */
  translucent: boolean;
  arb: fc.Arbitrary<Record<string, unknown>>;
  render: (props: Record<string, unknown>) => SurfaceHandle;
}

const cases: SurfaceCase[] = [
  {
    name: 'Glass_Card',
    inlineSurface: true,
    translucent: true,
    arb: fc.record({ elevation: elevationArb, blur: blurArb, padding: paddingArb }),
    render: (p) => {
      const u = renderWithTheme(<Glass_Card {...p}>content</Glass_Card>);
      const surface = u.container.firstElementChild as HTMLElement;
      return {
        surface,
        styledEls: Array.from(u.container.querySelectorAll<HTMLElement>('[style]')),
        className: surface.getAttribute('class') ?? '',
        unmount: u.unmount,
      };
    },
  },
  {
    name: 'Glass_Nav',
    inlineSurface: true,
    translucent: true,
    arb: fc.record({ elevation: elevationArb, blur: blurArb, sticky: fc.boolean() }),
    render: (p) => {
      const u = renderWithTheme(<Glass_Nav {...p}>nav</Glass_Nav>);
      const surface = u.container.firstElementChild as HTMLElement;
      return {
        surface,
        styledEls: Array.from(u.container.querySelectorAll<HTMLElement>('[style]')),
        className: surface.getAttribute('class') ?? '',
        unmount: u.unmount,
      };
    },
  },
  {
    name: 'Glass_Stat',
    inlineSurface: true,
    translucent: true,
    arb: fc.record({
      value: textArb,
      label: textArb,
      elevation: elevationArb,
      blur: blurArb,
    }),
    render: (p) => {
      const u = renderWithTheme(<Glass_Stat {...(p as { value: string; label: string })} />);
      const surface = u.container.firstElementChild as HTMLElement;
      return {
        surface,
        styledEls: Array.from(u.container.querySelectorAll<HTMLElement>('[style]')),
        className: surface.getAttribute('class') ?? '',
        unmount: u.unmount,
      };
    },
  },
  {
    name: 'Glass_Modal',
    inlineSurface: true,
    translucent: true,
    arb: fc.record({ elevation: elevationArb, blur: blurArb, title: textArb }),
    render: (p) => {
      const u = renderWithTheme(
        <Glass_Modal open onClose={() => {}} {...(p as { title: string })}>
          body
        </Glass_Modal>
      );
      const surface = document.querySelector('[role="dialog"]') as HTMLElement;
      // Scope to the dialog PANEL + its descendants — NEVER the overlay scrim
      // (the overlay is the dialog's parent and uses the documented rgba literal).
      const styledEls = [
        surface,
        ...Array.from(surface.querySelectorAll<HTMLElement>('[style]')),
      ];
      return {
        surface,
        styledEls,
        className: surface.getAttribute('class') ?? '',
        unmount: u.unmount,
      };
    },
  },
  {
    name: 'Glass_Button(secondary)',
    inlineSurface: true,
    translucent: false,
    arb: fc.record({
      size: sizeArb,
      elevation: fc.option(elevationArb, { nil: undefined }),
      children: textArb,
    }),
    render: (p) => {
      const { children, ...rest } = p as { children: string };
      const u = renderWithTheme(
        <Glass_Button variant="secondary" {...rest}>
          {children}
        </Glass_Button>
      );
      const surface = u.container.firstElementChild as HTMLElement;
      return {
        surface,
        styledEls: Array.from(u.container.querySelectorAll<HTMLElement>('[style]')),
        className: surface.getAttribute('class') ?? '',
        unmount: u.unmount,
      };
    },
  },
  {
    name: 'Glass_Button(primary)',
    inlineSurface: false, // gold surface comes from the `.btn-accent` class
    translucent: false,
    arb: fc.record({
      size: sizeArb,
      elevation: fc.option(elevationArb, { nil: undefined }),
      children: textArb,
    }),
    render: (p) => {
      const { children, ...rest } = p as { children: string };
      const u = renderWithTheme(
        <Glass_Button variant="primary" {...rest}>
          {children}
        </Glass_Button>
      );
      const surface = u.container.firstElementChild as HTMLElement;
      return {
        surface,
        styledEls: Array.from(u.container.querySelectorAll<HTMLElement>('[style]')),
        className: surface.getAttribute('class') ?? '',
        unmount: u.unmount,
      };
    },
  },
  {
    name: 'Glass_Chip',
    inlineSurface: false, // gold surface comes from the `.accent-chip` class
    translucent: false,
    arb: fc.record({
      as: fc.constantFrom<'span' | 'button' | 'a'>('span', 'button', 'a'),
      children: textArb,
    }),
    render: (p) => {
      const { children, as } = p as { children: string; as: 'span' | 'button' | 'a' };
      const u = renderWithTheme(
        <Glass_Chip as={as} href={as === 'a' ? '#' : undefined}>
          {children}
        </Glass_Chip>
      );
      const surface = u.container.firstElementChild as HTMLElement;
      return {
        surface,
        styledEls: Array.from(u.container.querySelectorAll<HTMLElement>('[style]')),
        className: surface.getAttribute('class') ?? '',
        unmount: u.unmount,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Hygiene: keep the `light` class and persisted theme from leaking across tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  document.documentElement.classList.remove('light');
});

afterEach(() => {
  document.documentElement.classList.remove('light');
});

// ===========================================================================
// Property 6 — Component theme parity and token-only surfaces (task 6.7)
// Validates: Requirements 4.3, 4.4, 4.5, 4.9, 10.6, 11.2, 11.4
// ===========================================================================

describe('Property 6: component theme parity and token-only surfaces', () => {
  // --- No hard-coded color literals anywhere on any glass surface (Req 4.3) --
  describe('surfaces contain no hard-coded color literals (Req 4.3, 10.6)', () => {
    cases.forEach((c) => {
      it(`${c.name}: no hex/rgb literal in any styled element`, () => {
        fc.assert(
          fc.property(c.arb, (props) => {
            const h = c.render(props);
            try {
              for (const el of h.styledEls) {
                const text = styleText(el);
                expect(text).not.toMatch(HEX_LITERAL);
                expect(text).not.toMatch(RGB_LITERAL);
              }
            } finally {
              h.unmount();
            }
          }),
          RENDER_RUNS
        );
      });
    });
  });

  // --- Inline surfaces reference ONLY var(--…) for color properties (Req 4.3) -
  describe('inline surfaces reference only var(--…) for color/border/shadow (Req 4.3)', () => {
    cases
      .filter((c) => c.inlineSurface)
      .forEach((c) => {
        it(`${c.name}: every color-bearing declaration is a var(--…) reference`, () => {
          fc.assert(
            fc.property(c.arb, (props) => {
              const h = c.render(props);
              try {
                const declarations = styleMap(h.surface);
                let sawColorProp = false;
                for (const prop of COLOR_PROPS) {
                  const value = declarations[prop];
                  if (value === undefined) continue;
                  sawColorProp = true;
                  expect(value).toContain('var(--');
                  expect(value).not.toMatch(HEX_LITERAL);
                  expect(value).not.toMatch(RGB_LITERAL);
                }
                // Inline-surface components must declare at least one token-driven
                // color-bearing property on their surface.
                expect(sawColorProp).toBe(true);
              } finally {
                h.unmount();
              }
            }),
            RENDER_RUNS
          );
        });
      });
  });

  // --- Translucent background token + blur scale token (Req 4.5, 11.2) -------
  describe('Card/Nav/Modal/Stat use a translucent bg token + a blur token (Req 4.5, 11.2)', () => {
    cases
      .filter((c) => c.translucent)
      .forEach((c) => {
        it(`${c.name}: background is a var(--…) token and backdrop is blur(var(--blur-*))`, () => {
          fc.assert(
            fc.property(c.arb, (props) => {
              const h = c.render(props);
              try {
                const background = styleMap(h.surface).background ?? '';
                // Translucent surface sourced from a token (e.g. --glass-bg / --nav-bg).
                expect(background).toContain('var(--');
                expect(background).not.toMatch(HEX_LITERAL);
                expect(background).not.toMatch(RGB_LITERAL);
                // Backdrop blur from the --blur-* scale.
                expect(backdropFilterOf(h.surface)).toMatch(BLUR_TOKEN);
              } finally {
                h.unmount();
              }
            }),
            RENDER_RUNS
          );
        });
      });
  });

  // --- Theme parity: token reference set is identical across `light` toggle ---
  describe('token references are theme-agnostic across the light toggle (Req 4.4)', () => {
    cases.forEach((c) => {
      it(`${c.name}: var(--…) reference set is identical with and without .light`, () => {
        fc.assert(
          fc.property(c.arb, (props) => {
            // Dark theme (no `light` class).
            document.documentElement.classList.remove('light');
            const dark = c.render(props);
            const darkRefs = collectVarRefs(dark.styledEls);
            dark.unmount();

            // Light theme (`light` class present).
            document.documentElement.classList.add('light');
            const light = c.render(props);
            const lightRefs = collectVarRefs(light.styledEls);
            light.unmount();
            document.documentElement.classList.remove('light');

            // Token-driven styling references the same token names in both
            // themes; the cascade resolves them to per-theme values.
            expect(lightRefs).toEqual(darkRefs);
          }),
          RENDER_RUNS
        );
      });
    });
  });

  // --- Gold reuse from the `--accent` family (Req 4.9, 11.4) -----------------
  describe('gold presentation reuses the --accent token family (Req 4.9, 11.4)', () => {
    it('Glass_Button variant="primary" composes the .btn-accent class', () => {
      fc.assert(
        fc.property(textArb, sizeArb, (children, size) => {
          const u = renderWithTheme(
            <Glass_Button variant="primary" size={size}>
              {children}
            </Glass_Button>
          );
          try {
            const cls = (u.container.firstElementChild as HTMLElement).className;
            expect(cls.split(/\s+/)).toContain('btn-accent');
          } finally {
            u.unmount();
          }
        }),
        RENDER_RUNS
      );
    });

    it('Glass_Chip composes the .accent-chip class', () => {
      fc.assert(
        fc.property(
          textArb,
          fc.constantFrom<'span' | 'button' | 'a'>('span', 'button', 'a'),
          (children, as) => {
            const u = renderWithTheme(
              <Glass_Chip as={as} href={as === 'a' ? '#' : undefined}>
                {children}
              </Glass_Chip>
            );
            try {
              const cls = (u.container.firstElementChild as HTMLElement).className;
              expect(cls.split(/\s+/)).toContain('accent-chip');
            } finally {
              u.unmount();
            }
          }
        ),
        RENDER_RUNS
      );
    });
  });
});

// ===========================================================================
// Property 8 — Prop totality, elevation totality, disabled exclusion (task 6.8)
// Validates: Requirements 4.2, 4.6, 4.7, 4.8, 7.6
// ===========================================================================

describe('Property 8: prop totality, elevation totality, disabled exclusion', () => {
  // --- Rendering with any documented prop combination never throws (Req 4.2) -
  describe('rendering with any documented prop combination never throws (Req 4.2)', () => {
    cases.forEach((c) => {
      it(`${c.name}: render does not throw across the prop domain`, () => {
        fc.assert(
          fc.property(c.arb, (props) => {
            expect(() => {
              const h = c.render(props);
              h.unmount();
            }).not.toThrow();
          }),
          RENDER_RUNS
        );
      });
    });
  });

  // --- resolveElevation totality (Req 4.6, 4.7, 4.8) ------------------------
  describe('resolveElevation is total over any input (Req 4.6, 4.7, 4.8)', () => {
    const ELEV_VAR = /^var\(--elev-(1|2|3|gold)\)$/;

    it('never throws and always returns a valid var(--elev-*) for fc.anything()', () => {
      fc.assert(
        fc.property(fc.anything(), (value) => {
          let out: string;
          expect(() => {
            out = resolveElevation(value);
          }).not.toThrow();
          expect(out!).toMatch(ELEV_VAR);
        }),
        PURE_RUNS
      );
    });

    it('omitted / undefined / null default to the lowest tier var(--elev-1)', () => {
      expect(resolveElevation()).toBe('var(--elev-1)');
      expect(resolveElevation(undefined)).toBe('var(--elev-1)');
      expect(resolveElevation(null)).toBe('var(--elev-1)');
    });
  });

  // --- Disabled interactive components are inert (Req 7.6) -------------------
  describe('disabled interactive components are not tabbable and do not activate (Req 7.6)', () => {
    it('disabled Glass_Button: excluded from focus, no activation on click/Enter/Space', () => {
      const onClick = jest.fn();
      const u = renderWithTheme(
        <Glass_Button disabled onClick={onClick}>
          press
        </Glass_Button>
      );
      try {
        const btn = u.getByRole('button');
        // Excluded from keyboard focus traversal (native disabled is unfocusable).
        expect(btn).toBeDisabled();
        (btn as HTMLButtonElement).focus();
        expect(document.activeElement).not.toBe(btn);
        // Does not activate.
        fireEvent.click(btn);
        fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
        fireEvent.keyDown(btn, { key: ' ', code: 'Space' });
        expect(onClick).not.toHaveBeenCalled();
      } finally {
        u.unmount();
      }
    });

    it('disabled Glass_Chip(as="button"): excluded from focus, no activation', () => {
      const onClick = jest.fn();
      const u = renderWithTheme(
        <Glass_Chip as="button" disabled onClick={onClick}>
          chip
        </Glass_Chip>
      );
      try {
        const btn = u.getByRole('button');
        expect(btn).toBeDisabled();
        (btn as HTMLButtonElement).focus();
        expect(document.activeElement).not.toBe(btn);
        fireEvent.click(btn);
        fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
        fireEvent.keyDown(btn, { key: ' ', code: 'Space' });
        expect(onClick).not.toHaveBeenCalled();
      } finally {
        u.unmount();
      }
    });
  });
});

// ===========================================================================
// Property 11 — Stat tile label rendering (task 6.9)
// Validates: Requirements 11.3
// ===========================================================================

describe('Property 11: stat tile renders exactly one label beneath the value', () => {
  it('renders exactly one label element beneath the value for any non-empty value/label', () => {
    fc.assert(
      fc.property(statTextArb, statTextArb, (value, label) => {
        // Keep value and label distinguishable so an exact text query is
        // unambiguous (the property is about the LABEL specifically).
        fc.pre(normalize(value) !== normalize(label));

        const u = renderWithTheme(<Glass_Stat value={value} label={label} />);
        try {
          const scope = within(u.container);

          // Exactly one element renders the label text…
          const labelMatches = scope.getAllByText(label);
          expect(labelMatches).toHaveLength(1);
          const labelEl = labelMatches[0];
          expect(normalize(labelEl.textContent ?? '')).toBe(normalize(label));

          // …and the value is present too.
          const valueEl = scope.getByText(value);
          expect(valueEl).toBeInTheDocument();

          // The label sits BENEATH the value: in a flex-col tile the two spans
          // are siblings in DOM order [value, label].
          const surface = u.container.firstElementChild as HTMLElement;
          const spans = Array.from(surface.querySelectorAll(':scope > span'));
          expect(spans).toHaveLength(2);
          expect(normalize(spans[0].textContent ?? '')).toBe(normalize(value));
          expect(normalize(spans[1].textContent ?? '')).toBe(normalize(label));
          // label follows the value in document order
          expect(
            spans[0].compareDocumentPosition(spans[1]) &
              Node.DOCUMENT_POSITION_FOLLOWING
          ).toBeTruthy();
        } finally {
          u.unmount();
        }
      }),
      RENDER_RUNS
    );
  });
});
