import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { COOKIES, CAT5_LOCALE, CAT5_LOCALES, CAT5_PAGES, CAT5_PATH, CAT5_SITE, REGION_LOCALES, regionForCountry, REMEMBER_DAYS } from './config/regions';
import { GEO_COUNTRY_COOKIE, GEO_COUNTRY_MAX_AGE, getClientIp, getCountryFromHeaders, isLocalIp } from './lib/geo/resolveCountryFromRequest';

/**
 * Runs before every page:
 *  1. works out the visitor's country (see countryOf)
 *  0. sends old-site language URLs to today's: /vi-intl → /vi, /zh-tw → /zh-TW, /en-intl/ru-intl/… → /ru/…
 *  2. sends URLs without a language/region (/, /company, old /en/…) to the visitor's regional site
 *  3. sends a regional English URL of another region to the visitor's own one, same path
 *     (UAE → /en-ae, South Africa → /en-za, Mauritius → /en-mu, Vanuatu → /en-vu, everyone else incl. US → /en-intl)
 *  1b. TEMPORARY UAE CAT 5 website (NEXT_PUBLIC_UAE_CAT5_SITE=on): UAE visitors always get it, see cat5Site()
 *  4. keeps UAE CAT 5 visitors on the marketing page (only while the CAT 5 website switch is off)
 *  5. hands over to next-intl, and stores the country in the `gtc_country` cookie — the single source the
 *     client reads (useCountry for popups/header, useLocationDetail for forms), so the browser normally
 *     never calls an IP service itself
 * Rules and cookie names: src/config/regions.js
 */
const intl = createMiddleware(routing);
const LOCALES = new Set(routing.locales);
const REGIONAL = new Set(REGION_LOCALES);
const GEO_TEST = process.env.VERCEL_ENV !== 'production' || process.env.GEO_TEST === '1';
const COUNTRY_RE = /^[A-Z]{2}$/;
// crawlers must reach every regional site (they would otherwise always land on /en-intl)
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|whatsapp|lighthouse|pagespeed/i;

// old site: every language had an "-intl" folder (vi-intl, ru-intl, zh-intl…) and some other spellings
const LOCALE_BY_LOWER = new Map(routing.locales.map((c) => [c.toLowerCase(), c]));
const OLD_LOCALES = {};
// languages the site no longer has (only English + Farsi now): their URLs go to the visitor's English site, same page
const REMOVED_LOCALES = new Set(['ar', 'ur', 'ps', 'hi', 'tr', 'uz', 'zh', 'zh-tw', 'vi', 'th', 'ms', 'id', 'fil', 'es', 'fr', 'it', 'pt', 'ru', 'cn', 'zh-cn', 'zh-hans', 'tw', 'zh-hk', 'zh-hant', 'tl', 'ph']);
const isRemoved = (segment) => REMOVED_LOCALES.has(segment.toLowerCase().replace(/-intl$/, ''));

/** Today's locale for a URL segment (vi-intl → vi, zh-tw → zh-TW, en-intl as is); null if it isn't one (plain /en: rule 2). */
function localeOf(segment) {
  const s = segment.toLowerCase();
  if (LOCALE_BY_LOWER.has(s)) return LOCALE_BY_LOWER.get(s);
  const old = s.endsWith('-intl');
  const base = old ? s.slice(0, -'-intl'.length) : s;
  return LOCALE_BY_LOWER.get(base) || ((old || base.includes('-')) && OLD_LOCALES[base]) || null;
}

const valid = (c) => {
  const v = String(c ?? '')
    .trim()
    .toUpperCase();
  return COUNTRY_RE.test(v) ? v : '';
};

/** Server-side IP → country (only when no CDN header and no cookie is available, e.g. off Vercel). */
async function lookupIp(request) {
  const ip = getClientIp(request);
  if (isLocalIp(ip)) return '';
  const token = process.env.IPINFO_TOKEN;
  try {
    const res = await fetch(token ? `https://ipinfo.io/${ip}?token=${token}` : `https://ipinfo.io/${ip}/json`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1500)
    });
    return res.ok ? valid((await res.json())?.country) : '';
  } catch {
    return '';
  }
}

/**
 * Visitor country, first match wins:
 *   ?geo=XX (test deployments; ?geo=clear removes it) → saved test override
 *   → CDN header (Vercel x-vercel-ip-country, Cloudflare cf-ipcountry)
 *   → cookies (gtcfx_geo_country: an earlier lookup here or the browser fallback in useLocationDetail,
 *      then gtc_country from the previous request)
 *   → ipinfo lookup of the request IP
 */
async function countryOf(request) {
  const q = request.nextUrl.searchParams.get('geo')?.toUpperCase();
  if (GEO_TEST && q && COUNTRY_RE.test(q)) return { country: q, test: q };
  if (GEO_TEST && q === 'CLEAR') return { country: valid(getCountryFromHeaders(request)), test: 'clear' };
  const saved = GEO_TEST ? valid(request.cookies.get(COOKIES.geoTest)?.value) : '';
  if (saved) return { country: saved };

  const fromHeader = valid(getCountryFromHeaders(request));
  if (fromHeader) return { country: fromHeader };
  const fromCookie = valid(request.cookies.get(GEO_COUNTRY_COOKIE)?.value) || valid(request.cookies.get(COOKIES.country)?.value);
  if (fromCookie) return { country: fromCookie };
  const looked = await lookupIp(request);
  return { country: looked, lookedUp: Boolean(looked) };
}

