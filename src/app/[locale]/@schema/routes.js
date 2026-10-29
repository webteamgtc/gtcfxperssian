/**
 * Which structured data each URL gets — the single place for page schemas.
 * The @schema slot (rendered inside <head> by app/[locale]/layout.js) looks the current path up here and
 * passes the result to pageSchema() (src/lib/pageSchemas.js), which adds the route's own nodes
 * (Service, HowTo, FinancialProduct…) from the schema copy.
 *
 * Each entry: pattern ('/markets/:market' — ':x' matches one segment) → async loader returning
 * { crumbs, faq, organization, events, nodes } or null (no schema, e.g. an unknown slug).
 * Loaders must not read headers/cookies/searchParams, or every page would turn dynamic.
 */
import { getTranslations } from 'next-intl/server';
import { SITE_URL } from '@/lib/seo';
import { getEventsPageData } from '@/lib/events';
import { faqText, getFaqGroups } from '@/lib/faqs';
import { getNewsArticle, getNewsCategories, NEWS_PATH } from '@/lib/news';
import { newsCategoryHref } from '@/lib/news-path';
import { getArticle, getSection } from '@/lib/learn';
import { ALPHABET, getGlossary } from '@/lib/glossary';
import { getPlatformGuides, normalizePlatform, createSlug } from '@/lib/platform-guide/googleDrive';
import { normalizePlatformGuideLocale } from '@/lib/platform-guide/locales';
import { getMarketSymbols } from '@/lib/marketSymbols';
import { marketPageBySlug } from '@/config/marketPages';
import { LEGAL_SLUGS } from '@/lib/legalDocuments';
import { COURSES, HUB_PATH, courseHref, sectionHref } from '../knowledge-to-learn/courses';
import { GUIDES_PATH } from '../knowledge-to-learn/platform-guide/guides';

const tr = (locale, namespace) => getTranslations({ locale, namespace });
const COMPANY = ['company', '/company'];
const TRADING = ['trading', '/trading'];
const NEWS = ['news', NEWS_PATH];

/** Breadcrumb from `<ns>.breadcrumb` (keys home / <section> / current). */
async function crumbsOf(locale, ns, path, { section, current = 'current' } = {}) {
  const t = await tr(locale, `${ns}.breadcrumb`);
  return [{ name: t('home'), path: '' }, ...(section ? [{ name: t(section[0]), path: section[1] }] : []), { name: t(current), path }];
}

/** The common case: a page with a breadcrumb namespace, optionally extra props. */
const simple = (ns, opts = {}) => async ({ locale, path }) => ({ crumbs: await crumbsOf(locale, ns, path, opts), organization: !!opts.organization });

/** "Knowledge to learn" pages start Home › Knowledge to learn. */
async function hubCrumbs(locale) {
  const t = await tr(locale, 'knowledgePage.breadcrumb');
  return [{ name: t('home'), path: '' }, { name: t('current'), path: HUB_PATH }];
}

const faqFrom = (items, q = 'q', a = 'a') => (Array.isArray(items) ? items.map((i) => ({ q: i[q], a: i[a] })) : []);

