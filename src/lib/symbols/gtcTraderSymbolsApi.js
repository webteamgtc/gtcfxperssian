const SYMBOLS_API_BASE =
  process.env.NEXT_PUBLIC_SYMBOLS_URL || "https://apiv1.gtctrader100.top/api";

const EXCHANGE_NAME =
  process.env.NEXT_PUBLIC_SERVER_NAME || "GTCFX MT5 Live";

async function postSymbolApi(path, payload) {
  const res = await fetch(`${SYMBOLS_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Symbol API ${path} failed (${res.status})`);
  }

  const json = await res.json();

  if (json?.code !== 200) {
    throw new Error(json?.message || `Symbol API ${path} returned code ${json?.code}`);
  }

  return json.data;
}

/**
 * Fetch available symbol categories for the configured exchange.
 * POST /symbol/type
 */
export async function fetchSymbolTypes({ loginId = 0, exchangeName = EXCHANGE_NAME } = {}) {
  const data = await postSymbolApi("/symbol/type", {
    loginid: loginId,
    exchange_name: exchangeName,
  });

  return Array.isArray(data) ? data : [];
}

/**
 * Fetch symbols for a category type.
 * POST /symbol/index
 */
export async function fetchSymbolsByType({
  type,
  loginId = "0",
  exchangeName = EXCHANGE_NAME,
  keyword = "",
  page = 1,
  pageSize = 15,
} = {}) {
  if (!type) {
    return { list: [], total: 0 };
  }

  const data = await postSymbolApi("/symbol/index", {
    exchange_name: exchangeName,
    loginid: String(loginId),
    type,
    keyword,
    page,
    page_size: pageSize,
  });

  return {
    list: Array.isArray(data?.list) ? data.list : [],
    total: Number(data?.total) || 0,
  };
}

/**
 * Fetch OHLC kline/candlestick data.
 * POST /kchart/chart
 * date: 1 | 15 | 30 | 60 | 240 | 1440 | 10080 | 43200 (minutes)
 */
export async function fetchKlineChart({
  symbol,
  date = 1440,
  loginId = "0",
  exchangeName = EXCHANGE_NAME,
  start = 0,
  end = 0,
  count = 100,
} = {}) {
  if (!symbol) return [];

  const data = await postSymbolApi("/kchart/chart", {
    symbol: String(symbol).replace(/\//g, ""),
    date,
    exchange_name: exchangeName,
    loginid: String(loginId),
    start,
    end,
    count,
  });

  return Array.isArray(data) ? data : [];
}

/**
 * Fetch symbol contract/spec details.
 * POST /trade/symbol_info
 */
export async function fetchSymbolInfo({
  symbol,
  loginId = 0,
  exchangeName = EXCHANGE_NAME,
} = {}) {
  if (!symbol) return null;

  const data = await postSymbolApi("/trade/symbol_info", {
    symbol: String(symbol).replace(/\//g, ""),
    exchange_name: exchangeName,
    loginid: loginId,
  });

  if (!data || typeof data !== "object") return null;

  const key = String(symbol).replace(/\//g, "");
  return data[key] ?? data;
}

/** Map symbol/index list item to MarketLiveQuotesSection row shape. */
export function mapSymbolToQuoteRow(item) {
  const rawSymbol = item?.symbol ?? "";
  const digits = Number(item?.digits);
  return {
    id: item?.id ?? rawSymbol,
    rawSymbol,
    symbol: rawSymbol,
    name: item?.description?.trim() || item?.symbol || "",
    digits: Number.isFinite(digits) ? digits : 5,
    bid: "—",
    ask: "—",
    spread: "—",
    change: "—",
    positive: true,
    iconUrl: item?.symbol_svg?.svg_png || item?.symbol_svg?.svg || null,
    lotSize: item?.min_volume ?? item?.contact_size ?? "0.01",
  };
}
