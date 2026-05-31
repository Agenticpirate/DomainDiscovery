# Implementation Plan: DomainsDiscovery.com

## Overview

This implementation plan breaks down the DomainsDiscovery.com platform into incremental coding tasks. Each task builds on previous work, ensuring no orphaned code. The plan follows a foundation-first approach: project setup → data layer → core services → UI components → pages → SEO → testing.

> **Re-baselined against the implemented codebase (reconciliation pass).** This task list was reset to reflect what is actually built in `src/`, not the originally-planned sequence. Several tasks were completed through a **different file structure** than originally proposed, and those references have been corrected below:
> - **Availability/API routes** live under `app/api/domains/*` (`search`, `instant-check`, `check`, `generate`, `premium-check`) plus `app/api/tld-prices` — not the originally-planned `/api/check`, `/api/bulk`, `/api/whois`, `/api/suggest`, `/api/appraise`.
> - **Search/generator/bulk/geo logic lives inside components and `services/instantDomainService.ts`**, not in dedicated React hooks. The only custom hook implemented is `src/hooks/usePreferredRegistrar.ts`. The planned `useDomainSearch`/`useDomainGenerator`/`useBulkChecker`/`useWHOIS`/`useAppraisal`/`useAnalytics` hooks do **not** exist.
> - **There is no `/tld/[tld]` dynamic route.** TLD/extension info is served via `app/domain-extensions/page.tsx` + `app/api/tld-prices`.
> - **WHOIS and appraisal backends are not implemented.** Their UIs exist (`app/tools/whois`, `app/tools/value`) but the client-referenced `/api/domains/whois` and `/api/domains/value` endpoints have no route handlers.
> - **Analytics is entirely unimplemented** (no analytics service/hook/tracking anywhere).
>
> Status legend: `[x]` done · `[ ]` not done · `[-]` partial / in-progress. Most property-based *test* tasks beyond Properties 4, 5, 6, 9, 22, 23 are not yet written and remain unchecked.

