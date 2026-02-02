/**
 * Premium Domain Detection using Heuristics
 * 
 * Since we don't have access to paid APIs, we use smart heuristics
 * to estimate if a taken domain is likely premium/for sale.
 */

// Common dictionary words that are valuable as domains
const DICTIONARY_WORDS = new Set([
  'premium', 'elite', 'pro', 'best', 'top', 'super', 'mega', 'ultra',
  'shop', 'store', 'market', 'buy', 'sell', 'trade', 'deal',
  'tech', 'app', 'web', 'net', 'digital', 'online', 'cloud',
  'finance', 'money', 'bank', 'pay', 'cash', 'credit',
  'health', 'medical', 'care', 'doctor', 'dental',
  'travel', 'hotel', 'flight', 'tour', 'vacation',
  'food', 'restaurant', 'cafe', 'pizza', 'delivery',
  'auto', 'car', 'drive', 'ride', 'motor',
  'home', 'house', 'real', 'estate', 'property',
  'game', 'play', 'fun', 'sport', 'fitness',
  'news', 'media', 'blog', 'video', 'photo',
  'social', 'chat', 'meet', 'date', 'friend',
  'learn', 'education', 'school', 'course', 'training',
]);

// Known corporate/tech company patterns (not premium listings)
const CORPORATE_PATTERNS = new Set([
  'google', 'facebook', 'amazon', 'microsoft', 'apple', 'netflix',
  'twitter', 'linkedin', 'instagram', 'youtube', 'reddit', 'github',
  'stackoverflow', 'wikipedia', 'wordpress', 'dropbox', 'spotify',
  'airbnb', 'uber', 'tesla', 'nvidia', 'intel', 'oracle', 'adobe',
  'salesforce', 'shopify', 'stripe', 'paypal', 'ebay', 'walmart'
]);

/**
 * Estimate if a domain is likely premium based on characteristics
 */
export function estimatePremiumLikelihood(domain: string): {
  isProbablyPremium: boolean;
  confidence: number;
  reasons: string[];
} {
  const name = domain.split('.')[0].toLowerCase();
  const tld = domain.split('.')[1]?.toLowerCase() || 'com';
  
  let score = 0;
  const reasons: string[] = [];
  
  // Exclude known corporate domains (not premium listings)
  if (CORPORATE_PATTERNS.has(name) && tld === 'com') {
    return {
      isProbablyPremium: false,
      confidence: 0,
      reasons: ['Known corporate domain - not a premium listing']
    };
  }
  
  // Exclude very short domains (likely corporate, not premium listings)
  // Examples: fb.com, go.com, hp.com
  if (name.length <= 6 && tld === 'com') {
    // These are likely major companies, not premium listings
    return {
      isProbablyPremium: false,
      confidence: 0,
      reasons: ['Very short .com domain - likely corporate, not premium listing']
    };
  }
  
  // 1. Domain length (shorter = more valuable, but not too short)
  if (name.length >= 7 && name.length <= 10) {
    score += 35;
    reasons.push('Optimal length for premium (7-10 chars)');
  } else if (name.length >= 11 && name.length <= 15) {
    score += 20;
    reasons.push('Good length for brandable domain');
  } else if (name.length > 15) {
    score += 5;
    reasons.push('Longer domain');
  }
  
  // 2. Dictionary word
  if (DICTIONARY_WORDS.has(name)) {
    score += 40;
    reasons.push('Common dictionary word');
  }
  
  // 3. TLD value (.com is most valuable)
  if (tld === 'com') {
    score += 25;
    reasons.push('.com TLD (most valuable)');
  } else if (['net', 'org', 'io', 'ai'].includes(tld)) {
    score += 15;
    reasons.push(`Popular .${tld} TLD`);
  }
  
  // 4. No numbers or hyphens (cleaner = more valuable)
  if (!/[0-9]/.test(name)) {
    score += 15;
    reasons.push('No numbers');
  }
  if (!/-/.test(name)) {
    score += 10;
    reasons.push('No hyphens');
  }
  
  // 5. Pronounceable (has vowels)
  const vowels = (name.match(/[aeiou]/g) || []).length;
  const consonants = name.length - vowels;
  if (vowels > 0 && consonants > 0 && vowels / name.length > 0.2) {
    score += 10;
    reasons.push('Pronounceable');
  }
  
  // 6. Single word (no multiple words concatenated)
  if (!name.includes('-') && name.length <= 12) {
    score += 5;
    reasons.push('Single word');
  }
  
  // 7. Brandable patterns
  if (/^[a-z]{7,12}$/.test(name) && vowels >= 2) {
    score += 10;
    reasons.push('Brandable pattern');
  }
  
  // Premium threshold: score > 80 (more conservative to avoid false positives)
  // Only mark as premium if we're very confident
  const isProbablyPremium = score >= 80;
  const confidence = Math.min(score, 100);
  
  return {
    isProbablyPremium,
    confidence,
    reasons: isProbablyPremium ? reasons : [],
  };
}

/**
 * Check if a word is in common dictionary
 */
function isDictionaryWord(word: string): boolean {
  return DICTIONARY_WORDS.has(word.toLowerCase());
}

/**
 * Estimate domain value range
 */
export function estimateDomainValue(domain: string): {
  min: number;
  max: number;
  currency: string;
} {
  const { confidence } = estimatePremiumLikelihood(domain);
  
  if (confidence >= 80) {
    return { min: 5000, max: 50000, currency: 'USD' };
  } else if (confidence >= 60) {
    return { min: 1000, max: 10000, currency: 'USD' };
  } else if (confidence >= 40) {
    return { min: 100, max: 2000, currency: 'USD' };
  } else {
    return { min: 10, max: 100, currency: 'USD' };
  }
}
