/**
 * Legacy site URLs (Search Console / inbound links) → current routes.
 * Imported from next.config.mjs — keep this file free of @/ aliases.
 */
import { LOCALES } from '../i18n/locales.js';
import { CAT5_LOCALES } from './regions.js';

const HOME = '/en-intl';

/** Public CAT 5 addresses (regions.js → CAT5_PAGES.path) — must not redirect to /company/*. */
const CAT5_PUBLIC_PATHS = new Set(['/about-us', '/faqs', '/contact-us']);

/** Old flat paths → current app paths (locale applied when expanding). */
const LEGACY_REDIRECTS = [
  // Company (flat -> /company/*)
  ['/about-us', '/company/about-us'],
  ['/why-gtc-group', '/company/why-gtc-group'],
  ['/global-presence', '/company/global-presence'],
  ['/regulations', '/company/regulations'],
  ['/careers', '/company/careers'],
  ['/contact-us', '/company/contact-us'],
  ['/awards', '/company/awards'],
  ['/dynamic-leverage', '/company/dynamic-leverage'],
  ['/events-and-exhibitions', '/company/events-and-exhibitions'],
  ['/faqs', '/company/faqs'],

  // Trading (flat -> /trading/*)
  ['/delete', '/trading/delete'],
  ['/open-account', '/live-account-application'],
  ['/margin-bonus', '/trading/margin-bonus'],
  ['/deposit', '/trading/deposit'],
  ['/account-types', '/trading/account-types'],
  ['/mt4-platform', '/trading/mt4-platform'],
  ['/mt5-platform', '/trading/mt5-platform'],
  ['/gtc-go-app', '/trading/gtc-go-app'],
  ['/vps-hosting-services', '/trading/vps-hosting-services'],
  ['/pamm-account', '/trading/pamm-account'],
  ['/mam-account', '/trading/mam-account'],
  ['/swap-update', '/trading/swap-update'],
  ['/compensation-fund', '/trading/compensation-fund'],
  ['/free-demo-account', '/trading/free-demo-account'],
  ['/swap-free-trading', '/trading/swap-free-trading'],

  // Markets (flat -> /markets/*)
  ['/forex', '/markets/forex'],
  ['/indices', '/markets/indices'],
  ['/commodities', '/markets/commodities'],
  ['/cfd-energy', '/markets/energy'],
  ['/precious-metals', '/markets/metals'],
  ['/economic-calendar', '/gtc-news/economic-calendar'],
  ['/market-overview', '/markets'],

  // News
  ['/earnings-calendar', '/gtc-news/earnings-calendar'],
  ['/gtc-news/knowledge-to-learn', '/knowledge-to-learn'],

  // Legal (flat -> /legal/*)
  ['/cookie-policy', '/legal/cookie-policy'],
  ['/privacy-policy', '/legal/privacy-policy'],
  ['/privacy', '/legal/privacy-policy'],
  ['/terms-and-conditions', '/legal/terms-and-conditions'],
  ['/terms', '/legal/terms-and-conditions'],
  ['/kyc-compliance-policy', '/legal/kyc-compliance-policy'],
  ['/deposit-and-refund-policy', '/legal/deposit-and-refund-policy'],
  ['/restricted-countries', '/legal/restricted-countries'],
  ['/website-disclaimer', '/legal/website-disclaimer'],
  ['/risk-disclosure', '/legal/risk-disclosure'],
  ['/swap-free-terms-and-conditions', '/legal/swap-free-terms-and-conditions'],
  ['/legal-policies-client-agreements', '/legal/legal-documents'],
  ['/liquidity-provider', '/knowledge-to-learn/liquidity-technology'],
  ['/legal', '/legal/legal-documents'],

  ['/webinar-with-gtcfx', '/'],
  ['/home2', '/'],

  // Retired pages -> closest relevant page (no direct equivalent)
  ['/download-app', '/trading/gtc-go-app'],
  ['/tutorial-videos', '/knowledge-to-learn'],
  ['/copy-trading', '/trading/pamm-account'],
  ['/glossary-faqs', '/knowledge-to-learn/trading-glossary'],
  ['/islamic-accounts', '/trading/swap-free-trading'],
  ['/liquidity-technology', '/company'],
  ['/liquidity-providers', '/company'],
  ['/introductory-broker', '/'],
  ['/affiliate-program', '/'],
  ['/withdrawal-policy', '/legal/deposit-and-refund-policy'],
  ['/customer-due-diligence-policy', '/legal/kyc-compliance-policy'],
  ['/client-agreement-MU', '/legal/website-disclaimer'],
  ['/client-agreement-VU', '/legal/website-disclaimer']
];

/** Flat legacy paths → Next.js redirect rules (default locale + /:locale/…). */
export function legacyPathRedirects() {
  const rules = [];
  const seen = new Set();
  for (const [from, to] of LEGACY_REDIRECTS) {
    if (!from?.startsWith('/') || seen.has(from)) continue;
    seen.add(from);
    rules.push({
      source: from,
      destination: to === '/' ? HOME : `${HOME}${to}`,
      permanent: true
    });
    if (CAT5_PUBLIC_PATHS.has(from)) {
      for (const { code } of LOCALES) {
        if (CAT5_LOCALES.includes(code)) continue;
        rules.push({
          source: `/${code}${from}`,
          destination: to === '/' ? `/${code}` : `/${code}${to}`,
          permanent: true
        });
      }
    } else {
      rules.push({
        source: `/:locale${from}`,
        destination: to === '/' ? '/:locale' : `/:locale${to}`,
        permanent: true
      });
    }
  }
  return rules;
}

/** Old blog posts at /blogs/<slug>; news lives at /gtc-news/blogs/<slug>. */
export function legacyBlogRedirects() {
  return [
    { source: '/blogs/:slug', destination: `${HOME}/gtc-news/blogs/:slug`, permanent: true },
    { source: '/blogs', destination: `${HOME}/gtc-news/blogs`, permanent: true },
    { source: '/:locale/blogs/:slug', destination: '/:locale/gtc-news/blogs/:slug', permanent: true },
    { source: '/:locale/blogs', destination: '/:locale/gtc-news/blogs', permanent: true },
    // former /en/… prefix (pre regional locales)
    { source: '/en/blogs/:slug', destination: `${HOME}/gtc-news/blogs/:slug`, permanent: true },
    { source: '/en/blogs', destination: `${HOME}/gtc-news/blogs`, permanent: true }
  ];
}
