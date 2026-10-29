'use client';
/** Browser helpers for the region rules (cookies, visitor country, intro hand-off). Settings: src/config/regions.js */
import { useEffect, useState } from 'react';
import { COOKIES, CAT5_LOCALE, REMEMBER_DAYS } from '@/config/regions';

export function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function writeCookie(name, value, days = REMEMBER_DAYS) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${secure}`;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

/** Visitor's country code ('US', 'AE'…), or '' until known. Set by src/proxy.js on every page view. */
export function useCountry() {
  const [country, setCountry] = useState('');
  useEffect(() => {
    setCountry(previewCountry() || (readCookie(COOKIES.country) || '').toUpperCase());
  }, []);
  return country;
}

/** Review-link builds have no server to detect the country: ?geo=US (AE, ZA…) simulates one for the session. */
function previewCountry() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== '1') return '';
  try {
    const q = new URLSearchParams(location.search).get('geo');
    if (q) sessionStorage.setItem('gtc_geo', q.toUpperCase() === 'CLEAR' ? '' : q.toUpperCase());
    return sessionStorage.getItem('gtc_geo') || '';
  } catch {
    return '';
  }
}

const PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

/**
 * URL of `path` on another locale's site. Live: /<locale><path>. Review link (flattened static pages,
 * /<locale>/<last segment>/index.html, see scripts/preview-export.sh): a relative link.
 * Without `path`, keeps the current page.
 */
export function localeHref(locale, path) {
  if (!PREVIEW) return `/${locale}${path ?? window.location.pathname.replace(/^\/[^/]+/, '')}${path ? '' : window.location.search}`;
  const slug = path !== undefined ? path.split('/').filter(Boolean).pop() || 'home' : window.location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'home';
  return `../../${locale}/${slug}/index.html`;
}

/**
 * UAE: forget the CAT 1 / CAT 5 choice (and the acknowledgement) and show the choice again.
 * `pick` ('1' or '5') pre-selects that category in the popup (the visitor still ticks the box and continues).
 */
export function resetUaeCategory(pick) {
  deleteCookie(COOKIES.uaeCategory);
  deleteCookie(COOKIES.uaeAck);
  try {
    if (pick === '1' || pick === '5') sessionStorage.setItem('gtc_uae_pick', pick);
  } catch {}
  window.location.assign(localeHref(CAT5_LOCALE, ''));
}

/**
 * Resolves as soon as the opening intro starts fading out (or immediately when it was skipped), so a popup
 * can open underneath it and the intro dissolves straight into it.
 */
export function whenIntroLeaving() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.__gtcIntroLeaving || window.__gtcIntroDone || document.documentElement.dataset.intro !== 'play') return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener('gtc:intro-leave', resolve, { once: true });
    window.addEventListener('gtc:intro-done', resolve, { once: true });
  });
}

/** Locks page scroll while a blocking dialog is open. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => {
      el.style.overflow = prev;
    };
  }, [active]);
}