## Tasks

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize Next.js 14 project with TypeScript and Tailwind CSS
    - Create Next.js app with App Router
    - Configure TypeScript strict mode
    - Set up Tailwind CSS with custom color palette (#0A0B14, #8B5CF6, etc.)
    - Configure Inter and JetBrains Mono fonts
    - _Requirements: 16.1, 16.2_
  
  - [x] 1.2 Set up project structure and base configuration
    - Create directory structure (components, hooks, services, lib, data, types)
    - Configure ESLint and Prettier
    - Set up path aliases in tsconfig.json
    - Create environment variable templates
    - _Requirements: 14.4_
  
  - [x] 1.3 Install and configure dependencies
    - Install Framer Motion for animations
    - Install fast-check for property testing
    - Install Jest and React Testing Library
    - Configure Jest with TypeScript support
    - _Requirements: 16.5_

- [x] 2. Type Definitions and Data Layer
  - [x] 2.1 Create TypeScript type definitions
    - Create src/types/domain.ts (DomainCheckResult, RegistrarLink, DomainSuggestion)
    - Create src/types/whois.ts (WHOISResult, RegistrantInfo)
    - Create src/types/geo.ts (GeoLocation, GeoDomainResult)
    - Create src/types/api.ts (APIResponse, APIError)
    - Add src/types/index.ts barrel export
    - _Requirements: 11.6_
  
  - [x] 2.2 Create static data files
    - Create src/data/tlds.json with TLD information
    - Create src/data/countries.json and src/data/cities.json (+ cities-expanded.json) with geo data
    - Create src/data/keywords.json with common words
    - Create src/data/registrars.json with affiliate registrar data
    - Create src/data/extensions.json, tld-price-comparison.json, us-states.json, canada-provinces.json, australia-states.json (exceeds original scope)
    - _Requirements: 1.7, 3.1_

- [x] 3. Core Utility Libraries
  - [x] 3.1 Implement validation utilities
    - Create src/lib/validators.ts with domain validation function
    - Implement bulk input parser (textarea and file) — validateBulkInput
    - Implement input sanitization function — sanitizeInput
    - Add apiHelpers.isValidQuery for server-side query validation
    - _Requirements: 4.1, 14.2_
  
  - [x] 3.2 Write property tests for validation utilities
    - **Property 9: Bulk Input Parsing**
    - **Property 23: Input Sanitization**
    - Implemented in src/__tests__/validators.property.test.ts
    - **Validates: Requirements 4.1, 14.2**
  
  - [x] 3.3 Implement rate limiter
    - Create src/lib/rateLimiter.ts with sliding window algorithm
    - Implement per-IP, per-concern limiters (search/bulk/generate) + getClientIP
    - Add 429 response with Retry-After and X-RateLimit-* headers (rateLimitResponse)
    - _Requirements: 14.1, 14.7_
  
  - [x] 3.4 Write property test for rate limiter
    - **Property 22: Rate Limiter Enforcement**
    - Implemented in src/__tests__/rateLimiter.property.test.ts
    - **Validates: Requirements 14.1, 14.7**
  
  - [x] 3.5 Implement caching utility
    - Create src/lib/cache.ts with in-memory cache + per-route caches
    - Implement TTL-based expiration
    - Unit tests in src/__tests__/cache.test.ts
    - _Requirements: 1.1_

- [x] 4. Checkpoint - Core utilities complete
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Service Layer Implementation
  - [x] 5.1 Implement domain service
    - Create src/services/domainService.ts (LEGACY hash-based mock — used by unit/property tests only, not on the production request path)
    - Implement checkAvailability function (mock via getMockAvailability)
    - Implement generateSuggestions with keyword combinations
    - Implement getRegistrarLinks function
    - _Requirements: 1.1, 1.4, 2.1_
  
  - [x] 5.2 Write property tests for domain generator
    - **Property 4: Generator Keyword Position Placement**
    - **Property 5: Generator Max Length Enforcement**
    - **Property 6: Generator Character Exclusion**
    - Implemented in src/__tests__/domainService.property.test.ts
    - **Validates: Requirements 2.2, 2.3, 2.4**
  
  - [x] 5.3 Implement geo service
    - Create src/services/geoService.ts
    - Implement getCountries and getCities functions
    - Implement generateGeoDomains with population sorting
    - Unit tests in src/__tests__/geoService.test.ts
    - _Requirements: 3.1, 3.2_
  
  - [ ] 5.4 Write property test for geo sorting
    - **Property 8: Geo Domain Population Sorting**
    - NOT DONE — geoService.test.ts is unit-only; no geoService.property.test.ts (fast-check) exists
    - **Validates: Requirements 3.2**
  
  - [ ] 5.5 Implement WHOIS service backend
    - NOT DONE — no whoisService.ts and no /api/domains/whois route handler exists
    - The client wrapper instantDomainService.getWhoisInfo references GET /api/domains/whois, which currently 404s
    - Implement lookup + parseRawWHOIS and wire to an endpoint (see task 7.6)
    - _Requirements: 5.1, 5.2_
  
  - [-] 5.6 Implement appraisal service
    - PARTIAL — heuristics exist in src/lib/premiumDetection.ts (estimateDomainValue, estimatePremiumLikelihood) but are NOT wired to a service/endpoint
    - Wire value/factor calculation to an endpoint (see task 7.7)
    - _Requirements: 6.1, 6.2_
  
  - [ ] 5.7 Implement analytics service
    - NOT DONE — no analyticsService / trackEvent exists anywhere in the codebase
    - Create src/services/analyticsService.ts with event tracking (search, tool usage, clicks, exports, page views)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ] 5.8 Write property test for analytics
    - **Property 25: Analytics Event Recording**
    - NOT DONE — blocked on task 5.7
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**

- [ ] 6. Checkpoint - Services complete
  - Ensure all tests pass, ask the user if questions arise.
  - Note: blocked — analytics (5.7/5.8), WHOIS (5.5), and appraisal wiring (5.6) are still open.

