'use client';
/**
 * Copy-trading helpers: ratings hook (via /api/copy-trading/ratings), formatters and gtccopy links.
 */
import { useEffect, useState } from 'react';

export const DEFAULT_AVATAR = '/GTCFX-ICON.svg';
export const MOCK_URL = 'https://gtccopy.com/portal/login';
export const START_URL = 'https://gtccopy.com/portal/login';

/** gtccopy subscription link for a strategy provider (same query string as the ratings widget). */
export function subscriptionUrl(providerId) {
  if (providerId == null || providerId === '') return START_URL;
  return `https://gtccopy.com/portal/registration/subscription?provider=${providerId}&backLink=true&backUrl=https%3A%2F%2Fratings.gtccopy.com%2Fwidgets%2Fratings%3FwidgetKey=social_platform_ratings&lang=en&wlid=2b9e7678-160f-48f5-9a5f-5f5bef2d9d26&widgetKey=social_platform_ratings`;
}

/** Countries whose providers are not shown in the featured carousel. */
const EXCLUDED = new Set(['jp', 'kr', 'ir', 'gb', 'au', 'us']);
export const isExcluded = (item) => EXCLUDED.has(item?.countryCode);

const nf = (d) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtNumber = (v, d = 2) => (Number.isFinite(v) ? nf(d).format(v) : '-');
export const fmtInt = (v) => (Number.isFinite(v) ? nf(0).format(v) : '-');
export const fmtMoney = (v) => (Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${nf(2).format(v)}` : '-');
export const fmtPercent = (v) => (Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${nf(2).format(v)}%` : '-');
export const tone = (v) => (!Number.isFinite(v) ? 'text-ink' : v >= 0 ? 'text-up' : 'text-down');

/** Fetch a page of ratings. Re-fetches when `skip` / `top` / `orderby` change. */
export function useRatings({ top = 12, skip = 0, orderby = 'rank asc' } = {}) {
  const [state, setState] = useState({ items: [], count: 0, loading: true, error: false });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: false }));
    const qs = new URLSearchParams({ top: String(top), skip: String(skip), orderby });
    fetch(`/api/copy-trading/ratings?${qs}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => alive && setState({ items: d.items || [], count: d.count || 0, loading: false, error: false }))
      .catch(() => alive && setState({ items: [], count: 0, loading: false, error: true }));
    return () => {
      alive = false;
    };
  }, [top, skip, orderby]);

  return state;
}
