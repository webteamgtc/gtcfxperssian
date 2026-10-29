/**
 * The 6 market pages (/markets/<slug>). Order = the Trade Markets menu.
 * Template A: Forex, Indices, Shares. Template B: Energy, Metals, Futures.
 * Symbols come only from the symbols API — there is no static fallback list; a market the API has no
 * symbols for shows an empty state instead of placeholder prices.
 *
 *  - slug        URL segment (/markets/<slug>); symbol pages live at /markets/<slug>/<symbol lowercase>
 *  - id          key in messages/<locale>/marketsPage.json → marketsPage.pages.<id>
 *  - apiType     matches the category name returned by the symbols API (/symbol/type)
 */
export const MARKET_PAGES = [
  {
    slug: 'forex',
    id: 'forex',
    template: 'A',
    apiType: /forex|fx|currenc/i
  },
  {
    slug: 'energy',
    id: 'energy',
    template: 'B',
    apiType: /energ|oil/i
  },
  {
    slug: 'indices',
    id: 'indices',
    template: 'A',
    apiType: /indic|index/i
  },
  {
    slug: 'metals',
    id: 'metals',
    template: 'B',
    apiType: /metal|gold|precious/i
  },
  {
    slug: 'shares',
    id: 'shares',
    template: 'A',
    apiType: /share|stock|equit/i
  },
  {
    slug: 'future-cfds',
    id: 'futures',
    template: 'B',
    apiType: /futur|commod|soft/i
  }
];

export const marketPageBySlug = (slug) => MARKET_PAGES.find((p) => p.slug === slug);

/** URL of a single symbol page: /markets/<slug>/<symbol lowercase> */
export const symbolHref = (slug, symbol) => `/markets/${slug}/${String(symbol).toLowerCase()}`;

/**
 * Symbol pages built ahead of time (the Markets menu links + the review link).
 * Every other symbol of a market is rendered on its first visit and cached (see `revalidate` in the route).
 */
export const PREBUILT_SYMBOLS = {
  forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'],
  metals: ['XAUUSD']
};

/**
 * Symbol page settings you can change without touching the components.
 *  - devicesImage   the "Unlock global markets" picture (put the final file in /public and update the path)
 *  - downloads      the four buttons under it; replace the hrefs with the real download links when ready
 */
export const SYMBOL_PAGE = {
  devicesImage: { src: '/images/markets/platform-devices.webp', width: 1510, height: 720 },
  downloads: [
    { id: 'windows', href: '/trading/gtc-go-app' },
    { id: 'mac', href: '/trading/gtc-go-app' },
    { id: 'linux', href: '/trading/gtc-go-app' },
    { id: 'web', href: '/trading/gtc-go-app' }
  ]
};