- [-] 7. API Routes Implementation
  - [x] 7.1 Implement domain availability APIs
    - Create app/api/domains/search/route.ts (POST) — MCP + DNS + optional premium enrichment, 10-min DNS cache
    - Create app/api/domains/instant-check/route.ts (POST/GET) — MCP-first + DNS, LRU cache (max 1000 domains)
    - Create app/api/domains/check/route.ts (POST/GET) — pure Cloudflare DoH batch checker (max 100 domains)
    - Add per-concern rate limiting, CORS preflight, and Cache-Control headers
    - _Requirements: 11.1, 11.2, 11.6_
  
  - [ ] 7.2 Write property test for bulk limit
    - **Property 10: Bulk Domain Limit Enforcement**
    - NOT DONE — server caps exist in code (check ≤100, instant-check ≤1000, premium-check ≤60) but no fast-check test asserts the limit
    - **Validates: Requirements 4.5, 4.6**
  
  - [x] 7.3 Implement generate API
    - Create app/api/domains/generate/route.ts (POST) — MCP generate_domain_variations with prefix/suffix/TLD fallback
    - Add generate rate limiter (10/min)
    - _Requirements: 11.4_
  
  - [x] 7.4 Implement premium-check API
    - Create app/api/domains/premium-check/route.ts (POST) — GoDaddy + MCP enrichment, 10-min cache (max 60 domains)
    - _Requirements: 11.1, 11.6_
  
  - [x] 7.5 Implement TLD prices API
    - Create app/api/tld-prices/route.ts (GET) — returns { meta, summaries } or { meta, detail } for ?tld=
    - Backed by src/lib/tldPriceData.ts + data/tld-price-comparison.json
    - _Requirements: 8.2_
  
  - [ ] 7.6 Implement WHOIS API
    - NOT DONE — create app/api/domains/whois/route.ts (referenced by instantDomainService.getWhoisInfo; no handler exists)
    - Add caching for WHOIS results
    - _Requirements: 11.3_
  
  - [ ] 7.7 Implement appraisal/value API
    - NOT DONE — create app/api/domains/value/route.ts (referenced by instantDomainService.getDomainValue)
    - Wire to src/lib/premiumDetection.ts#estimateDomainValue
    - _Requirements: 11.5_
  
  - [ ] 7.8 Write property test for API response structure
    - **Property 18: API Response Structure Consistency**
    - NOT DONE — and per design reconciliation, implemented routes do not yet emit a uniform APIResponse envelope (success returns bare data; errors return { error }; only rate-limit errors return { success, error }), so this test would currently fail until the contract is settled
    - **Validates: Requirements 11.6**

- [-] 8. Checkpoint - API routes complete
  - Ensure all tests pass, ask the user if questions arise.
  - Note: core availability/generate/premium/tld-prices routes done; WHOIS (7.6) and value (7.7) routes still missing.

- [ ] 9. Custom Hooks Implementation
  - Architecture note: this layer was NOT built as planned. The only implemented hook is src/hooks/usePreferredRegistrar.ts. Search/generator/bulk/WHOIS/appraisal logic lives inside components and src/services/instantDomainService.ts (30s cache + in-flight de-dupe) instead of dedicated hooks. The tasks below remain open if dedicated hooks are still desired.
  - [ ] 9.1 Implement useDomainSearch hook
    - NOT DONE — search logic currently lives in components + instantDomainService.searchDomains
    - _Requirements: 1.1, 1.2_
  
  - [ ] 9.2 Write property test for TLD selection
    - **Property 1: TLD Selection Coverage**
    - NOT DONE — testable today against /api/domains/search (one result per requested TLD) with mocked fetch
    - **Validates: Requirements 1.2**
  
  - [ ] 9.3 Implement useDomainGenerator hook
    - NOT DONE — generator logic lives in components/generator + instantDomainService.generateDomainVariations
    - _Requirements: 2.1, 2.5_
  
  - [ ] 9.4 Implement useBulkChecker hook
    - NOT DONE — bulk logic + CSV export live inside components/domain/BulkDomainSearch.tsx
    - _Requirements: 4.1, 4.3, 4.7_
  
  - [ ] 9.5 Write property test for CSV export
    - **Property 7: CSV Export Round Trip**
    - NOT DONE — CSV (and PDF) export is implemented in BulkDomainSearch, GeoDomainGenerator, and saved-domains, but no fast-check round-trip test exists
    - **Validates: Requirements 2.6, 3.4, 4.7**
  
  - [ ] 9.6 Implement useWHOIS hook
    - NOT DONE — UI exists (components/domain/WHOISLookup.tsx) but no working backend/hook
    - _Requirements: 5.1, 5.3, 5.4_
  
  - [ ] 9.7 Implement useAppraisal hook
    - NOT DONE — UI exists (components/domain/DomainValueEstimate.tsx) but no working backend/hook
    - _Requirements: 6.1_
  
  - [ ] 9.8 Implement useAnalytics hook
    - NOT DONE — no analytics layer exists (blocked on task 5.7)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 10. Checkpoint - Hooks complete
  - Ensure all tests pass, ask the user if questions arise.
  - Note: not started — logic was consolidated into components/services instead.

