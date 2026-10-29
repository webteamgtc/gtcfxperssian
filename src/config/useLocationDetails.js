'use client';
/**
 * Visitor country for client components (forms preselect the phone / country with it):
 *   const { countryCode, countryData, locationReady } = useLocationDetail();
 *   countryCode   — ISO 3166-1 alpha-2, upper case ("AE"), or null while unknown
 *   countryData   — { country, source } where source is 'proxy' | 'cookie' | 'ipinfo' (+ ipinfo fields when looked up)
 *   locationReady — true once the country is known or the lookup gave up
 *
 * Source of truth is the server: src/proxy.js works out the country on every page request (CDN header,
 * ?geo= test override, or its own IP lookup) and writes it to the `gtc_country` cookie — so normally this hook
 * just reads that cookie and makes no network request.
 * Only when no country is known yet (e.g. localhost, where the server sees a local IP) does it ask ipinfo.io
 * from the browser, once per page load, and saves the answer in the geo cookie; the proxy reads that cookie
 * on the next request, so the lookup isn't repeated.
 * Cookies are read after mount, so server and browser render the same first HTML.
 */
import { useEffect, useState } from 'react';
import { COOKIES } from '@/config/regions';
import { GEO_COUNTRY_COOKIE, GEO_COUNTRY_MAX_AGE } from '@/lib/geo/resolveCountryFromRequest';

const GEO_URL = 'https://ipinfo.io/json';
const TIMEOUT = 5000;

let cached = null; // ipinfo answer ({ countryCode, countryData }) for the rest of the page's life
let lookup = null; // in-flight ipinfo request shared by every component

/** "ae" → "AE"; anything that isn't a two-letter code → null. */
export const normaliseCountry = (code) => {
  const c = String(code ?? '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(c) ? c : null;
};

function readCookie(name) {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  if (!hit) return null;
  try {
    return decodeURIComponent(hit.slice(name.length + 1));
  } catch {
    return null;
  }
}

/** Country already known without a request: the proxy's cookie, then a saved lookup. */
function knownCountry() {
  const fromProxy = normaliseCountry(readCookie(COOKIES.country));
  if (fromProxy) return { countryCode: fromProxy, countryData: { country: fromProxy, source: 'proxy' } };
  const saved = normaliseCountry(readCookie(GEO_COUNTRY_COOKIE));
  if (saved) return { countryCode: saved, countryData: { country: saved, source: 'cookie' } };
  return null;
}

/** Browser-side fallback; the result is saved where the proxy (and later page loads) will find it. */
function lookupCountry() {
  lookup ??= fetch(GEO_URL, { signal: AbortSignal.timeout(TIMEOUT), headers: { Accept: 'application/json' } })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const country = normaliseCountry(data?.country);
      if (!country) return null;
      document.cookie = `${GEO_COUNTRY_COOKIE}=${country}; path=/; max-age=${GEO_COUNTRY_MAX_AGE}; SameSite=Lax`;
      return { countryCode: country, countryData: { ...data, country, source: 'ipinfo' } };
    })
    .catch(() => null)
    .finally(() => {
      lookup = null;
    });
  return lookup;
}

const EMPTY = { countryCode: null, countryData: null, locationReady: false };

export const useLocationDetail = () => {
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    let alive = true;
    // cookies first (cheap, and they follow the proxy on every navigation), then this page's ipinfo answer
    const known = knownCountry() ?? cached;
    if (known) {
      setState({ ...known, locationReady: true });
      return undefined;
    }
    lookupCountry().then((result) => {
      if (!alive) return;
      if (result) cached = result;
      setState(result ? { ...result, locationReady: true } : { ...EMPTY, locationReady: true });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
};
