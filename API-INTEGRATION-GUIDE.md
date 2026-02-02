# API Integration Guide

This guide explains how to connect your domain search platform to real domain availability APIs.

## 🎯 Current Status

Your application is now set up with:
- ✅ Frontend components (all features from Instant Domain Search)
- ✅ Backend API routes (`/api/domains/*`)
- ✅ Service layer (`instantDomainService.ts`)
- ⚠️ Mock data (fallback when no API is configured)

## 🔌 API Integration Options

### Option 1: Domainr API (Recommended)

**Best for**: Fast, reliable domain checking with good coverage

**Setup**:
1. Sign up at [https://domainr.build/](https://domainr.build/)
2. Get your API key
3. Add to `.env.local`:
```env
DOMAINR_API_KEY=your_api_key_here
```

**Pricing**: Free tier available, paid plans for higher volume

**Features**:
- Real-time availability checking
- 1,600+ TLD support
- Fast response times (< 100ms)
- Domain suggestions

---

### Option 2: RapidAPI Domain Checker

**Best for**: Budget-friendly option with multiple providers

**Setup**:
1. Sign up at [https://rapidapi.com/](https://rapidapi.com/)
2. Subscribe to "Domain Availability Checker" API
3. Add to `.env.local`:
```env
RAPIDAPI_KEY=your_rapidapi_key_here
```

**Pricing**: Free tier with 100 requests/month, paid plans available

**Features**:
- Bulk domain checking
- Multiple TLD support
- Price comparison data

---

### Option 3: WHOIS-Based Checking

**Best for**: Free solution, but slower

**Setup**:
1. Install WHOIS package:
```bash
npm install whois
```

2. Add to `.env.local`:
```env
USE_WHOIS_CHECK=true
```

3. Implement in `src/app/api/domains/check/route.ts`:
```typescript
import whois from 'whois';

async function checkWithWhois(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    whois.lookup(domain, (err, data) => {
      if (err) {
        resolve(false);
      }
      // Parse WHOIS data to determine availability
      const available = !data || data.includes('No match');
      resolve(available);
    });
  });
}
```

**Pricing**: Free

**Limitations**:
- Slower (1-3 seconds per domain)
- Rate limited by WHOIS servers
- Less reliable for some TLDs

---

### Option 4: Instant Domain Search MCP (For AI Assistants)

**Best for**: Using within Claude, ChatGPT, or Cursor

**Note**: The Instant Domain Search MCP is designed for AI assistants, not direct web API access. However, you could:

1. Set up an MCP client in your backend
2. Use it to query their domain API
3. Proxy results to your frontend

**Setup** (Advanced):
```bash
npm install @modelcontextprotocol/sdk
```

Then create an MCP client that connects to:
```
https://instantdomainsearch.com/mcp/streamable-http
```

---

## 🚀 Quick Start (Development Mode)

For immediate testing without API keys:

1. The app already works with **mock data**
2. All features are functional
3. Results are randomized but realistic

To switch to real data, just add API keys to `.env.local`

---

## 📝 Environment Variables

Create or update `.env.local`:

```env
# Domain Availability APIs (choose one or more)
DOMAINR_API_KEY=your_domainr_key
RAPIDAPI_KEY=your_rapidapi_key
USE_WHOIS_CHECK=false

# AI Generation (optional)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Other APIs (optional)
WHOIS_API_KEY=your_whois_api_key
DOMAIN_VALUE_API_KEY=your_value_api_key
```

---

## 🔧 Implementation Steps

### Step 1: Choose Your API Provider

Pick one from the options above based on:
- Budget
- Required speed
- Volume of requests
- Feature requirements

### Step 2: Get API Keys

Sign up and get your API keys from your chosen provider(s).

### Step 3: Configure Environment

Add keys to `.env.local` (never commit this file!)

### Step 4: Test the Integration

```bash
# Start development server
npm run dev

# Test domain search
curl -X POST http://localhost:3000/api/domains/search \
  -H "Content-Type: application/json" \
  -d '{"query":"example","tlds":[".com",".net"]}'
```

### Step 5: Update Frontend

The frontend already uses the API routes, so once you configure the backend, it will automatically use real data!

---

## 🎨 API Endpoints

Your app now has these endpoints:

### POST `/api/domains/search`
Search domains across multiple TLDs
```json
{
  "query": "myapp",
  "tlds": [".com", ".net", ".ai"]
}
```

### POST `/api/domains/generate`
Generate domain name variations
```json
{
  "keyword": "tech",
  "count": 10
}
```

### POST `/api/domains/check`
Check specific domains
```json
{
  "domains": ["example.com", "test.net"]
}
```

---

## 💡 Recommended Setup

For production, we recommend:

1. **Primary**: Domainr API (fast, reliable)
2. **Fallback**: WHOIS checking (free backup)
3. **AI Generation**: OpenAI or Gemini (optional)

This gives you:
- Fast results from Domainr
- Free fallback if API limits reached
- AI-powered name generation

---

## 🔒 Security Notes

1. **Never expose API keys** in frontend code
2. **Always use environment variables**
3. **Add rate limiting** to your API routes
4. **Validate all inputs** before making API calls
5. **Cache results** to reduce API costs

Example rate limiting:
```typescript
// Add to your API routes
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  
  if (!rateLimit(ip, 10, 60000)) { // 10 requests per minute
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // ... rest of your code
}
```

---

## 📊 Cost Comparison

| Provider | Free Tier | Paid Plans | Speed | Reliability |
|----------|-----------|------------|-------|-------------|
| Domainr | 100/day | $29/mo+ | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| RapidAPI | 100/mo | $10/mo+ | ⚡⚡ | ⭐⭐⭐⭐ |
| WHOIS | Unlimited | Free | ⚡ | ⭐⭐⭐ |

---

## 🐛 Troubleshooting

### "No API configured" warning
- Add API keys to `.env.local`
- Restart your dev server

### API requests failing
- Check API key is correct
- Verify API endpoint URLs
- Check rate limits
- Review API provider status page

### Slow responses
- Enable caching in `src/lib/cache.ts`
- Use faster API provider
- Implement request batching

---

## 📚 Additional Resources

- [Domainr API Docs](https://domainr.build/docs)
- [RapidAPI Hub](https://rapidapi.com/hub)
- [WHOIS Protocol](https://en.wikipedia.org/wiki/WHOIS)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Next Steps

1. Choose an API provider
2. Get API keys
3. Add to `.env.local`
4. Test the integration
5. Deploy to production

Your domain search platform is ready to go live! 🚀
