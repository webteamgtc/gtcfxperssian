/**
 * Regional English sites and visitor rules — one place to change them.
 *
 *   /en-intl  everyone not listed below (and the US)   footer: international notice
 *   /en-ae    UAE                                      footer: international notice + CAT 1 / CAT 5 choice
 *   /en-za    South Africa                             footer: footer.notices.za
 *   /en-mu    Mauritius                                footer: footer.notices.mu
 *   /en-vu    Vanuatu                                  footer: footer.notices.vu
 *
 * A visitor's country is worked out in src/proxy.js: CDN header (Vercel `x-vercel-ip-country`, Cloudflare
 * `cf-ipcountry`) → geo cookie (ipinfo result saved by useLocationDetail) → server-side ipinfo lookup of the IP.
 * The proxy sends URLs without a locale, and regional English URLs of another region, to the visitor's region
 * (same path) — unless they chose to stay (regionDismissed cookie) or are a crawler.
 * Testing from anywhere: add ?geo=US (or AE, ZA, MU, VU, PK…) to any URL on a preview/dev deployment;
 * ?geo=clear removes it. The override is ignored on the production deployment unless GEO_TEST=1.
 */

/** country (ISO 3166-1 alpha-2) → regional English site */
export const REGION_BY_COUNTRY = { AE: 'en-ae', ZA: 'en-za', MU: 'en-mu', VU: 'en-vu' };
export const DEFAULT_REGION = 'en-intl';
export const REGION_LOCALES = ['en-intl', 'en-ae', 'en-za', 'en-mu', 'en-vu'];

export const regionForCountry = (country) => REGION_BY_COUNTRY[String(country || '').toUpperCase()] ?? DEFAULT_REGION;

/** 'en-za' → 'za'; non-regional locales (ar, zh…) → 'intl' */
export const regionOf = (locale) => (REGION_LOCALES.includes(locale) ? locale.slice(3) : 'intl');

/** Regions with their own legal footer (messages: footer.notices.<region>); the rest use footer.risk. */
export const FOOTER_NOTICE_REGIONS = ['za', 'mu', 'vu'];

/** Cookies (all readable in the browser; none hold personal data). */
export const COOKIES = {
  country: 'gtc_country', // visitor's country, refreshed on every page view by the proxy
  geoTest: 'gtc_geo_test', // ?geo= override while testing
  usAccepted: 'gtc_us_notice', // US visitor accepted the important notice
  uaeCategory: 'gtc_uae_cat', // UAE visitor's choice: '1' or '5'
  uaeAck: 'gtc_uae_ack', // when the UAE visitor accepted the important-information statement
  regionDismissed: 'gtc_region_ok' // visitor chose to stay on another region's site
};
export const REMEMBER_DAYS = 30;

/** UAE CAT 5: GTC Financial Consultancy L.L.C page (CMA Category 5). While CAT 5 is chosen, every other page redirects here. */
export const CAT5_PATH = '/marketing';

/**
 * TEMPORARY UAE CAT 5 website (GTC Financial Consultancy L.L.C.), until the CAT 1 licence arrives.
 * NEXT_PUBLIC_UAE_CAT5_SITE=on (Vercel env): every visitor with a UAE IP gets the CAT 5 website on the normal
 * addresses (gtcfx.com/en-ae, /en-ae/about-us, /en-ae/faqs, /en-ae/contact-us, and the same under /ar); every other
 * page sends them to its Home; no CAT 1 / CAT 5 popup. Set it to off (or remove it) and redeploy to switch back to
 * the normal UAE site. See src/proxy.js.
 */
export const CAT5_SITE = process.env.NEXT_PUBLIC_UAE_CAT5_SITE === 'on';
/** CAT 5 pages: key → public address (after /<locale>) and the folder it lives in (src/app/[locale]/marketing/…). */
export const CAT5_PAGES = {
  home: { path: '', dir: '' },
  about: { path: '/about-us', dir: '/about' },
  faq: { path: '/faqs', dir: '/faq' },
  contact: { path: '/contact-us', dir: '/contact' }
};
export const CAT5_LOCALE = 'en-ae';
/** The CAT 5 page exists in English (/en-ae) and Farsi (/fa). */
export const CAT5_LOCALES = ['en-ae', 'fa'];

/**
 * Contact details on the CAT 5 site ("Prefer to talk now?", Support, contact page, form sidebar). Address: marketingPage.form.address.
 */
export const CAT5_CONTACT = { email: 'support@gtcfx.com', phone: '971-45109800' };

/** Preferred language options on the CAT 5 enquiry form → POST /api/uae-enquiry. */
export const CAT5_LANGUAGES = ['fa', 'en'];

/**
 * CAT 5 footer links (GTC Financial Consultancy L.L.C. documents). Labels: marketingPage.footer.links.
 * "Legal Documents" is also the button in "Your Relationship with GTC Financial Consultancy".
 */
export const CAT5_LEGAL_LINKS = {
  legalDocuments: '/legal/legal-documents',
  riskDisclosure: '/legal/risk-disclosure',
  privacy: '/legal/privacy-policy',
  cookies: '/legal/cookie-policy',
  terms: '/legal/terms-and-conditions'
};

/** CMA licensed-companies register (footer “here” + relationship verify line). */
export const CAT5_CMA_URL = 'https://www.uaecma.gov.ae/en/open-data/licensed-companies';
