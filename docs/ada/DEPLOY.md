# Deploy aidomainassistant.com

## DNS

1. At your domain registrar for **aidomainassistant.com**:
   - Add domain to Vercel (or your host) project that runs this Next app
   - Point apex + `www` as instructed by the host (A/CNAME)
2. Prefer canonical **https://www.aidomainassistant.com**
3. Redirect apex → www

## Environment

```bash
NEXT_PUBLIC_ADA_HOST=www.aidomainassistant.com
NEXT_PUBLIC_ADA_URL=https://www.aidomainassistant.com
NEXT_PUBLIC_DD_API_BASE=https://www.domainsdiscovery.com
# DomainDiscovery site still uses:
NEXT_PUBLIC_BASE_URL=https://www.domainsdiscovery.com
```

## Local preview

- Path: http://localhost:5001/ada  
- Host simulation: map `ada.localhost` or `assistant.localhost` → 127.0.0.1 and open http://ada.localhost:5001/

## Middleware

`src/middleware.ts` rewrites ADA hosts to `/ada/*` routes.
