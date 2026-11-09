'use client';
// v2
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../ui/Icons';
import { Logo } from '../ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { LOCALES, persistLocaleChoice, stripLocalePrefix } from '@/lib/i18n/locales';

interface NavProps {
  onToolSelect?: (tool: string) => void;
  activeTool?: string;
}

interface DropdownItem {
  id: string;
  label: string;
  /** One-line label for the compact mobile menu. */
  mobileLabel: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

interface DropdownMenu {
  label: string;
  items: DropdownItem[];
}

/** Notch geometry (px): flat side rails are RAIL_H tall, the centre notch floor is NOTCH_H. */
const NOTCH_H = 60;
const RAIL_H = 38;

export const Navigation: React.FC<NavProps> = ({ onToolSelect, activeTool }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedDomainsCount, setSavedDomainsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const barePath = stripLocalePrefix(pathname || '/');
  const { messages, href, locale, switchHref } = useLocale();
  const t = useT();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus on route change so next page opens clean (no stale dropdown flash)
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateSavedCount = () => {
      try {
        const saved = localStorage.getItem('saved_domains');
        if (saved) {
          const domains = JSON.parse(saved);
          setSavedDomainsCount(Array.isArray(domains) ? domains.length : 0);
        } else {
          setSavedDomainsCount(0);
        }
      } catch (error) {
        console.error('Failed to load saved domains count:', error);
      }
    };

    updateSavedCount();
    window.addEventListener('storage', updateSavedCount);
    window.addEventListener('savedDomainsUpdated', updateSavedCount);

    return () => {
      window.removeEventListener('storage', updateSavedCount);
      window.removeEventListener('savedDomainsUpdated', updateSavedCount);
    };
  }, []);

  // Pathname is source of truth so the correct menu icon highlights after navigation
  const currentTool = (() => {
    if (barePath === '/bulk-search' || barePath.startsWith('/bulk-search/')) return 'bulk';
    if (barePath.startsWith('/domain-extensions')) return 'extensions';
    if (barePath.startsWith('/assistant')) return 'assistant';
    if (barePath.startsWith('/generator')) return 'generator';
    if (barePath === '/search' || barePath.startsWith('/search/')) return 'search';
    if (barePath.startsWith('/tools/whois')) return 'whois';
    if (barePath.startsWith('/tools/value')) return 'value';
    if (barePath.startsWith('/tools/domain-age')) return 'domain-age';
    if (barePath.startsWith('/tools/dns')) return 'dns';
    if (barePath.startsWith('/tools/keyword') || barePath.startsWith('/tools/brandable')) return 'keyword';
    if (barePath.startsWith('/tools/compare')) return 'compare';
    if (barePath.startsWith('/tools/geo')) return 'geo';
    if (barePath.startsWith('/tools/leads') || barePath.startsWith('/leads')) return 'leads';
    if (barePath === '/') return 'home';
    // Fall back to explicit prop only when path is unknown
    if (activeTool) return activeTool;
    return null;
  })();

  const isMenuItemActive = (itemId: string, href: string) => {
    if (currentTool === itemId) return true;
    // Domain name search shares home/search routes
    if (itemId === 'search' && (currentTool === 'home' || currentTool === 'search')) return true;
    const target = stripLocalePrefix(href);
    if (target !== '/' && (barePath === target || barePath.startsWith(`${target}/`))) return true;
    return false;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const iconSm = 'w-[18px] h-[18px] shrink-0';

  const navCopy = messages.nav;
  const searchIds = ['search', 'extensions', 'assistant', 'generator', 'bulk', 'leads'] as const;
  const searchHrefs = ['/', '/domain-extensions', '/assistant', '/generator', '/bulk-search', '/tools/leads'];
  const searchIcons = [
    <Icons.Search key="search" className={iconSm} />,
    <Icons.Layers key="layers" className={iconSm} />,
    <Icons.Magic key="assistant" className={iconSm} />,
    <Icons.Magic key="generator" className={iconSm} />,
    <Icons.Bulk key="bulk" className={iconSm} />,
    <Icons.Users key="leads" className={iconSm} />,
  ];
  const toolIds = ['keyword', 'compare', 'whois', 'geo', 'value', 'domain-age', 'dns'] as const;
  const toolHrefs = ['/tools/keyword', '/tools/compare', '/tools/whois', '/tools/geo', '/tools/value', '/tools/domain-age', '/tools/dns'];
  // English-only tools without translated nav copy
  const extraToolItems: Record<number, { label: string; mobile: string; description: string }> = {
    4: { label: t('Domain Value'), mobile: t('Value'), description: t('Estimate what a domain is worth.') },
    5: { label: t('Domain Age'), mobile: t('Age'), description: t('Check registration age and expiry date.') },
    6: { label: t('DNS Lookup'), mobile: 'DNS', description: t('Look up A, MX, NS and TXT records.') },
  };
  const toolIcons = [
    <Icons.Keyword key="keyword" className={iconSm} />,
    <Icons.Dollar key="dollar" className={iconSm} />,
    <Icons.Info key="info" className={iconSm} />,
    <Icons.Globe key="globe" className={iconSm} />,
    <Icons.Dollar key="value" className={iconSm} />,
    <Icons.Info key="age" className={iconSm} />,
    <Icons.Globe key="dns" className={iconSm} />,
  ];

  const searchMenu: DropdownMenu = {
    label: navCopy.search,
    items: searchIds.map((id, index) => {
      const item = navCopy.searchItems[index] || {
        label: t('Domain Leads'),
        mobile: t('Leads'),
        description: t('Track namespace saturation, newly registered domains, and end-user buyers.'),
      };
      return {
        id,
        label: item.label,
        mobileLabel: item.mobile,
        description: item.description,
        icon: searchIcons[index],
        href: href(searchHrefs[index]),
      };
    }),
  };

  const toolsMenu: DropdownMenu = {
    label: navCopy.tools,
    items: toolIds.map((id, index) => {
      const item = navCopy.toolItems[index] || extraToolItems[index] || {
        label: t('Domain Leads'),
        mobile: t('Leads'),
        description: t('Analyze SLD saturation across TLDs and discover buyer prospects.'),
      };
      return {
        id,
        label: item.label,
        mobileLabel: item.mobile,
        description: item.description,
        icon: toolIcons[index],
        href: href(toolHrefs[index]),
      };
    }),
  };

  const handleItemClick = (itemId: string) => {
    onToolSelect?.(itemId);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const navBtnBase = `group flex items-center gap-1.5 px-2 py-1.5 text-[12px] sm:text-[13px] font-medium rounded-lg transition-all duration-200 min-h-[34px]`;
  /* Light: DESIGN.md monochrome ink (no indigo wash) */
  const navBtnActive = isLight
    ? 'text-[#171717] bg-[#f5f5f5] border border-[#d0d0d0] shadow-sm'
    : 'text-white bg-gradient-to-b from-white/[0.12] to-white/[0.08] border border-white/20 shadow-lg shadow-black/20 backdrop-blur-xl';
  const navBtnInactive = isLight
    ? 'text-[#4d4d4d] hover:text-[#171717] hover:bg-[#fafafa] border border-transparent hover:border-[#d0d0d0]'
    : 'text-white/70 hover:text-white hover:bg-gradient-to-b hover:from-white/[0.08] hover:to-white/[0.04] border border-transparent hover:border-white/[0.15]';

  const renderDropdown = (menu: DropdownMenu, menuKey: string, align: 'left' | 'right' = 'right') => (
    <div 
      className="relative" 
      key={menuKey}
      onMouseEnter={() => setOpenDropdown(menuKey)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <button
        className={`${navBtnBase} ${openDropdown === menuKey ? navBtnActive : navBtnInactive}`}
      >
        <span>{menu.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${openDropdown === menuKey ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {openDropdown === menuKey && (
        <div
          className={`nav-dropdown-panel absolute top-full z-[200] pt-2 ${align === 'left' ? 'left-0' : 'right-0'}`}
          style={{ width: 480, maxWidth: 'min(480px, calc(100vw - 1.5rem))' }}
        >
          {/* Solid panel — no animated sheens on hover (avoids icon blink) */}
          <div
            className={`relative rounded-2xl p-2.5 border ${
              isLight
                ? 'bg-white border-[#d0d0d0] shadow-[0_1px_1px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.07)]'
                : 'bg-[#0a0a0a] border-white/[0.12] shadow-2xl shadow-black/60'
            }`}
            style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0a' }}
          >
            <div className="relative grid grid-cols-2 gap-1.5">
              {menu.items.map((item) => {
                const active = isMenuItemActive(item.id, item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleDropdownClose}
                    className={`nav-dropdown-item flex items-start gap-2.5 p-2.5 rounded-xl text-left border min-w-0 ${
                      active
                        ? isLight
                          ? 'is-active bg-[#f5f5f5] border-[#d0d0d0]'
                          : 'is-active bg-white/[0.1] border-white/20'
                        : isLight
                          ? 'border-transparent hover:bg-[#fafafa] hover:border-[#d0d0d0]'
                          : 'border-transparent hover:bg-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    {/* Icon tile: no color transition — prevents SVG stroke flicker */}
                    <div
                      className={`nav-dropdown-icon flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                        active
                          ? isLight
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-900'
                          : isLight
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-white/[0.1] text-white/90'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div
                        className={`font-semibold text-[12px] mb-0.5 truncate ${
                          active
                            ? isLight
                              ? 'text-slate-900'
                              : 'text-white'
                            : isLight
                              ? 'text-slate-800'
                              : 'text-white/90'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-[10px] leading-relaxed line-clamp-2 ${
                          isLight ? 'text-slate-500' : 'text-white/55'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const sunIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  const moonIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
  const bookmarkIcon = (
    <svg className="w-4 h-4" fill={savedDomainsCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
  const savedLabel =
    savedDomainsCount > 0 ? navCopy.savedAria.replace('{count}', String(savedDomainsCount)) : navCopy.saved;
  const savedCount = savedDomainsCount > 99 ? '99+' : String(savedDomainsCount);

  /* Notch hairlines (double rule, like the reference): outer + inner line, theme-aware ink. */
  const lineOuter = isLight ? 'rgba(10,10,10,0.11)' : 'rgba(255,255,255,0.12)';
  const lineInner = isLight ? 'rgba(10,10,10,0.05)' : 'rgba(255,255,255,0.06)';
  const fill = 'var(--bg-main)';
  const mobileIconBtn = `inline-flex h-10 w-10 items-center justify-center rounded-xl ${isLight ? 'text-[#434a4d]' : 'text-[#a1a4a5]'}`;

  /** Flat side rail (shorter than the notch). */
  const rail = (
    <div className="relative flex-1 min-w-0" style={{ height: RAIL_H, background: fill }} aria-hidden>
      <span className="absolute inset-x-0 bottom-0 h-px" style={{ background: lineOuter }} />
      <span className="absolute inset-x-0 bottom-[3px] h-px" style={{ background: lineInner }} />
    </div>
  );

  /** Curved shoulder joining the rail (38px) to the notch floor (60px). Mirrored on the right. */
  const shoulder = (side: 'left' | 'right') => {
    const fillPath =
      side === 'left'
        ? `M0 0 H44 V${NOTCH_H} C22 ${NOTCH_H} 22 ${RAIL_H} 0 ${RAIL_H} Z`
        : `M0 0 H44 V${RAIL_H} C22 ${RAIL_H} 22 ${NOTCH_H} 0 ${NOTCH_H} Z`;
    const curve = (offset: number) =>
      side === 'left'
        ? `M0 ${RAIL_H - 0.5 - offset} C22 ${RAIL_H - 0.5 - offset} 22 ${NOTCH_H - 0.5 - offset} 44 ${NOTCH_H - 0.5 - offset}`
        : `M0 ${NOTCH_H - 0.5 - offset} C22 ${NOTCH_H - 0.5 - offset} 22 ${RAIL_H - 0.5 - offset} 44 ${RAIL_H - 0.5 - offset}`;
    return (
      <svg
        className="notch-shoulder block shrink-0 w-[22px] lg:w-[44px] -mx-px"
        style={{ height: NOTCH_H }}
        viewBox={`0 0 44 ${NOTCH_H}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={fillPath} fill={fill} />
        <path d={curve(0)} fill="none" stroke={lineOuter} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={curve(3)} fill="none" stroke={lineInner} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

  return (
    <nav
      className="notch-nav fixed top-0 left-0 right-0 z-[100]"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', background: 'transparent' }}
      data-site-nav
      aria-label={t('Primary')}
    >
      <style>{`nav[data-site-nav] .notch-content svg{width:16px;height:16px;max-width:16px;max-height:16px;flex-shrink:0}`}</style>
      {/* Safe-area strip keeps the notch shape flush on iOS */}
      <div className="absolute inset-x-0 top-0" style={{ height: 'env(safe-area-inset-top, 0px)', background: fill }} aria-hidden />

      <div className="relative flex items-start">
        {rail}

        {/* Notch: shoulders + content floor */}
        <div className="relative flex shrink-0 max-w-full">
          {shoulder('left')}
          <div className="notch-content relative min-w-0" style={{ height: NOTCH_H, background: fill }}>
            <span className="absolute inset-x-0 bottom-0 h-px" style={{ background: lineOuter }} aria-hidden />
            <span className="absolute inset-x-0 bottom-[3px] h-px" style={{ background: lineInner }} aria-hidden />

            {/* Desktop */}
            <div className="hidden lg:flex h-full items-center gap-6 px-3 pb-1" ref={dropdownRef}>
              <div className="flex items-center gap-1">
                <Link
                  href={href('/')}
                  className={`${navBtnBase} ${currentTool === 'home' || currentTool === 'search' ? navBtnActive : navBtnInactive}`}
                >
                  <span>{navCopy.home}</span>
                </Link>
                {renderDropdown(searchMenu, 'search', 'left')}
                {renderDropdown(toolsMenu, 'tools', 'left')}
                <Link
                  href={href('/learn')}
                  className={`${navBtnBase} ${barePath.startsWith('/learn') ? navBtnActive : navBtnInactive}`}
                >
                  {navCopy.learn}
                </Link>
              </div>

              <Link href={href('/')} className="shrink-0 hover:opacity-90 transition-opacity" aria-label={t('DomainDiscovery home')}>
                <Logo size="sm" showText />
              </Link>

              <div className="flex items-center gap-1">
                <Link href={href('/saved-domains')} className={`group ${navBtnBase} ${navBtnInactive}`} aria-label={savedLabel}>
                  {bookmarkIcon}
                  <span>{navCopy.saved}</span>
                  {savedDomainsCount > 0 && (
                    <span
                      className={`inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-md px-1 text-[10px] font-semibold tabular-nums leading-none ${
                        isLight
                          ? 'bg-slate-900/6 text-slate-600 ring-1 ring-inset ring-slate-900/10'
                          : 'bg-white/[0.06] text-white/55 ring-1 ring-inset ring-white/10'
                      }`}
                    >
                      {savedCount}
                    </span>
                  )}
                </Link>
                <LanguageSwitcher />
                <button
                  onClick={toggleTheme}
                  className={`${navBtnBase} ${navBtnInactive} px-2`}
                  title={theme === 'dark' ? navCopy.light : navCopy.dark}
                  aria-label={theme === 'dark' ? navCopy.light : navCopy.dark}
                >
                  {theme === 'dark' ? sunIcon : moonIcon}
                </button>
              </div>
            </div>

            {/* Mobile / tablet */}
            <div className="flex lg:hidden h-full items-center gap-1 px-0.5 pb-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={mobileMenuOpen ? t('Close menu') : t('Open menu')}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  mobileMenuOpen
                    ? isLight
                      ? 'bg-[#f4f5f5] text-[#0a0a0a]'
                      : 'bg-white/[0.08] text-[#f0f0f0]'
                    : isLight
                      ? 'text-[#0a0a0a]'
                      : 'text-[#f0f0f0]'
                }`}
              >
                <svg className="w-5 h-5" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <Link href={href('/')} className="min-w-0 px-1 hover:opacity-90 transition-opacity" aria-label={t('DomainDiscovery home')}>
                <Logo size="sm" showText />
              </Link>

              <LanguageSwitcher compact />
              <Link href={href('/saved-domains')} className={`relative ${mobileIconBtn}`} aria-label={savedLabel}>
                {bookmarkIcon}
                {savedDomainsCount > 0 && (
                  <span
                    className={`absolute top-0.5 right-0.5 inline-flex h-3.5 min-w-[0.875rem] items-center justify-center rounded px-1 text-[9px] font-semibold tabular-nums leading-none ${
                      isLight
                        ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                        : 'bg-[#111111] text-white/65 ring-1 ring-white/12'
                    }`}
                  >
                    {savedCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          {shoulder('right')}
        </div>

        {rail}
      </div>

      {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className={`mobile-nav-panel lg:hidden fixed left-2 right-2 z-[99] rounded-2xl border max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain ${
              isLight
                ? 'border-[#d7dbdc] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.08)]'
                : 'border-white/[0.08] bg-[#0a0a0a] shadow-2xl shadow-black/60'
            }`}
            style={{ top: `calc(${NOTCH_H + 6}px + env(safe-area-inset-top, 0px))` }}
          >
            <div className="px-2 pt-2 pb-2">
              <div className="grid grid-cols-2 gap-1">
                {[{
                  id: 'home',
                  label: navCopy.home,
                  mobileLabel: navCopy.home,
                  href: href('/'),
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
                    </svg>
                  ),
                }, ...searchMenu.items, ...toolsMenu.items].map((item) => {
                  const active = item.id === 'home'
                    ? currentTool === 'home'
                    : item.id === 'search'
                      ? currentTool === 'search'
                      : isMenuItemActive(item.id, item.href);
                  return (
                  <Link key={item.id} href={item.href} onClick={handleDropdownClose}
                    title={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[44px] items-center gap-2 rounded-xl px-2 min-w-0 ${
                      active
                        ? isLight ? 'bg-[#f4f5f5] text-[#0a0a0a]' : 'bg-white/[0.08] text-[#f0f0f0]'
                        : isLight ? 'text-[#434a4d]' : 'text-[#c4c7c8]'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                      active
                        ? isLight ? 'bg-white text-[#0a0a0a] shadow-sm' : 'bg-white/[0.1] text-white'
                        : isLight ? 'bg-[#f4f5f5] text-[#6e7679]' : 'bg-white/[0.05] text-white/55'
                    }`}>{item.icon}</div>
                    <span className="min-w-0 truncate text-[13px] font-medium leading-none">{item.mobileLabel}</span>
                  </Link>
                  );
                })}
              </div>

              <p className={`px-1.5 pt-3 pb-1.5 text-[11px] font-semibold tracking-wide ${isLight ? 'text-[#6e7679]' : 'text-white/45'}`}>
                {navCopy.language}
              </p>
              <div className="grid grid-cols-4 gap-1 px-0.5 pb-1">
                {LOCALES.map((item) => {
                  const active = item.id === locale;
                  return (
                    <Link
                      key={item.id}
                      href={switchHref(item.id, pathname || '/')}
                      hrefLang={item.hreflang}
                      lang={item.htmlLang}
                      onClick={() => {
                        persistLocaleChoice(item.id);
                        handleDropdownClose();
                      }}
                      aria-current={active ? 'true' : undefined}
                      className={`flex min-h-[36px] items-center justify-center rounded-lg px-1 text-center text-[11px] font-medium leading-none ${
                        active
                          ? isLight ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#0a0a0a]'
                          : isLight ? 'bg-[#f4f5f5] text-[#434a4d]' : 'bg-white/[0.05] text-white/70'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom bar */}
            <div className={`flex items-center justify-between px-3 py-1 border-t ${isLight ? 'border-[#d7dbdc]' : 'border-white/[0.08]'}`}>
              <Link href={href('/learn')} onClick={handleDropdownClose} className={`inline-flex min-h-[44px] items-center text-[13px] font-semibold ${isLight ? 'text-[#434a4d]' : 'text-[#a1a4a5]'}`}>{navCopy.learn}</Link>
              <Link
                href={href('/saved-domains')}
                onClick={handleDropdownClose}
                className={`inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold ${isLight ? 'text-[#434a4d]' : 'text-[#a1a4a5]'}`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill={savedDomainsCount > 0 ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {navCopy.saved}
                {savedDomainsCount > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded px-1 text-[9px] font-semibold tabular-nums ${
                      isLight
                        ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                        : 'bg-white/[0.06] text-white/55 ring-1 ring-white/10'
                    }`}
                  >
                    {savedDomainsCount > 99 ? '99+' : savedDomainsCount}
                  </span>
                )}
              </Link>
              <button onClick={toggleTheme} className={`inline-flex min-h-10 items-center gap-1 text-[13px] font-semibold ${isLight ? 'text-[#434a4d]' : 'text-[#a1a4a5]'}`}>
                {theme === 'dark' ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                {theme === 'dark' ? navCopy.light : navCopy.dark}
              </button>
            </div>
          </div>
      )}
    </nav>
  );
};