const ROUTES = {
  '/': async () => ({}),

  /* company */
  '/company': simple('companyPage', { current: 'company', organization: true }),
  '/company/about-us': simple('aboutUsPage', { section: COMPANY, organization: true }),
  '/company/awards': simple('awardsPage', { section: COMPANY }),
  '/company/contact-us': simple('contactPage', { section: COMPANY, organization: true }),
  '/company/dynamic-leverage': simple('dynamicLeveragePage', { section: COMPANY }),
  '/company/global-presence': simple('globalPresencePage', { section: COMPANY, organization: true }),
  '/company/regulations': simple('regulationsPage', { section: COMPANY, organization: true }),
  '/company/why-gtc-group': simple('whyGtcGroupPage', { section: COMPANY, organization: true }),
  '/company/events-and-exhibitions': async ({ locale, path }) => ({
    crumbs: await crumbsOf(locale, 'eventsPage', path, { section: COMPANY }),
    organization: true,
    events: (await getEventsPageData(locale)).upcoming
  }),
  '/company/faqs': async ({ locale, path }) => ({
    crumbs: await crumbsOf(locale, 'faqsPage', path, { section: COMPANY }),
    faq: (await getFaqGroups(locale)).flatMap((g) => g.questions).map((it) => ({ q: it.q, a: faqText(it.a) }))
  }),

  /* trading */
  '/trading': simple('tradingPage', { current: 'trading' }),
  '/trading/account-types': simple('accountTypesPage', { section: TRADING }),
  '/trading/compensation-fund': simple('compensationFundPage', { section: TRADING }),
  '/trading/copy-trading': simple('copyTradingPage', { section: TRADING }),
  '/trading/copy-trading/leaderboard/:slug': async ({ locale }) => ({
    crumbs: await crumbsOf(locale, 'copyTradingPage.detail', '/trading/copy-trading', { section: TRADING, current: 'copyTrading' })
  }),
  '/trading/delete': simple('deleteAccountPage', { section: TRADING }),
  '/trading/deposit': simple('depositPage', { section: TRADING }),
  '/trading/free-demo-account': simple('freeDemoAccount', { section: TRADING }),
  '/trading/open-live-account': simple('openLiveAccountPage', { section: TRADING }),
  '/trading/pamm-account': simple('pammPage', { section: TRADING }),
  '/trading/swap-update': simple('swapUpdatePage', { section: TRADING }),
  '/trading/vps-hosting-services': simple('vpsHostingPage', { section: TRADING }),
  '/trading/margin-bonus': simple('marginBonusPage', { section: TRADING }),
  '/trading/mt4-platform': simple('mt4Page', { section: TRADING }),
  '/trading/mt5-platform': simple('mt5Page', { section: TRADING }),
  '/trading/metatrader-for-android': simple('metatraderAndroidPage', { section: TRADING }),
  '/trading/metatrader-for-ipad': simple('metatraderIpadPage', { section: TRADING }),
  '/trading/gtc-go-app': simple('gtcGoApp', { section: TRADING }),
  '/trading/gtc-go-app-android': simple('gtcGoAndroidPage', { section: TRADING }),
  '/trading/gtc-go-app-ipad': simple('gtcGoIosPage', { section: TRADING }),
  '/live-account-application': simple('liveAccountApplicationPage', { section: TRADING }),

  /* markets */
  '/markets': simple('marketsPage'),
  '/markets/:market': async ({ locale, params }) => {
    const page = marketPageBySlug(params.market);
    if (!page) return null;
    const t = await tr(locale, 'marketsPage');
    return {
      crumbs: [{ name: t('breadcrumb.home'), path: '' }, { name: t('detail.markets'), path: '/markets' }, { name: t(`pages.${page.id}.name`), path: `/markets/${page.slug}` }],
      faq: page.template === 'B' ? t.raw(`pages.${page.id}.faq.items`) : null
    };
  },
  '/markets/:market/:symbol': async ({ locale, params, path, url }) => {
    const page = marketPageBySlug(params.market);
    const sym = page && (await getMarketSymbols(page)).find((x) => x.s.toLowerCase() === params.symbol.toLowerCase());
    if (!sym) return null;
    const t = await tr(locale, 'marketsPage');
    const market = t(`pages.${page.id}.name`);
    return {
      crumbs: [{ name: t('breadcrumb.home'), path: '' }, { name: t('detail.markets'), path: '/markets' }, { name: market, path: `/markets/${page.slug}` }, { name: sym.s, path }],
      nodes: [
        {
          '@type': 'FinancialProduct',
          name: `${sym.s} CFD`,
          alternateName: sym.n,
          category: market,
          description: t('symbol.meta.description', { symbol: sym.s, name: sym.n, market }),
          url,
          provider: { '@type': 'Organization', name: 'GTCFX', url: SITE_URL }
        }
      ]
    };
  },

  /* news */
  '/gtc-news': async ({ locale, path }) => {
    const t = await tr(locale, 'gtcNewsPage.breadcrumb');
    return { crumbs: [{ name: t('home'), path: '' }, { name: t('current'), path }] };
  },
  '/gtc-news/economic-calendar': async ({ locale, path }) => ({
    crumbs: await crumbsOf(locale, 'economicCalendarPage', path, { section: NEWS }),
    faq: faqFrom((await tr(locale, 'economicCalendarPage.faq')).raw('items'), 'question', 'answer')
  }),
  '/gtc-news/earnings-calendar': async ({ locale, path }) => ({
    crumbs: await crumbsOf(locale, 'earningsCalendarPage', path, { section: NEWS }),
    faq: faqFrom((await tr(locale, 'earningsCalendarPage.faq')).raw('items'))
  }),
  '/gtc-news/market-holidays': simple('marketHolidaysPage', { section: NEWS }),
  '/gtc-news/:category': async ({ locale, params }) => {
    const category = (await getNewsCategories(locale)).find((c) => c.slug === params.category);
    if (!category) return null;
    const t = await tr(locale, 'gtcNewsPage.breadcrumb');
    return { crumbs: [{ name: t('home'), path: '' }, { name: t('current'), path: NEWS_PATH }, { name: category.name, path: newsCategoryHref(category.slug) }] };
  },
  '/gtc-news/:category/:slug': async ({ locale, params, url }) => {
    const article = await getNewsArticle(locale, params.category, params.slug);
    if (!article) return null;
    const t = await tr(locale, 'gtcNewsPage.breadcrumb');
    return {
      crumbs: [
        { name: t('home'), path: '' },
        { name: t('current'), path: NEWS_PATH },
        ...(article.category ? [{ name: article.category, path: newsCategoryHref(params.category) }] : []),
        { name: article.title, path: article.href }
      ],
      nodes: [
        {
          '@type': 'NewsArticle',
          headline: article.title,
          description: article.metaDescription || article.excerpt || undefined,
          datePublished: article.publishedAt || undefined,
          image: article.cover?.url ? [article.cover.url] : undefined,
          author: article.author ? { '@type': 'Person', name: article.author } : { '@type': 'Organization', name: 'GTCFX' },
          publisher: { '@type': 'Organization', name: 'GTCFX', url: SITE_URL },
          mainEntityOfPage: url
        }
      ]
    };
  },

  /* knowledge to learn */
  '/knowledge-to-learn': async ({ locale }) => ({
    crumbs: await hubCrumbs(locale),
    faq: (await tr(locale, 'knowledgePage')).raw('qanda.items')
  }),
  '/knowledge-to-learn/liquidity-technology': async ({ locale, path }) => {
    const t = await tr(locale, 'liquidityTechnologyPage.breadcrumb');
    return { crumbs: [...(await hubCrumbs(locale)), { name: t('current'), path }] };
  },
  '/knowledge-to-learn/platform-guide': async ({ locale }) => {
    const t = await tr(locale, 'platformGuidePage.hero');
    return { crumbs: [...(await hubCrumbs(locale)), { name: t('title'), path: GUIDES_PATH }] };
  },
  '/knowledge-to-learn/platform-guide/:platform/:slug': async ({ locale, params, path }) => {
    const platform = normalizePlatform(params.platform);
    if (!platform) return null;
    const guides = await getPlatformGuides(platform, normalizePlatformGuideLocale(locale)).catch(() => null);
    const wanted = createSlug(params.slug.normalize('NFC'));
    const item = guides && [...guides.png, ...guides.pdf].find((g) => g.slug === wanted || g.id === wanted);
    if (!item) return null;
    const t = await tr(locale, 'platformGuidePage.hero');
    return { crumbs: [...(await hubCrumbs(locale)), { name: t('title'), path: GUIDES_PATH }, { name: item.title, path }] };
  },
  '/knowledge-to-learn/trading-glossary': ({ locale }) => glossary(locale),
  '/knowledge-to-learn/trading-glossary/:letter': ({ locale, params }) => (ALPHABET.includes(params.letter.toUpperCase()) ? glossary(locale, params.letter.toUpperCase()) : null),
  '/knowledge-to-learn/:course': async ({ locale, params }) => (COURSES[params.course] ? { crumbs: await courseCrumbs(locale, params.course) } : null),
  '/knowledge-to-learn/:course/:section': async ({ locale, params }) => {
    const section = COURSES[params.course] && (await getSection(locale, params.course, params.section));
    if (!section) return null;
    return { crumbs: [...(await courseCrumbs(locale, params.course)), { name: section.name, path: sectionHref(params.course, section.slug) }] };
  },
  '/knowledge-to-learn/:course/:section/:article': async ({ locale, params, path }) => {
    if (!COURSES[params.course]) return null;
    const [section, article] = await Promise.all([getSection(locale, params.course, params.section), getArticle(locale, params.section, params.article)]);
    if (!section || !article) return null;
    return { crumbs: [...(await courseCrumbs(locale, params.course)), { name: section.name, path: sectionHref(params.course, section.slug) }, { name: article.title, path }] };
  },

  /* legal */
  '/legal/legal-documents': async ({ locale, path }) => {
    const t = await tr(locale, 'legalPage');
    return { crumbs: [{ name: t('breadcrumb.home'), path: '' }, { name: t('hub.current'), path }] };
  },
  '/legal/restricted-countries': ({ locale, path }) => legalCrumbs(locale, path, 'restricted.current'),
  '/legal/:doc': ({ locale, params, path }) => (LEGAL_SLUGS.includes(params.doc) ? legalCrumbs(locale, path, `docs.${params.doc}.name`) : null)
};

