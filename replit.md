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
- `src/components/ui/Input.tsx` - Uses React `useId()` for SSR-safe ID generation
- `src/components/home/HomePageContent.tsx` - Main homepage content sections
- `src/components/domain/SearchInterface.tsx` - Domain search input with keyboard shortcuts

## Recent Changes
- Fixed hydration error by replacing Math.random() ID generation with React useId() hook in Input component
- Removed all debug console.log statements from components and API routes
- Cleaned up ~200 lines of dead legacy code (false && blocks) from page.tsx
- Replaced emoji icons with proper SVG Icons components for professional appearance
- Configured for Replit environment (port 5000, allowed dev origins via REPLIT_DEV_DOMAIN)
- Updated .gitignore for Next.js conventions

## User Preferences
- Professional appearance preferred - avoid emoji icons in favor of SVG icons
- Clean console output - no debug logging in production or development
