/**
 * Browser-side helpers for the /api/symbols/* routes (which proxy the GTC symbols API).
 * Responses are cached in memory for a short time so several components on one page
 * (hero terminal, tickers, market tables) share a single request per resource.
 */

const TYPES_TTL = 10 * 60 * 1000;
const LIST_TTL = 5 * 60 * 1000;
const KLINE_TTL = 30 * 1000;

const cache = new Map();

function cached(key, ttl, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.promise;

  const promise = loader().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { at: Date.now(), promise });
  return promise;
}

async function getJson(url) {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json.data;
}

/** API category name, e.g. "Metals", "FX Minors". */
export const getSymbolTypeName = (item) => item?.title_name || item?.title || "";

/** GET /api/symbols/types → [{ id, title, title_name, ... }] */
export function loadSymbolTypes() {
  return cached("types", TYPES_TTL, async () => {
    const data = await getJson("/api/symbols/types");
    return Array.isArray(data) ? data : [];
  });
}

/** GET /api/symbols/list → { list, total } */
export function loadSymbols(type, { page = 1, pageSize = 15 } = {}) {
  const params = new URLSearchParams({ type, page: String(page), pageSize: String(pageSize) });
  return cached(`list:${params}`, LIST_TTL, async () => {
    const data = await getJson(`/api/symbols/list?${params}`);
    return {
      list: Array.isArray(data?.list) ? data.list : [],
      total: Number(data?.total) || 0,
    };
  });
}

/**
 * GET /api/symbols/chart → [{ t, o, h, l, c, v }] oldest first.
 * `date` is the candle period in minutes (1, 15, 30, 60, 240, 1440, ...).
 */
export function loadKline(symbol, { date = 60, count = 48 } = {}) {
  const params = new URLSearchParams({ symbol, date: String(date), count: String(count) });
  return cached(`kline:${params}`, KLINE_TTL, async () => {
    const data = await getJson(`/api/symbols/chart?${params}`);
    return (Array.isArray(data) ? data : [])
      .map((k) => ({ t: Number(k.t), o: Number(k.o), h: Number(k.h), l: Number(k.l), c: Number(k.c) }))
      .filter((k) => [k.o, k.h, k.l, k.c].every(Number.isFinite))
      .sort((a, b) => a.t - b.t);
  });
}
