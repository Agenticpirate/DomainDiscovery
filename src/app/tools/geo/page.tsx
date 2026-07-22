'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { GeoDomainGenerator } from '@/components/geo/GeoDomainGenerator';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { useTheme } from '@/contexts/ThemeContext';

const FEATURES = [
  { label: 'Geo domain lists', hint: 'City + country' },
  { label: 'Official flags', hint: 'ISO countries' },
  { label: 'Populations in millions', hint: 'City proper · WPR 2026' },
  { label: 'Live availability', hint: 'Free · premium · taken' },
  { label: 'CSV export', hint: 'Local SEO inventory' },
];

const STEPS = [
  { n: '01', title: 'Local niche keyword', body: 'plumber, dentist, realtor…' },
  { n: '02', title: 'Pick cities or countries', body: 'By country, mega cities, continents' },
  { n: '03', title: 'Pattern & TLDs', body: 'Order, hyphens, .com / geo TLDs' },
  { n: '04', title: 'Generate & live-check', body: 'Available vs registered inventory' },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function GeoPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: easeOut },
        };

  const staggerParent = reduceMotion
    ? {}
    : {
        initial: 'hidden',
        animate: 'show',
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
        },
      };

  const staggerItem = reduceMotion
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 10 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: easeOut },
          },
        },
      };

  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      <Navigation activeTool="geo" />

      <main className="relative pt-20 sm:pt-24">
        <section className="px-4 sm:px-6 pb-5 sm:pb-7">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp(0)}>
              <Breadcrumb
                items={[
                  { label: 'Tools', href: '/' },
                  { label: 'Geo Domain Generator' },
                ]}
              />
            </motion.div>

            <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end">
              <div className="min-w-0">
                <motion.p
                  {...fadeUp(0.05)}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                    isLight ? 'text-slate-400' : 'text-white/35'
                  }`}
                >
                  Local SEO · City & country domains
                </motion.p>

                <motion.h1
                  {...fadeUp(0.1)}
                  className={`mt-2 text-3xl font-black tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.08] ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Geo domain generator
                  <br className="hidden sm:block" />
                  <span className="sm:mt-1 sm:inline-block"> for local SEO campaigns</span>
                </motion.h1>

                <motion.p
                  {...fadeUp(0.16)}
                  className={`mt-3 max-w-xl text-sm leading-relaxed sm:text-[15px] ${
                    isLight ? 'text-slate-500' : 'text-white/50'
                  }`}
                >
                  Build city- and country-level domain lists for any niche (plumber, dentist, realtor, and more).
                  Populations display in millions; city figures use city-proper counts (World Population Review 2026).
                  Live-check free, premium, and registered names — then export CSV for your local SEO inventory.
                </motion.p>

                <motion.div
                  {...staggerParent}
                  className="mt-5 flex flex-wrap gap-2"
                >
                  {FEATURES.map((f) => (
                    <motion.div
                      key={f.label}
                      {...staggerItem}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { y: -2, transition: { duration: 0.2 } }
                      }
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-shadow ${
                        isLight
                          ? 'border-slate-200/90 bg-white/80 text-slate-700 shadow-sm hover:shadow-md'
                          : 'border-white/[0.08] bg-white/[0.04] text-white/70 hover:border-white/15 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                        } ${reduceMotion ? '' : 'animate-pulse-soft'}`}
                      />
                      {f.label}
                      <span
                        className={
                          isLight ? 'font-medium text-slate-400' : 'font-medium text-white/35'
                        }
                      >
                        {f.hint}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                {...fadeUp(0.18)}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -3, transition: { duration: 0.25, ease: easeOut } }
                }
                className={`rounded-2xl border p-4 sm:p-5 ${
                  isLight
                    ? 'border-slate-200/90 bg-white/70 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] backdrop-blur-sm'
                    : 'border-white/[0.08] bg-white/[0.03] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.7)]'
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                    isLight ? 'text-slate-400' : 'text-white/35'
                  }`}
                >
                  How it works
                </div>
                <ol className="mt-3 space-y-0">
                  {STEPS.map((s, i) => (
                    <motion.li
                      key={s.n}
                      initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: reduceMotion ? 0 : 0.28 + i * 0.07,
                        ease: easeOut,
                      }}
                      className={`flex items-start gap-3 rounded-xl px-2 py-2 transition-colors ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 font-mono text-[11px] font-bold tabular-nums ${
                          isLight ? 'text-slate-300' : 'text-white/25'
                        }`}
                      >
                        {s.n}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-bold ${
                            isLight ? 'text-slate-800' : 'text-white/90'
                          }`}
                        >
                          {s.title}
                        </div>
                        <div
                          className={`text-[12px] ${
                            isLight ? 'text-slate-500' : 'text-white/40'
                          }`}
                        >
                          {s.body}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            </div>
          </div>
        </section>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.32, ease: easeOut }}
          className="px-4 sm:px-6 pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-6xl">
            <GeoDomainGenerator />
          </div>
        </motion.section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.geo} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.geo} />
      </main>

      <Footer />
    </div>
  );
}
