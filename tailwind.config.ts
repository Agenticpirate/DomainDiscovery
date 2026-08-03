import type { Config } from "tailwindcss";

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
        /* Apple Silicon / SF Pro stack first, then system */
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "SF Mono",
          "ui-monospace",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        border: "var(--border-color)",
        /* DESIGN.md dual-theme tokens (flip with html.light) */
        ds: {
          canvas: "var(--ds-canvas)",
          soft: "var(--ds-canvas-soft)",
          inset: "var(--ds-canvas-soft-2)",
          ink: "var(--ds-ink)",
          body: "var(--ds-body)",
          mute: "var(--ds-mute)",
          hairline: "var(--ds-hairline)",
          strong: "var(--ds-hairline-strong)",
          link: "var(--ds-link)",
          "link-deep": "var(--ds-link-deep)",
          "link-soft": "var(--ds-link-bg-soft)",
          error: "var(--ds-error)",
          "error-soft": "var(--ds-error-soft)",
          warning: "var(--ds-warning)",
          "warning-soft": "var(--ds-warning-soft)",
          success: "var(--ds-success)",
          "success-soft": "var(--ds-success-soft)",
        },
        /* Vercel brand scale */
        vercel: {
          black: "#000000",
          white: "#ffffff",
          gray: {
            50: "#fafafa",
            100: "#eaeaea",
            200: "#999999",
            300: "#888888",
            400: "#666666",
            500: "#444444",
            600: "#333333",
            700: "#111111",
            800: "#0a0a0a",
          },
          blue: "#0070f3",
          "blue-light": "#3291ff",
          success: "#0070f3",
        },
      },
      boxShadow: {
        "vercel-sm": "0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.05)",
        "vercel": "0 0 0 1px rgba(0,0,0,0.03), 0 8px 30px rgba(0,0,0,0.08)",
        "vercel-lg": "0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.12)",
        "apple-glow": "0 0 0 1px rgba(255,255,255,0.06), 0 20px 50px -20px rgba(0,0,0,0.55)",
        "apple-soft": "0 8px 40px -12px rgba(0,0,0,0.35)",
        "ds-card": "var(--shadow-card)",
        "ds-card-hover": "var(--shadow-card-hover)",
      },
      borderRadius: {
        "ds-sm": "var(--radius-sm)",
        "ds-md": "var(--radius-md)",
        "ds-lg": "var(--radius-lg)",
        "ds-xl": "var(--radius-xl)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.22, 1, 0.36, 1)",
        vercel: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.2, 0.64, 1)",
      },
      keyframes: {
        "premium-fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "premium-scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "vercel-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "ambient-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -1%, 0) scale(1.03)" },
        },
        "border-glow": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "premium-fade-up": "premium-fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) both",
        "premium-scale-in": "premium-scale-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "vercel-pulse": "vercel-pulse 2.4s ease-in-out infinite",
        "ambient-drift": "ambient-drift 14s ease-in-out infinite",
        "border-glow": "border-glow 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
