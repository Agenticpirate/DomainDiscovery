'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { useTheme } from '@/contexts/ThemeContext';

export default function LearnPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const guides = [
    {
      title: 'How to Choose the Perfect Domain Name',
      description: 'Learn the key factors that make a domain memorable, brandable, and SEO-friendly.',
      href: '/learn/choosing-domain',
      icon: '📚',
    },
    {
      title: 'Understanding Domain Extensions (TLDs)',
      description: 'Explore the differences between .com, .io, .ai, and hundreds of other extensions.',
      href: '/learn/domain-extensions',
      icon: '🌐',
    },
    {
      title: 'Domain Valuation Guide',
      description: 'Discover how domain names are valued and what makes some worth millions.',
      href: '/learn/domain-valuation',
      icon: '💰',
    },
    {
      title: 'Protecting Your Brand Online',
      description: 'Best practices for securing your brand across multiple domain extensions.',
      href: '/learn/brand-protection',
      icon: '🛡️',
    },
    {
      title: 'Domain Investment Strategies',
      description: 'Learn about domain flipping, portfolio management, and market trends.',
      href: '/learn/domain-investing',
      icon: '📈',
    },
    {
      title: 'Technical DNS Guide',
      description: 'Understanding DNS records, nameservers, and domain configuration.',
      href: '/learn/dns-guide',
      icon: '⚙️',
    },
  ];

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      
      <Navigation activeTool="learn" />

      {/* Main Content */}
      <main className="relative pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="px-3 sm:px-6 pb-5 sm:pb-7">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-3 sm:mb-4">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Learn About Domains
              </span>
            </h1>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto`}>
              Master the art of domain selection, valuation, and management with our comprehensive guides.
            </p>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="px-3 sm:px-6 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {guides.map((guide) => (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className={`group block p-3.5 sm:p-4 ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'} border rounded-2xl transition-all`}
                >
                  <div className="text-3xl sm:text-4xl mb-2.5 sm:mb-3">{guide.icon}</div>
                  <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'} mb-2 group-hover:${isLight ? 'text-blue-600' : 'text-slate-300'} transition-colors`}>
                    {guide.title}
                  </h3>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} leading-relaxed`}>
                    {guide.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="px-3 sm:px-6 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className={`p-4 sm:p-6 ${isLight ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60' : 'bg-gradient-to-br from-slate-400/10 to-transparent border-slate-400/20'} border rounded-2xl`}>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Ready to find your domain?</h2>
              <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} text-sm sm:text-base mb-5 sm:mb-6`}>
                Use our powerful tools to search, generate, and compare domain names.
              </p>
              <div className="flex flex-wrap gap-2.5 sm:gap-4">
                <Link
                  href="/"
                  className={`px-4 py-2.5 sm:px-6 sm:py-3 ${isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-white/90'} font-semibold rounded-lg transition-colors`}
                >
                  Search Domains
                </Link>
                <Link
                  href="/bulk-search"
                  className={`px-4 py-2.5 sm:px-6 sm:py-3 ${isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-white/10 text-white hover:bg-white/20'} font-semibold rounded-lg transition-colors`}
                >
                  Bulk Search
                </Link>
                <Link
                  href="/generator"
                  className={`px-4 py-2.5 sm:px-6 sm:py-3 ${isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-white/10 text-white hover:bg-white/20'} font-semibold rounded-lg transition-colors`}
                >
                  Generate Ideas
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
