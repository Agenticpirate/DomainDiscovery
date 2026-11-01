import { headers } from 'next/headers';
import { isLocaleId, type LocaleId } from './locales';

export async function getRequestLocale(): Promise<LocaleId> {
  const headerStore = await headers();
  const value = headerStore.get('x-dd-locale') || 'en';
  return isLocaleId(value) ? value : 'en';
}

export async function getRequestPath(): Promise<string> {
  const headerStore = await headers();
  const value = headerStore.get('x-dd-path') || '/';
  if (!value.startsWith('/')) return '/';
  return value;
}
