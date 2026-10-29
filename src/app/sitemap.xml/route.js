import { buildSitemapIndex, xmlResponse } from '@/lib/sitemap';

export const dynamic = 'force-static';
export const revalidate = 86400;

/** /sitemap.xml — index of the per-locale sitemaps (see src/lib/sitemap.js). */
export function GET() {
  return xmlResponse(buildSitemapIndex());
}
