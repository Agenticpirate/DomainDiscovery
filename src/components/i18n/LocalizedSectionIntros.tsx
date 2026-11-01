'use client';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { pageShell } from '@/lib/i18n/pageShells';

export function LearnIntro({ count }: { count: number }) {
  const { locale } = useLocale();
  const shell = pageShell(locale);
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
        {shell ? `${count}+ ${shell.learnKicker}` : `${count}+ free guides · naming · SEO · DNS`}
      </p>
      <h1 className="text-2xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-2 sm:mb-4">
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--gradient-hero-from), var(--gradient-hero-from), var(--gradient-hero-to))',
          }}
        >
          {shell?.learnTitle ?? 'Domain name guides that help you choose & rank'}
        </span>
      </h1>
      <p className="text-xs sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {shell?.learnBody ??
          'Practical education on brandable names, keyword domains, geo domains for local SEO, valuation, auctions, DNS, and legal basics — then apply what you learn with free domain name search, WHOIS, and price compare.'}
      </p>
    </>
  );
}

export function LearnTrendingLabel() {
  const { locale } = useLocale();
  const shell = pageShell(locale);
  return <>{shell?.learnTrending ?? 'Trending now'}</>;
}

export function BlogIntro() {
  const { locale } = useLocale();
  const shell = pageShell(locale);
  return (
    <header className="mt-2 sm:mt-4 max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
        {shell?.blogKicker ?? 'TLD encyclopedia · domain strategy'}
      </p>
      <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight">
        {shell?.blogTitle ?? 'Domain blog & TLD encyclopedia'}
      </h1>
      <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {shell?.blogBody ??
          'Research domain extensions before you register: registry sponsors, WHOIS/RDAP endpoints, and nameserver context drawn from the public IANA Root Zone Database — plus strategy notes for buyers and local SEO teams.'}
      </p>
    </header>
  );
}

export function BlogStatLabel({ kind }: { kind: 'pages' | 'gtld' | 'cctld' | 'date' }) {
  const { locale } = useLocale();
  const shell = pageShell(locale);
  const english = { pages: 'TLD about pages', gtld: 'gTLDs', cctld: 'ccTLDs', date: 'Catalog date' };
  const localized = shell
    ? { pages: shell.blogPages, gtld: shell.blogGtld, cctld: shell.blogCctld, date: shell.blogDate }
    : english;
  return <>{localized[kind]}</>;
}

export function ForAiIntro() {
  const { locale } = useLocale();
  const shell = pageShell(locale);
  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-50 mb-2">
        {shell?.forAiKicker ?? 'Generative Engine Optimization · LLM discovery'}
      </p>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
        {shell?.forAiTitle ?? 'For AI systems & assistants'}
      </h1>
      <p className="text-sm sm:text-base leading-relaxed opacity-80 mb-6" data-aeo-definition="for-ai-lead">
        {shell?.forAiBody ??
          'DomainDiscovery publishes noise-free Markdown indexes so ChatGPT, Claude, Perplexity, Gemini, and other assistants can cite accurate product facts without scraping ad-heavy HTML.'}
      </p>
    </>
  );
}
