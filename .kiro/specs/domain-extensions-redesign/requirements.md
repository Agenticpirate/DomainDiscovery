# Domain Extensions Page - Complete Redesign

## Overview
Redesign the Domain Extensions page to match the exact layout and functionality of instantdomainsearch.com/domain-extensions with ALL TLDs across ALL categories.

## User Stories

### US-1: View All Domain Extensions
**As a** user  
**I want to** see all available domain extensions organized by category  
**So that** I can explore different TLD options for my domain

**Acceptance Criteria:**
- Display ALL categories from instantdomainsearch.com
- Show ALL TLDs within each category
- Use compact colored-block layout (not cards)
- Green blocks = available domains
- Red blocks = taken domains  
- Blue blocks = premium domains
- Display TLD count for each category

### US-2: Real-Time Availability Checking
**As a** user  
**I want to** type a keyword and see availability across all extensions instantly  
**So that** I can quickly find available domains

**Acceptance Criteria:**
- Search input at top of page
- 500ms debounce on typing
- Check availability across ALL TLDs when keyword entered
- Update block colors in real-time as results come in
- Batch processing (50 domains at a time)
- Show checking state (white/gray pulse)

### US-3: Category Organization
**As a** user  
**I want to** see extensions grouped by relevant categories  
**So that** I can find TLDs related to my industry/purpose

**Acceptance Criteria:**
- Categories must include (from screenshots):
  1. Professional Services (~60 TLDs)
  2. Featured (~13 TLDs)
  3. Popular (~60 TLDs)
  4. Technology (~80 TLDs)
  5. Media & Communications (~30 TLDs)
  6. Lifestyle & Recreation (~60 TLDs)
  7. Education (~20 TLDs)
  8. Arts & Entertainment (~25 TLDs)
  9. Business & Commerce (~80 TLDs)
  10. Asia-Pacific (~90 TLDs)
  11. International (~27 TLDs)
  12. Generic (~33 TLDs)
  13. Americas (~22 TLDs)
  14. Europe (~53 TLDs)
  15. Government (~3 TLDs)
  16. Country (~200+ TLDs)
  17. Real Estate (~10 TLDs)
  18. Travel & Tourism (~9 TLDs)
  19. Sports & Fitness (~15 TLDs)
  20. Non-Profit & Community (~15 TLDs)
  21. Food & Beverage (~13 TLDs)
  22. Financial Services (~18 TLDs)
  23. Health & Wellness (~20 TLDs)

### US-4: Compact Block Design
**As a** user  
**I want to** see extensions in a compact, efficient layout  
**So that** I can scan many options quickly

**Acceptance Criteria:**
- Use rectangular colored blocks (not cards)
- Blocks show: TLD name only (e.g., ".com")
- Dropdown arrow on right side of each block
- 6 blocks per row on desktop
- Responsive: fewer columns on mobile
- Tight spacing between blocks
- Category headers with TLD count

### US-5: Affiliate Protection
**As a** site owner  
**I want to** prevent users from copying domain names  
**So that** they register through my affiliate links

**Acceptance Criteria:**
- Disable text selection on all TLD blocks
- Disable context menu (right-click) on blocks
- Clicking available domain opens GoDaddy registration
- Use affiliate tracking in all registration links

## Technical Requirements

### Data Structure
```typescript
interface Extension {
  tld: string;           // e.g., ".com"
  category: string;      // e.g., "Popular"
  available: boolean | null;
  checking: boolean;
}
```

### API Integration
- Use existing `/api/domains/instant-check` endpoint
- Batch size: 50 domains per request
- Cache results for 5 minutes
- Handle 500+ TLDs efficiently

### Performance
- Initial page load: < 200ms
- Search debounce: 500ms
- Batch checking: 50 TLDs at a time
- Total check time for 500+ TLDs: < 10 seconds

## Design Specifications

### Colors
- Available (green): `#10b981` with glow
- Taken (red): `#ef4444` with glow
- Premium (blue): `#3b82f6` with glow
- Checking (gray): `#6b7280` with pulse
- Background: `#1a1a1a`
- Block background: `#1a1a1a`
- Border: `rgba(255,255,255,0.1)`

### Typography
- TLD text: `font-mono text-sm font-medium`
- Category headers: `text-xl font-bold`
- TLD count: `text-xs text-white/40`

### Layout
- Grid: 6 columns on xl screens
- Grid: 5 columns on lg screens
- Grid: 4 columns on md screens
- Grid: 3 columns on sm screens
- Grid: 2 columns on mobile
- Gap: `gap-2` (8px)
- Category spacing: `space-y-8`

## Out of Scope
- Filtering by specific categories (show all by default)
- Sorting options
- Price display on blocks
- Detailed TLD information modals

## Success Metrics
- All 500+ TLDs displayed correctly
- Real-time availability checking works
- Page loads in < 200ms
- Affiliate links work correctly
- Mobile responsive design
