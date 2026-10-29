/**
 * Help-center FAQs from Strapi (server side; cached via strapiGet / STRAPI_REVALIDATE).
 *
 *  faqs-categories  { name, slug }
 *  faqs             { question, answer (rich-text HTML), faqs_category (relation) }
 *
 * The locale is used when it has FAQs, otherwise English. Answers are reduced to safe text markup
 * (p, lists, emphasis, links) — the CMS HTML carries editor wrappers and inline styles.
 */
import { strapiGet } from './strapi';
import { langOf } from '@/i18n/locales';

const PAGE = 100;
const ALLOWED = new Set(['a', 'b', 'br', 'em', 'i', 'li', 'ol', 'p', 'strong', 'u', 'ul']);
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

const attrs = (row) => (row?.attributes ? { id: row.id, ...row.attributes } : row ?? {});
const rel = (r) => {
  const d = r?.data !== undefined ? r.data : r;
  return d ? attrs(Array.isArray(d) ? d[0] : d) : null;
};

/** CMS HTML → allowed tags only; links keep a safe href (external ones open in a new tab). */
export function sanitizeFaqHtml(html) {
  return String(html ?? '')
    .replace(/<(script|style|template)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, rawTag, rawAttrs) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED.has(tag)) return tag === 'div' && full.startsWith('</') ? ' ' : '';
      if (full.startsWith('</')) return `</${tag}>`;
      if (tag === 'br') return '<br />';
      if (tag !== 'a') return `<${tag}>`;
      const href = /\bhref\s*=\s*(["'])(.*?)\1/i.exec(rawAttrs)?.[2]?.trim() ?? '';
      if (!SAFE_HREF.test(href)) return '';
      return /^https?:/i.test(href) ? `<a href="${href}" target="_blank" rel="noopener noreferrer">` : `<a href="${href}">`;
    })
    .replace(/&nbsp;| /gi, ' ')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Plain text of an answer (FAQPage structured data). */
export const faqText = (html) =>
  String(html ?? '')
    .replace(/<br\s*\/?>|<\/(p|li)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

async function getAll(path, query, locale) {
  const rows = [];
  for (let page = 1; page <= 10; page += 1) {
    const json = await strapiGet(path, { locale, tags: [path], query: { ...query, pagination: { page, pageSize: PAGE } } });
    const data = Array.isArray(json?.data) ? json.data : [];
    rows.push(...data);
    if (data.length < PAGE || page >= (json?.meta?.pagination?.pageCount ?? 1)) break;
  }
  return rows;
}

/**
 * FAQ groups for a locale → [{ key, label, count, questions: [{ q, a }] }] (categories A–Z, questions A–Z,
 * empty categories dropped). Never throws: resolves to [] when Strapi is unreachable.
 */
export async function getFaqGroups(locale) {
  const tries = locale && langOf(locale) !== 'en' ? [langOf(locale), 'en'] : ['en'];
  for (const loc of tries) {
    const [cats, faqs] = await Promise.all([
      getAll('faqs-categories', { fields: ['name', 'slug'] }, loc),
      getAll('faqs', { fields: ['question', 'answer'], populate: { faqs_category: { fields: ['name', 'slug'] } } }, loc)
    ]);
    if (!faqs.length) continue;

    const byCat = new Map();
    for (const row of faqs.map(attrs)) {
      const q = String(row.question ?? '').trim();
      if (!q) continue;
      const cat = rel(row.faqs_category);
      const key = cat?.id != null ? String(cat.id) : 'other';
      if (!byCat.has(key)) byCat.set(key, { label: cat?.name?.trim() || 'FAQs', slug: cat?.slug, questions: [] });
      byCat.get(key).questions.push({ q, a: sanitizeFaqHtml(row.answer) });
    }
    // categories listed in Strapi keep their name even when the FAQ relation only carries the id
    for (const c of cats.map(attrs)) if (byCat.has(String(c.id)) && c.name) byCat.get(String(c.id)).label = c.name.trim();

    return [...byCat.entries()]
      .map(([id, g]) => ({ key: g.slug || id, label: g.label, count: g.questions.length, questions: g.questions.sort((a, b) => a.q.localeCompare(b.q)) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  return [];
}
