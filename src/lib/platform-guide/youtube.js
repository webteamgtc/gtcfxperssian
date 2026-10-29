/**
 * GTC Go / client-portal tutorial videos from the @GTCFXMarketing YouTube playlists (server only).
 *
 * Env: YOUTUBE_API_KEY (server key, YouTube Data API v3), optional YOUTUBE_PLAYLIST_ID_<EN|AR|ZH|VI|ES|FR>,
 * YOUTUBE_CHANNEL_ID / YOUTUBE_CHANNEL_HANDLE (used to find "Video Tutorial (<Language> Version)" playlists).
 * Without an API key the videos are read from the public playlist page; if that fails the playlist id + embed URL
 * are still returned so the page can show YouTube's playlist player.
 * Results are cached in memory for PLATFORM_GUIDE_CACHE_SECONDS (default 600).
 */
import { normalizePlatformGuideLocale } from './locales';

const API = 'https://www.googleapis.com/youtube/v3';
const CACHE_MS = Number(process.env.PLATFORM_GUIDE_CACHE_SECONDS ?? 600) * 1000;

const PLAYLIST_LANGUAGE = { en: 'English' };
// "Video Tutorial (<Language> Version)" playlists on @GTCFXMarketing
const PLAYLIST_IDS = { en: 'PLFHynh7TbVNA' };
const HL = { en: 'en' };
const LOCALIZATION_KEYS = { en: ['en', 'en-US'] };

const playlistTitle = (code) => `Video Tutorial (${PLAYLIST_LANGUAGE[code] ?? 'English'} Version)`;
const apiKey = () => (process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY || '').trim();
const configuredPlaylist = (code) => (process.env[`YOUTUBE_PLAYLIST_ID_${code.toUpperCase()}`] || PLAYLIST_IDS[code] || '').trim();
export const playlistEmbedUrl = (id) => (id ? `https://www.youtube-nocookie.com/embed/videoseries?list=${id}&rel=0` : null);

async function yt(path, params) {
  const key = apiKey();
  if (!key) throw new Error('YouTube API key is not configured (YOUTUBE_API_KEY).');
  const res = await fetch(`${API}${path}?${new URLSearchParams({ key, ...params })}`, { cache: 'no-store' });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = payload?.error?.message || `YouTube API request failed (HTTP ${res.status}).`;
    throw new Error(/referer.*blocked/i.test(msg) ? 'YouTube API key is restricted to browser referrers; use a server key.' : msg);
  }
  return payload;
}

let channelId = null;
const playlistByTitle = new Map();

async function findPlaylistId(title) {
  const wanted = title.toLowerCase();
  if (playlistByTitle.has(wanted)) return playlistByTitle.get(wanted);
  if (!channelId) {
    channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
    if (!channelId) {
      const handle = (process.env.YOUTUBE_CHANNEL_HANDLE || 'GTCFXMarketing').trim().replace(/^@/, '');
      channelId = (await yt('/channels', { part: 'id', forHandle: handle }))?.items?.[0]?.id;
      if (!channelId) throw new Error(`Unable to resolve YouTube channel @${handle}.`);
    }
  }
  let pageToken;
  do {
    const payload = await yt('/playlists', { part: 'snippet', channelId, maxResults: '50', ...(pageToken ? { pageToken } : {}) });
    for (const item of payload.items || []) playlistByTitle.set(String(item?.snippet?.title ?? '').trim().toLowerCase(), item.id);
    if (playlistByTitle.has(wanted)) return playlistByTitle.get(wanted);
    pageToken = payload.nextPageToken;
  } while (pageToken);
  return null;
}

async function resolvePlaylist(code) {
  const configured = configuredPlaylist(code);
  if (configured) return { playlistId: configured, fallbackUsed: false };
  const id = await findPlaylistId(playlistTitle(code));
  if (id || code === 'en') return { playlistId: id, fallbackUsed: false };
  return { playlistId: await findPlaylistId(playlistTitle('en')), fallbackUsed: true };
}

function localizedTitle(item, code) {
  const s = item?.snippet ?? {};
  const loc = s.localized?.title?.trim();
  if (loc && loc !== s.title) return loc;
  for (const k of LOCALIZATION_KEYS[code] ?? []) {
    const t = item?.localizations?.[k]?.title?.trim();
    if (t) return t;
  }
  return loc || s.title?.trim() || null;
}

const cache = new Map();

