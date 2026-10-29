"use client";

import { useEffect, useMemo, useState } from "react";
import { loadKline } from "@/lib/symbols/symbolsClient";

/**
 * OHLC candles for `symbol` from /api/symbols/chart.
 * Pass `livePrice` (e.g. the current bid) to keep the last candle moving with the feed.
 * Returns { candles: [{ t, o, h, l, c }], loading }.
 */
export function useKlineCandles(symbol, { date = 60, count = 48, livePrice = null } = {}) {
  const [state, setState] = useState({ key: "", candles: [], loading: false });
  const key = symbol ? `${symbol}:${date}:${count}` : "";

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;

    setState((prev) => ({ key, candles: prev.key === key ? prev.candles : [], loading: true }));
    loadKline(symbol, { date, count })
      .then((candles) => !cancelled && setState({ key, candles, loading: false }))
      .catch(() => !cancelled && setState({ key, candles: [], loading: false }));

    return () => {
      cancelled = true;
    };
  }, [key, symbol, date, count]);

  const base = state.key === key ? state.candles : [];

  const candles = useMemo(() => {
    if (!base.length || !Number.isFinite(livePrice)) return base;
    const last = base[base.length - 1];
    const merged = { ...last, c: livePrice, h: Math.max(last.h, livePrice), l: Math.min(last.l, livePrice) };
    return [...base.slice(0, -1), merged];
  }, [base, livePrice]);

  return { candles, loading: Boolean(key) && (state.key !== key || state.loading) };
}