- [x] 11. UI Components - Base
  - [x] 11.1 Implement base UI components
    - Create components/ui/Button.tsx with gradient and glow variants
    - Create components/ui/Input.tsx with dark theme styling
    - Card-equivalent via glassmorphism utilities + components/ui/PageBackground.tsx (no standalone Card.tsx)
    - Create components/ui/Badge.tsx and components/ui/AvailabilityIndicator.tsx for status indicators
    - Create components/ui/Icons.tsx and components/ui/Logo.tsx
    - _Requirements: 16.3, 16.4_
  
  - [x] 11.2 Implement feedback UI components
    - Create components/ui/Tooltip.tsx
    - Create components/ui/SkeletonLoader.tsx for loading states
    - Create components/ui/Toast.tsx for notifications (with ToastProvider)
    - Create components/ui/glowing-effect.tsx
    - Create components/ui/Accordion.tsx and components/ui/Breadcrumb.tsx
    - _Requirements: 16.3, 16.5_

- [x] 12. UI Components - Domain
  - [x] 12.1 Implement domain search components
    - Create components/domain/DomainSearchBar.tsx with TLD selector integration
    - Create components/domain/TLDFilter.tsx with multi-select
    - Create components/domain/SearchInterface.tsx and components/ui/AvailabilityIndicator.tsx (available/taken indicators)
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 12.2 Write property test for availability display
    - **Property 2: Availability Display Consistency**
    - NOT DONE in this spec's scope (Property 24 in ui-components.property.test.tsx belongs to the ui-ux-enhancement spec, not Property 2 here)
    - **Validates: Requirements 1.3**
  
  - [x] 12.3 Implement domain result components
    - Create components/domain/DomainCard.tsx and DomainResultCard.tsx with registrar links
    - Create components/domain/DomainResultsList.tsx and ResultsList.tsx for results display
    - Create components/domain/RegistrarControls.tsx with affiliate tracking
    - _Requirements: 1.3, 1.4, 2.7_
  
  - [ ] 12.4 Write property test for registrar links
    - **Property 3: Registrar Links for Available Domains**
    - NOT DONE — registrar links implemented (src/lib/registrars.ts + usePreferredRegistrar) but no fast-check test exists
    - **Validates: Requirements 1.4**

- [x] 13. UI Components - Generator and Geo
  - [x] 13.1 Implement generator components
    - Create components/generator/DomainGenerator.tsx and GeneratorContent.tsx (keyword input, filters for position/length/exclusions, and suggestion list consolidated here)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 13.2 Implement geo components
    - Create components/geo/GeoDomainGenerator.tsx (location selector, results table, population badges, and CSV/PDF export consolidated here)
    - _Requirements: 3.1, 3.2, 3.5_

- [x] 14. UI Components - Layout
  - [x] 14.1 Implement layout components
    - Create components/layout/Navigation.tsx (sticky with blur; mobile-menu logic is inside Navigation)
    - Create components/layout/Footer.tsx
    - Create components/layout/SimpleContentPage.tsx for static content pages
    - Breadcrumbs provided by components/ui/Breadcrumb.tsx
    - _Requirements: 16.6, 16.7_

- [x] 15. UI Components - Home Page Sections
  - [x] 15.1 Implement home page sections
    - Create components/home/HomePageContent.tsx (hero with animated gradient, features, and stats consolidated here)
    - Create components/sections/FAQSection.tsx with FAQ questions
    - Hero/features/stats/FAQ/CTA wired through app/page.tsx
    - _Requirements: 1.5, 1.6, 1.7, 1.8_

- [x] 16. Checkpoint - Components complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. SEO Components
  - [x] 17.1 Implement SEO structured data and meta
    - JSON-LD (WebSite + SoftwareApplication schemas) embedded in app/layout.tsx
    - Dynamic meta tags, Open Graph, Twitter Card, and canonical via Next.js Metadata API in app/layout.tsx
    - Note: no dedicated components/seo/JsonLd.tsx / MetaTags.tsx / CanonicalUrl.tsx — handled via layout metadata + inline JSON-LD scripts
    - _Requirements: 13.1, 13.2, 13.3, 13.6_
  
  - [ ] 17.2 Write property tests for SEO
    - **Property 19: Page SEO Completeness**
    - **Property 21: JSON-LD Schema Validity**
    - NOT DONE — no SEO property tests exist
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.6**

