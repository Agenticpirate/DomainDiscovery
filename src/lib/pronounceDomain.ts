/**
 * Speak a domain name via the Web Speech API.
 * Tuned for clear, natural voice (same spirit as the original single-dot Say).
 */

function preferredVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;

  // Prefer natural / premium English voices when the OS exposes them
  const rank = (v: SpeechSynthesisVoice): number => {
    const name = `${v.name} ${v.lang}`.toLowerCase();
    let score = 0;
    if (/en(-|_)?us|en(-|_)?gb|en(-|_)?au|english/.test(name)) score += 10;
    if (/samantha|karen|moira|daniel|google|microsoft|siri|premium|enhanced|natural|neural|aria|jenny|zira|susan/.test(name))
      score += 20;
    if (/compact|mini|eloquence|robot|fred|albert/.test(name)) score -= 15;
    if (v.localService) score += 2;
    if (v.default) score += 1;
    return score;
  };

  return [...voices].sort((a, b) => rank(b) - rank(a))[0];
}

/** Warm the voice list (Chrome loads voices async). Call once on first user gesture. */
let warmed = false;
function ensureVoicesLoaded(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || warmed) return;
  warmed = true;
  window.speechSynthesis.getVoices();
  // Some browsers fire this when the list is ready
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

/**
 * Convert domain → spoken form, close to the original “name dot tld” phrasing.
 * Avoids harsh multi-token rewrites that make TTS sound cracked.
 */
function toSpoken(domain: string): string {
  const raw = (domain || '').trim();
  if (!raw) return '';

  // Keep readable casing for TTS; only normalize separators
  // "raviteja.co.in" → "raviteja dot co dot in"
  // "my-brand.com" → "my brand dot com" (hyphen as light pause, not "dash")
  return raw
    .replace(/^\.+|\.+$/g, '')
    .replace(/-+/g, ' ')
    .replace(/\./g, ' dot ')
    .replace(/\s+/g, ' ')
    .trim();
}

function speakNow(spoken: string): boolean {
  try {
    const utterance = new SpeechSynthesisUtterance(spoken);
    // Original used 0.9 — keep it; slightly higher pitch reads cleaner on mobile
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = preferredVoice();
    if (voice) {
      utterance.voice = voice;
      // Prefer the voice’s own locale over forcing en-US (forcing can pick a low-quality fallback)
      if (voice.lang) utterance.lang = voice.lang;
      else utterance.lang = 'en-US';
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/**
 * Speak a domain. Returns false if speech is unavailable.
 */
export function pronounceDomain(domain: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!('speechSynthesis' in window) || !window.speechSynthesis) return false;

  ensureVoicesLoaded();

  const spoken = toSpoken(domain);
  if (!spoken) return false;

  try {
    // Hard cancel → speak() in the same tick cracks/chops audio on Chrome/Safari.
    // Stop current speech, then start on the next frame with a short gap.
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      window.setTimeout(() => {
        speakNow(spoken);
      }, 60);
      return true;
    }

    return speakNow(spoken);
  } catch {
    return false;
  }
}
