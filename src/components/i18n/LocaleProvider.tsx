'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  getLocaleMeta,
  localeFromPathname,
  localeNavHref,
  persistLocaleChoice,
  switchLocaleHref,
  type LocaleId,
} from '@/lib/i18n/locales';
import { loadMessages, peekMessages, rememberMessages } from '@/lib/i18n/loadMessages';
import type { Messages } from '@/lib/i18n/types';

type LocaleContextValue = {
  locale: LocaleId;
  messages: Messages;
  href: (path: string) => string;
  switchHref: (locale: LocaleId, pathname: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: LocaleId;
  messages: Messages;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/';
  const pathLocale = localeFromPathname(pathname);
  rememberMessages(locale, messages);

  const [held, setHeld] = useState<{ locale: LocaleId; messages: Messages }>({ locale, messages });
  const cached = peekMessages(pathLocale);
  if (cached && held.locale !== pathLocale) {
    setHeld({ locale: pathLocale, messages: cached });
  }
  const activeLocale = cached ? pathLocale : held.locale;
  const activeMessages = cached ?? held.messages;

  useEffect(() => {
    if (peekMessages(pathLocale)) return;
    let cancelled = false;
    loadMessages(pathLocale).then((next) => {
      if (!cancelled) setHeld({ locale: pathLocale, messages: next });
    });
    return () => {
      cancelled = true;
    };
  }, [pathLocale]);

  useLayoutEffect(() => {
    if (activeLocale !== pathLocale) return;
    const meta = getLocaleMeta(activeLocale);
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    persistLocaleChoice(activeLocale);
  }, [activeLocale, pathLocale]);

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale: activeLocale,
      messages: activeMessages,
      href: (path: string) => localeNavHref(activeLocale, path),
      switchHref: switchLocaleHref,
    }),
    [activeLocale, activeMessages]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return value;
}

export type Translate = (text: string, vars?: Record<string, string | number>) => string;
/** Looks up UI copy by its English text; falls back to the English text itself. */
export function useT(): Translate {
  const { messages } = useLocale();
  return React.useCallback<Translate>(
    (text, vars) => {
      let out = messages.tx[text] ?? text;
      if (vars) for (const key of Object.keys(vars)) out = out.split(`{${key}}`).join(String(vars[key]));
      return out;
    },
    [messages]
  );
}
