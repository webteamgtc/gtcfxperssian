/**
 * GET /api/platform-guide/youtube?locale=en
 * → { success, requestedLocale, resolvedLocale, fallbackUsed, playlistId, playlistEmbedUrl, data: { videos: [] } }
 * Tutorial videos from the @GTCFXMarketing playlists (src/lib/platform-guide/youtube.js). Without YOUTUBE_API_KEY
 * `videos` is empty and the page falls back to the playlist embed.
 */
import { normalizePlatformGuideLocale } from '@/lib/platform-guide/locales';
import { getGtcGoPlaylistVideos } from '@/lib/platform-guide/youtube';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const requestedLocale = normalizePlatformGuideLocale(new URL(request.url).searchParams.get('locale'));
  try {
    const { videos, playlistId, playlistEmbedUrl, resolvedLocale, fallbackUsed } = await getGtcGoPlaylistVideos(requestedLocale);
    return Response.json(
      { success: true, requestedLocale, resolvedLocale, fallbackUsed, playlistId, playlistEmbedUrl, data: { videos } },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('Platform guide YouTube API error:', error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load tutorial videos.', data: { videos: [] } },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