- [-] 18. Page Implementation - Core Tools
  - [-] 18.1 Implement root layout
    - app/layout.tsx with global styles, fonts, ThemeProvider, ToastProvider, and JSON-LD — DONE
    - Analytics initialization — NOT DONE (blocked on task 5.7)
    - _Requirements: 16.1, 16.2, 16.6_
  
  - [x] 18.2 Implement homepage
    - Create app/page.tsx integrating HomePageContent and FAQSection
    - JSON-LD WebSite/SoftwareApplication schemas present (FAQPage schema not yet added)
    - _Requirements: 1.5, 1.6, 1.7, 1.8_
  
  - [x] 18.3 Implement generator page
    - Create app/generator/page.tsx integrating DomainGenerator/GeneratorContent
    - Check All and Export CSV functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 18.4 Implement geo page
    - Create app/tools/geo/page.tsx integrating GeoDomainGenerator
    - Load More and Export (CSV/PDF) functionality
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 18.5 Implement bulk checker page
    - Create app/bulk-search/page.tsx with textarea input and file upload (components/domain/BulkDomainSearch.tsx)
    - Progress bar, results table, filtering, sorting, and export
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [-] 19. Page Implementation - WHOIS and Appraisal
  - [-] 19.1 Implement WHOIS pages
    - app/tools/whois/page.tsx (UI via components/domain/WHOISLookup.tsx) — DONE
    - Backend (/api/domains/whois), dynamic /whois/[domain] SEO page, and share functionality — NOT DONE
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 19.2 Write property test for WHOIS display
    - **Property 11: WHOIS Display Completeness**
    - **Property 12: Shareable URL Generation**
    - NOT DONE — blocked on WHOIS backend (tasks 5.5 / 7.6)
    - **Validates: Requirements 5.2, 5.4**
  
  - [-] 19.3 Implement appraisal page
    - app/tools/value/page.tsx (UI via components/domain/DomainValueEstimate.tsx) — DONE
    - Backend (/api/domains/value) value range/confidence/factors — NOT DONE (heuristics exist in lib/premiumDetection.ts but unwired)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 19.4 Write property test for appraisal display
    - **Property 13: Appraisal Result Completeness**
    - NOT DONE — blocked on appraisal backend (tasks 5.6 / 7.7); note estimateDomainValue range monotonicity is unit/property testable today
    - **Validates: Requirements 6.3**
  
  - [x] 19.5 Implement expired domains page
    - Create app/expired/page.tsx displaying expiring domains with filters
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 19.6 Write property tests for expired domains
    - **Property 14: Expired Domain Display Completeness**
    - **Property 15: Expired Domain Filter Application**
    - NOT DONE — no fast-check tests exist for the expired page
    - **Validates: Requirements 7.2, 7.3**

- [-] 20. Checkpoint - Tool pages complete
  - Ensure all tests pass, ask the user if questions arise.
  - Note: search/generator/geo/bulk/expired pages done; WHOIS and value pages render UI only (backends pending).

- [-] 21. Page Implementation - TLD and Blog
  - [-] 21.1 Implement TLD information pages
    - TLD/extension info delivered via app/domain-extensions/page.tsx + components/domain/DomainExtensionsView.tsx + components/domain/PriceComparison.tsx, consuming app/api/tld-prices — DONE
    - No per-TLD /tld/[tld] dynamic SEO route exists (static params / per-TLD JSON-LD pages NOT implemented)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 21.2 Write property test for TLD pages
    - **Property 16: TLD Page Completeness**
    - NOT DONE — and depends on the per-TLD route decision in 21.1
    - **Validates: Requirements 8.1, 8.2, 8.4**
  
  - [-] 21.3 Implement blog/content pages
    - app/blog/page.tsx (listing) — DONE
    - Long-form articles served via app/learn/page.tsx + app/learn/[slug]/page.tsx — DONE
    - No app/blog/[slug] dynamic route (individual posts route to /learn/[slug] instead)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 21.4 Write property test for blog SEO
    - **Property 17: Blog Post SEO Completeness**
    - NOT DONE
    - **Validates: Requirements 9.3**

