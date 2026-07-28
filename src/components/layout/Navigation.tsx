'use client';
// v2
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../ui/Icons';
import { Logo } from '../ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';

interface NavProps {
  onToolSelect?: (tool: string) => void;
  activeTool?: string;
}

interface DropdownItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

interface DropdownMenu {
  label: string;
  items: DropdownItem[];
}

export const Navigation: React.FC<NavProps> = ({ onToolSelect, activeTool }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedDomainsCount, setSavedDomainsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (pathname === '/bulk-search' || pathname.startsWith('/bulk-search/')) return 'bulk';
    if (pathname.startsWith('/domain-extensions')) return 'extensions';
    if (pathname.startsWith('/assistant')) return 'assistant';
    if (pathname.startsWith('/generator')) return 'generator';
    if (pathname === '/search' || pathname.startsWith('/search?')) return 'search';
    if (pathname.startsWith('/tools/whois')) return 'whois';
    if (pathname.startsWith('/tools/keyword') || pathname.startsWith('/tools/brandable')) return 'keyword';
    if (pathname.startsWith('/tools/compare')) return 'compare';
    if (pathname.startsWith('/tools/geo')) return 'geo';
    if (pathname === '/' || pathname === '') return 'home';
    // Fall back to explicit prop only when path is unknown
    if (activeTool) return activeTool;
    return null;
  })();

  const isMenuItemActive = (itemId: string, href: string) => {
    if (currentTool === itemId) return true;
    // Domain name search shares home/search routes
    if (itemId === 'search' && (currentTool === 'home' || currentTool === 'search')) return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
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

  const searchMenu: DropdownMenu = {
    label: 'Search',
    items: [
      { id: 'search', label: 'Domain name search', description: 'Find available domains instantly with real-time availability checking.', icon: <Icons.Search className={iconSm} />, href: '/' },
      { id: 'extensions', label: 'Domain extensions', description: 'Explore hundreds of TLD options including .com, .net, .ai, and more.', icon: <Icons.Layers className={iconSm} />, href: '/domain-extensions' },
      { id: 'assistant', label: 'AI Domain Assistant', description: 'Describe your business — auto-generate, check, and rank brand domains.', icon: <Icons.Magic className={iconSm} />, href: '/assistant' },
      { id: 'generator', label: 'Domain generator', description: 'Generate creative domain name ideas using smart keywords and topics.', icon: <Icons.Magic className={iconSm} />, href: '/generator' },
      { id: 'bulk', label: 'Bulk domain search', description: 'Check availability for thousands of domains at once.', icon: <Icons.Bulk className={iconSm} />, href: '/bulk-search' },
    ],
  };

  const toolsMenu: DropdownMenu = {
    label: 'Tools',
    items: [
      { id: 'keyword', label: 'Keyword Domains', description: 'Expand keywords into brandable names with live availability.', icon: <Icons.Keyword className={iconSm} />, href: '/tools/keyword' },
      { id: 'compare', label: 'Price Comparison', description: 'Compare registrar pricing in real time to find the lowest prices.', icon: <Icons.Dollar className={iconSm} />, href: '/tools/compare' },
      { id: 'whois', label: 'WHOIS Lookup', description: 'Look up domain ownership and registration details instantly.', icon: <Icons.Info className={iconSm} />, href: '/tools/whois' },
      { id: 'geo', label: 'Geo Domain Finder', description: 'Find location-based domains for local businesses and regional marketing.', icon: <Icons.Globe className={iconSm} />, href: '/tools/geo' },
    ],
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

  const navBtnBase = `group flex items-center gap-1.5 px-2 py-1.5 text-[12px] sm:text-[13px] font-medium rounded-xl transition-all duration-200 min-h-[34px]`;
  const navBtnActive = isLight
    ? 'text-indigo-900 bg-gradient-to-b from-indigo-50 to-sky-50 border border-indigo-200 shadow-sm shadow-indigo-500/10 backdrop-blur-xl'
    : 'text-white bg-gradient-to-b from-white/[0.12] to-white/[0.08] border border-white/20 shadow-lg shadow-black/20 backdrop-blur-xl';
  const navBtnInactive = isLight
    ? 'text-slate-600 hover:text-indigo-800 hover:bg-indigo-50/80 border border-transparent hover:border-indigo-100'
    : 'text-white/70 hover:text-white hover:bg-gradient-to-b hover:from-white/[0.08] hover:to-white/[0.04] border border-transparent hover:border-white/[0.15]';

  const renderDropdown = (menu: DropdownMenu, menuKey: string) => (
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
        <div className="absolute top-full right-0 w-[min(480px,calc(100vw-1.5rem))] z-[200] pt-2">
          {/* Solid panel — no animated sheens on hover (avoids icon blink) */}
          <div
            className={`relative rounded-2xl p-2.5 border ${
              isLight
                ? 'bg-white border-slate-200 shadow-xl shadow-slate-900/[0.08]'
                : 'bg-[#0c0c0e] border-white/[0.12] shadow-2xl shadow-black/60'
            }`}
          >
            <div className="relative grid grid-cols-2 gap-1.5">
              {menu.items.map((item) => {
                const active = isMenuItemActive(item.id, item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleDropdownClose}
                    className={`nav-dropdown-item flex items-start gap-2.5 p-2.5 rounded-xl text-left border ${
                      active
                        ? isLight
                          ? 'is-active bg-slate-50 border-slate-200'
                          : 'is-active bg-white/[0.1] border-white/20'
                        : isLight
                          ? 'border-transparent hover:bg-slate-50 hover:border-slate-200'
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
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold text-[12px] mb-0.5 ${
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] py-1 sm:py-1.5 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`relative backdrop-blur-2xl border rounded-2xl ${
          isLight
            ? 'bg-white/85 border-indigo-200/70 shadow-lg shadow-indigo-500/[0.08]'
            : 'bg-black/40 border-white/[0.08] shadow-2xl shadow-black/20'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-r rounded-2xl pointer-events-none ${
            isLight
              ? 'from-indigo-400/[0.06] via-transparent to-sky-400/[0.07]'
              : 'from-white/[0.03] via-transparent to-slate-400/[0.03]'
          }`} />
          
          <div className="relative px-2 sm:px-3 py-1.5 sm:py-1.5">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="hover:opacity-90 transition-all duration-300 shrink-0"
                style={{ maxWidth: '180px' }}
              >
                <Logo size="sm" showText />
              </Link>

              <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
                <Link
                  href="/"
                  className={`${navBtnBase} ${currentTool === 'home' || currentTool === 'search' ? navBtnActive : navBtnInactive}`}
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </Link>
                {renderDropdown(searchMenu, 'search')}
                {renderDropdown(toolsMenu, 'tools')}
                <Link
                  href="/learn"
                  className={`${navBtnBase} ${navBtnInactive}`}
                >
                  Learn
                </Link>

                <Link
                  href="/saved-domains"
                  className={`group relative ${navBtnBase} ${navBtnInactive}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Saved</span>
                  {savedDomainsCount > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-[20px] rounded-full px-1.5 py-0.5 text-xs font-bold text-center ${
                      isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                    }`}>
                      {savedDomainsCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={toggleTheme}
                  className={`${navBtnBase} ${navBtnInactive} px-2`}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1 lg:hidden">
                <button
                  onClick={toggleTheme}
                  className={`p-1.5 rounded-xl transition-all duration-200 border border-transparent ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <Link
                  href="/saved-domains"
                  className={`relative p-1.5 rounded-xl transition-all duration-200 border border-transparent ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}
                  aria-label="Saved domains"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedDomainsCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full px-1 text-[10px] font-bold flex items-center justify-center ${
                      isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                    }`}>
                      {savedDomainsCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`p-1.5 rounded-xl transition-all duration-300 border border-transparent ${
                    isLight
                      ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.08]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div
              className={`lg:hidden border-t animate-fade-in ${
                isLight
                  ? 'border-slate-200 bg-white'
                  : 'border-white/[0.06] bg-[#0c0c0e]'
              }`}
            >
              <div className="px-3 pt-2 pb-1.5">
                {/* Home */}
                <Link href="/" onClick={handleDropdownClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-2 transition-all ${
                    currentTool === 'home' || currentTool === 'search'
                      ? isLight ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-white/[0.08] text-white border border-white/[0.08]'
                      : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.04] text-white/70'
                  }`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-lg shrink-0 ${
                    currentTool === 'home' || currentTool === 'search' ? (isLight ? 'bg-slate-200 text-slate-900' : 'bg-white/[0.12] text-white') : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/[0.06] text-white/50')
                  }`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  </div>
                  <span className="text-[13px] font-semibold">Home</span>
                </Link>

                {/* All tools in a single 2-col grid */}
                <div className="grid grid-cols-2 gap-1">
                  {[...searchMenu.items, ...toolsMenu.items].map((item) => {
                    const active = isMenuItemActive(item.id, item.href);
                    return (
                    <Link key={item.id} href={item.href} onClick={handleDropdownClose}
                      className={`flex items-center gap-2 px-2 py-2 rounded-xl transition-all ${
                        active
                          ? isLight ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-white/[0.08] text-white border border-white/[0.08]'
                          : isLight ? 'hover:bg-slate-50 text-slate-600 border border-transparent' : 'hover:bg-white/[0.03] text-white/50 border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ${
                        active
                          ? isLight ? 'bg-slate-200 text-slate-900' : 'bg-white text-slate-900'
                          : isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/[0.05] text-white/35'
                      }`}>{item.icon}</div>
                      <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                    </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom bar */}
              <div className={`flex items-center justify-between px-4 py-2 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.05]'}`}>
                <Link href="/learn" onClick={handleDropdownClose} className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Learn</Link>
                <Link href="/saved-domains" onClick={handleDropdownClose} className={`flex items-center gap-1 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  Saved{savedDomainsCount > 0 && ` (${savedDomainsCount})`}
                </Link>
                <button onClick={toggleTheme} className={`flex items-center gap-1 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                  {theme === 'dark' ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