function finish(response, { country, test, lookedUp }) {
  const opts = { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' };
  if (country) response.cookies.set(COOKIES.country, country, { ...opts, maxAge: 60 * 60 * 24 });
  // cache a server-side lookup so it runs at most once a day per visitor
  if (lookedUp) response.cookies.set(GEO_COUNTRY_COOKIE, country, { ...opts, maxAge: GEO_COUNTRY_MAX_AGE });
  if (test === 'clear') response.cookies.delete(COOKIES.geoTest);
  else if (test) response.cookies.set(COOKIES.geoTest, test, { ...opts, maxAge: 60 * 60 * 24 * REMEMBER_DAYS });
  return response;
}

/**
 * TEMPORARY UAE CAT 5 website (GTC Financial Consultancy L.L.C.), on while NEXT_PUBLIC_UAE_CAT5_SITE=on.
 * UAE visitors (any page, any language):
 *   /en-ae, /en-ae/about-us, /en-ae/faqs, /en-ae/contact-us (and /fa/…) → shown from src/app/[locale]/marketing/…
 *   (the address stays the same); /en-ae/marketing/… → its public address; any other page or language → /en-ae
 *   (or /fa). The CAT 5 category cookie is set, so the CAT 1 / CAT 5 popup never shows.
 * Everyone else: /…/marketing/… → that language's normal Home; the normal site otherwise.
 * Returns undefined when the normal rules should run.
 */
function cat5Site(request, geo, first, restPath, redirect) {
  const internal = restPath === CAT5_PATH || restPath.startsWith(`${CAT5_PATH}/`);
  if (geo.country !== 'AE') return internal ? redirect(`/${first}`) : undefined;
  const pages = Object.values(CAT5_PAGES);
  if (!CAT5_LOCALES.includes(first)) {
    return redirect(`/${first === 'fa' ? 'fa' : CAT5_LOCALE}`);
  }
  if (internal) return redirect(`/${first}${pages.find((p) => p.dir === restPath.slice(CAT5_PATH.length))?.path ?? ''}`);
  const page = pages.find((p) => p.path === restPath);
  if (!page) return redirect(`/${first}`);
  const url = new URL(`/${first}${CAT5_PATH}${page.dir}`, request.url);
  url.search = request.nextUrl.search;
  const res = finish(NextResponse.rewrite(url), geo);
  res.cookies.set(COOKIES.uaeCategory, '5', { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * REMEMBER_DAYS });
  return res;
}

export default async function proxy(request) {
  const geo = await countryOf(request);
  const { pathname, search } = request.nextUrl;
  const [, first = '', ...rest] = pathname.split('/');
  const restPath = rest.length ? `/${rest.join('/')}` : '';
  const home = regionForCountry(geo.country);
  const isBot = BOT_RE.test(request.headers.get('user-agent') || '');
  const redirect = (path, status = 307) => {
    // drop ?geo= from the target so the override isn't re-applied on every page
    const url = new URL(path, request.url);
    url.search = search;
    url.searchParams.delete('geo');
    return finish(NextResponse.redirect(url, status), geo);
  };

  // 0. old-site language URLs → today's locale, same page (permanent, for search engines):
  //    /vi-intl → /vi, /zh-tw → /zh-TW, /en-intl/vi-intl/… → /vi/… (old links that got /en-intl put in front)
  const outer = localeOf(first);
  const inner = outer && rest.length ? localeOf(rest[0]) : null;
  const fixed = inner ?? outer;
  const fixedTail = inner ? rest.slice(1) : rest;
  if (fixed && (inner || fixed !== first)) return redirect(`/${fixed}${fixedTail.length ? `/${fixedTail.join('/')}` : ''}`, 301);

  // 1b. TEMPORARY UAE CAT 5 website
  if (CAT5_SITE) {
    const res = cat5Site(request, geo, first, restPath, redirect);
    if (res) return res;
  }

  // 2. no region/language in the URL (or the old /en, or a removed language) → the visitor's regional site (en-intl, en-ae…);
  //    no remembered language — the locale lives only in the URL
  if (!LOCALES.has(first)) {
    const tail = first === 'en' || isRemoved(first) ? restPath : pathname === '/' ? '' : pathname;
    return redirect(`/${home}${tail}`);
  }

  // 3. another region's English site → the visitor's own region (same page).
  //    Skipped for crawlers, when the country is unknown, or when the visitor chose to stay on this
  //    region (GeoGate "stay here" / picking it in the language picker → regionDismissed cookie).
  //    UAE CAT 5 visitors are handled by rule 4 (their marketing page is always on /en-ae).
  const cat5 = request.cookies.get(COOKIES.uaeCategory)?.value === '5';
  if (REGIONAL.has(first) && first !== home && geo.country && !isBot && !cat5 && request.cookies.get(COOKIES.regionDismissed)?.value !== first) {
    return redirect(`/${home}${restPath}`);
  }

  // 4. UAE CAT 5 (popup flow, CAT 5 website switch off): every page leads to the CAT 5 pages (Farsi pages to the Farsi version)
  if (!CAT5_SITE && cat5 && !(CAT5_LOCALES.includes(first) && (restPath === CAT5_PATH || restPath.startsWith(`${CAT5_PATH}/`)))) {
    return redirect(`/${first === 'fa' ? 'fa' : CAT5_LOCALE}${CAT5_PATH}`);
  }

  // 5. normal page
  return finish(intl(request), geo);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
