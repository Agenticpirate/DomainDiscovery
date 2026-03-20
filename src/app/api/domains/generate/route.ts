import { NextRequest } from 'next/server';
import { getGenerateRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, isValidQuery, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { generateDomainVariationsViaMCP, checkDomainAvailabilityViaMCP } from '@/lib/instantDomainMCP';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = getGenerateRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { keyword, count = 10 } = await request.json();
    if (!keyword || !isValidQuery(keyword)) {
      return errorResponse('Invalid or missing keyword', 400);
    }

    const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '');
    const safeCount = Math.min(Math.max(1, count), 20);
    let variations = await generateRealVariations(cleanKeyword, safeCount);
    if (variations.length === 0) {
      variations = await generateFallbackVariations(cleanKeyword, safeCount);
    }

    const resp = jsonResponse(variations, request, 120);
    resp.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return resp;
  } catch (error) {
    console.error('Domain generation error:', error);
    return errorResponse('Generation failed. Please try again.', 500);
  }
}

async function generateRealVariations(keyword: string, count: number) {
  const mcpVariations = await generateDomainVariationsViaMCP({ keyword, count });
  return mcpVariations.slice(0, count).map((item, index) => ({
    domain: item.domain,
    available: item.available,
    score: Math.max(60, 95 - index * 4),
    reason: item.available ? 'Available variation from Instant Domain Search' : 'Variation found via Instant Domain Search',
  }));
}

async function generateFallbackVariations(keyword: string, count: number) {
  const prefixes = ['get', 'my', 'the', 'try', 'use', 'go', 'hey', 'app', 'join', 'meet'];
  const suffixes = ['app', 'hub', 'pro', 'hq', 'lab', 'io', 'ai', 'tech', 'now', 'live'];
  const tlds = ['.com', '.ai', '.io', '.co', '.app', '.dev'];
  const variations: Array<{ domain: string; score: number; reason: string }> = [];

  variations.push({ domain: `${keyword}.com`, score: 95, reason: 'Short and brandable' });

  for (let i = 0; i < Math.min(3, count - 1); i++) {
    variations.push({
      domain: `${prefixes[i]}${keyword}.com`,
      score: 88 - i * 2, reason: `Action-oriented with "${prefixes[i]}" prefix`,
    });
  }
  for (let i = 0; i < Math.min(3, count - variations.length); i++) {
    variations.push({
      domain: `${keyword}${suffixes[i]}.com`,
      score: 90 - i * 2, reason: `Modern with "${suffixes[i]}" suffix`,
    });
  }
  for (let i = 1; i < Math.min(tlds.length, count - variations.length + 1); i++) {
    variations.push({
      domain: `${keyword}${tlds[i]}`,
      score: 87 - i, reason: `Great for ${tlds[i].replace('.', '')} projects`,
    });
  }

  const unique = Array.from(new Map(variations.slice(0, count).map((item) => [item.domain, item])).values());
  const checked = await checkDomainAvailabilityViaMCP({ domains: unique.map((item) => item.domain) });
  const availability = new Map(checked.map((item) => [item.domain.toLowerCase(), item.available]));

  return unique.map((item) => ({
    ...item,
    available: availability.get(item.domain.toLowerCase()) ?? false,
  }));
}
