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
- `src/contexts/` - React context providers
- `src/data/` - Static data files
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility libraries
- `src/services/` - Service layer
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

## Recent Changes
- Configured for Replit environment (port 5000, allowed dev origins)
- Fixed SSR issue with `navigator` reference in SearchInterface component
- Updated .gitignore for Next.js conventions
