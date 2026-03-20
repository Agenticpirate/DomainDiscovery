'use client';

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
  const isLight = theme === 'light';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateSavedCount = () => {
      try {
        const saved = localStorage.getItem('saved_domains');
        if (saved) {
          const domains = JSON.parse(saved);
          setSavedDomainsCount(domains.length);
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

  const currentTool = activeTool || (() => {
    if (pathname === '/') return 'search';
    if (pathname === '/bulk-search') return 'bulk';
    if (pathname === '/domain-extensions') return 'extensions';
    if (pathname === '/generator') return 'generator';
    if (pathname === '/tools/whois') return 'whois';
    if (pathname === '/tools/brandable') return 'brandable';
    if (pathname === '/tools/keyword') return 'keyword';
    if (pathname === '/tools/value') return 'value';
    if (pathname === '/tools/compare') return 'compare';
    if (pathname === '/tools/geo') return 'geo';
    return 'search';
  })();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchMenu: DropdownMenu = {
    label: 'Search',
    items: [
      { id: 'search', label: 'Domain name search', description: 'Find available domains instantly with real-time availability checking.', icon: <Icons.Search />, href: '/' },
      { id: 'extensions', label: 'Domain extensions', description: 'Explore hundreds of TLD options including .com, .net, .ai, and more.', icon: <Icons.Layers />, href: '/domain-extensions' },
      { id: 'generator', label: 'Domain generator', description: 'Generate creative domain name ideas using smart keywords and topics.', icon: <Icons.Magic />, href: '/generator' },
      { id: 'premium', label: 'Premium domains', description: 'Discover premium domains available for sale or aftermarket auction.', icon: <Icons.Star />, href: '/premium' },
      { id: 'bulk', label: 'Bulk domain search', description: 'Check availability for thousands of domains at once.', icon: <Icons.Layers />, href: '/bulk-search' },
      { id: 'expired', label: 'Expired domains', description: 'Find expired and expiring domain names with AI-powered search tools.', icon: <Icons.Clock />, href: '/expired' },
    ],
  };

  const toolsMenu: DropdownMenu = {
    label: 'Tools',
    items: [
      { id: 'brandable', label: 'Find Brandable Domains', description: 'Discover unique, memorable brandable domain names for your business.', icon: <Icons.Star />, href: '/tools/brandable' },
      { id: 'keyword', label: 'Keyword-Based Domains', description: 'Find domains based on specific keywords and search terms.', icon: <Icons.Search />, href: '/tools/keyword' },
      { id: 'whois', label: 'WHOIS Lookup', description: 'Look up domain ownership history and registrant information instantly.', icon: <Icons.Info />, href: '/tools/whois' },
      { id: 'value', label: 'Domain Value Estimator', description: 'Estimate how much a domain might be worth using real market data.', icon: <Icons.Dollar />, href: '/tools/value' },
      { id: 'compare', label: 'Price Comparison', description: 'Compare registrar pricing in real time to find the lowest prices.', icon: <Icons.Dollar />, href: '/tools/compare' },
      { id: 'geo', label: 'Geo Domain Finder', description: 'Find location-based domains for local businesses and regional marketing.', icon: <Icons.Globe />, href: '/tools/geo' },
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

  const navBtnBase = `group flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-xl transition-all duration-200 min-h-[40px]`;
  const navBtnActive = isLight
    ? 'text-slate-900 bg-gradient-to-b from-slate-100 to-slate-50 border border-slate-200 shadow-sm backdrop-blur-xl'
    : 'text-white bg-gradient-to-b from-white/[0.12] to-white/[0.08] border border-white/20 shadow-lg shadow-black/20 backdrop-blur-xl';
  const navBtnInactive = isLight
    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200'
    : 'text-white/70 hover:text-white hover:bg-gradient-to-b hover:from-white/[0.08] hover:to-white/[0.04] border border-white/[0.08] hover:border-white/[0.15]';

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
        <div className="absolute top-full right-0 w-[520px] z-[100] pt-2">
          <div className={`relative backdrop-blur-3xl border rounded-2xl p-3 animate-fade-in ${
            isLight
              ? 'bg-white border-slate-200 shadow-xl shadow-slate-900/[0.08]'
              : 'bg-black border-white/[0.15] shadow-2xl shadow-black/60'
          }`}>
            <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl pointer-events-none ${
              isLight ? 'from-slate-50/50 via-transparent to-transparent' : 'from-white/[0.02] via-transparent to-transparent'
            }`} />
            <div className="relative grid grid-cols-2 gap-1.5">
              {menu.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleDropdownClose}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                    currentTool === item.id
                      ? isLight
                        ? 'bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm'
                        : 'bg-gradient-to-br from-white/[0.15] to-white/[0.10] border border-white/[0.2] shadow-lg shadow-black/30'
                      : isLight
                        ? 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                        : 'hover:bg-white/[0.08] border border-transparent hover:border-white/[0.12]'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 transition-all duration-200 ${
                      currentTool === item.id
                        ? isLight
                          ? 'bg-slate-100 text-slate-800 shadow-sm'
                          : 'bg-white/[0.2] text-white shadow-lg shadow-white/20'
                        : isLight
                          ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800 group-hover:scale-105'
                          : 'bg-white/[0.08] text-white/60 group-hover:bg-white/[0.15] group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-white/10'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold text-[13px] mb-1 transition-colors ${
                        currentTool === item.id
                          ? isLight ? 'text-slate-900' : 'text-white'
                          : isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className={`text-[11px] leading-relaxed line-clamp-2 transition-colors ${
                      isLight ? 'text-slate-500 group-hover:text-slate-600' : 'text-white/60 group-hover:text-white/75'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] py-1 sm:py-2.5 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className={`relative backdrop-blur-2xl border rounded-2xl ${
          isLight
            ? 'bg-white/90 border-slate-200/80 shadow-lg shadow-slate-900/[0.04]'
            : 'bg-black/40 border-white/[0.08] shadow-2xl shadow-black/20'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-r rounded-2xl pointer-events-none ${
            isLight ? 'from-blue-500/[0.02] via-transparent to-purple-500/[0.02]' : 'from-purple-500/5 via-transparent to-blue-500/5'
          }`} />
          
          <div className="relative px-2 sm:px-3.5 py-1.5 sm:py-1.5">
            <div className="flex items-center justify-between">
              <Link 
                href="/"
                className="hover:opacity-80 transition-all duration-300 hover:scale-105"
              >
                <Logo size="md" showText={true} />
              </Link>

              <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
                <Link
                  href="/"
                  className={`${navBtnBase} ${currentTool === 'search' ? navBtnActive : navBtnInactive}`}
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
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full min-w-[20px] text-center">
                      {savedDomainsCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={toggleTheme}
                  className={`${navBtnBase} ${navBtnInactive} px-2.5`}
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

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-1.5 rounded-xl transition-all duration-300 border border-transparent ${
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

          {mobileMenuOpen && (
            <div className={`lg:hidden mt-1.5 pt-2.5 border-t animate-fade-in ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}>
              <Link
                href="/"
                onClick={handleDropdownClose}
                className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all mb-2.5 ${
                  currentTool === 'search'
                    ? isLight ? 'bg-slate-100' : 'bg-white/10'
                    : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                }`}
              >
                <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/50'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <div className={`font-semibold text-sm ${isLight ? 'text-slate-800' : 'text-white/80'}`}>Home</div>
                  <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Go back to main search</div>
                </div>
              </Link>

              <div className="mb-3">
                <div className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 px-2 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                  Search
                </div>
                <div className="space-y-1">
                  {searchMenu.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={handleDropdownClose}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                        currentTool === item.id
                          ? isLight ? 'bg-slate-100' : 'bg-white/10'
                          : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/50'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isLight ? 'text-slate-800' : 'text-white/80'}`}>{item.label}</div>
                        <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 px-2 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                  Tools
                </div>
                <div className="space-y-1">
                  {toolsMenu.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={handleDropdownClose}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                        currentTool === item.id
                          ? isLight ? 'bg-slate-100' : 'bg-white/10'
                          : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/50'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isLight ? 'text-slate-800' : 'text-white/80'}`}>{item.label}</div>
                        <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/learn"
                onClick={handleDropdownClose}
                className={`w-full p-2 text-left text-sm font-semibold rounded-xl transition-all block ${
                  isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Learn
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
