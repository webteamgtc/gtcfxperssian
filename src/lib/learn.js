/**
 * Knowledge-to-learn content from Strapi (server side; cached via strapiGet / STRAPI_REVALIDATE).
 *
 *  learn-types  { name, slug, mainCategory }            one per course section (mainCategory = course slug)
 *  blogs        { title, slug, short_descreption, descreption (HTML), metaTitle, metaDescreption,
 *                 imageUrl (media), learn_type (relation) }   the lessons/articles of a section
 *
 * Works with Strapi v4 ({ id, attributes }) and v5 (flat) payloads. Each call retries in English when
 * the requested locale has no content, and resolves to empty data (never throws) when Strapi is down.
 */
import { strapiGet, toImage } from './strapi';
import { cleanHtml, parseLesson } from './learnArticle';
import { langOf } from '@/i18n/locales';

export { cleanHtml };

const PAGE = 100; // Strapi max page size

const attrs = (row) => (row?.attributes ? { id: row.id, ...row.attributes } : row ?? {});
const rel = (r) => {
  const d = r?.data !== undefined ? r.data : r;
  return d ? attrs(d) : null;
};

/** GET a collection for `locale`, falling back to English when nothing comes back. */
async function getWithFallback(path, query, locale) {
  const tries = locale && langOf(locale) !== 'en' ? [langOf(locale), 'en'] : ['en'];
  for (const loc of tries) {
    const json = await strapiGet(path, { query, locale: loc, tags: [path] });
    if (Array.isArray(json?.data) && json.data.length) return { rows: json.data, meta: json.meta, locale: loc };
  }
  return { rows: [], meta: null, locale: tries[tries.length - 1] };
}

/* ------------------------------------------------------------ sections */

/** Sections of a course: [{ slug, name, lessons }] in CMS order. `lessons` = number of articles. */
export async function getCourseSections(locale, course) {
  const { rows, locale: used } = await getWithFallback(
    'learn-types',
    { filters: { mainCategory: { $eq: course } }, sort: ['createdAt:asc'], pagination: { pageSize: PAGE }, fields: ['name', 'slug'] },
    locale
  );
  const sections = rows.map(attrs).filter((s) => s.slug && s.name).map((s) => ({ slug: s.slug, name: s.name, lessons: 0 }));
  if (!sections.length) return [];

  // one paged query for every article of the course → lesson count per section
  const counts = {};
  for (let page = 1; page <= 10; page += 1) {
    const json = await strapiGet('blogs', {
      locale: used,
      tags: ['blogs'],
      query: { filters: { learn_type: { mainCategory: { $eq: course } } }, fields: ['slug'], populate: { learn_type: { fields: ['slug'] } }, pagination: { page, pageSize: PAGE } }
    });
    const data = Array.isArray(json?.data) ? json.data : [];
    for (const row of data) {
      const lt = rel(attrs(row).learn_type);
      if (lt?.slug) counts[lt.slug] = (counts[lt.slug] ?? 0) + 1;
    }
    if (data.length < PAGE || page >= (json?.meta?.pagination?.pageCount ?? 1)) break;
  }
  return sections.map((s) => ({ ...s, lessons: counts[s.slug] ?? 0 }));
}

/** A single section (learn-type) of a course, or null. */
export async function getSection(locale, course, sectionSlug) {
  const { rows } = await getWithFallback(
    'learn-types',
    { filters: { slug: { $eq: sectionSlug }, mainCategory: { $eq: course } }, pagination: { pageSize: 1 }, fields: ['name', 'slug', 'mainCategory'] },
    locale
  );
  const s = rows[0] ? attrs(rows[0]) : null;
  return s?.slug ? { slug: s.slug, name: s.name } : null;
}

/* ------------------------------------------------------------ articles */

const ARTICLE_LIST_FIELDS = ['title', 'slug', 'short_descreption', 'createdAt', 'publishedAt'];
const IMAGE_POPULATE = { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] };

function toArticleCard(row) {
  const a = attrs(row);
  return {
    slug: a.slug ?? '',
    title: String(a.title ?? a.name ?? '').trim(),
    excerpt: String(a.short_descreption ?? a.shortDescription ?? '').trim(),
    image: toImage(rel(a.imageUrl), 'medium'),
    date: String(a.publishedAt ?? a.createdAt ?? '').slice(0, 10)
  };
}

/** Articles of a section (oldest first, as lessons): [{ slug, title, excerpt, image, date }]. */
export async function getSectionArticles(locale, sectionSlug) {
  const { rows } = await getWithFallback(
    'blogs',
    { filters: { learn_type: { slug: { $eq: sectionSlug } } }, sort: ['createdAt:asc'], fields: ARTICLE_LIST_FIELDS, populate: { imageUrl: IMAGE_POPULATE }, pagination: { pageSize: PAGE } },
    locale
  );
  return rows.map(toArticleCard).filter((a) => a.slug && a.title);
}

/**
 * One article of a section with SEO fields, or null. `lesson` is the parsed lesson template
 * (src/lib/learnArticle.js); `html` (cleaned) is only sent when the body doesn't follow it.
 */
export async function getArticle(locale, sectionSlug, articleSlug) {
  const slug = decodeURIComponent(String(articleSlug ?? ''));
  const { rows } = await getWithFallback(
    'blogs',
    {
      filters: { slug: { $eq: slug }, learn_type: { slug: { $eq: sectionSlug } } },
      fields: [...ARTICLE_LIST_FIELDS, 'descreption', 'metaTitle', 'metaDescreption', 'updatedAt'],
      populate: { imageUrl: IMAGE_POPULATE },
      pagination: { pageSize: 1 }
    },
    locale
  );
  if (!rows[0]) return null;
  const a = attrs(rows[0]);
  const raw = a.descreption ?? a.description ?? '';
  const lesson = parseLesson(raw);
  return {
    ...toArticleCard(rows[0]),
    lesson,
    html: lesson ? '' : cleanHtml(raw),
    metaTitle: String(a.metaTitle ?? '').trim(),
    metaDescription: String(a.metaDescreption ?? a.metaDescription ?? '').trim(),
    updated: String(a.updatedAt ?? '').slice(0, 10)
  };
}
