'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export const HomePageContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    },
    {
      icon: <Icons.Star />,
      title: 'Explore premium domain names',
      description: 'Our smart domain search tool recommends premium domains for sale that will make your website stand out. Discover undervalued domains with existing traffic, backlinks, and domain authority.',
      href: '/premium-domains',
      cta: 'Browse premium domains',
      badge: 'Premium'
    }
  ];

  const faqs = [
    {
      question: 'What is a domain name?',
      answer: 'A domain name is the address you type into your web browser to visit a website, like "domaindiscovery.com." It identifies a website on the internet, making it easy for people to find and remember. Like your home address helps people find where you live, a domain name helps people find your website. Our domain search tool helps you find available domains instantly.'
    },
    {
      question: 'Why use DomainsDiscovery?',
      answer: 'Our free domain name search delivers lightning-fast results with instant availability checking. As you type, our tool shows available domains in real-time using powerful AI and advanced search infrastructure. With every query, you see available extensions, suggested similar domains, and premium domains to boost your website performance. You also gain access to features including bulk search, domain generator, WHOIS lookup, price comparison, and more.'
    },
    {
      question: 'What if the domain name I want is already taken?',
      answer: 'If someone already owns the domain name you want, you still have several options: (1) Try a different extension - if someone owns "example.com," check if "example.net," "example.org," or other TLDs remain available. See our full list of 1,600+ available extensions. (2) Create a variation - add a word or change the order of words to create a variation of your desired domain name. Our AI Domain Generator suggests similar available domains. (3) Check premium domains - our premium domain search tool helps you find similar, high-performing domains that may be available for purchase.'
    },
    {
      question: 'How do I check if a domain name is available?',
      answer: 'Use our domain checker to see if a domain name is available. Type the name you want in the search bar above, and you\'ll receive instant results that check domains across different extensions (like ".com" or ".net") and provide alternative suggestions. Our tool checks availability in real-time across 1,600+ TLD extensions.'
    },
    {
      question: 'What are extensions and TLDs, and which one should I choose?',
      answer: 'A TLD (Top-Level Domain) represents the part of a domain name that comes after the dot, like ".com" or ".org." The .com extension ranks as the most common and trusted, but many others, such as ".net," ".ai," ".io," or industry-specific extensions like ".tech" or ".shop," offer great alternatives. Our domain extension tool helps you explore different TLD options and find the perfect match for your website.'
    },
    {
      question: 'How do I buy domains?',
      answer: 'Once you find an available domain using our domain search tool, select a registrar to purchase it. We show you pricing from trusted registrars including GoDaddy, Namecheap, Google Domains, and more, so you can buy with confidence at the best price. After buying, you\'ll connect the domain to your website or hosting provider.'
    },
    {
      question: 'How fast is DomainsDiscovery?',
      answer: 'DomainsDiscovery delivers instant search results as you type, with response times optimized for real-time feedback. Our advanced infrastructure and AI-powered search engine ensure you get hundreds of domain suggestions in milliseconds, making it one of the fastest domain search tools available.'
    },
    {
      question: 'Is DomainsDiscovery free to use?',
      answer: 'Yes! DomainsDiscovery is completely free to use. You can search unlimited domains, check availability across 1,600+ extensions, use our AI domain generator, compare prices, and access all our tools at no cost. You only pay when you\'re ready to register a domain through your chosen registrar.'
    }
  ];

  const tools = [
    {
      icon: <Icons.Search />,
      title: 'Instant Domain Search',
      description: 'Search millions of domains with real-time availability checking',
      href: '/'
    },
    {
      icon: <Icons.Sparkles />,
      title: 'AI Domain Generator',
      description: 'Generate creative domain names using advanced AI algorithms',
      href: '/generator'
    },
    {
      icon: <Icons.Layers />,
      title: 'Bulk Domain Search',
      description: 'Check availability for up to 1,000 domains at once',
      href: '/bulk-search'
    },
    {
      icon: <Icons.Globe />,
      title: 'Domain Extensions',
      description: 'Explore 1,600+ TLD extensions across all categories',
      href: '/domain-extensions'
    },
    {
      icon: <Icons.Star />,
      title: 'Premium Domains',
      description: 'Discover high-value domains with existing traffic and authority',
      href: '/premium-domains'
    },
    {
      icon: <Icons.Dollar />,
      title: 'Price Comparison',
      description: 'Compare domain prices across multiple registrars',
      href: '/tools/compare'
    },
    {
      icon: <Icons.Globe />,
      title: 'Geo Domain Finder',
      description: 'Find location-based domains for local businesses',
      href: '/tools/geo'
    },
    {
      icon: <Icons.Info />,
      title: 'WHOIS Lookup',
      description: 'Check domain ownership and registration details',
      href: '/tools/whois'
    }
  ];

  return (
    <div className="space-y-24 py-16">
      {/* Main Description Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            The fastest domain search tool<br />on the internet
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-3xl mx-auto">
            DomainsDiscovery is the ultimate domain search engine to find, buy, and register available 
            domain names and extensions (TLDs). Our tool shows hundreds of results as you type, surfacing 
            the best domain names at the lowest prices. Search and register domains with confidence using 
            our advanced AI-powered search infrastructure.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                {feature.badge && (
                  <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    {feature.badge}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed mb-6">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors group/link"
              >
                {feature.cta}
                <svg 
                  className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Extensions Showcase */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Popular Domain Extensions
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Choose from 1,600+ domain extensions. Find the perfect TLD for your website.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { ext: '.com', desc: 'Most popular', color: 'from-blue-500 to-blue-600' },
            { ext: '.ai', desc: 'AI & Tech', color: 'from-purple-500 to-purple-600' },
            { ext: '.io', desc: 'Tech startups', color: 'from-emerald-500 to-emerald-600' },
            { ext: '.co', desc: 'Companies', color: 'from-orange-500 to-orange-600' },
            { ext: '.net', desc: 'Networks', color: 'from-cyan-500 to-cyan-600' },
            { ext: '.org', desc: 'Organizations', color: 'from-pink-500 to-pink-600' },
            { ext: '.app', desc: 'Applications', color: 'from-indigo-500 to-indigo-600' },
            { ext: '.xyz', desc: 'Creative', color: 'from-yellow-500 to-yellow-600' },
          ].map((item, i) => (
            <Link
              key={i}
              href="/domain-extensions"
              className="group px-6 py-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <div className={`text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                {item.ext}
              </div>
              <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                {item.desc}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/domain-extensions"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl font-semibold transition-all"
          >
            View all 1,600+ extensions
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Powerful Domain Tools
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Everything you need to find, analyze, and register the perfect domain name
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <Link
              key={index}
              href={tool.href}
              className="group p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <div className="p-3 rounded-xl bg-white/5 mb-4 group-hover:bg-white/10 group-hover:scale-110 transition-all text-white/70">
                {tool.icon}
              </div>
              <h3 className="font-bold mb-2 group-hover:text-white transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose DomainsDiscovery */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Why Choose DomainsDiscovery?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Icons.Magic />,
              title: 'Lightning Fast Search',
              description: 'Get instant results as you type with our optimized search infrastructure. No waiting, no delays - just instant domain availability.'
            },
            {
              icon: <Icons.Sparkles />,
              title: 'AI-Powered Suggestions',
              description: 'Our advanced AI analyzes millions of domains to suggest creative, brandable names you\'ll love. Smart semantic understanding for better results.'
            },
            {
              icon: <Icons.Dollar />,
              title: 'Best Prices Guaranteed',
              description: 'Compare prices across multiple registrars instantly. We help you find the lowest price for every domain you want to register.'
            },
            {
              icon: <Icons.Check />,
              title: 'Secure & Private',
              description: 'Your searches are completely private. We don\'t track, store, or sell your search data. Search with confidence.'
            },
            {
              icon: <Icons.Globe />,
              title: '1,600+ Extensions',
              description: 'Access the largest selection of domain extensions. From .com to .ai, find the perfect TLD for your website.'
            },
            {
              icon: <Icons.Layers />,
              title: 'Works Everywhere',
              description: 'Fully responsive design works perfectly on desktop, tablet, and mobile. Search domains anywhere, anytime.'
            }
          ].map((benefit, i) => (
            <div
              key={i}
              className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <div className="p-3 rounded-xl bg-white/5 inline-flex mb-4 text-white/70">{benefit.icon}</div>
              <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Domain Name Search FAQs
          </h2>
          <p className="text-white/60">
            Everything you need to know about finding and registering domain names
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <h3 className="font-bold text-white pr-4">{faq.question}</h3>
                <svg
                  className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5">
                  <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-black mb-6">
            Find Your Perfect Domain Name with DomainsDiscovery
          </h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Finding the perfect domain name is the first step in building your online presence. Whether you're 
            launching a startup, creating a personal brand, or establishing an e-commerce store, DomainsDiscovery 
            makes it easy to search, compare, and register domain names instantly.
          </p>
          <p className="text-white/70 leading-relaxed mb-6">
            Our advanced domain search engine checks availability across 1,600+ domain extensions in real-time, 
            showing you results as you type. With powerful AI-driven suggestions, bulk search capabilities, and 
            comprehensive price comparison tools, we help you find available domains at the best prices.
          </p>
          <h3 className="text-2xl font-bold mb-4 mt-8">
            How to Choose the Right Domain Name
          </h3>
          <p className="text-white/70 leading-relaxed mb-4">
            Choosing the right domain name is crucial for your online success. Here are key factors to consider:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/70 mb-6">
            <li><strong className="text-white">Keep it short and memorable</strong> - Aim for 6-14 characters for easy recall</li>
            <li><strong className="text-white">Make it easy to spell</strong> - Avoid complex words or unusual spellings</li>
            <li><strong className="text-white">Choose .com when possible</strong> - It's the most recognized and trusted extension</li>
            <li><strong className="text-white">Avoid numbers and hyphens</strong> - They can cause confusion and typos</li>
            <li><strong className="text-white">Make it brandable</strong> - Choose a name that reflects your brand identity</li>
            <li><strong className="text-white">Check trademark availability</strong> - Ensure your domain doesn't infringe on existing trademarks</li>
          </ul>
          <h3 className="text-2xl font-bold mb-4 mt-8">
            Domain Extensions: Which TLD Should You Choose?
          </h3>
          <p className="text-white/70 leading-relaxed mb-6">
            While .com remains the most popular choice, modern TLDs like .ai, .io, .tech, and .app offer great 
            alternatives for specific industries. Our domain extension tool helps you explore all options and find 
            the perfect match for your website. Industry-specific extensions can help with SEO and immediately 
            communicate your website's purpose to visitors.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="p-12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready to Find Your Perfect Domain?
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto text-lg">
            Start searching millions of available domains instantly. Free to use, fast results, 
            and the best prices from trusted registrars.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-white/10"
          >
            <Icons.Search />
            Start Searching Domains
          </a>
        </div>
      </section>
    </div>
  );
};
