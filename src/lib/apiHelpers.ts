/**
 * Shared API helpers for CORS, validation, and response formatting.
 */
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

/** Headers agents use for MCP / BYOK LLM / registrar automation */
const AGENT_CORS_HEADERS = [
  'Content-Type',
  'Accept',
  'Authorization',
  'x-agent-api-key',
  'x-ada-agent-id',
  'x-agent-id',
  'x-ada-client-id',
  'x-mcp-mode',
  'x-ada-llm-provider',
  'x-ada-llm-api-key',
  'x-ada-llm-model',
  'x-ada-llm-base-url',
  'x-llm-provider',
  'x-llm-api-key',
  'x-llm-model',
  'x-llm-base-url',
  'x-ada-registrar',
  'x-ada-registrar-api-key',
  'x-ada-registrar-secret',
  'x-ada-registrar-account-id',
  'x-ada-registrar-client-ip',
  'x-ada-registrar-username',
  'x-ada-registrar-email',
  'x-ada-human-confirm',
  'x-ada-max-budget-usd',
  'x-human-confirm-token',
  'x-registrar-api-key',
  'x-registrar-provider',
].join(', ');

/** Add CORS headers to a response (mutates headers in place) */
export function applyCORS(response: NextResponse, request: NextRequest): void {
  const origin = request.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', AGENT_CORS_HEADERS);
  response.headers.set(
    'Access-Control-Expose-Headers',
    'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-ADA-Engine, X-ADA-Session, X-ADA-Agent-Id, X-ADA-Scale-Tier, X-ADA-IP-Remaining, Retry-After'
  );
  response.headers.set('Access-Control-Max-Age', '86400');
}

/** Standard error response */
export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Validate that a string is a plausible domain query (no injection) */
export function isValidQuery(query: string): boolean {
  if (!query || query.length > 100) return false;
  return /^[a-zA-Z0-9\s.\-]+$/.test(query);
}

/** Add Cache-Control header (mutates in place) */
export function applyCacheHeaders(response: NextResponse, maxAge = 60): void {
  response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
}

/** Build a JSON response with CORS + cache headers applied */
export function jsonResponse(data: unknown, request: NextRequest, cacheMaxAge = 60): NextResponse {
  const resp = NextResponse.json(data);
  applyCORS(resp, request);
  applyCacheHeaders(resp, cacheMaxAge);
  return resp;
}

/** CORS preflight response */
export function corsPreflightResponse(request: NextRequest): NextResponse {
  const resp = new NextResponse(null, { status: 204 });
  applyCORS(resp, request);
  return resp;
}
