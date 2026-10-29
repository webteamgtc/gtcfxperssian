import { buildLocaleSitemap, SITEMAP_LOCALES, xmlResponse } from '@/lib/sitemap';

export const dynamicParams = false;
export const revalidate = 86400; // symbols, news and lessons are re-read daily

export function generateStaticParams() {
  return SITEMAP_LOCALES.map((locale) => ({ locale }));
}

/** /sitemap-<locale>.xml (rewritten here by next.config.mjs) — see src/lib/sitemap.js. */
export async function GET(_request, { params }) {
  const { locale } = await params;
  const xml = await buildLocaleSitemap(locale);
  return xml ? xmlResponse(xml) : new Response('Not found', { status: 404 });
}
