/**
 * Multilingual sitemaps.
 *   /sitemap.xml              index: one <sitemap> per locale (app/sitemap.xml/route.js)
 *   /sitemap-<locale>.xml     that locale's URLs: <loc> + <lastmod> (rewritten to app/sitemaps/[locale]/route.js
 *                             in next.config.mjs). hreflang alternates are declared in each page's <head> (pageMetadata).
 * Every URL is a final, locale-prefixed URL (no bare paths that depend on IP geo redirects).
 * To list a new page, add its path to PAGES. noindex pages (thank-you, delete, marketing) stay out.
 */
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/locales';
import { SITE_URL } from '@/lib/seo';
import { MARKET_PAGES, symbolHref } from '@/config/marketPages';
import { getMarketSymbols } from '@/lib/marketSymbols';
import { ALPHABET } from '@/lib/glossary';
import { getNewsCategories, getNewsPage } from '@/lib/news';
import { newsCategoryHref } from '@/lib/news-path';
import { getCourseSections, getSectionArticles } from '@/lib/learn';
import { LEGAL_SLUGS } from '@/lib/legalDocuments';
import { COURSES, courseHref, sectionHref, articleHref } from '@/app/[locale]/knowledge-to-learn/courses';

export const SITEMAP_LOCALES = LOCALES.map((l) => l.code);
export const sitemapFileFor = (locale) => `sitemap-${locale}.xml`;

/** Stable lastmod for the static pages, so it doesn't change on every build (bump it after big content updates). */
const STATIC_LASTMOD = process.env.SITEMAP_STATIC_LASTMOD || '2026-10-23';
const FETCH_TIMEOUT = 10000;

/** Static pages (paths without the locale). */
const PAGES = [
  '',
  '/company',
  '/company/about-us',
  '/company/why-gtc-group',
  '/company/global-presence',
  '/company/regulations',
  '/company/awards',
  '/company/events-and-exhibitions',
  '/company/contact-us',
  '/company/faqs',
  '/company/dynamic-leverage',
  '/trading',
  '/trading/account-types',
  '/trading/open-live-account',
  '/trading/free-demo-account',
  '/live-account-application',
  '/trading/deposit',
  '/trading/compensation-fund',
  '/trading/mt4-platform',
  '/trading/mt5-platform',
  '/trading/metatrader-for-android',
  '/trading/metatrader-for-ipad',
  '/trading/gtc-go-app',
  '/trading/gtc-go-app-android',
  '/trading/gtc-go-app-ipad',
  '/trading/copy-trading',
  '/trading/pamm-account',
  '/trading/vps-hosting-services',
  '/trading/margin-bonus',
  '/trading/swap-update',
  '/markets',
  ...MARKET_PAGES.map((p) => `/markets/${p.slug}`),
  '/gtc-news',
  '/gtc-news/economic-calendar',
  '/gtc-news/earnings-calendar',
  '/gtc-news/market-holidays',
  '/knowledge-to-learn',
  '/knowledge-to-learn/liquidity-technology',
  '/knowledge-to-learn/platform-guide',
  '/knowledge-to-learn/trading-glossary',
  ...ALPHABET.map((l) => `/knowledge-to-learn/trading-glossary/${l.toLowerCase()}`),
  ...Object.keys(COURSES).map(courseHref),
  '/legal/legal-documents',
  '/legal/restricted-countries',
  ...LEGAL_SLUGS.map((s) => `/legal/${s}`)
];

/** Resolves to `fallback` if `promise` is slow or fails, so one unreachable API never breaks the sitemap. */
async function safe(promise, fallback, label) {
  try {
    return await Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT))]);
  } catch (error) {
    console.error(`[sitemap] ${label}:`, error.message);
    return fallback;
  }
}

/** Data-driven pages: { path, lastmod? }[]. Same paths for every locale (the pages fall back to English). */
async function dynamicPages() {
  const [symbols, categories, news, lessons] = await Promise.all([
    safe(Promise.all(MARKET_PAGES.map(async (p) => (await getMarketSymbols(p)).map((x) => symbolHref(p.slug, x.s)))), [], 'symbols'),
    safe(getNewsCategories(DEFAULT_LOCALE), [], 'news categories'),
    safe(getNewsPage(DEFAULT_LOCALE, { pageSize: 100 }), { articles: [] }, 'news'),
    safe(courseLessons(), [], 'courses')
  ]);
  return [
    ...categories.map((c) => ({ path: newsCategoryHref(c.slug) })),
    ...news.articles.map((a) => ({ path: a.href, lastmod: a.publishedAt || undefined })),
    ...lessons,
    ...symbols.flat().map((path) => ({ path }))
  ];
}

/** Knowledge-to-learn sections and their lessons (Strapi). */
async function courseLessons() {
  const out = [];
  await Promise.all(
    Object.keys(COURSES).map(async (course) => {
      const sections = await getCourseSections(DEFAULT_LOCALE, course);
      await Promise.all(
        sections.map(async (s) => {
          out.push({ path: sectionHref(course, s.slug) });
          for (const a of await getSectionArticles(DEFAULT_LOCALE, s.slug)) out.push({ path: articleHref(course, s.slug, a.slug) });
        })
      );
    })
  );
  return out;
}

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const urlFor = (locale, path) => `${SITE_URL}/${locale}${path}`;

const urlEntry = (locale, { path, lastmod = STATIC_LASTMOD }) => `  <url>
    <loc>${esc(urlFor(locale, path))}</loc>
    <lastmod>${esc(lastmod)}</lastmod>
  </url>`;

/** /sitemap-<locale>.xml, or null for an unknown locale. */
export async function buildLocaleSitemap(locale) {
  if (!SITEMAP_LOCALES.includes(locale)) return null;
  const pages = [...PAGES.map((path) => ({ path })), ...(await dynamicPages())];
  const seen = new Set();
  const entries = pages.filter((p) => !seen.has(p.path) && seen.add(p.path)).map((p) => urlEntry(locale, p));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

/** /sitemap.xml: index of the per-locale sitemaps. */
export function buildSitemapIndex() {
  const entries = SITEMAP_LOCALES.map(
    (l) => `  <sitemap>
    <loc>${esc(`${SITE_URL}/${sitemapFileFor(l)}`)}</loc>
    <lastmod>${esc(STATIC_LASTMOD)}</lastmod>
  </sitemap>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>
`;
}

export const xmlResponse = (xml) =>
  new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
