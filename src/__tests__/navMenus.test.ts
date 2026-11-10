import { getMessages } from '@/lib/i18n';
import { LOCALES } from '@/lib/i18n/locales';

/**
 * Navigation.tsx reads nav.searchItems and nav.toolItems by position. Language files are
 * merged over English by position too, so a language that lists fewer items than English
 * silently gets the missing ones in English, and an extra English item shifts the labels of
 * the slots Navigation fills itself (Tools: Domain Value, Domain Age, DNS Lookup).
 */
const en = getMessages('en').nav;

describe('nav menu copy', () => {
  it('English: Domain Leads lives in Search only; Tools lists the first four tools', () => {
    expect(en.searchItems.map((i) => i.label)).toContain('Domain Leads');
    expect(en.toolItems).toHaveLength(4);
    expect(en.toolItems.map((i) => i.label).join(' ')).not.toMatch(/lead/i);
  });

  it.each(LOCALES.map((l) => l.id).filter((id) => id !== 'en'))(
    '%s: Search menu is fully translated and Tools copy covers exactly four tools',
    (locale) => {
      const nav = getMessages(locale).nav;
      expect(nav.searchItems).toHaveLength(en.searchItems.length);
      nav.searchItems.forEach((item, i) => {
        expect(item.label).not.toBe(en.searchItems[i].label);
        expect(item.description).not.toBe(en.searchItems[i].description);
      });
      expect(nav.toolItems).toHaveLength(4);
      nav.toolItems.forEach((item, i) => expect(item.label).not.toBe(en.toolItems[i].label));
    }
  );
});
