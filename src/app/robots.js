import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * /robots.txt
 * - Everything is crawlable except the API routes (form endpoints, not pages).
 * - Pages that must not be indexed are NOT disallowed here: thank-you / trading/delete / marketing carry
 *   a noindex meta tag, and removed legacy URLs (/fa, /en-intl/fa) answer 404 + noindex. Crawlers have to
 *   be able to fetch them to see that and drop them from search results.
 * - Sitemaps: /sitemap.xml is the index of the per-locale sitemaps (src/lib/sitemap.js);
 *   /sitemap-index.xml serves the same index for crawlers that still have the old URL.
 */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
