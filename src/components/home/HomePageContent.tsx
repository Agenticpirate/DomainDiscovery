'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { GlowingEffect } from '@/components/ui/glowing-effect';

export const HomePageContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted ? theme === 'light' : false;

  const features = [
    {
      icon: <Icons.Search />,
      title: 'Search available domain names',
      description: 'Our tool instantly shows you every domain and extension combination in real-time as you type. Explore domain availability, popularity, and more so you can have full confidence in your domain choice.',
      href: '/',
      cta: 'Try search',
      badge: null
    },
    {
      icon: <Icons.Layers />,
      title: 'Check 1,600+ domain extensions',
      description: 'Our domain search tool instantly suggests the most popular, relevant, and cheapest domain extensions (.com, .org, .ai) to choose for your website URL.',
      href: '/domain-extensions',
      cta: 'Browse extensions',
      badge: '1,600+ TLDs'
    },
    {
      icon: <Icons.Magic />,
      title: 'AI domain name generator',
      description: 'Our AI domain generator searches through millions of available domains to suggest the most creative, shortest, and unique names. Instantly go from idea to buying the domain.',
      href: '/generator',
      cta: 'Try generator',
      badge: 'AI-Powered'
    }
  ];

  const faqs = [
    { question: 'What is a domain name?', answer: 'A domain name is the address you type into your web browser to visit a website, like "domaindiscovery.com." It identifies a website on the internet, making it easy for people to find and remember. Like your home address helps people find where you live, a domain name helps people find your website. Our domain search tool helps you find available domains instantly.' },
    { question: 'Why use DomainDiscovery?', answer: 'Our free domain name search delivers lightning-fast results with instant availability checking. As you type, our tool shows available domains in real-time using powerful AI and advanced search infrastructure. With every query, you see available extensions, suggested similar domains, and premium domains to boost your website performance. You also gain access to features including bulk search, domain generator, WHOIS lookup, price comparison, and more.' },
    { question: 'What if the domain name I want is already taken?', answer: 'If someone already owns the domain name you want, you still have several options: (1) Try a different extension - if someone owns "example.com," check if "example.net," "example.org," or other TLDs remain available. See our full list of 1,600+ available extensions. (2) Create a variation - add a word or change the order of words to create a variation of your desired domain name. Our AI Domain Generator suggests similar available domains. (3) Check premium domains - our premium domain search tool helps you find similar, high-performing domains that may be available for purchase.' },
    { question: 'How do I check if a domain name is available?', answer: 'Use our domain checker to see if a domain name is available. Type the name you want in the search bar above, and you\'ll receive instant results that check domains across different extensions (like ".com" or ".net") and provide alternative suggestions. Our tool checks availability in real-time across 1,600+ TLD extensions.' },
    { question: 'What are extensions and TLDs, and which one should I choose?', answer: 'A TLD (Top-Level Domain) represents the part of a domain name that comes after the dot, like ".com" or ".org." The .com extension ranks as the most common and trusted, but many others, such as ".net," ".ai," ".io," or industry-specific extensions like ".tech" or ".shop," offer great alternatives. Our domain extension tool helps you explore different TLD options and find the perfect match for your website.' },
    { question: 'How do I buy domains?', answer: 'Once you find an available domain using our domain search tool, select a registrar to purchase it. We show you pricing from trusted registrars including GoDaddy, Namecheap, Google Domains, and more, so you can buy with confidence at the best price. After buying, you\'ll connect the domain to your website or hosting provider.' },
    { question: 'How fast is DomainDiscovery?', answer: 'DomainDiscovery delivers instant search results as you type, with response times optimized for real-time feedback. Our advanced infrastructure and AI-powered search engine ensure you get hundreds of domain suggestions in milliseconds, making it one of the fastest domain search tools available.' },
    { question: 'Is DomainDiscovery free to use?', answer: 'Yes! DomainDiscovery is completely free to use. You can search unlimited domains, check availability across 1,600+ extensions, use our AI domain generator, compare prices, and access all our tools at no cost. You only pay when you\'re ready to register a domain through your chosen registrar.' }
  ];

  const tools = [
    { icon: <Icons.Search />, title: 'Instant Domain Search', description: 'Live results as you type across the core extensions.', href: '/', eyebrow: 'Featured', badge: 'Real-time', featured: true },
    { icon: <Icons.Sparkles />, title: 'AI Domain Generator', description: 'Generate brandable names and check them instantly.', href: '/generator', eyebrow: 'Featured', badge: 'AI', featured: true },
    { icon: <Icons.Layers />, title: 'Bulk Domain Search', description: 'Run up to 1,000 domains in one pass.', href: '/bulk-search', eyebrow: '1,000 at once' },
    { icon: <Icons.Globe />, title: 'Domain Extensions', description: 'Browse the most useful TLDs and niche extensions.', href: '/domain-extensions', eyebrow: '1,600+ TLDs' },
    { icon: <Icons.Dollar />, title: 'Price Comparison', description: 'Compare standard registrar pricing side by side.', href: '/tools/compare' },
    { icon: <Icons.Globe />, title: 'Geo Domain Finder', description: 'Surface location-aware names for local brands.', href: '/tools/geo' },
  ];

  const benefits = [
    { icon: <Icons.Magic />, title: 'Lightning Fast Search', description: 'Results update as you type, without waiting on page refreshes.', stat: 'Instant' },
    { icon: <Icons.Sparkles />, title: 'AI-Powered Suggestions', description: 'Semantic suggestions help you move from idea to shortlist faster.', stat: 'AI' },
    { icon: <Icons.Dollar />, title: 'Smarter Price Visibility', description: 'Registrar pricing stays side by side so cost is easier to compare.', stat: 'Pricing' },
    { icon: <Icons.Check />, title: 'Private By Default', description: 'Searches stay private with no query history sold or exposed.', stat: 'Private' },
    { icon: <Icons.Globe />, title: '1,600+ Extensions', description: 'From .com to niche TLDs, the extension coverage stays broad.', stat: 'Coverage' },
    { icon: <Icons.Layers />, title: 'Works Everywhere', description: 'The same workflow stays usable on desktop, tablet, and mobile.', stat: 'Responsive' }
  ];

  const cardClasses = `group relative h-full rounded-2xl transition-all duration-300 ${
    isLight
      ? 'bg-white border hover:border-slate-300 hover:shadow-lg shadow-sm border-transparent'
      : 'bg-white/[0.02] border hover:border-white/20 hover:bg-white/[0.04] border-transparent'
  }`;

  const smallCardClasses = `group relative h-full rounded-2xl transition-colors duration-200 ${
    isLight
      ? 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm'
      : 'bg-[#0f1012] border border-white/8 hover:border-white/12'
  }`;

  const iconBoxClasses = `inline-flex items-center justify-center rounded-2xl border transition-colors ${
    isLight
      ? 'border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.94))] text-slate-700 shadow-sm'
      : 'border-white/10 bg-[#17191d] text-white/85'
  }`;

  const smallIconBoxClasses = `inline-flex shrink-0 items-center justify-center rounded-2xl border transition-colors ${
    isLight
      ? 'border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.94))] text-slate-700 shadow-sm'
      : 'border-white/10 bg-[#17191d] text-white/85'
  }`;

  const featuredTools = tools.filter((tool) => tool.featured);
  const standardTools = tools.filter((tool) => !tool.featured);

  return (
    <div className="space-y-2.5 sm:space-y-7 py-0.5 sm:py-5">
      <section className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-1.5 sm:mb-5">
          <h2 className="text-base sm:text-4xl md:text-[2.8rem] font-black mb-0.5 sm:mb-3 leading-tight">
            The fastest domain search tool
          </h2>
          <p className="hidden sm:block text-sm sm:text-[15px] leading-relaxed max-w-[44rem] mx-auto" style={{ color: 'var(--text-secondary)' }}>
            DomainDiscovery is the ultimate domain search engine to find, buy, and register available 
            domain names and extensions (TLDs).
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href} className={`${cardClasses} p-2 sm:p-4 block`}>
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant={isLight ? "default" : "white"} />
              <div className="relative z-10 flex items-center gap-2 sm:flex-col h-full">
                <div className="flex items-center justify-between gap-1 shrink-0 sm:w-full sm:mb-1">
                  <div className={`${iconBoxClasses} h-7 w-7 sm:h-11 sm:w-11 shrink-0`}>
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <span className={`hidden sm:inline shrink-0 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-semibold rounded-full border ${
                      isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/[0.04] text-white/75'
                    }`}>{feature.badge}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 flex flex-col h-full">
                  <h3 className="text-[11px] sm:text-[17px] font-bold leading-tight">
                    {feature.title}
                  </h3>
                  <p className="hidden sm:block text-[13px] leading-relaxed mt-1 mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    {feature.description}
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold transition-colors mt-auto" style={{ color: 'var(--text-secondary)' }}>
                    {feature.cta}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-3 sm:px-6 pt-10 sm:pt-0">
        <div className="text-center mb-2 sm:mb-4.5">
          <h2 className="text-base sm:text-4xl font-black mb-0.5 sm:mb-2">Popular Extensions</h2>
          <p style={{ color: 'var(--text-tertiary)' }} className="hidden sm:block text-[11px] sm:text-base max-w-xl mx-auto">
            Choose from 1,600+ extensions. Find the perfect TLD.
          </p>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-1 sm:gap-2">
          {[
            { ext: '.com', desc: 'Popular' },
            { ext: '.ai', desc: 'AI & Tech' },
            { ext: '.io', desc: 'Startups' },
            { ext: '.co', desc: 'Companies' },
            { ext: '.net', desc: 'Networks' },
            { ext: '.org', desc: 'Orgs' },
            { ext: '.app', desc: 'Apps' },
            { ext: '.xyz', desc: 'Creative' },
          ].map((item, i) => (
            <Link
              key={i}
              href="/domain-extensions"
              className={`group relative px-1 sm:px-4 py-1.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all text-center block ${
                isLight
                  ? 'bg-white border-transparent hover:border-slate-300 shadow-sm'
                : 'bg-white/[0.02] border-transparent hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant={isLight ? "default" : "white"} />
              <div className="relative z-10 w-full h-full">
                <div className="text-[11px] sm:text-2xl font-black mb-0" style={{ color: 'var(--text-primary)' }}>{item.ext}</div>
                <div className="text-[8px] sm:text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-1.5 sm:mt-4">
          <Link
            href="/domain-extensions"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            View all 1,600+ extensions
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-3 sm:px-6 pt-12 sm:pt-0">
        <div className="text-center mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-4xl font-black mb-1 sm:mb-2">
            Powerful Domain Tools
          </h2>
          <p style={{ color: 'var(--text-tertiary)' }} className="text-[11px] sm:text-base max-w-xl mx-auto">
            Everything you need to find and register the perfect domain
          </p>
        </div>

        {/* Featured tools row — equal-width 2-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
          {featuredTools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className={`${smallCardClasses} p-3 sm:p-4 transition-transform duration-200 hover:-translate-y-0.5 block`}
            >
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant={isLight ? "default" : "white"} />
              <div className="relative z-10 flex items-center gap-3">
                <div className={`${iconBoxClasses} h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0`}>{tool.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className={`flex items-center gap-1.5 mb-0.5`}>
                    <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{tool.eyebrow}</span>
                    {tool.badge && <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-white/[0.08] text-white/50 border border-white/10'}`}>{tool.badge}</span>}
                  </div>
                  <h3 className="text-[13px] sm:text-[16px] font-black leading-tight">{tool.title}</h3>
                  <p className="mt-0.5 text-[11px] sm:text-[13px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{tool.description}</p>
                </div>
                <svg className={`w-4 h-4 shrink-0 transition-colors ${isLight ? 'text-slate-300 group-hover:text-slate-500' : 'text-white/20 group-hover:text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Standard tools — even 2x2 grid on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {standardTools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className={`${smallCardClasses} p-2.5 sm:p-3.5 transition-transform duration-200 hover:-translate-y-0.5 block`}
            >
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant={isLight ? "default" : "white"} />
              <div className="relative z-10 flex items-center gap-2.5">
                <div className={`${smallIconBoxClasses} h-8 w-8 sm:h-9 sm:w-9 shrink-0`}>{tool.icon}</div>
                <h3 className="text-[11px] sm:text-sm font-bold leading-tight min-w-0 flex-1">{tool.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-1.5 sm:mb-4.5">
          <h2 className="text-base sm:text-4xl font-black mb-0 sm:mb-2">Why DomainDiscovery?</h2>
          <p style={{ color: 'var(--text-tertiary)' }} className="hidden sm:block text-base max-w-xl mx-auto">
            Faster, smarter domain search built for founders.
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-1 sm:gap-2.5">
          {benefits.map((benefit) => (
            <div key={benefit.title} className={`${smallCardClasses} p-1.5 sm:p-3.5`}>
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant={isLight ? "default" : "white"} />
              <div className="relative z-10 flex items-center gap-1.5 sm:flex-col sm:items-start sm:gap-3">
                <div className={`${smallIconBoxClasses} h-6 w-6 sm:h-10 sm:w-10 shrink-0`}>{benefit.icon}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[10px] sm:text-base font-bold leading-tight">{benefit.title}</h3>
                  <p className="hidden sm:block mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      <section className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-2 sm:mb-5">
          <h2 className="text-base sm:text-4xl font-black mb-0.5 sm:mb-3">FAQs</h2>
          <p className="hidden sm:block text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Everything you need to know about finding and registering domain names
          </p>
        </div>
        <div className="space-y-1">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-lg overflow-hidden transition-all ${
                isLight
                  ? 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
                  : 'bg-white/[0.02] border border-white/10 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className={`w-full px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between text-left transition-colors ${
                  isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]'
                }`}
              >
                <h3 className="text-[12px] sm:text-base font-bold pr-3 leading-snug">{faq.question}</h3>
                <svg
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-tertiary)' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}>
                <div className="overflow-hidden">
                  <div className="px-3 sm:px-5 pb-2.5 sm:pb-4">
                    <p className="text-[11px] sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="hidden sm:block max-w-4xl mx-auto px-3 sm:px-6">
        <div className={`prose max-w-none ${isLight ? 'prose-gray' : 'prose-invert'}`}>
          <h2 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4">
            Find Your Perfect Domain Name with DomainDiscovery
          </h2>
          <p className="text-sm sm:text-[15px] leading-relaxed mb-3 sm:mb-4" style={{ color: 'var(--text-secondary)' }}>
            Finding the perfect domain name is the first step in building your online presence. Whether you&apos;re 
            launching a startup, creating a personal brand, or establishing an e-commerce store, DomainDiscovery 
            makes it easy to search, compare, and register domain names instantly.
          </p>
          <p className="text-sm sm:text-[15px] leading-relaxed mb-3 sm:mb-4" style={{ color: 'var(--text-secondary)' }}>
            Our advanced domain search engine checks availability across 1,600+ domain extensions in real-time, 
            showing you results as you type. With powerful AI-driven suggestions, bulk search capabilities, and 
            comprehensive price comparison tools, we help you find available domains at the best prices.
          </p>
          <h3 className="text-xl sm:text-2xl font-bold mb-2.5 sm:mb-3 mt-5 sm:mt-6">
            How to Choose the Right Domain Name
          </h3>
          <p className="text-sm sm:text-base leading-relaxed mb-3.5" style={{ color: 'var(--text-secondary)' }}>
            Choosing the right domain name is crucial for your online success. Here are key factors to consider:
          </p>
          <ul className="list-disc list-inside space-y-1.5 sm:space-y-1.5 mb-4.5 sm:mb-5" style={{ color: 'var(--text-secondary)' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Keep it short and memorable</strong> - Aim for 6-14 characters for easy recall</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Make it easy to spell</strong> - Avoid complex words or unusual spellings</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Choose .com when possible</strong> - It&apos;s the most recognized and trusted extension</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Avoid numbers and hyphens</strong> - They can cause confusion and typos</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Make it brandable</strong> - Choose a name that reflects your brand identity</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Check trademark availability</strong> - Ensure your domain doesn&apos;t infringe on existing trademarks</li>
          </ul>
          <h3 className="text-xl sm:text-2xl font-bold mb-2.5 sm:mb-3.5 mt-5 sm:mt-7">
            Domain Extensions: Which TLD Should You Choose?
          </h3>
          <p className="text-sm sm:text-[15px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            While .com remains the most popular choice, modern TLDs like .ai, .io, .tech, and .app offer great 
            alternatives for specific industries. Our domain extension tool helps you explore all options and find 
            the perfect match for your website. Industry-specific extensions can help with SEO and immediately 
            communicate your website&apos;s purpose to visitors.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl text-center ${
          isLight
            ? 'bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-lg'
            : 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10'
        }`}>
          <h2 className="text-lg sm:text-4xl font-black mb-1 sm:mb-3.5">
            Ready to Find Your Perfect Domain?
          </h2>
          <p className="mb-2.5 sm:mb-6 max-w-2xl mx-auto text-[11px] sm:text-base" style={{ color: 'var(--text-tertiary)' }}>
            Free to use · Real-time results · Best prices
          </p>
          <a
            href="#top"
            className={`inline-flex items-center gap-2 px-4 sm:px-7 py-2 sm:py-3.5 text-xs sm:text-base font-bold rounded-lg sm:rounded-xl transition-all ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                : 'bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10'
            }`}
          >
            <Icons.Search />
            Start Searching
          </a>
        </div>
      </section>
    </div>
  );
};
