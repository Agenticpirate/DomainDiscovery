/**
 * Speak a domain name via the Web Speech API (browser).
 * Works for multi-level TLDs (.co.in) and hyphenated labels.
 */
export function pronounceDomain(domain: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!('speechSynthesis' in window) || !window.speechSynthesis) return false;

  const raw = (domain || '').trim().toLowerCase();
  if (!raw) return false;

  // "raviteja.co.in" → "raviteja dot co dot in"
  // "my-brand.com" → "my dash brand dot com"
  const spoken = raw
    .replace(/^\.+|\.+$/g, '')
    .replace(/-/g, ' dash ')
    .replace(/\./g, ' dot ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!spoken) return false;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
