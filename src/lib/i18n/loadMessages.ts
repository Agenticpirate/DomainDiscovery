import type { LocaleId } from './locales';
import type { Messages } from './types';

const loaders: Record<LocaleId, () => Promise<Messages>> = {
  en: () => import('./messages/en').then((mod) => mod.en),
  zh: () => import('./messages/zh').then((mod) => mod.zh),
  de: () => import('./messages/de').then((mod) => mod.de),
  es: () => import('./messages/es').then((mod) => mod.es),
  ja: () => import('./messages/ja').then((mod) => mod.ja),
  fr: () => import('./messages/fr').then((mod) => mod.fr),
  pt: () => import('./messages/pt').then((mod) => mod.pt),
  hi: () => import('./messages/hi').then((mod) => mod.hi),
  ar: () => import('./messages/ar').then((mod) => mod.ar),
  ru: () => import('./messages/ru').then((mod) => mod.ru),
  bn: () => import('./messages/bn').then((mod) => mod.bn),
  ur: () => import('./messages/ur').then((mod) => mod.ur),
};

const resolved = new Map<LocaleId, Messages>();
const inflight = new Map<LocaleId, Promise<Messages>>();

export function rememberMessages(locale: LocaleId, messages: Messages) {
  resolved.set(locale, messages);
}

export function peekMessages(locale: LocaleId): Messages | undefined {
  return resolved.get(locale);
}

export function loadMessages(locale: LocaleId): Promise<Messages> {
  const ready = resolved.get(locale);
  if (ready) return Promise.resolve(ready);
  const pending = inflight.get(locale);
  if (pending) return pending;
  const next = loaders[locale]().then((messages) => {
    resolved.set(locale, messages);
    inflight.delete(locale);
    return messages;
  });
  inflight.set(locale, next);
  return next;
}

export function preloadMessages(locale: LocaleId) {
  void loadMessages(locale);
}
