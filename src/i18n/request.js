import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { loadLocaleMessages } from './loadMessages';
import { langOf } from './locales';

// Code identifiers inside messages (items[].id → icon/visual lookups): always the English value,
// so a translated id in a language file can't break a page.
const PINNED = new Set(['id', 'icon', 'key']);

// Deep-merge so any key missing from a language falls back to English (arrays are merged item by item).
function merge(base, extra) {
  if (Array.isArray(base) && Array.isArray(extra)) return extra.map((item, i) => (i < base.length ? merge(base[i], item) : item));
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return extra ?? base;
  const out = { ...base };
  for (const k of Object.keys(extra)) {
    if (PINNED.has(k) && typeof base?.[k] === 'string') continue;
    out[k] = base && typeof base[k] === 'object' && base[k] && typeof extra[k] === 'object' ? merge(base[k], extra[k]) : extra[k];
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const en = await loadLocaleMessages('en');
  const lang = langOf(locale); // regional English (en-ae, en-za…) uses the English messages
  if (lang === 'en') return { locale, messages: en };
  const own = await loadLocaleMessages(lang);
  return { locale, messages: merge(en, own) };
});
