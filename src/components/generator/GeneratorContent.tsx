'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

export const GeneratorContent: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is a domain name generator?',
      answer: 'A domain name generator is an AI-powered tool that helps you discover creative, available domain names based on your keywords. It generates hundreds of variations including prefixes, suffixes, and semantic alternatives, then checks their real-time availability across registrars. Perfect for finding the ideal domain when your first choice is taken.'
    },
    {
      question: 'How does the DomainDiscovery generator work?',
      answer: 'Our generator uses advanced algorithms to create domain suggestions as you type. It combines your keyword with 200+ prefixes, 200+ suffixes, and semantic alternatives to generate unique combinations. Each suggestion is checked for real-time availability using our instant domain search API, ensuring you only see domains you can actually register.'
    },
    {
      question: 'Why should I use a domain name generator?',
      answer: 'Domain generators save hours of manual brainstorming and checking. They provide creative alternatives you might not think of, help you find available domains when popular names are taken, and offer instant availability checking across multiple TLDs. Our generator is especially useful for finding brandable, memorable names that match your business vision.'
    },
    {
      question: 'Can I trust the availability results?',
      answer: 'Yes! Our generator uses real-time availability checking through the same API that powers our instant domain search. Results are accurate at the moment they\'re displayed. However, popular domains can be registered quickly, so we recommend securing your choice as soon as you find the perfect name.'
    },
    {
      question: 'How specific should my keywords be?',
      answer: 'Start with broad, single-word keywords for maximum variety (e.g., "cloud", "mint", "spark"). The generator works best with 3-10 character keywords. More specific terms give targeted results, while broader terms provide diverse options. Try both approaches to explore different naming directions for your project.'
    },
    {
      question: 'What makes a good domain name?',
      answer: 'Great domains are short (under 15 characters), memorable, easy to spell, and relevant to your brand. Avoid hyphens, numbers, and complex spellings. Choose .com when possible for maximum credibility. Our generator prioritizes these qualities, showing the most brandable suggestions first.'
    },
    {
      question: 'Can I use this for brainstorming without registering immediately?',
      answer: 'Absolutely! The generator is perfect for exploring ideas and saving favorites for later. However, remember that available domains can be registered by others at any time. If you find a name you love, consider registering it quickly to secure it, even if you\'re not ready to build your site yet.'
    },
    {
      question: 'What are semantic alternatives?',
      answer: 'Semantic alternatives are contextually related words that share meaning with your keyword. For example, "cloud" suggests "compute", "server", and "storage" in tech contexts. Our AI understands domain-specific meanings, so "mint" generates finance-related terms like "budget" and "wealth", not just plant-related words. This helps you discover relevant, industry-appropriate domain names.'
    }
  ];

  const tips = [
    {
      icon: <Icons.Star />,
      title: 'Start with core keywords',
      description: 'Use simple, memorable words that represent your brand or niche. Single words work best for generating diverse options.'
    },
    {
      icon: <Icons.Magic />,
      title: 'Explore semantic alternatives',
      description: 'Try keywords like "cloud", "mint", or "spark" to see how our AI suggests contextually relevant domain names based on industry meanings.'
    },
    {
      icon: <Icons.Check />,
      title: 'Prioritize .com domains',
      description: 'While other TLDs are valid, .com remains the most trusted and memorable extension for most businesses and projects.'
    },
    {
      icon: <Icons.Globe />,
      title: 'Keep it short and simple',
      description: 'Aim for domains under 15 characters. Shorter names are easier to remember, type, and share across social media and marketing materials.'
    },
    {
      icon: <Icons.Search />,
      title: 'Check trademark conflicts',
      description: 'Before finalizing your domain, search for existing trademarks to avoid legal issues. Use USPTO or your country\'s trademark database.'
    },
    {
      icon: <Icons.Dollar />,
      title: 'Act fast on good finds',
      description: 'Available domains can be registered by anyone at any time. When you find the perfect name, register it immediately to secure it.'
    }
  ];

  const benefits = [
    {
      title: 'Instant Results',
      description: 'Generate hundreds of domain suggestions in milliseconds with real-time availability checking.',
      icon: '⚡'
    },
    {
      title: 'AI-Powered Creativity',
      description: 'Our semantic engine understands context, suggesting relevant alternatives you might never think of.',
      icon: '🤖'
    },
    {
      title: 'Real-Time Availability',
      description: 'Every suggestion is checked against live registrar data, ensuring accuracy and saving you time.',
      icon: '✓'
    },
    {
      title: 'Comprehensive Coverage',
      description: 'We combine 200+ prefixes, 200+ suffixes, and semantic alternatives for maximum variety.',
      icon: '🎯'
    }
  ];

  return (
    <div className="space-y-10 py-10 sm:space-y-14 sm:py-14">
      {/* What is Domain Generator Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 text-center">
          What is an AI Domain Name Generator?
        </h2>
        <div className={`prose ${isLight ? 'prose-slate' : 'prose-invert'} max-w-none`}>
          <p className={`${isLight ? 'text-slate-600' : 'text-white/70'} leading-relaxed text-base sm:text-lg mb-4 sm:mb-6`}>
            An AI domain name generator is a powerful tool that helps entrepreneurs, businesses, and creators 
            discover the perfect domain name for their online presence. Instead of manually brainstorming and 
            checking availability one domain at a time, our generator uses advanced algorithms to create hundreds 
            of creative, brandable domain suggestions based on your keywords.
          </p>
          <p className={`${isLight ? 'text-slate-600' : 'text-white/70'} leading-relaxed text-base sm:text-lg mb-4 sm:mb-6`}>
            What makes our generator unique is its <strong className={isLight ? 'text-slate-900' : 'text-white'}>semantic understanding</strong>. 
            Unlike basic generators that just add random prefixes and suffixes, our AI understands domain-specific 
            context. When you search for &quot;cloud&quot;, it knows you likely mean cloud computing, not weather. When you 
            type &quot;mint&quot;, it suggests finance-related terms, not herbs. This contextual awareness helps you find 
            domains that truly match your industry and vision.
          </p>
          <p className={`${isLight ? 'text-slate-600' : 'text-white/70'} leading-relaxed text-base sm:text-lg`}>
            Every suggestion is checked for real-time availability across major registrars, so you can immediately 
            register domains that catch your eye. Whether you&apos;re launching a startup, building a personal brand, 
            or exploring new project ideas, our generator streamlines the entire domain discovery process.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-10 text-center">
          Why Use Our Domain Generator?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`p-4 sm:p-6 ${isLight ? 'bg-white' : 'bg-white/[0.02]'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-xl ${isLight ? 'hover:border-blue-300' : 'hover:border-white/20'} ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.04]'} transition-all animate-fade-in`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">{benefit.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-10 text-center">
          Expert Tips for Choosing Domain Names
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`p-4 sm:p-6 ${isLight ? 'bg-white' : 'bg-white/[0.02]'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-xl ${isLight ? 'hover:border-blue-300' : 'hover:border-white/20'} ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.04]'} transition-all group animate-fade-in`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${isLight ? 'from-slate-200 to-slate-100' : 'from-white/10 to-white/5'} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                {tip.icon}
              </div>
              <h3 className={`font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{tip.title}</h3>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-10 text-center">
          How Our AI Generator Works
        </h2>
        <div className="space-y-5 sm:space-y-8">
          <div className="flex gap-4 sm:gap-6 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
              1
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Enter Your Keyword</h3>
              <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
                Type a single word that represents your brand, niche, or business idea. Our AI starts generating 
                suggestions instantly as you type, providing real-time feedback.
              </p>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
              2
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">AI Generates Variations</h3>
              <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
                Our semantic engine creates hundreds of variations using prefixes, suffixes, and contextually 
                relevant alternatives. It understands industry-specific meanings to suggest truly relevant names.
              </p>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
              3
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Real-Time Availability Check</h3>
              <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
                Each suggestion is instantly checked against live registrar databases. Available domains are 
                highlighted with a green indicator, so you know exactly which names you can register.
              </p>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
              4
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Register Your Domain</h3>
              <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
                Click any available domain to register it instantly through your preferred registrar. We support 
                GoDaddy, Namecheap, Google Domains, and more for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-10 text-center">
          Domain Generator FAQs
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`${isLight ? 'bg-white' : 'bg-white/[0.02]'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-xl overflow-hidden ${isLight ? 'hover:border-blue-300' : 'hover:border-white/20'} transition-all`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className={`w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between text-left ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]'} transition-colors`}
              >
                <h3 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'} pr-4`}>{faq.question}</h3>
                <svg
                  className={`w-5 h-5 ${isLight ? 'text-slate-500' : 'text-white/50'} flex-shrink-0 transition-transform ${
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
                <div className="px-4 pb-4 sm:px-6">
                  <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed text-sm sm:text-base`}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Popular Keywords Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 text-center">
          Popular Domain Keywords to Try
        </h2>
        <p className={`text-center ${isLight ? 'text-slate-600' : 'text-white/60'} mb-6 sm:mb-8 text-sm sm:text-base`}>
          Click any keyword below to see instant domain suggestions with semantic alternatives
        </p>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {[
            'cloud', 'mint', 'spark', 'shop', 'tech', 'ai', 'blog', 'app', 'web', 'digital',
            'smart', 'data', 'code', 'crypto', 'social', 'market', 'hub', 'pro', 'studio', 'labs',
            'network', 'platform', 'engine', 'portal', 'vault', 'forge', 'craft', 'nexus', 'core', 'edge'
          ].map((keyword) => (
            <a
              key={keyword}
              href={`/generator?q=${keyword}`}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 ${isLight ? 'bg-slate-100' : 'bg-white/5'} ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'} border ${isLight ? 'border-slate-200' : 'border-white/10'} ${isLight ? 'hover:border-blue-300' : 'hover:border-white/20'} rounded-lg text-xs sm:text-sm font-medium transition-all`}
            >
              {keyword}
            </a>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className={`p-6 sm:p-10 bg-gradient-to-br ${isLight ? 'from-slate-100 to-white' : 'from-white/[0.05] to-white/[0.02]'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-2xl`}>
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            Ready to Find Your Perfect Domain?
          </h2>
          <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base`}>
            Start generating creative, available domain names instantly. Our AI-powered tool makes 
            finding the perfect domain fast, easy, and free.
          </p>
          <a
            href="#top"
            className={`inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 ${isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-white/90'} font-bold rounded-xl transition-all shadow-lg ${isLight ? 'shadow-slate-300' : 'shadow-white/10'}`}
          >
            <Icons.Magic />
            Start Generating Domains
          </a>
        </div>
      </section>
    </div>
  );
};
