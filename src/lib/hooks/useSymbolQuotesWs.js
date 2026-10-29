"use client";

import { useEffect, useMemo, useState } from "react";
import {
  mapWsTickToQuote,
  quotesWsManager,
} from "@/lib/symbols/gtcTraderQuotesWs";

/**
 * Subscribe to live bid/ask via GTC Trader WebSocket.
 * Returns a map keyed by raw symbol (e.g. EURUSD, XAUUSD).
 */
export function useSymbolQuotesWs(symbols = []) {
  const [quotes, setQuotes] = useState({});

  const symbolKey = useMemo(
    () =>
      symbols
        .map((s) => String(s).replace(/\//g, ""))
        .filter(Boolean)
        .sort()
        .join(","),
    [symbols]
  );

  useEffect(() => {
    const symbolList = symbolKey ? symbolKey.split(",") : [];
    if (!symbolList.length) {
      setQuotes({});
      return undefined;
    }

    // subscribe() registers this listener's symbols, (re)syncs the socket subscription and returns the cleanup
    return quotesWsManager.subscribe(symbolList, setQuotes);
  }, [symbolKey]);

  return quotes;
}

/** Merge row digits into WS quote for correct decimal formatting. */
export function getRowLiveQuote(quotes, row) {
  const raw = row?.rawSymbol;
  if (!raw) return null;

  const tick = quotes[raw];
  if (!tick) return null;

  if (tick.sellNum != null && tick.buyNum != null && Number.isFinite(Number(row?.digits))) {
    return mapWsTickToQuote(
      { symbol: raw, ask: tick.buyNum, bid: tick.sellNum, timestamp: tick.timestamp },
      Number(row.digits)
    );
  }

  return tick;
}
