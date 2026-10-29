/**
 * GET /api/news?locale=en&category=company-news&page=1&pageSize=9
 * → { articles: [...normalised], total, page, pageSize }   (src/lib/news.js; Strapi `blogs`)
 * Used by the GTC News category tabs and "Load more".
 */
import { getNewsPage } from '@/lib/news';
import { routing } from '@/i18n/routing';

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const locale = routing.locales.includes(sp.get('locale')) ? sp.get('locale') : routing.defaultLocale;
  const category = /^[a-z0-9-]{1,60}$/i.test(sp.get('category') ?? '') ? sp.get('category') : undefined;
  const page = Math.min(Math.max(Number(sp.get('page')) || 1, 1), 100);
  const pageSize = Math.min(Math.max(Number(sp.get('pageSize')) || 9, 1), 24);
  try {
    const data = await getNewsPage(locale, { category, page, pageSize });
    return Response.json(data, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } });
  } catch (error) {
    console.error('News API error:', error);
    return Response.json({ articles: [], total: 0, page, pageSize }, { status: 500 });
  }
}
