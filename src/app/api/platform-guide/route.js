/**
 * GET /api/platform-guide?platform=gtcgo|gettingStarted&locale=en
 * → { success, platform, requestedLocale, resolvedLocale, fallbackUsed, data: { png: [], pdf: [] } }
 * Guides come from Google Drive (src/lib/platform-guide/googleDrive.js); English is used when the locale folder is empty.
 */
import { getPlatformGuides, normalizePlatform } from '@/lib/platform-guide/googleDrive';
import { normalizePlatformGuideLocale } from '@/lib/platform-guide/locales';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const platform = normalizePlatform(searchParams.get('platform')) ?? 'gtcgo';
  const requestedLocale = normalizePlatformGuideLocale(searchParams.get('locale'));
  try {
    const { png, pdf, resolvedLocale, fallbackUsed } = await getPlatformGuides(platform, requestedLocale);
    return Response.json(
      { success: true, platform, requestedLocale, resolvedLocale, fallbackUsed, data: { png, pdf } },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
    );
  } catch (error) {
    console.error('Platform guides API error:', error);
    const raw = error instanceof Error ? error.message : 'Failed to load platform guides.';
    const notShared = /file not found/i.test(raw);
    return Response.json(
      { success: false, message: notShared ? 'Google Drive folder is not shared with the service account.' : raw, data: { png: [], pdf: [] } },
      { status: notShared ? 404 : 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
