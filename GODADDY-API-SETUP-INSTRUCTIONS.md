# GoDaddy API Setup Instructions

## Current Status

❌ **API Authentication Failed**

The credentials provided are not valid GoDaddy API credentials:
```
Error: "UNABLE_TO_AUTHENTICATE" - Bad Request
```

## How to Get Real GoDaddy API Credentials

### Step 1: Create GoDaddy Developer Account

1. Visit: https://developer.godaddy.com/
2. Click "Sign In" or "Get Started"
3. Create an account or sign in with existing GoDaddy account

### Step 2: Generate API Keys

1. Go to: https://developer.godaddy.com/keys
2. Click "Create New API Key"
3. Choose environment:
   - **Production** (OTE) - For live domain checking
   - **Test** - For development/testing
4. Give it a name (e.g., "Domain Availability Checker")
5. Click "Next"
6. **Copy both the Key and Secret** immediately (you won't see them again!)

### Step 3: Add to Your Project

1. Open `.env.local` file
2. Replace with your real credentials:
   ```
   GODADDY_API_KEY=your_real_key_here
   GODADDY_API_SECRET=your_real_secret_here
   ```
3. Restart the dev server

## API Limits (Free Tier)

- **60 requests per minute**
- **Unlimited domains**
- **No cost** for availability checking
- Premium domain detection included

## Alternative: Use DNS Checking (Current Fallback)

If you don't want to set up GoDaddy API, the system will continue using DNS checking:

**Pros**:
- ✅ No API signup needed
- ✅ Free
- ✅ Fast

**Cons**:
- ❌ Cannot detect premium domains
- ❌ Less accurate for taken domains
- ❌ No pricing information

## Testing Your API Credentials

Once you have real credentials, test them:

```bash
curl -X GET "https://api.godaddy.com/v1/domains/available?domain=test.com" \
  -H "Authorization: sso-key YOUR_KEY:YOUR_SECRET" \
  -H "Accept: application/json"
```

**Expected response**:
```json
{
  "available": false,
  "domain": "test.com",
  "definitive": true,
  "price": 12990000,
  "currency": "USD",
  "period": 1
}
```

## What Happens Now

The system is currently using **DNS fallback** for domain checking:
- ✅ Basic availability works
- ❌ Premium detection doesn't work
- ❌ Pricing not available

Once you add real GoDaddy API credentials:
- ✅ Accurate availability
- ✅ Premium domain detection
- ✅ Real pricing
- ✅ 100% accuracy

## Quick Links

- **Get API Keys**: https://developer.godaddy.com/keys
- **API Documentation**: https://developer.godaddy.com/doc/endpoint/domains
- **Support**: https://developer.godaddy.com/support

---

**Next Step**: Get real API credentials from GoDaddy Developer Portal and update `.env.local`
