/** Platform-guide routes: /knowledge-to-learn/platform-guide/<platform>/<slug>?type=png|pdf&lang=<guide locale> */
export const GUIDES_PATH = '/knowledge-to-learn/platform-guide';

/** Main tabs → Drive platform folders (src/lib/platform-guide/googleDrive.js). Video tab only for the client portal. */
export const PLATFORMS = [
  { key: 'gtcgo', video: false },
  { key: 'gettingStarted', video: true }
];

// PNG and PDF of the same guide share a title (and slug), so the type is part of the link.
export function guideHref(platform, item, guideLocale) {
  const query = new URLSearchParams({ type: item.type, ...(guideLocale ? { lang: guideLocale } : {}) });
  return `${GUIDES_PATH}/${platform}/${encodeURIComponent(item.slug)}?${query}`;
}
