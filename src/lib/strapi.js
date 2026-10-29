/**
 * Minimal Strapi (v5) REST client — server side only.
 *
 * env:
 *   STRAPI_URL        e.g. https://cms.gtcfx.com      (no trailing slash)
 *   STRAPI_TOKEN      read-only API token (Settings → API Tokens)
 *   STRAPI_REVALIDATE seconds to cache responses (ISR), default 300
 *
 * Every helper resolves to `null` when Strapi is not configured or the request fails,
 * so pages can fall back to local sample content instead of breaking the build.
 */
import { langOf } from '@/i18n/locales';
const BASE = process.env.STRAPI_URL?.replace(/\/$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
const REVALIDATE = Number(process.env.STRAPI_REVALIDATE ?? 300);

// next-intl locale → Strapi i18n locale (only where the codes differ)
const LOCALE_MAP = { 'zh-TW': 'zh-Hant-TW', zh: 'zh-Hans' };

export const strapiConfigured = () => Boolean(BASE);

/** next-intl locale → Strapi locale code. */
export const strapiLocale = (locale) => {
  const lang = langOf(locale); // en-ae, en-za… → en
  return LOCALE_MAP[lang] ?? lang;
};
/** Same mapping; strapiFaqs.js imports it under this name. */
export const mapStrapiLocale = strapiLocale;

/** Encode a nested object as Strapi query string: { filters: { endDate: { $gte: '2026-01-01' } } } → filters[endDate][$gte]=… */
export function toQuery(obj, prefix = '') {
  const parts = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' ? parts.push(toQuery(item, `${key}[${i}]`)) : parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`)));
    else if (typeof v === 'object') parts.push(toQuery(v, key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.filter(Boolean).join('&');
}

/** GET /api/{path}?{query} — returns the parsed JSON body or null. */
export async function strapiGet(path, { query, locale, tags } = {}) {
  if (!BASE) return null;
  const q = toQuery({ ...query, ...(locale ? { locale: strapiLocale(locale) } : {}) });
  try {
    const res = await fetch(`${BASE}/api/${path}${q ? `?${q}` : ''}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      next: { revalidate: REVALIDATE, tags }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Absolute URL for a Strapi media object (handles local uploads and S3/CDN providers). */
export function mediaUrl(media) {
  const url = media?.url;
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : `${BASE ?? ''}${url}`;
}

/** Normalise a Strapi media object → { url, alt, width, height } (or null). Prefers a "large"/"medium" format for thumbs when asked. */
export function toImage(media, format) {
  if (!media) return null;
  const f = format && media.formats?.[format];
  const src = f ?? media;
  const url = mediaUrl(src);
  return url ? { url, alt: media.alternativeText ?? '', width: src.width ?? null, height: src.height ?? null } : null;
}

/** Strapi "blocks" rich text (or a plain/markdown string) → array of paragraph strings. */
export function toParagraphs(value) {
  if (!value) return [];
  if (typeof value === 'string')
    return value
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  if (Array.isArray(value))
    return value
      .filter((b) => b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote')
      .map((b) => (b.children ?? []).map((c) => c.text ?? (c.children ?? []).map((cc) => cc.text ?? '').join('')).join(''))
      .map((p) => p.trim())
      .filter(Boolean);
  return [];
}
