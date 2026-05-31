'use client';

/**
 * DesignSystemShowcase — the interactive body of the `/design-system` route.
 *
 * Rendered by the server `page.tsx` (which owns the `metadata` export, since a
 * `'use client'` module cannot export `metadata`). This component holds every
 * piece of interactivity the showcase needs:
 *
 *  - all six glass components rendered LIVE (Req 5.1), including a Glass_Modal
 *    opened by a button (open/close state);
 *  - one LABELED sample per Token_Layer category sourced from the manifest —
 *    color swatches, typography scale, spacing scale, elevation tiers, motion
 *    primitives — so the page doubles as the human-readable token reference
 *    (Req 1.6, 5.1);
 *  - a per-Motion_Primitive "Replay" trigger that re-runs an animation applying
 *    that primitive's duration/easing value (Req 5.4, 5.5), implemented by
 *    bumping a per-token key so the animated element remounts and restarts;
 *  - reduced-motion awareness: when `useReducedMotion()` is true, each motion
 *    example renders in its final resting state — full opacity, no transform,
 *    no animation (Req 5.6);
 *  - a theme toggle wired to the existing ThemeContext; because every sample
 *    reads `var(--token)` values, toggling the theme re-renders all swatches
 *    and components with the theme-appropriate values automatically (Req 5.2,
 *    5.3) — no per-sample theme branching is needed.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Showcase page"
 * Requirements: 1.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { useState, type CSSProperties, type ReactNode } from 'react';

import {
  Glass_Card,
  Glass_Nav,
  Glass_Button,
  Glass_Chip,
  Glass_Stat,
  Glass_Modal,
} from '@/components/ui/glass';
import { useReducedMotion } from '@/components/ui/glass/hooks/useReducedMotion';
import {
  colorTokens,
  typographyTokens,
  spacingTokens,
  elevationTokens,
  motionTokens,
} from '@/design-system/tokens';
import { useTheme } from '@/contexts/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────
// Small presentational helpers (token-only styling)
// ─────────────────────────────────────────────────────────────────────────

/** A labeled section wrapper with a heading. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{ marginBottom: 'var(--space-8)' }}
      aria-label={title}
    >
      <h2
        style={{
          fontSize: 'var(--text-size-xl)',
          color: 'var(--text-primary)',
          fontWeight: 800,
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: 'var(--text-size-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-5)',
            maxWidth: '60ch',
          }}
        >
          {description}
        </p>
      )}
      {children}
    </section>
  );
}

/** A simple responsive grid that never overflows the viewport. */
function Grid({
  min = '220px',
  children,
}: {
  min?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}, 100%), 1fr))`,
        gap: 'var(--space-4)',
      }}
    >
      {children}
    </div>
  );
}

/** Monospace token-name label used across every sample. */
function TokenName({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 'var(--text-size-xs)',
        color: 'var(--text-secondary)',
        wordBreak: 'break-all',
      }}
    >
      {children}
    </code>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Motion primitive example (with "Replay")
// ─────────────────────────────────────────────────────────────────────────

/**
 * A single Motion_Primitive demo. The "Replay" button re-runs an animation that
 * applies this primitive's value (Req 5.4, 5.5):
 *
 *  - duration tokens (`--motion-duration-*`) drive the animation's DURATION;
 *  - easing tokens (`--motion-ease-*`) drive the animation's EASING.
 *
 * Restart works by remounting the animated element via a changing `key`.
 *
 * Under reduced motion (Req 5.6) the example renders in its final resting state:
 * full opacity, no transform, and no animation applied.
 */
function MotionExample({
  name,
  value,
  reducedMotion,
}: {
  name: string;
  value: string;
  reducedMotion: boolean;
}) {
  const [replayKey, setReplayKey] = useState(0);

  const isDuration = name.startsWith('--motion-duration');
  // Reference the token in the matching slot of the `animation` shorthand so the
  // primitive's own value is what's applied. The other slot uses a sensible
  // fixed token so the demo is perceptible.
  const animation = isDuration
    ? `riseSm var(${name}) var(--motion-ease-entrance) both`
    : `riseSm var(--motion-duration-slow) var(${name}) both`;

  // Final resting state: the `riseSm` keyframe ends at opacity 1 / translateY(0).
  const restingStyle: CSSProperties = {
    width: 'var(--space-7)',
    height: 'var(--space-7)',
    borderRadius: '12px',
    background: 'var(--gradient-gold)',
    boxShadow: 'var(--elev-gold)',
    opacity: 1,
  };

  const animatedStyle: CSSProperties = reducedMotion
    ? restingStyle
    : { ...restingStyle, animation };

  return (
    <Glass_Card padding={4} blur="md" data-motion-example={name}>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <TokenName>{name}</TokenName>
        <div
          style={{
            fontSize: 'var(--text-size-xs)',
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-1)',
          }}
        >
          {value}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          minHeight: 'var(--space-8)',
        }}
      >
        {/* The `key` change remounts this node, restarting the CSS animation. */}
        <div key={replayKey} style={animatedStyle} aria-hidden="true" />
        <Glass_Button
          size="sm"
          onClick={() => setReplayKey((k) => k + 1)}
          aria-label={`Replay ${name} animation`}
        >
          Replay
        </Glass_Button>
      </div>
    </Glass_Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The showcase
// ─────────────────────────────────────────────────────────────────────────

export function DesignSystemShowcase() {
  const reducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main
      style={{
        background: 'var(--bg-main)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
      }}
    >
      {/* Live Glass_Nav (one of the six components) */}
      <Glass_Nav blur="md" elevation={2}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-5)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 'var(--text-size-lg)' }}>
            Glass Design System
          </span>
          <Glass_Button
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </Glass_Button>
        </div>
      </Glass_Nav>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'var(--space-7) var(--space-5)',
        }}
      >
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <Glass_Chip>Internal · noindex</Glass_Chip>
          <h1
            style={{
              fontSize: 'var(--text-size-2xl)',
              fontWeight: 800,
              margin: 'var(--space-3) 0 var(--space-2)',
            }}
          >
            Premium Glass Design System
          </h1>
          <p
            style={{
              fontSize: 'var(--text-size-base)',
              color: 'var(--text-secondary)',
              maxWidth: '70ch',
            }}
          >
            Every glass component and design token, rendered live. Toggle the
            theme above to verify both light and dark values. Active theme:{' '}
            <strong>{theme}</strong>
            {reducedMotion ? ' · reduced motion active' : ''}.
          </p>
        </header>

        {/* ── Components ────────────────────────────────────────────────── */}
        <Section
          title="Glass components"
          description="The six reusable glass primitives, rendered live with their token-only surfaces."
        >
          <Grid min="260px">
            <Glass_Card padding={5} elevation={2}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                Glass_Card
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-size-sm)',
                  color: 'var(--text-secondary)',
                }}
              >
                A translucent container with token-driven blur, elevation, and
                padding.
              </p>
            </Glass_Card>

            <Glass_Card padding={5} elevation={1}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                Buttons
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                }}
              >
                <Glass_Button variant="primary">Primary</Glass_Button>
                <Glass_Button variant="secondary">Secondary</Glass_Button>
              </div>
            </Glass_Card>

            <Glass_Card padding={5} elevation={1}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                Chips
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                }}
              >
                <Glass_Chip>Static chip</Glass_Chip>
                <Glass_Chip
                  as="button"
                  onClick={() => undefined}
                  aria-label="Interactive chip example"
                >
                  Interactive chip
                </Glass_Chip>
              </div>
            </Glass_Card>

            <Glass_Stat value="20M+" label="Domains scanned" elevation={1} />

            <Glass_Card padding={5} elevation={2}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                Glass_Modal
              </h3>
              <Glass_Button
                variant="primary"
                onClick={() => setModalOpen(true)}
              >
                Open modal
              </Glass_Button>
            </Glass_Card>
          </Grid>

          <Glass_Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Glass_Modal"
          >
            <p
              style={{
                fontSize: 'var(--text-size-sm)',
                color: 'var(--text-secondary)',
              }}
            >
              A focus-trapped dialog rendered into a portal. Press Escape, click
              the overlay, or use the close button to dismiss.
            </p>
          </Glass_Modal>
        </Section>

        {/* ── Color tokens ──────────────────────────────────────────────── */}
        <Section
          title="Color tokens"
          description="Every color token with its dark and light values. Swatches resolve to the active theme."
        >
          <Grid min="200px">
            {colorTokens.map((token) => (
              <Glass_Card key={token.name} padding={3} blur="sm" elevation={1}>
                <div
                  aria-hidden="true"
                  style={{
                    height: 'var(--space-7)',
                    borderRadius: '10px',
                    background: `var(${token.name})`,
                    border: '1px solid var(--card-border)',
                    marginBottom: 'var(--space-2)',
                  }}
                />
                <TokenName>{token.name}</TokenName>
                <dl
                  style={{
                    fontSize: 'var(--text-size-xs)',
                    color: 'var(--text-tertiary)',
                    margin: 'var(--space-1) 0 0',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 'var(--space-2)',
                  }}
                >
                  <dt>dark</dt>
                  <dd style={{ margin: 0, wordBreak: 'break-all' }}>
                    {token.dark}
                  </dd>
                  <dt>light</dt>
                  <dd style={{ margin: 0, wordBreak: 'break-all' }}>
                    {token.light}
                  </dd>
                </dl>
              </Glass_Card>
            ))}
          </Grid>
        </Section>

        {/* ── Typography scale ──────────────────────────────────────────── */}
        <Section
          title="Typography scale"
          description="Each named type-size token rendered at its own size."
        >
          <Glass_Card padding={5} elevation={1}>
            {typographyTokens.map((token) => (
              <div
                key={token.name}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--section-divider)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: '12rem' }}>
                  <TokenName>{token.name}</TokenName>
                  <div
                    style={{
                      fontSize: 'var(--text-size-xs)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {token.value}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: `var(${token.name})`,
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  Ag
                </span>
              </div>
            ))}
          </Glass_Card>
        </Section>

        {/* ── Spacing scale ─────────────────────────────────────────────── */}
        <Section
          title="Spacing scale"
          description="Each named spacing token shown as a bar of that width."
        >
          <Glass_Card padding={5} elevation={1}>
            {spacingTokens.map((token) => (
              <div
                key={token.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-2) 0',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: '10rem' }}>
                  <TokenName>{token.name}</TokenName>
                  <div
                    style={{
                      fontSize: 'var(--text-size-xs)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {token.value}
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    height: 'var(--space-4)',
                    width: `var(${token.name})`,
                    background: 'var(--accent)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            ))}
          </Glass_Card>
        </Section>

        {/* ── Elevation tiers ───────────────────────────────────────────── */}
        <Section
          title="Elevation tiers"
          description="Each named elevation token applied as a box-shadow."
        >
          <Grid min="200px">
            {elevationTokens.map((token) => (
              <div
                key={token.name}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '16px',
                  padding: 'var(--space-5)',
                  boxShadow: `var(${token.name})`,
                }}
              >
                <TokenName>{token.name}</TokenName>
                <div
                  style={{
                    fontSize: 'var(--text-size-xs)',
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-1)',
                    wordBreak: 'break-all',
                  }}
                >
                  {token.value}
                </div>
              </div>
            ))}
          </Grid>
        </Section>

        {/* ── Motion primitives ─────────────────────────────────────────── */}
        <Section
          title="Motion primitives"
          description="Each motion token has a Replay trigger that runs an animation applying its duration or easing. Under reduced motion, examples render in their final resting state."
        >
          <Grid min="240px">
            {motionTokens.map((token) => (
              <MotionExample
                key={token.name}
                name={token.name}
                value={token.value}
                reducedMotion={reducedMotion}
              />
            ))}
          </Grid>
        </Section>
      </div>
    </main>
  );
}

export default DesignSystemShowcase;
