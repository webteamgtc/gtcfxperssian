/**
 * Legal policy documents (privacy policy, terms, cookie policy…) are JSON files on S3:
 *   <DOCUMENTS_URL>/<slug>/<lang>.json
 * Shape: { sidebarLabels?, topSection { badge, title, description, aboutThisPolicy, keyNotice }, content: Section[], footer }
 * (some files are a bare Section[]). A translated file only has to contain what it translates —
 * anything missing comes from the English file.
 */
import { langOf } from '@/i18n/locales';

const DOCUMENTS_URL = (process.env.NEXT_PUBLIC_DOCUMENTS_URL || 'https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/documents').replace(/\/$/, '');
export const LEGAL_REVALIDATE = 3600;

/** Web policy pages under /legal/<slug>, in the order they are listed across the site. */
export const LEGAL_SLUGS = [
  'privacy-policy',
  'terms-and-conditions',
  'risk-disclosure',
  'cookie-policy',
  'deposit-and-refund-policy',
  'kyc-compliance-policy',
  'website-disclaimer',
  'swap-free-terms-and-conditions'
];

const isSections = (v) => Array.isArray(v) && v.length > 0 && v.every((s) => s && typeof s === 'object' && typeof s.id === 'string' && Array.isArray(s.content));

function normalise(payload) {
  if (isSections(payload)) return { content: payload };
  return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : null;
}

async function fetchDoc(slug, lang) {
  try {
    const res = await fetch(`${DOCUMENTS_URL}/${slug}/${encodeURIComponent(lang)}.json`, { next: { revalidate: LEGAL_REVALIDATE } });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return null;
    return normalise(await res.json());
  } catch {
    return null;
  }
}

/**
 * The documents link to gtcfx.com/en-intl/… and to site paths such as "/contact-us"; point those at the
 * visitor's locale and at this site's routes.
 */
const PATH_FIXES = { '/contact-us': '/company/contact-us', '/legal/deposit-refund-policy': '/legal/deposit-and-refund-policy' };
function localiseUrls(value, locale) {
  if (typeof value === 'string') return value.replace(/(https?:\/\/(?:www\.)?gtcfx\.com)\/en-intl(?=\/|\b)/g, `$1/${locale}`);
  if (Array.isArray(value)) return value.map((v) => localiseUrls(v, locale));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = k === 'href' && typeof v === 'string' ? (PATH_FIXES[v] ?? v) : localiseUrls(v, locale);
    return out;
  }
  return value;
}

/** The locale's own file (regional English: en-za.json, en-mu.json…), else its language's (es.json); null for plain English. */
async function fetchLocalised(slug, locale, lang) {
  const own = locale !== lang ? await fetchDoc(slug, locale) : null;
  return own ?? (lang === 'en' ? null : fetchDoc(slug, lang));
}

/** Document for a locale (regional / translated where that file exists, English otherwise); null if unavailable. */
export async function getLegalDocument(slug, locale) {
  const lang = langOf(locale);
  const [english, localised] = await Promise.all([fetchDoc(slug, 'en'), fetchLocalised(slug, locale, lang)]);
  const base = english || {};
  const doc = localised
    ? { ...base, ...localised, topSection: localised.topSection ?? base.topSection, footer: localised.footer ?? base.footer, content: localised.content ?? base.content }
    : english;
  if (!doc || !Array.isArray(doc.content)) return null;
  return localiseUrls({ ...doc, content: doc.content.filter((s) => s?.id) }, locale);
}
