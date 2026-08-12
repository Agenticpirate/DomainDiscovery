# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
- Primary product: **DomainDiscovery**, a single Next.js 14 (App Router) app for domain name search/discovery. This is the app to run and test. Standard commands live in `package.json` (`dev`, `build`, `lint`, `typecheck`, `test`).
- Secondary/standalone: `cryptodomains/` is a separate Vite + React prototype that is NOT part of the Next.js build. It requires a `GEMINI_API_KEY` in `cryptodomains/.env.local` to function and is optional/out of scope for core work.

### Running the app (non-obvious)
- `npm run dev` serves on **port 5001** (bound to `0.0.0.0`), not the Next.js default 3000. Some older docs (`QUICK-START.md`, `.replit`) mention port 3000/5000 — ignore those; the actual port is 5001 from `package.json`.
- The app runs fully with **mock/free data and no secrets**. Domain availability uses public RDAP + DNS; there is no database, docker, or external service to start. All the API keys/feature flags in `.env.example` are optional.
- Core flow to smoke-test: open `http://localhost:5001/search`, type a query, submit, and a grid of TLD availability results appears. Equivalent API: `POST /api/domains/search` with JSON `{"query":"...","tlds":[".com",".io"]}`.

### Testing / lint / build (non-obvious)
- `npm test` (Jest) requires **`ts-node`** because the config is `jest.config.ts`. `ts-node` is a devDependency; if tests fail with "'ts-node' is required for the TypeScript configuration files", run `npm install`.
- `npm run lint` currently reports **pre-existing ESLint errors** (e.g. `react-hooks/rules-of-hooks` false positives on `useInstantDomainMcp`, some `prefer-const`). These are not caused by setup. `next build` sets `eslint.ignoreDuringBuilds: true`, so lint does NOT block the build — but `typescript.ignoreBuildErrors` is `false`, so type errors DO block the build. Use `npm run typecheck` to check types.
