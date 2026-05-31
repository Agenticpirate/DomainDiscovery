'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/* ── Shared section heading (consistent alignment across the page) ── */
interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, subtitle, align = 'center' }) => (
  <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'} mb-8 sm:mb-12`}>
    {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
    <h2 className="heading-1 mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    {subtitle && (
      <p className="text-sm sm:text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {subtitle}
      </p>
    )}
  </div>
);

/* ── Scroll-reveal wrapper ── */
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export const HomePageContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted ? theme === 'light' : false;

  /* ── Primary value props (3-up feature row) ── */
  const features = [
    {
      icon: <Icons.Search />,
      title: 'Search every extension at once',
      description: 'Type once and see live availability across .com, .ai, .io and 1,600+ more. No refreshes, no waiting.',
      href: '/',
      cta: 'Start searching',
      badge: 'Real-time',
    },
    {
      icon: <Icons.Magic />,
      title: 'Generate names with AI',
      description: 'Turn a keyword into dozens of brandable, available options in seconds, ranked by quality.',
      href: '/generator',
      cta: 'Try the generator',
      badge: 'AI-powered',
    },
    {
      icon: <Icons.Dollar />,
      title: 'Always get the best price',
      description: 'Compare registrar pricing side by side so you never overpay on registration or renewal.',
      href: '/tools/compare',
      cta: 'Compare prices',
      badge: 'Save more',
    },
  ];

  /* ── Tool directory ── */
  const tools = [
    { icon: <Icons.Search />, title: 'Instant Search', description: 'Live availability as you type across the core extensions.', href: '/', eyebrow: 'Featured', badge: 'Real-time', featured: true },
    { icon: <Icons.Sparkles />, title: 'AI Generator', description: 'Brandable name ideas, checked for availability instantly.', href: '/generator', eyebrow: 'Featured', badge: 'AI', featured: true },
    { icon: <Icons.Layers />, title: 'Bulk Search', description: 'Check up to 1,000 domains in a single pass.', href: '/bulk-search', eyebrow: '1,000 at once' },
    { icon: <Icons.Globe />, title: 'Extensions', description: 'Browse 1,600+ TLDs by category and purpose.', href: '/domain-extensions', eyebrow: '1,600+ TLDs' },
    { icon: <Icons.Dollar />, title: 'Price Comparison', description: 'Registrar pricing side by side, no markups.', href: '/tools/compare' },
    { icon: <Icons.Globe />, title: 'Geo Finder', description: 'Location-aware names for local brands.', href: '/tools/geo' },
  ];

  /* ── Why-us value grid ── */
  const benefits = [
    { icon: <Icons.Magic />, title: 'Instant results', description: 'Availability updates as you type, with zero page reloads.' },
    { icon: <Icons.Sparkles />, title: 'AI suggestions', description: 'Smart, semantic ideas take you from blank page to shortlist.' },
    { icon: <Icons.Dollar />, title: 'Transparent pricing', description: 'Compare registrars side by side and register at the lowest price.' },
    { icon: <Icons.Check />, title: 'Private by default', description: 'Your searches stay yours. We never sell or expose your queries.' },
    { icon: <Icons.Globe />, title: '1,600+ extensions', description: 'From .com to niche TLDs, the coverage stays comprehensive.' },
    { icon: <Icons.Layers />, title: 'Built to scale', description: 'The same fast workflow on desktop, tablet, and mobile.' },
  ];

  const faqs = [
    { question: 'Is DomainDiscovery free?', answer: 'Yes, completely. Search unlimited domains, check 1,600+ extensions, use the AI generator, and compare prices at no cost. You only pay the registrar when you register a domain you love.' },
    { question: 'How do I check if a domain is available?', answer: 'Type any name in the search bar. We check availability in real time across 1,600+ extensions and surface available alternatives instantly — no sign-up required.' },
    { question: 'What if my domain is already taken?', answer: 'You have options: try a different extension (.io, .co, .ai), use the AI generator for brandable variations, or check the premium market for similar names that may be for sale.' },
    { question: 'Which extension should I choose?', answer: '.com is still the most trusted, but .ai, .io, .tech, and industry-specific TLDs can be a smart, available fit. Our extensions explorer helps you compare options by purpose and price.' },
    { question: 'How do I register a domain?', answer: 'Once you find an available name, choose a registrar from the price comparison and register in one click. We surface pricing from GoDaddy, Namecheap, Porkbun, and more so you get the best deal.' },
    { question: 'How fast are results?', answer: 'Results appear as you type, typically in under a second. Repeat lookups are cached for near-instant feedback across all 1,600+ extensions.' },
  ];

  const popularExtensions = [
    { ext: '.com', desc: 'Most trusted' },
    { ext: '.ai', desc: 'AI & tech' },
    { ext: '.io', desc: 'Startups' },
    { ext: '.co', desc: 'Companies' },
    { ext: '.net', desc: 'Networks' },
    { ext: '.org', desc: 'Nonprofits' },
    { ext: '.app', desc: 'Apps' },
    { ext: '.xyz', desc: 'Creative' },
  ];

  return (
    <div className="pt-4 sm:pt-10 pb-6 sm:pb-16">
      {/* ── Primary value props ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28">
        <SectionHeading
          eyebrow="Why founders choose us"
          title="The fastest way to find a domain you'll love"
          subtitle="Everything you need to search, compare, and register — built for speed and clarity from the first keystroke."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08}>
              <Link href={feature.href} className="premium-card group relative block h-full p-6 sm:p-7">
                <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant={isLight ? 'default' : 'white'} />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: 'var(--accent-tint)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}
                    >
                      {feature.icon}
                    </span>
                    <span className="accent-chip">{feature.badge}</span>
                  </div>
                  <h3 className="heading-2 mb-2 text-[18px] sm:text-[20px]" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                  <p className="mb-5 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: 'var(--accent-text)' }}>
                    {feature.cta}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Popular extensions ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28">
        <SectionHeading
          eyebrow="1,600+ extensions"
          title="Pick the perfect ending"
          subtitle="From the classics to niche TLDs built for your industry — all checked in real time."
        />
        <Reveal>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {popularExtensions.map((item) => (
              <Link
                key={item.ext}
                href="/domain-extensions"
                className="premium-card group relative flex flex-col items-center justify-center px-2 py-4 sm:py-5 text-center"
              >
                <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant={isLight ? 'default' : 'white'} />
                <div className="relative z-10">
                  <div className="text-[15px] sm:text-2xl font-black mb-0.5 transition-colors group-hover:text-[var(--accent-text)]" style={{ color: 'var(--text-primary)' }}>{item.ext}</div>
                  <div className="text-[9px] sm:text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
        <div className="mt-7 text-center">
          <Link href="/domain-extensions" className="btn-secondary inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px]">
            View all 1,600+ extensions
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      {/* ── Tools ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28">
        <SectionHeading
          eyebrow="The complete toolkit"
          title="Every tool you need in one place"
          subtitle="A full suite for finding, evaluating, and registering domains — no account required."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {tools.filter((t) => t.featured).map((tool, i) => (
            <Reveal key={tool.title} delay={i * 0.08}>
              <Link href={tool.href} className="premium-card group relative block p-6 sm:p-7">
                <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant={isLight ? 'default' : 'white'} />
                <div className="relative z-10 flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--accent-tint)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}>{tool.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="eyebrow text-[10px]">{tool.eyebrow}</span>
                      {tool.badge && <span className="accent-chip py-0.5">{tool.badge}</span>}
                    </div>
                    <h3 className="text-[17px] font-black leading-tight" style={{ color: 'var(--text-primary)' }}>{tool.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{tool.description}</p>
                  </div>
                  <svg className="h-5 w-5 shrink-0 transition-all duration-300 group-hover:translate-x-1" style={{ color: 'var(--accent-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.filter((t) => !t.featured).map((tool, i) => (
            <Reveal key={tool.title} delay={i * 0.06}>
              <Link href={tool.href} className="premium-card group relative block p-5 h-full">
                <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant={isLight ? 'default' : 'white'} />
                <div className="relative z-10">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--icon-bg)', color: 'var(--icon-color)', border: '1px solid var(--card-border)' }}>{tool.icon}</span>
                  <h3 className="text-[14px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{tool.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{tool.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Why DomainDiscovery ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28">
        <SectionHeading
          eyebrow="Built different"
          title="Why founders stick with DomainDiscovery"
          subtitle="Speed, transparency, and privacy — the things that matter when you're naming what's next."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {benefits.map((benefit, i) => (
            <Reveal key={benefit.title} delay={(i % 3) * 0.08}>
              <div className="premium-card relative h-full p-6">
                <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant={isLight ? 'default' : 'white'} />
                <div className="relative z-10 flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--accent-tint)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}>{benefit.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold leading-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>{benefit.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{benefit.description}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28">
        <SectionHeading
          eyebrow="Questions, answered"
          title="Frequently asked questions"
        />
        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const open = openFaq === index;
            return (
              <div
                key={index}
                className="premium-card overflow-hidden"
                style={{ borderColor: open ? 'var(--accent-border)' : undefined }}
              >
                <button
                  onClick={() => setOpenFaq(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <h3 className="text-[14px] sm:text-[15px] font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{faq.question}</h3>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      background: open ? 'var(--accent)' : 'var(--icon-bg)',
                      color: open ? 'var(--accent-contrast)' : 'var(--text-tertiary)',
                      transform: open ? 'rotate(180deg)' : 'none',
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-[13px] sm:text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16 text-center"
            style={{
              background: isLight
                ? 'linear-gradient(135deg, #ffffff, #f8fafc)'
                : 'linear-gradient(135deg, rgba(233,180,76,0.08), rgba(255,255,255,0.02))',
              border: '1px solid var(--accent-border)',
              boxShadow: 'var(--elev-gold)',
            }}
          >
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full blur-[100px]"
              style={{ background: 'var(--accent-glow)' }}
            />
            <div className="relative z-10">
              <div className="eyebrow mb-4">Start in seconds</div>
              <h2 className="display-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                Your perfect domain is one search away
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-[15px] sm:text-[17px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Free to use, no account needed, real-time results across 1,600+ extensions. Find it before someone else does.
              </p>
              <a href="#top" className="btn-accent text-[15px]">
                <Icons.Search />
                Search domains now
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