async function courseCrumbs(locale, course) {
  const t = await tr(locale, `${COURSES[course].ns}.courseHeader`);
  return [...(await hubCrumbs(locale)), { name: t('title').replace(/[[\]]/g, ''), path: courseHref(course) }];
}

async function glossary(locale, letter) {
  const [g, t] = await Promise.all([getGlossary(locale), tr(locale, 'glossaryPage')]);
  const terms = letter ? g[letter] ?? [] : Object.values(g).flat();
  return {
    crumbs: [...(await hubCrumbs(locale)), { name: t('breadcrumb.current'), path: '/knowledge-to-learn/trading-glossary' }],
    nodes: [terms.length > 0 && { '@type': 'DefinedTermSet', name: t('title'), hasDefinedTerm: terms.map((x) => ({ '@type': 'DefinedTerm', name: x.term, description: x.definition })) }]
  };
}

async function legalCrumbs(locale, path, currentKey) {
  const t = await tr(locale, 'legalPage');
  return { crumbs: [{ name: t('breadcrumb.home'), path: '' }, { name: t('breadcrumb.legal'), path: '/legal/legal-documents' }, { name: t(currentKey), path }] };
}

/* ---------------- lookup ---------------- */

// static patterns first, so '/gtc-news/economic-calendar' wins over '/gtc-news/:category'
const COMPILED = Object.entries(ROUTES)
  .map(([pattern, load]) => ({ parts: pattern.split('/').filter(Boolean), load, dynamic: pattern.includes(':') }))
  .sort((a, b) => a.dynamic - b.dynamic);

/** segments: the URL path after the locale, e.g. ['markets', 'forex']. Returns the loader's props + route, or null. */
export async function schemaPropsFor(locale, segments, url) {
  const parts = segments.map((s) => decodeURIComponent(s));
  for (const r of COMPILED) {
    if (r.parts.length !== parts.length) continue;
    const params = {};
    if (!r.parts.every((p, i) => (p.startsWith(':') ? ((params[p.slice(1)] = parts[i]), true) : p === parts[i]))) continue;
    const path = parts.length ? `/${parts.join('/')}` : '/';
    try {
      const props = await r.load({ locale, params, path, url });
      return props ? { ...props, route: path } : null;
    } catch (error) {
      console.error(`[schema] ${path}:`, error);
      return null;
    }
  }
  return null;
}
