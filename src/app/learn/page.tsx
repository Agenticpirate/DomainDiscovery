'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { useTheme } from '@/contexts/ThemeContext';
import { GlowingEffect } from '@/components/ui/glowing-effect';

export default function LearnPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const guides = [
    {
      title: 'How to Choose the Perfect Domain Name',
      description: 'Learn the radio test, brandability principles, and SEO factors that separate great domains from forgettable ones. Covers length, spelling, trademarks, and long-term strategy.',
      href: '/learn/choosing-domain',
      icon: '📚',
      readTime: '8 min read',
      topics: ['Branding', 'SEO', 'Strategy'],
    },
    {
      title: 'Understanding Domain Extensions (TLDs)',
      description: 'Compare .com, .io, .ai, .app, and 1,600+ other TLDs. Understand how extensions affect SEO, user trust, pricing, and geographic targeting for your website.',
      href: '/learn/domain-extensions',
      icon: '🌐',
      readTime: '10 min read',
      topics: ['TLDs', 'SEO', 'Pricing'],
    },
    {
      title: 'Domain Valuation Guide',
      description: 'Discover what makes domains worth $100 or $1 million. Covers length, keywords, brandability, search volume, comparable sales data, and professional appraisal methods.',
      href: '/learn/domain-valuation',
      icon: '💰',
      readTime: '9 min read',
      topics: ['Valuation', 'Market', 'Investing'],
    },
    {
      title: 'Protecting Your Brand Online',
      description: 'Secure your brand across extensions, enable WHOIS privacy, configure domain locks, set up DNSSEC, and monitor for trademark infringement and cybersquatting.',
      href: '/learn/brand-protection',
      icon: '🛡️',
      readTime: '7 min read',
      topics: ['Security', 'Trademarks', 'Privacy'],
    },
    {
      title: 'Domain Investment Strategies',
      description: 'Build a profitable domain portfolio with strategies for finding undervalued names, managing renewals, pricing inventory, and selling through multiple channels.',
      href: '/learn/domain-investing',
      icon: '📈',
      readTime: '11 min read',
      topics: ['Investing', 'Portfolio', 'Sales'],
    },
    {
      title: 'Technical DNS Guide',
      description: 'Master DNS records (A, AAAA, CNAME, MX, TXT), nameserver configuration, propagation timing, SSL setup, email authentication, and troubleshooting common issues.',
      href: '/learn/dns-guide',
      icon: '⚙️',
      readTime: '12 min read',
      topics: ['DNS', 'Technical', 'Configuration'],
    },
  ];

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool="learn" />

      <main className="relative pt-[4.75rem] sm:pt-24">
        {/* Hero */}
        <section className="px-3 sm:px-6 pb-4 sm:pb-7">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-2 sm:mb-4">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Learn About Domains
              </span>
            </h1>
            <p className={`text-xs sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto leading-relaxed`}>
              Comprehensive guides on domain selection, valuation, security, DNS configuration, and investment strategies. Written for beginners and professionals alike.
            </p>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="px-3 sm:px-6 pb-8 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {guides.map((guide) => (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className={`group relative block p-3 sm:p-4 ${isLight ? 'bg-white border-transparent hover:border-blue-300 hover:shadow-lg shadow-sm border' : 'bg-white/[0.02] border-transparent hover:border-white/20 hover:bg-white/[0.04] border'} rounded-xl sm:rounded-2xl transition-all`}
                >
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant={isLight ? "default" : "white"} />
                  <div className="relative z-10 w-full h-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl sm:text-3xl">{guide.icon}</span>
                      <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{guide.readTime}</span>
                    </div>
                    <h3 className={`text-sm sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'} mb-1.5 leading-snug`}>
                      {guide.title}
                    </h3>
                    <p className={`text-[11px] sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} leading-relaxed mb-2.5`}>
                      {guide.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {guide.topics.map((topic) => (
                        <span
                          key={topic}
                          className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded ${
                            isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/[0.06] text-white/40'
                          }`}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-3 sm:px-6 pb-8 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className={`p-3.5 sm:p-6 ${isLight ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60' : 'bg-gradient-to-br from-slate-400/10 to-transparent border-slate-400/20'} border rounded-xl sm:rounded-2xl`}>
              <h2 className={`text-base sm:text-2xl font-bold mb-1.5 sm:mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Ready to find your domain?</h2>
              <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} text-xs sm:text-base mb-3 sm:mb-6`}>
                Use our tools to search, generate, and compare domain names across 1,600+ extensions.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <Link
                  href="/"
                  className={`px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm ${isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-white/90'} font-semibold rounded-lg transition-colors`}
                >
                  Search Domains
                </Link>
                <Link
                  href="/bulk-search"
                  className={`px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm ${isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-white/10 text-white hover:bg-white/20'} font-semibold rounded-lg transition-colors`}
                >
                  Bulk Search
                </Link>
                <Link
                  href="/generator"
                  className={`px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm ${isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-white/10 text-white hover:bg-white/20'} font-semibold rounded-lg transition-colors`}
                >
                  AI Generator
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
