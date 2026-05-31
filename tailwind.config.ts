import type { Config } from "tailwindcss";
import { tailwindTokenMap } from "./src/design-system/tokens";

/**
 * Tailwind theme mapping for the premium glass design system (Req 3).
 *
 * The theme references the CSS-variable Token_Layer through the single
 * `tailwindTokenMap` manifest (`src/design-system/tokens.ts`) — every utility
 * resolves to a `var(--token)` reference rather than a duplicated literal value
 * (Req 3.1, 3.4). Because the values are CSS custom properties, each mapped
 * utility automatically resolves to the active Theme's value when the `light`
 * class toggles (Req 3.5).
 *
 * PRESERVED: the `darkMode: "class"` strategy, the existing `fontFamily`
 * sans/mono entries, and the `border: var(--border-color)` color mapping
 * (carried inside `tailwindTokenMap.colors`, so spreading it keeps the mapping
 * intact with no duplication) — Req 3.3.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      // Spreads `border: var(--border-color)` plus the design-system color
      // tokens — all `var(--token)` references (Req 3.1, 3.3, 3.4).
      colors: {
        ...tailwindTokenMap.colors,
      },
      spacing: {
        ...tailwindTokenMap.spacing,
      },
      // Glass surfaces use `backdrop-filter: blur(...)`, so the blur scale is
      // exposed primarily as backdropBlur; also mapped as `blur` for parity.
      backdropBlur: {
        ...tailwindTokenMap.blur,
      },
      blur: {
        ...tailwindTokenMap.blur,
      },
      boxShadow: {
        ...tailwindTokenMap.boxShadow,
      },
    },
  },
  plugins: [],
};

export default config;
