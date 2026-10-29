/**
 * GTC News from Strapi (server side; cached via strapiGet / STRAPI_REVALIDATE).
 *
 *  categories  { name, slug }                       news categories (Company News, Daily Market Update, Blogs…)
 *  blogs       { title, slug, short_descreption, descreption (HTML), Published, imageUrl (media),
 *                author (relation: name), category (relation), metaTitle, metaDescreption }
 *
 * Normalised article (what components see):
 * { id, slug, title, excerpt, category, categorySlug, author, publishedAt ('YYYY-MM-DD'), dateLabel,
 *   cover: {url, alt, width, height} | null, href ('/gtc-news/<category>/<slug>') }
 *
 * The locale is used when it has posts, otherwise English. getLatestNews falls back to the sample list
 * (src/data/news.sample.js) only when Strapi isn't configured.
 */
import { strapiGet, strapiConfigured, toImage } from './strapi';
import { dateLocale } from './events';
import { cleanHtml, parseLesson } from './learnArticle';
import { SAMPLE_NEWS } from '@/data/news.sample';
import { NEWS_PATH, newsArticleHref } from './news-path';
import { langOf } from '@/i18n/locales';

/** Categories that are not news feeds (or are shown in their own section). */
const HIDDEN = new Set(['favourite', 'fundamental', 'weekly-forecast']);
/** Tab order; the rest follow alphabetically. */
const ORDER = ['market-daily-updates', 'blogs', 'company-news', 'technical-analysis', 'event'];

const attrs = (row) => (row?.attributes ? { id: row.id, ...row.attributes } : row ?? {});
const rel = (r) => {
  const d = r?.data !== undefined ? r.data : r;
  return d ? attrs(Array.isArray(d) ? d[0] : d) : null;
};
const LIST_FIELDS = ['title', 'slug', 'short_descreption', 'Published', 'publishedAt', 'createdAt'];
const LIST_POPULATE = { imageUrl: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] }, author: { fields: ['name'] }, category: { fields: ['name', 'slug'] } };

function dateLabelFor(iso, locale) {
  try {
    return new Intl.DateTimeFormat(dateLocale(locale), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  } catch {
    return iso;
  }
}

/** Raw Strapi blog (v4 or v5) → normalised article. */
export function normaliseArticle(raw, locale = 'en') {
  const a = attrs(raw);
  const cat = rel(a.category);
  const categorySlug = cat?.slug ?? 'blogs';
  const publishedAt = String(a.Published ?? a.publishedAt ?? a.createdAt ?? '').slice(0, 10);
  return {
    id: String(a.documentId ?? a.id ?? a.slug),
    slug: a.slug ?? '',
    title: String(a.title ?? '').trim(),
    excerpt: String(a.short_descreption ?? a.excerpt ?? '').trim(),
    category: cat?.name ?? '',
    categorySlug,
    author: rel(a.author)?.name ?? '',
    publishedAt,
    dateLabel: dateLabelFor(publishedAt, locale),
    cover: toImage(rel(a.imageUrl ?? a.cover), 'medium'),
    href: newsArticleHref(categorySlug, a.slug ?? '')
  };
}

async function getBlogs(locale, query) {
  const tries = locale && langOf(locale) !== 'en' ? [langOf(locale), 'en'] : ['en'];
  for (const loc of tries) {
    const json = await strapiGet('blogs', { locale: loc, tags: ['blogs'], query: { sort: ['publishedAt:desc'], ...query } }); // not Published: that display date is empty on most posts
    if (Array.isArray(json?.data) && json.data.length) return { rows: json.data, total: Number(json.meta?.pagination?.total ?? json.data.length), locale: loc };
  }
  return { rows: [], total: 0, locale: 'en' };
}

/* ------------------------------------------------------------ categories */

/** News categories with posts → [{ slug, name, count }] (tab order, hidden feeds removed). */
export async function getNewsCategories(locale) {
  const tries = locale && langOf(locale) !== 'en' ? [langOf(locale), 'en'] : ['en'];
  for (const loc of tries) {
    const json = await strapiGet('categories', { locale: loc, tags: ['categories'], query: { fields: ['name', 'slug'], pagination: { pageSize: 100 } } });
    const cats = (json?.data ?? []).map(attrs).filter((c) => c.slug && !HIDDEN.has(c.slug));
    if (!cats.length) continue;
    const counted = await Promise.all(
      cats.map(async (c) => {
        const r = await strapiGet('blogs', { locale: loc, tags: ['blogs'], query: { filters: { category: { slug: { $eq: c.slug } } }, fields: ['slug'], pagination: { pageSize: 1 } } });
        return { slug: c.slug, name: String(c.name ?? c.slug).trim(), count: Number(r?.meta?.pagination?.total ?? 0) };
      })
    );
    const rank = (s) => (ORDER.includes(s) ? ORDER.indexOf(s) : ORDER.length);
    return counted.filter((c) => c.count > 0).sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name));
  }
  return [];
}

/* ------------------------------------------------------------ lists */

/** One page of posts (optionally of a category) → { articles, total, page, pageSize }. */
export async function getNewsPage(locale, { category, page = 1, pageSize = 9 } = {}) {
  const { rows, total } = await getBlogs(locale, {
    ...(category ? { filters: { category: { slug: { $eq: category } } } } : { filters: { category: { slug: { $notIn: [...HIDDEN] } } } }),
    fields: LIST_FIELDS,
    populate: LIST_POPULATE,
    pagination: { page, pageSize }
  });
  return { articles: rows.map((r) => normaliseArticle(r, locale)).filter((a) => a.slug && a.title), total, page, pageSize };
}

/** Newest `limit` articles across the news categories (Strapi, or the sample list when Strapi isn't configured). */
export async function getLatestNews(locale, limit = 5) {
  if (!strapiConfigured()) {
    const articles = SAMPLE_NEWS.slice(0, limit).map((a) => ({ ...a, categorySlug: 'blogs', author: '', dateLabel: dateLabelFor(a.publishedAt, locale), href: newsArticleHref('blogs', a.slug) }));
    return { articles, source: 'sample' };
  }
  const { articles } = await getNewsPage(locale, { pageSize: limit });
  return { articles, source: 'strapi' };
}

/* ------------------------------------------------------------ article */

/**
 * One article of a category with its body, or null. `lesson` is the parsed GTC lesson template when the HTML
 * follows it (src/lib/learnArticle.js); otherwise `html` holds the cleaned HTML.
 */
export async function getNewsArticle(locale, category, slug) {
  const wanted = decodeURIComponent(String(slug ?? ''));
  const { rows } = await getBlogs(locale, {
    filters: { slug: { $eq: wanted }, category: { slug: { $eq: category } } },
    fields: [...LIST_FIELDS, 'descreption', 'metaTitle', 'metaDescreption', 'updatedAt'],
    populate: LIST_POPULATE,
    pagination: { pageSize: 1 }
  });
  if (!rows[0]) return null;
  const a = attrs(rows[0]);
  const raw = a.descreption ?? a.description ?? '';
  const lesson = parseLesson(raw);
  return {
    ...normaliseArticle(rows[0], locale),
    cover: toImage(rel(a.imageUrl), 'large') ?? toImage(rel(a.imageUrl)),
    lesson,
    html: lesson ? '' : cleanHtml(raw, { keepStyles: true }), // news posts are designed with inline styles
    metaTitle: String(a.metaTitle ?? '').trim(),
    metaDescription: String(a.metaDescreption ?? '').trim()
  };
}

export { NEWS_PATH };
