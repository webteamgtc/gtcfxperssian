/**
 * Page structured data (JSON-LD): builds the one document each page gets in <head>.
 * Which URL gets what (breadcrumb, FAQ, events…) is decided in app/[locale]/@schema/routes.js; pages hold no schema code.
 *
 * pageSchema() returns ONE document with a @graph of:
 *   - the BreadcrumbList (crumbs, same shape as breadcrumbLd in ./seo)
 *   - the route's own nodes from SCHEMAS below (Service, HowTo, FinancialProduct…) if it has any
 *   - an FAQPage: `faq` when the page shows its own FAQ, otherwise the route's FAQ from the schema copy
 *   - `nodes`: any page-specific JSON-LD (NewsArticle, events, glossary terms…)
 * Schema copy: ./schemaCopy/<lang>.json (en, ar, zh; any key a language lacks comes from English).
 */
import { SITE_URL, OG_IMAGE, localeUrl, breadcrumbLd } from './seo';
import { langOf } from '@/i18n/locales';
import { GTC_GO_APP_STORE_URL, GTC_GO_PLAY_STORE_URL } from '@/config/gtcGoStoreLinks';
import en from './schemaCopy/en.json';
import ar from './schemaCopy/ar.json';
import zh from './schemaCopy/zh.json';

const COPY = { en, ar, zh };
const ORG_ID = `${SITE_URL}/#organization`;
const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'GTCFX',
  url: SITE_URL,
  logo: OG_IMAGE,
  foundingDate: '2012',
  sameAs: [
    'https://www.facebook.com/GTCFXGlobalTradeCapital',
    'https://www.linkedin.com/company/gtcfx-official',
    'https://www.youtube.com/channel/UCnKWakjm1b9Bm63xgwNFXHA',
    'https://www.instagram.com/gtcfxofficial/',
    'https://t.me/gtc_vip_signal',
    'https://www.tiktok.com/@gtcgroup_official',
    'https://x.com/GTC_fx'
  ]
};
/* ---------------- schema copy ---------------- */

function merge(base, over) {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over ?? base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = v && typeof v === 'object' && !Array.isArray(v) && out[k] ? merge(out[k], v) : v ?? out[k];
  return out;
}

/** Copy for one route key in the visitor's language (English for anything missing). */
function copyFor(locale, key) {
  const lang = langOf(locale);
  const local = COPY[lang] ?? COPY[lang.split('-')[0]];
  return merge(en.routes[key] ?? {}, lang === 'en' ? null : local?.routes?.[key]);
}

const pairs = (list, a, b) => (Array.isArray(list) ? list.map((i) => [i?.[a], i?.[b]]).filter(([x, y]) => x && y) : []);

/* ---------------- node helpers ---------------- */

const faqPage = (id, items) =>
  items.length ? { '@type': 'FAQPage', '@id': id, mainEntity: items.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) } : null;

const howTo = (url, h) => ({
  '@type': 'HowTo',
  '@id': `${url}#howto`,
  name: h.name,
  description: h.description,
  step: pairs(h.steps, 'name', 'text').map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text }))
});

const service = (url, sv, offers) => ({
  '@type': 'Service',
  '@id': `${url}#service`,
  name: sv.name,
  ...(sv.alternateName ? { alternateName: sv.alternateName } : {}),
  url,
  serviceType: sv.serviceType,
  description: sv.description,
  ...(sv.disambiguatingDescription ? { disambiguatingDescription: sv.disambiguatingDescription } : {}),
  category: sv.category,
  brand: { '@id': ORG_ID },
  ...(offers ? { offers } : {})
});

const dataset = (url, base, id, d) => ({
  '@type': 'Dataset',
  '@id': `${url}#${id}`,
  name: d.name,
  url,
  description: d.description,
  keywords: d.keywords,
  ...(d.about ? { about: d.about.map((name) => ({ '@type': 'Thing', name })) } : {}),
  creator: { '@type': 'Organization', name: 'GTCFX', url: base },
  license: `${base}/legal/terms-and-conditions`,
  isAccessibleForFree: true
});

const product = (url, slug, p) => ({
  '@type': 'FinancialProduct',
  '@id': `${url}#${slug}-cfd-product`,
  name: p.name,
  ...(p.alternateName?.length ? { alternateName: p.alternateName } : {}),
  url,
  serviceType: p.serviceType,
  description: p.description,
  category: p.category,
  provider: { '@id': ORG_ID }
});

const software = (url, a) => ({
  '@type': 'SoftwareApplication',
  '@id': `${url}#software`,
  name: a.name,
  alternateName: a.alternateName,
  url,
  applicationCategory: 'FinanceApplication',
  operatingSystem: ['Windows', 'macOS', 'iOS', 'Android'],
  description: a.description,
  featureList: a.featureList
});

const eventNode = (e, url) => ({
  '@type': 'Event',
  name: e.title,
  description: e.summary,
  startDate: e.startDate,
  endDate: e.endDate,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: { '@type': 'Place', name: e.venue || e.city, address: { '@type': 'PostalAddress', addressLocality: e.city, addressCountry: e.country || undefined } },
  ...(e.cover?.url ? { image: [e.cover.url] } : {}),
  organizer: { '@id': ORG_ID },
  url
});

/* ---------------- per-route nodes ---------------- */

const market = (key, slug) => ({ key, nodes: ({ url, c }) => [product(url, slug, c.product)] });
const platform = (key) => ({ key, nodes: ({ url, c }) => [software(url, c.application), howTo(url, c.howTo)] });
const serviceHowTo = (key) => ({ key, nodes: ({ url, c }) => [service(url, c.service), howTo(url, c.howTo)] });

