# DomainsDiscovery

## Overview
DomainsDiscovery is an AI-powered domain name search and discovery tool built with Next.js 14, React 18, and Tailwind CSS. It allows users to search for domains, compare prices across registrars, and use various domain tools (WHOIS lookup, bulk search, domain generator, etc.).

## Project Architecture
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Port**: 5000 (dev and production)

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature (domain, generator, geo, home, layout, sections)
- `src/components/ui/` - Reusable UI components (Input, Button, Icons, Accordion, etc.)
- `src/contexts/` - React context providers (ThemeContext)
- `src/data/` - Static data files
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility libraries (cache, MCP proxy, validators)
- `src/services/` - Service layer (domain search services)
- `src/types/` - TypeScript type definitions
- `src/__tests__/` - Test files

### Key Pages
- `/` - Home page with domain search
- `/bulk-search` - Bulk domain search
- `/domain-extensions` - Domain extension browser
- `/generator` - AI domain name generator
- `/premium` - Premium domains
- `/saved-domains` - Saved domains
- `/tools/*` - Various domain tools (WHOIS, compare, geo, keyword, value, brandable)
- `/learn` - Learning resources

### Key Components
- `src/components/ui/Icons.tsx` - SVG icon library used throughout the app
- `src/components/ui/Input.tsx` - Uses React `useId()` for SSR-safe ID generation, CSS variable theming
- `src/components/home/HomePageContent.tsx` - Main homepage content sections
- `src/components/domain/SearchInterface.tsx` - Domain search input with keyboard shortcuts

### Theming System
- **CSS Variables**: Defined in `globals.css` under `:root` (dark) and `html.light` (light)
- **ThemeContext**: `src/contexts/ThemeContext.tsx` manages theme state, toggles `light` class on `<html>`
- **Approach**: Hybrid - CSS variables for simple color tokens, `useTheme()` hook with `isLight` conditionals for complex structural differences (gradients, backgrounds)
- **Key variables**: `--bg-main`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--card-bg`, `--card-border`, `--btn-primary-bg`, `--input-bg`, `--nav-bg`, etc.
- **Theme-aware components**: ALL pages and components are theme-aware including Navigation, Footer, PageBackground, Logo, Input, Button, SearchInterface, HomePageContent, Breadcrumb, DomainExtensionsView, BulkDomainSearch, BulkDomainSearchLanding, WHOISLookup, DomainValueEstimate, PriceComparison, KeywordDomainFinder, BrandableDomainFinder, GeoDomainGenerator, and all page.tsx files
- **Color palette**: Slate-based (`#0f172a`, `#475569`, `#64748b`) for light mode text, blue/indigo/violet gradients for apple silicon accents, white/slate backgrounds for cards
- **Light mode accents**: Blue-to-indigo gradient for active pills, blue hover borders on cards, emerald-50 for success states

## Recent Changes
- Extended full light/dark theme support to ALL internal pages (bulk-search, domain-extensions, generator, premium, saved-domains, expired, learn, and all 6 tools/* pages)
- Updated all internal page components (DomainExtensionsView, BulkDomainSearch, BulkDomainSearchLanding, WHOISLookup, DomainValueEstimate, PriceComparison, KeywordDomainFinder, BrandableDomainFinder, GeoDomainGenerator) with theme-aware styling
- Applied apple silicon color aesthetic (blue/indigo/violet gradients) across all pages for light mode
- Updated Breadcrumb component for theme support
- Removed hardcoded `bg-[#0a0a0a] text-white` from all page wrappers (body handles via CSS variables)
- Converted all gray-* references to slate-* for consistency across Navigation and SearchInterface
- Configured for Replit environment (port 5000, allowed dev origins via REPLIT_DEV_DOMAIN)

## User Preferences
- Professional, aesthetic, sleek design throughout - apple silicon inspired color palette
- Avoid emoji icons in favor of SVG icons
- Clean console output - no debug logging in production or development
- Light/dark mode toggle must work and visually switch the entire site consistently across all pages
