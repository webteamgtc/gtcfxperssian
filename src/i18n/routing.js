import { defineRouting } from 'next-intl/routing';
import { LOCALES, DEFAULT_LOCALE } from './locales';

export const routing = defineRouting({
  locales: LOCALES.map((l) => l.code),
  defaultLocale: DEFAULT_LOCALE,
  // no NEXT_LOCALE cookie: a URL without a locale always goes to the visitor's regional site (src/proxy.js)
  localeCookie: false
});
