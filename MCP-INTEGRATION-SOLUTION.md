# Instant Domain Search MCP Integration - Solution

## The Challenge

The Instant Domain Search MCP tools work perfectly through Kiro Powers:
- ✅ Accurate availability checking
- ✅ Premium domain detection  
- ✅ Real GoDaddy data

**BUT** they cannot be called directly from Next.js API routes because:
- ❌ MCP tools require Kiro's MCP client infrastructure
- ❌ No direct HTTP endpoint for the MCP server
- ❌ Authentication/session management handled by Kiro

## The Solution: Hybrid Approach

Since we can't call MCP tools from Next.js directly, here's the best approach:

### Option 1: Use GoDaddy API Directly (Recommended)

The Instant Domain Search MCP is powered by GoDaddy's API. We can use it directly:

**Steps**:
1. Sign up for GoDaddy API: https://developer.godaddy.com/
2. Get API key and secret (free tier available)
3. Use their domain availability endpoint

**Implementation**:
```typescript
// src/lib/godaddyAPI.ts
export async function checkDomainWithGoDaddy(domain: string) {
  const response = await fetch(
    `https://api.godaddy.com/v1/domains/available?domain=${domain}`,
    {
      headers: {
        'Authorization': `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
        'Accept': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  return {
    domain,
    available: data.available,
    premium: data.price > 20000000, // GoDaddy returns price in micro-units
    price: data.price / 1000000, // Convert to dollars
  };
}
```

**Pros**:
- ✅ Same data source as MCP
- ✅ Accurate premium detection
- ✅ Real pricing
- ✅ Free tier available

**Cons**:
- Requires API key setup
- Rate limits apply

### Option 2: Keep Current DNS + Add Heuristics

Enhance the current DNS checking with smart heuristics:

```typescript
function estimatePremiumStatus(domain: string, dnsAvailable: boolean): {
  available: boolean;
  premium: boolean;
  confidence: number;
} {
  if (dnsAvailable) {
    return { available: true, premium: false, confidence: 100 };
  }
  
  // Domain is taken, estimate if it's premium
  const name = domain.split('.')[0];
  const tld = domain.split('.')[1];
  
  let premiumScore = 0;
  
  // Short domains are often premium
  if (name.length <= 4) premiumScore += 40;
  else if (name.length <= 6) premiumScore += 25;
  else if (name.length <= 8) premiumScore += 10;
  
  // Dictionary words
  if (isDictionaryWord(name)) premiumScore += 30;
  
  // .com domains
  if (tld === 'com') premiumScore += 20;
  
  // No numbers/hyphens
  if (!/[0-9-]/.test(name)) premiumScore += 10;
  
  return {
    available: false,
    premium: premiumScore > 50,
    confidence: premiumScore,
  };
}
```

**Pros**:
- ✅ No API keys needed
- ✅ Fast
- ✅ Free

**Cons**:
- ❌ Not 100% accurate
- ❌ Estimates only

### Option 3: Kiro-Assisted Checking (For Kiro Users)

Create a workflow where Kiro helps with premium detection:

1. User searches for domain
2. If taken, show "Check with Kiro" button
3. Button triggers Kiro agent to check via MCP
4. Kiro returns accurate premium status

**Implementation**:
```typescript
// Add button in UI
{!result.available && (
  <button onClick={() => checkWithKiro(result.domain)}>
    🤖 Check Premium Status with Kiro
  </button>
)}

// Function to trigger Kiro
function checkWithKiro(domain: string) {
  // This would integrate with Kiro's chat interface
  window.kiro?.chat(`Check if ${domain} is a premium domain`);
}
```

**Pros**:
- ✅ Uses existing MCP integration
- ✅ 100% accurate
- ✅ No API costs

**Cons**:
- ❌ Requires user interaction
- ❌ Only works in Kiro environment

## Recommended Implementation

**For Production**: Use **Option 1 (GoDaddy API)**

1. Sign up at https://developer.godaddy.com/
2. Get free API credentials
3. Add to `.env.local`:
   ```
   GODADDY_API_KEY=your_key_here
   GODADDY_API_SECRET=your_secret_here
   ```
4. Update `instant-check` route to use GoDaddy API
5. Fall back to DNS if API fails

**Cost**: Free tier includes 60 requests/minute

## Next Steps

1. **Choose approach** based on your needs
2. **Implement chosen solution**
3. **Test with known premium domains**
4. **Update UI** to show premium indicators
5. **Add pricing** for premium domains

## Current Status

✅ **Working**: Basic availability (DNS)
✅ **Working**: Kiro MCP integration (agent context only)
❌ **Not Working**: Direct MCP calls from Next.js
🔄 **In Progress**: GoDaddy API integration

## Files to Update

If implementing GoDaddy API:
- `src/lib/godaddyAPI.ts` - New file for API client
- `src/app/api/domains/instant-check/route.ts` - Use GoDaddy API
- `.env.local` - Add API credentials
- `src/components/domain/*` - Update UI for premium display

---

**Recommendation**: Proceed with GoDaddy API integration for accurate premium detection.