/** route (path without locale) → copy key + the nodes it adds. `url` = this page, `base` = site root for the locale. */
const SCHEMAS = {
  '/': {
    key: 'home',
    nodes: ({ base, c }) => [
      { '@type': 'WebSite', '@id': `${base}/#website`, url: base, name: c.website.name, description: c.website.description, publisher: ORGANIZATION },
      {
        '@type': 'FinancialService',
        '@id': `${base}/#financial-service`,
        name: c.financialService.name,
        legalName: c.financialService.legalName,
        url: `${base}/company/regulations`,
        brand: { '@id': ORG_ID },
        description: c.financialService.description,
        address: { '@type': 'PostalAddress', ...c.financialService.address },
        identifier: c.financialService.identifiers.map((i) => ({ '@type': 'PropertyValue', propertyID: i.propertyID, value: i.value }))
      }
    ]
  },
  '/markets/forex': market('marketsForex', 'forex'),
  '/markets/energy': market('marketsEnergy', 'energy'),
  '/markets/indices': market('marketsIndices', 'indices'),
  '/markets/metals': market('marketsMetals', 'metals'),
  '/markets/shares': market('marketsShares', 'shares'),
  '/markets/future-cfds': market('marketsFutureCfds', 'future'),
  '/trading/mt4-platform': platform('mt4Platform'),
  '/trading/mt5-platform': platform('mt5Platform'),
  '/trading/copy-trading': { key: 'copyTrading', nodes: ({ url, c }) => [howTo(url, c.howTo), service(url, c.service)] },
  '/trading/free-demo-account': serviceHowTo('freeDemoAccount'),
  '/trading/open-live-account': serviceHowTo('openLiveAccount'),
  '/trading/pamm-account': serviceHowTo('pammAccount'),
  '/trading/gtc-go-app': {
    key: 'gtcGoApp',
    nodes: ({ url, c }) => [
      {
        '@type': 'MobileApplication',
        '@id': `${url}#mobile-application`,
        name: c.application.name,
        alternateName: c.application.alternateName,
        url,
        description: c.application.description,
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['iOS', 'Android'],
        downloadUrl: [GTC_GO_APP_STORE_URL, GTC_GO_PLAY_STORE_URL],
        featureList: c.application.featureList,
        publisher: { '@id': ORG_ID }
      }
    ]
  },
  '/trading/vps-hosting-services': {
    key: 'vpsHosting',
    nodes: ({ url, c }) => [service(url, c.service, c.offers.map((o) => ({ '@type': 'Offer', name: o.name, price: o.price, priceCurrency: o.priceCurrency, description: o.description })))]
  },
  '/trading/swap-update': { key: 'swapUpdate', nodes: ({ url, base, c }) => [dataset(url, base, 'swap-rates', c.dataset)] },
  '/gtc-news/economic-calendar': { key: 'economicCalendar', nodes: ({ url, base, c }) => [dataset(url, base, 'economic-calendar', c.dataset)] },
  '/company/dynamic-leverage': {
    key: 'dynamicLeverage',
    nodes: ({ url, c }) => [{ '@type': 'WebPage', '@id': `${url}#webpage`, url, name: c.webpage.name, description: c.webpage.description, about: { '@type': 'Thing', name: c.webpage.about }, publisher: { '@id': ORG_ID } }]
  }
};

/* ---------------- output ---------------- */

/** JSON-LD documents → their nodes ('@graph' flattened, '@context' dropped). */
const toNodes = (docs) => docs.filter(Boolean).flatMap(({ '@context': _, '@graph': graph, ...node }) => graph ?? [node]);

/**
 * JSON-LD document for a page.
 *  - route:  the page's path without the locale ('/' for the homepage)
 *  - crumbs: [{ name, path }] breadcrumb (paths without the locale)
 *  - faq:    [{ q, a }] shown on the page — replaces the schema copy's FAQ
 *  - organization: add the GTCFX Organization node (company pages; the homepage has it as WebSite.publisher)
 *  - events: upcoming events ({ title, summary, startDate, endDate, venue, city, country, cover }) → Event nodes
 *  - nodes:  extra page-specific JSON-LD (an article, a FAQ built elsewhere…); falsy entries are skipped
 */
export function pageSchema({ locale, route, crumbs, faq, organization = false, events = [], nodes = [] }) {
  const base = `${SITE_URL}${localeUrl(locale)}`;
  const path = route || '/';
  const home = path === '' || path === '/';
  const url = home ? base : `${base}${path}`;
  const def = SCHEMAS[home ? '/' : path];
  const c = def ? copyFor(locale, def.key) : {};
  const extra = toNodes(nodes);
  const ownFaq = extra.some((n) => n['@type'] === 'FAQPage');
  const faqItems = faq?.length ? faq.map((f) => [f.q, f.a]).filter(([q, a]) => q && a) : ownFaq ? [] : pairs(c.faq?.items, 'question', 'answer');

  const graph = [
    crumbs?.length ? { ...toNodes([breadcrumbLd(locale, crumbs)])[0], '@id': `${url}#breadcrumb` } : null,
    ...(def ? def.nodes({ url, base, c }) : []),
    faqPage(home ? `${base}/#faq` : `${url}#faq`, faqItems),
    organization ? ORGANIZATION : null,
    ...events.map((e) => eventNode(e, url)),
    ...extra
  ].filter(Boolean);
  return graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null;
}