const toVideo = (id, title, thumbnail) => ({ id, title, thumbnail: thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, watchUrl: `https://www.youtube.com/watch?v=${id}` });

/**
 * Keyless fallback: videos of a public playlist read from its YouTube page (ytInitialData → playlistVideoRenderer).
 * Returns [] when the page can't be read, so callers fall back to the playlist embed.
 */
async function playlistFromPage(playlistId, code) {
  try {
    const res = await fetch(`https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}&hl=${HL[code] ?? 'en'}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept-Language': HL[code] ?? 'en', Cookie: 'CONSENT=YES+1' },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const html = await res.text();
    const json = html.match(/ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s)?.[1];
    if (!json) return [];
    const videos = [];
    const seen = new Set();
    const add = (id, title, thumb) => {
      if (!id || seen.has(id)) return;
      seen.add(id);
      videos.push(toVideo(id, title, thumb?.split('?')[0]));
    };
    (function walk(node) {
      if (!node || typeof node !== 'object') return;
      // current layout: lockupViewModel; older layout: playlistVideoRenderer
      const l = node.lockupViewModel;
      if (l?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
        const sources = l.contentImage?.thumbnailViewModel?.image?.sources ?? [];
        add(l.contentId, l.metadata?.lockupMetadataViewModel?.title?.content ?? '', sources[sources.length - 1]?.url);
      }
      const r = node.playlistVideoRenderer;
      if (r?.videoId && r.isPlayable !== false) {
        const thumbs = r.thumbnail?.thumbnails ?? [];
        add(r.videoId, r.title?.runs?.map((x) => x.text).join('') || r.title?.simpleText || '', thumbs[thumbs.length - 1]?.url);
      }
      for (const v of Array.isArray(node) ? node : Object.values(node)) walk(v);
    })(JSON.parse(json));
    return videos;
  } catch (error) {
    console.error('YouTube playlist page parse failed:', error);
    return [];
  }
}

/**
 * Playlist videos for a guide locale →
 * { videos: [{ id, title, thumbnail, embedUrl, watchUrl }], playlistId, playlistEmbedUrl, resolvedLocale, fallbackUsed }.
 * With YOUTUBE_API_KEY the Data API is used (localized titles); without it the public playlist page is read.
 * If neither yields videos, `videos` is empty and the page shows the playlist embed.
 */
export async function getGtcGoPlaylistVideos(locale) {
  const code = normalizePlatformGuideLocale(locale);
  const hit = cache.get(code);
  if (hit && hit.expires > Date.now()) return hit.data;

  if (!apiKey()) {
    const playlistId = configuredPlaylist(code) || null;
    const videos = playlistId ? await playlistFromPage(playlistId, code) : [];
    const data = { videos, playlistId, playlistEmbedUrl: playlistEmbedUrl(playlistId), resolvedLocale: code, fallbackUsed: false };
    if (videos.length) cache.set(code, { data, expires: Date.now() + CACHE_MS });
    return data;
  }

  const { playlistId, fallbackUsed } = await resolvePlaylist(code);
  const videos = [];
  let pageToken;
  while (playlistId) {
    const payload = await yt('/playlistItems', { part: 'snippet', playlistId, maxResults: '50', ...(pageToken ? { pageToken } : {}) });
    for (const row of payload.items || []) {
      const s = row?.snippet ?? {};
      const id = s.resourceId?.videoId;
      if (!id || /^(private|deleted) video$/i.test(s.title ?? '')) continue;
      const th = s.thumbnails ?? {};
      videos.push(toVideo(id, s.title || '', (th.maxres || th.standard || th.high || th.medium || th.default)?.url));
    }
    pageToken = payload.nextPageToken;
    if (!pageToken) break;
  }

  // titles in the guide language where the channel provides localizations
  for (let i = 0; i < videos.length; i += 50) {
    const batch = videos.slice(i, i + 50);
    const payload = await yt('/videos', { part: 'snippet,localizations', id: batch.map((v) => v.id).join(','), hl: HL[code] ?? 'en' });
    const byId = new Map((payload.items || []).map((it) => [it.id, localizedTitle(it, code)]));
    for (const v of batch) v.title = byId.get(v.id) || v.title;
  }

  const data = { videos, playlistId, playlistEmbedUrl: playlistEmbedUrl(playlistId), resolvedLocale: fallbackUsed ? 'en' : code, fallbackUsed };
  cache.set(code, { data, expires: Date.now() + CACHE_MS });
  return data;
}
