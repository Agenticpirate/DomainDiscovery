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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
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
      { id: 'bulk', label: 'Bulk domain search', description: 'Check availability for thousands of domains at once.', icon: <Icons.Layers />, href: '/bulk-search' },
    ],
  };

  const toolsMenu: DropdownMenu = {
    label: 'Tools',
    items: [
      { id: 'brandable', label: 'Brandable Names', description: 'Generate unique, memorable brand-ready domain names.', icon: <Icons.Sparkles />, href: '/tools/brandable' },
      { id: 'keyword', label: 'Keyword-Based Domains', description: 'Find domains based on specific keywords and search terms.', icon: <Icons.Search />, href: '/tools/keyword' },
      { id: 'compare', label: 'Price Comparison', description: 'Compare registrar pricing in real time to find the lowest prices.', icon: <Icons.Dollar />, href: '/tools/compare' },
      { id: 'geo', label: 'Geo Domain Finder', description: 'Find location-based domains for local businesses and regional marketing.', icon: <Icons.Globe />, href: '/tools/geo' },
      { id: 'value', label: 'Domain Value', description: 'Estimate the market value of any domain name.', icon: <Icons.Chart />, href: '/tools/value' },
      { id: 'whois', label: 'WHOIS Lookup', description: 'Look up ownership and registration details for any domain.', icon: <Icons.Info />, href: '/tools/whois' },
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

  const navBtnBase = `group flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] sm:text-[13px] font-medium rounded-xl transition-all duration-200 min-h-[36px]`;
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
        <div className="absolute top-full right-0 w-[480px] z-[100] pt-2">
          <div className={`relative backdrop-blur-3xl border rounded-2xl p-2.5 animate-fade-in ${
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
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all duration-200 group ${
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
                          ? 'shadow-lg'
                        : isLight
                          ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800 group-hover:scale-105'
                          : 'bg-white/[0.08] text-white/60 group-hover:bg-white/[0.15] group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-white/10'
                    }`}
                    style={currentTool === item.id ? { background: 'var(--accent-tint-strong)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' } : undefined}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold text-[12px] mb-0.5 transition-colors ${
                        currentTool === item.id
                          ? isLight ? 'text-slate-900' : 'text-white'
                          : isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className={`text-[10px] leading-relaxed line-clamp-2 transition-colors ${
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
    <nav className="fixed top-0 left-0 right-0 z-[60] py-1 sm:py-1.5 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`relative backdrop-blur-2xl border rounded-2xl ${
          isLight
            ? 'bg-white/90 border-slate-200/80 shadow-lg shadow-slate-900/[0.04]'
            : mobileMenuOpen
              ? 'bg-[#0a0a0a] border-white/[0.08] shadow-2xl shadow-black/20'
              : 'bg-black/40 border-white/[0.08] shadow-2xl shadow-black/20'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-r rounded-2xl pointer-events-none ${
            isLight ? 'from-slate-500/[0.02] via-transparent to-slate-400/[0.02]' : 'from-white/[0.03] via-transparent to-slate-400/[0.03]'
          }`} />
          
          <div className="relative px-2 sm:px-3 py-1.5 sm:py-1.5">
            <div className="flex items-center justify-between">
              <Link 
                href="/"
                className="hover:opacity-80 transition-all duration-300 shrink-0 flex items-center gap-1.5"
                style={{ maxWidth: '160px' }}
              >
                {/* Nav logo icon - explicit pixel sizes to prevent hydration issues */}
                <div style={{ width: 28, height: 28, minWidth: 28, maxWidth: 28, flexShrink: 0, borderRadius: '0.625rem', overflow: 'hidden', background: isLight ? 'linear-gradient(135deg, #334155, #475569, #1e293b)' : 'linear-gradient(135deg, #e2e8f0, #f1f5f9, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: isLight ? '#f1f5f9' : '#334155' }}>
                    <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9"/>
                    <circle cx="12" cy="12" r="1.5" fill={isLight ? '#475569' : 'white'} fillOpacity="0.6"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, backgroundImage: isLight ? 'linear-gradient(to right, #0f172a, #1e293b, #475569)' : 'linear-gradient(to right, #ffffff, #f1f5f9, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    DomainDiscovery
                  </span>
                  <span style={{ fontSize: '7px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: isLight ? '#64748b' : '#94a3b8' }}>
                    AI-Powered
                  </span>
                </div>
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
                    <span className={`absolute -top-1 -right-1 min-w-[20px] rounded-full px-1.5 py-0.5 text-xs font-bold text-center ${
                      isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                    }`}>
                      {savedDomainsCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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

                <Link href="/" className="btn-accent ml-1.5 px-4 py-1.5 text-[12px]">
                  Search free
                </Link>
              </div>

              <div className="flex items-center gap-1 lg:hidden">
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
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
            <div className={`lg:hidden border-t animate-fade-in ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}
              style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0a' }}
            >
              <div className="px-3 pt-2.5 pb-2 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                {/* Home */}
                <Link href="/" onClick={handleDropdownClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-2 transition-all ${
                    currentTool === 'search'
                      ? isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/[0.06] text-white'
                      : isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/[0.03] text-white/80'
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ${
                    isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/[0.06] text-white/60'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  </div>
                  <span className="text-[13px] font-semibold">Home</span>
                </Link>

                {/* Grouped sections — top 2 shown, rest behind a toggle */}
                {[searchMenu, toolsMenu].map((menu) => {
                  const expanded = expandedSections[menu.label];
                  const visibleItems = expanded ? menu.items : menu.items.slice(0, 2);
                  const hiddenCount = menu.items.length - 2;
                  return (
                    <div key={menu.label} className="mb-2.5">
                      <div className={`px-2 mb-1 text-[9px] font-semibold uppercase tracking-[0.18em] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                        {menu.label}
                      </div>
                      <div className="space-y-px">
                        {visibleItems.map((item) => {
                          const active = currentTool === item.id;
                          return (
                            <Link key={item.id} href={item.href} onClick={handleDropdownClose}
                              className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all ${
                                active
                                  ? isLight ? 'bg-slate-100' : 'bg-white/[0.06]'
                                  : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-all ${
                                active
                                  ? 'bg-[var(--accent-tint)] text-[var(--accent-text)] icon-glow-active'
                                  : isLight ? 'bg-slate-100 text-slate-500 icon-glow group-hover:text-slate-700' : 'bg-white/[0.05] text-white/45 icon-glow group-hover:text-[var(--accent-text)]'
                              }`}>
                                {item.icon}
                              </div>
                              <span className={`flex-1 text-[13px] font-medium leading-tight ${active ? (isLight ? 'text-slate-900' : 'text-white') : (isLight ? 'text-slate-700' : 'text-white/80')}`}>
                                {item.label}
                              </span>
                              {active && <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--accent)]" />}
                            </Link>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <button
                            onClick={() => setExpandedSections((prev) => ({ ...prev, [menu.label]: !prev[menu.label] }))}
                            className={`flex items-center gap-1.5 px-2.5 py-1 mt-0.5 text-[11px] font-semibold transition-colors ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/45 hover:text-[var(--accent-text)]'}`}
                          >
                            {expanded ? 'Show less' : `Show ${hiddenCount} more`}
                            <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Resources */}
                <div className="mb-1">
                  <div className={`px-2 mb-1 text-[9px] font-semibold uppercase tracking-[0.18em] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                    Resources
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Learn', href: '/learn' },
                      { label: 'FAQ', href: '/faq' },
                      { label: 'Blog', href: '/blog' },
                    ].map((r) => (
                      <Link key={r.href} href={r.href} onClick={handleDropdownClose}
                        className={`text-center px-2 py-2 rounded-lg text-[12px] font-medium transition-all ${isLight ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'}`}
                      >
                        {r.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className={`flex items-center justify-between px-4 py-3 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.05]'}`}>
                <Link href="/saved-domains" onClick={handleDropdownClose} className={`flex items-center gap-1.5 text-[12px] font-semibold ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  Saved{savedDomainsCount > 0 && ` (${savedDomainsCount})`}
                </Link>
                <Link href="/contact" onClick={handleDropdownClose} className={`text-[12px] font-semibold ${isLight ? 'text-slate-600' : 'text-white/55'}`}>Contact</Link>
                <button onClick={toggleTheme} className={`flex items-center gap-1.5 text-[12px] font-semibold ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
                  {theme === 'dark' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
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
