import { en } from './messages/en';
import { zh } from './messages/zh';
import { hi } from './messages/hi';
import { de } from './messages/de';
import { es } from './messages/es';
import { ja } from './messages/ja';
import { fr } from './messages/fr';
import { ar } from './messages/ar';
import { bn } from './messages/bn';
import { pt } from './messages/pt';
import { ru } from './messages/ru';
import { ur } from './messages/ur';
import type { LocaleId } from './locales';
import type { Messages } from './types';

const CATALOG: Record<LocaleId, Messages> = { en, zh, de, es, ja, fr, pt, hi, ar, ru, bn, ur };

function sameShape(source: unknown, other: unknown, path: string): void {
  if (typeof source === 'string') {
    if (typeof other !== 'string' || other.trim() === '') {
      throw new Error(`Missing translation at ${path}`);
    }
    return;
  }
  if (Array.isArray(source)) {
    if (path.endsWith('.keywords')) {
      if (!Array.isArray(other) || other.some((item) => typeof item !== 'string' || item.trim() === '')) {
        throw new Error(`Missing keywords at ${path}`);
      }
      return;
    }
    if (!Array.isArray(other)) {
      throw new Error(`Translation array missing at ${path}`);
    }
    if (other.length < source.length) {
      for (let i = other.length; i < source.length; i++) {
        other.push(source[i]);
      }
    }
    source.forEach((item, index) => sameShape(item, other[index], `${path}[${index}]`));
    return;
  }
  if (source && typeof source === 'object') {
    const record = other as Record<string, unknown> | null;
    if (!record || typeof record !== 'object') throw new Error(`Translation object missing at ${path}`);
    for (const key of Object.keys(source as Record<string, unknown>)) {
      if (record[key] === undefined) {
        record[key] = (source as Record<string, unknown>)[key];
      }
      sameShape((source as Record<string, unknown>)[key], record[key], `${path}.${key}`);
    }
  }
}

for (const id of Object.keys(CATALOG) as LocaleId[]) {
  if (id !== 'en') sameShape(en, CATALOG[id], id);
}

export function getMessages(locale: LocaleId): Messages {
  return CATALOG[locale] ?? en;
}

export function getPageCopy(locale: LocaleId, path: string) {
  const pages = getMessages(locale).pages;
  const key =
    path === '/' ? 'home'
    : path === '/search' ? 'search'
    : path === '/generator' ? 'generator'
    : path === '/bulk-search' ? 'bulk'
    : path === '/domain-extensions' ? 'extensions'
    : path === '/tools/whois' ? 'whois'
    : path === '/tools/compare' ? 'compare'
    : path === '/tools/geo' ? 'geo'
    : path === '/faq' ? 'faq'
    : path === '/contact' ? 'contact'
    : null;
  return key ? pages[key] : null;
}
