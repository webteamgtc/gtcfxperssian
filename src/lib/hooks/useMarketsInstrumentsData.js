"use client";

import { useEffect, useMemo, useState } from "react";
import { mapSymbolToQuoteRow } from "@/lib/symbols/gtcTraderSymbolsApi";
import { formatQuotePrice } from "@/lib/symbols/gtcTraderQuotesWs";
import { getRowLiveQuote, useSymbolQuotesWs } from "./useSymbolQuotesWs";
import { PAGE_TYPES } from "./useMarketLiveQuotes";

/**
 * API symbol type per markets hub instrument card (keys match MARKETS ids in src/config/markets.js).
 * The symbols API has no Index / Crypto types, so those markets keep the demo feed.
 */
export const INSTRUMENT_API_TYPES = {
  forex: "FX Minors",
  metals: "Metals",
  energy: "Energy",
  shares: "Stock",
  futures: "Future",
};

async function loadSymbolsForType(type, pageSize = 3) {
  const params = new URLSearchParams({
    type,
    page: "1",
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/symbols/list?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to load symbols");
  return (Array.isArray(json.data?.list) ? json.data.list : [])
    .slice(0, pageSize)
    .map(mapSymbolToQuoteRow);
}

export function useAssetMarketHeroSymbols(slug, limit = 3) {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const type = PAGE_TYPES[slug]?.[0];

      if (!type) {
        if (!cancelled) {
          setSymbols([]);
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await loadSymbolsForType(type, limit);
        if (!cancelled) setSymbols(rows);
      } catch {
        if (!cancelled) setSymbols([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, limit]);

  const rawSymbols = useMemo(
    () => symbols.map((row) => row.rawSymbol).filter(Boolean),
    [symbols]
  );
  const liveQuotes = useSymbolQuotesWs(rawSymbols);

  return { symbols, liveQuotes, loading };
}

export function buildAssetHeroWidget(symbolRow, liveQuotes) {
  if (!symbolRow) return null;

  const quote = getRowLiveQuote(liveQuotes, symbolRow);
  if (!quote) return null;

  const sellNum = quote.sellNum;
  const buyNum = quote.buyNum;
  const dayLow = quote.dayLow;
  const dayHigh = quote.dayHigh;
  const digits = symbolRow.digits;

  let longPercent = 50;
  let shortPercent = 50;

  if (
    sellNum != null &&
    buyNum != null &&
    dayLow != null &&
    dayHigh != null &&
    dayHigh > dayLow
  ) {
    const mid = (sellNum + buyNum) / 2;
    const buyers = ((mid - dayLow) / (dayHigh - dayLow)) * 100;
    longPercent = Math.min(99, Math.max(1, Math.round(buyers)));
    shortPercent = 100 - longPercent;
  }

  const mid = sellNum != null && buyNum != null ? (sellNum + buyNum) / 2 : null;
  const ref = quote?.prevClose ?? quote?.dayOpen;
  let dailyChange = "—";
  let dailyChangePositive = true;

  if (mid != null && ref != null && ref > 0) {
    const pct = ((mid - ref) / ref) * 100;
    dailyChangePositive = pct >= 0;
    dailyChange = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
  }

  const spread = quote?.spread ?? "—";
  const spreadDisplay =
    spread && spread !== "—" ? `${spread} pts` : undefined;

  return {
    symbol: symbolRow.symbol,
    sellPrice: quote?.sell ?? "—",
    buyPrice: quote?.buy ?? "—",
    spread,
    spreadDisplay,
    dailyChange,
    dailyChangePositive,
    dayHigh: dayHigh != null ? formatQuotePrice(dayHigh, digits) : "—",
    dayLow: dayLow != null ? formatQuotePrice(dayLow, digits) : "—",
    longPercent,
    shortPercent,
  };
}

export function useMarketsInstrumentsData() {
  const [symbolsByKey, setSymbolsByKey] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const entries = await Promise.all(
          Object.entries(INSTRUMENT_API_TYPES).map(async ([key, type]) => {
            try {
              const symbols = await loadSymbolsForType(type, 3);
              return [key, symbols];
            } catch {
              return [key, []];
            }
          })
        );
        if (!cancelled) {
          setSymbolsByKey(Object.fromEntries(entries));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allRawSymbols = useMemo(
    () =>
      Object.values(symbolsByKey)
        .flat()
        .map((row) => row.rawSymbol)
        .filter(Boolean),
    [symbolsByKey]
  );

  const liveQuotes = useSymbolQuotesWs(allRawSymbols);

  return { symbolsByKey, liveQuotes, loading };
}

export function buildInstrumentWidget(symbolRow, liveQuotes) {
  if (!symbolRow) return null;

  const quote = getRowLiveQuote(liveQuotes, symbolRow);
  const sellNum = quote?.sellNum;
  const buyNum = quote?.buyNum;
  const dayLow = quote?.dayLow;
  const dayHigh = quote?.dayHigh;

  let buyersPercent = "50.00";
  let sellersPercent = "50.00";

  if (
    sellNum != null &&
    buyNum != null &&
    dayLow != null &&
    dayHigh != null &&
    dayHigh > dayLow
  ) {
    const mid = (sellNum + buyNum) / 2;
    const buyers = ((mid - dayLow) / (dayHigh - dayLow)) * 100;
    buyersPercent = Math.min(99, Math.max(1, buyers)).toFixed(2);
    sellersPercent = (100 - Number(buyersPercent)).toFixed(2);
  }

  return {
    symbol: symbolRow.symbol,
    name: symbolRow.name,
    live: Boolean(quote),
    sellPrice: quote?.sell ?? "—",
    buyPrice: quote?.buy ?? "—",
    spread: quote?.spread ?? "—",
    /** where the mid price sits in today's low–high range, 0–100 (null until both are known) */
    rangePercent:
      sellNum != null && buyNum != null && dayLow != null && dayHigh != null && dayHigh > dayLow
        ? Math.min(100, Math.max(0, (((sellNum + buyNum) / 2 - dayLow) / (dayHigh - dayLow)) * 100))
        : null,
    lotSize: symbolRow.lotSize ?? "0.01",
    low: dayLow != null ? formatQuotePrice(dayLow, symbolRow.digits) : "—",
    high: dayHigh != null ? formatQuotePrice(dayHigh, symbolRow.digits) : "—",
    sellersPercent,
    buyersPercent,
    positive: sellNum != null && buyNum != null ? buyNum >= sellNum : true,
  };
}
