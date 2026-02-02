'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { Icons } from '@/components/ui/Icons';

export default function ExpiredPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    search: true,
    extensions: false,
    godaddy: false,
    premium: false,
  });

  const lifecycleStages = [
    {
      title: 'Active Domain',
      badge: 'Registration period',
      description: 'Domain is registered and active. Renew anytime before expiration.',
      number: '01',
    },
    {
      title: 'Grace Period',
      badge: '0-45 days',
      description: 'Domain expires but can still be renewed by the owner at regular price - no website or email will function.',
      number: '02',
    },
    {
      title: 'Redemption Period',
      badge: '30-90 days',
      description: 'Domain can only be recovered by the original owner at a higher redemption fee. No longer available for new registration.',
      number: '03',
    },
    {
      title: 'Pending Delete',
      badge: '5 days',
      description: 'Domain is queued for deletion. Still not available for re-registration. Cannot be recovered.',
      number: '04',
    },
    {
      title: 'Available',
      badge: 'After ~75-90 days',
      description: 'Domain is released and available for anyone to register on a first-come, first-served basis.',
      number: '05',
    },
  ];

  const infoCards = [
    {
      title: 'What is an expired domain?',
      description: 'An expired domain is a previously registered domain name that the owner didn\'t renew. This can happen due to failed payments, forgotten renewals, or intentional abandonment. After going through grace and redemption periods, these domains become available for registration.',
    },
    {
      title: 'Why consider expired domains?',
      description: 'Expired domains may have existing backlinks, search engine history, or memorable names. Understanding these characteristics helps you evaluate whether a domain fits your needs and goals.',
    },
    {
      title: 'Research before registering',
      description: 'Before registering an expired domain, research its history using archive tools and backlink checkers. Verify it doesn\'t have penalties or trademark issues. Understanding the domain\'s past helps you make informed decisions.',
    },
    {
      title: 'How our search works',
      description: 'Our tool collects millions of expiring and newly available domains. AI-powered filters help you find relevant expired domains based on keywords, extensions, and other criteria you specify.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageBackground variant="default" />
      
      <Navigation activeTool="expired" />

      {/* Main Content */}
      <main className="relative pt-32 pb-24">
        {/* Hero Section */}
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
              Expired Domains
            </h1>
            <p className="text-xl text-white/50 max-w-2xl mx-auto mb-16 leading-relaxed">
              Search expired domains with AI-powered tools. Explore our comprehensive index of expiring and recently expired domain names.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-black/40 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-2 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-3 px-5 py-4 bg-white/[0.02] rounded-xl">
                  <Icons.Search className="w-5 h-5 text-white/40 shrink-0" />
                  <input
                    type="text"
                    placeholder="Start typing here..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-base"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
                    >
                      <Icons.X className="w-4 h-4 text-white/40" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 px-2 pt-2 flex-wrap">
                  {Object.entries(activeFilters).map(([key, active]) => (
                    <button
                      key={key}
                      onClick={() => setActiveFilters(prev => ({ ...prev, [key]: !active }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                        active
                          ? 'bg-white/[0.1] text-white border border-white/[0.15]'
                          : 'bg-transparent text-white/50 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white/70'
                      }`}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      <span className="capitalize">{key}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Domain Lifecycle Section */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
                Understanding the Expired Domain Lifecycle
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                When a domain expires, it goes through several stages before becoming available for registration. The entire process typically takes 75-90 days.
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {lifecycleStages.map((stage, index) => (
                <div key={index} className="group">
                  <div className="relative bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300">
                    <div className="flex items-start gap-6">
                      {/* Number */}
                      <div className="shrink-0">
                        <div className="text-5xl font-black text-white/[0.06] group-hover:text-white/[0.1] transition-colors">
                          {stage.number}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.06] text-white/70 border border-white/[0.08] whitespace-nowrap">
                            {stage.badge}
                          </span>
                        </div>
                        <p className="text-white/50 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className="px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 hover:border-white/[0.12] transition-all duration-300 group"
                >
                  <h3 className="text-lg font-bold mb-3 text-white group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed text-[15px]">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