- [-] 22. Page Implementation - Static Pages
  - [-] 22.1 Implement static pages
    - app/contact/page.tsx (contact), app/privacy/page.tsx, app/terms/page.tsx, app/faq/page.tsx — DONE (using SimpleContentPage where applicable)
    - About page (app/about) — NOT DONE
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [-] 23. SEO Configuration
  - [-] 23.1 Implement sitemap and robots
    - app/sitemap.ts for dynamic sitemap generation — DONE
    - app/opengraph-image.tsx + app/twitter-image.tsx — DONE
    - Dedicated app/robots.ts — NOT DONE (robots directives currently declared via layout metadata.robots)
    - _Requirements: 13.4, 13.5_
  
  - [ ] 23.2 Write property test for sitemap
    - **Property 20: Sitemap URL Coverage**
    - NOT DONE
    - **Validates: Requirements 13.4**

- [-] 24. Security Headers
  - [-] 24.1 Implement security configuration
    - CORS configured in src/lib/apiHelpers.ts (applyCORS + corsPreflightResponse, wired into every /api/domains/* route) — DONE
    - Content Security Policy headers — NOT DONE
    - HTTPS redirect — NOT verified / NOT DONE
    - _Requirements: 14.3, 14.5, 14.6_
  
  - [ ] 24.2 Write property test for CSP headers
    - **Property 24: CSP Header Presence**
    - NOT DONE — blocked on 24.1 (no CSP header implemented). Note: the Property 24 test in ui-components.property.test.tsx belongs to the ui-ux-enhancement spec, not this CSP property
    - **Validates: Requirements 14.6**

- [ ] 25. Final Checkpoint - All features complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Performance Optimization
  - [ ] 26.1 Implement performance optimizations
    - NOT verified as complete — code splitting/dynamic imports, lazy loading, and next/image optimization not confirmed in code (SkeletonLoader exists for async loading states)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [-] 27. Final Integration and Polish
  - [-] 27.1 Wire all components and verify flows
    - Homepage/search, generator, bulk, geo, and expired flows wired end-to-end — DONE
    - WHOIS and appraisal flows render UI but lack working backends — PARTIAL
    - _Requirements: All_
  
  - [ ] 27.2 Run Lighthouse audits and fix issues
    - NOT DONE / not verifiable — Performance 95+, SEO 100, Accessibility 100 audits outstanding
    - _Requirements: 12.1, 13.7, 13.8_

- [ ] 28. Final Checkpoint - Production ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- This list was re-baselined against the implemented codebase on the reconciliation pass (see Overview). Status reflects what exists in `src/`, not the original build order.
- Several completed tasks used a different file structure than originally planned: real API routes under `app/api/domains/*` + `app/api/tld-prices`, search/generator/bulk/geo logic embedded in components and `services/instantDomainService.ts` rather than dedicated hooks, and no `/tld/[tld]` dynamic route (TLD info via `/domain-extensions` + `/api/tld-prices`).
- Implemented property tests: Properties 4, 5, 6 (domainService.property.test.ts), 9 & 23 (validators.property.test.ts), 22 (rateLimiter.property.test.ts). All other property-test tasks remain unchecked.
- Largest open gaps: analytics (service/hook/tracking — entirely unimplemented), WHOIS backend (`/api/domains/whois`), appraisal backend (`/api/domains/value`, heuristics exist in `lib/premiumDetection.ts` but unwired), dedicated custom hooks, CSP header, and the remaining property/SEO/Lighthouse tests.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["5.5", "5.6", "5.7"] },
    { "id": 1, "tasks": ["5.4", "5.8", "7.6", "7.7"] },
    { "id": 2, "tasks": ["7.2", "7.8", "9.1", "9.3", "9.4", "9.6", "9.7", "9.8"] },
    { "id": 3, "tasks": ["9.2", "9.5", "12.2", "12.4", "18.1", "19.1", "19.3", "21.1", "21.3", "22.1", "23.1", "24.1"] },
    { "id": 4, "tasks": ["17.2", "19.2", "19.4", "19.6", "21.2", "21.4", "23.2", "24.2", "26.1", "27.1"] },
    { "id": 5, "tasks": ["27.2"] }
  ]
}
```
