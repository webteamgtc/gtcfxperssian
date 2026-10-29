"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mapSymbolToQuoteRow } from "@/lib/symbols/gtcTraderSymbolsApi";
import { formatQuotePrice } from "@/lib/symbols/gtcTraderQuotesWs";
import { marketCategoryFromApiType } from "../symbolDetailConfig";
import { getRowLiveQuote, useSymbolQuotesWs } from "./useSymbolQuotesWs";

const TICKER_PAGE_SIZE = 12;

function getTypeName(item) {
  return item?.title_name || item?.title || "";
}

async function loadTypes() {
  const res = await fetch("/api/symbols/types");
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to load types");
  return Array.isArray(json.data) ? json.data : [];
}

async function loadSymbolsForType(type, pageSize = TICKER_PAGE_SIZE) {
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

function inferIconType(rawSymbol = "") {
  const symbol = String(rawSymbol).toUpperCase();
  if (symbol.includes("XAU") || symbol.includes("GOLD")) return "gold";
  if (symbol.includes("XAG") || symbol.includes("SILVER")) return "silver";
  if (symbol.includes("OIL") || symbol === "USOIL" || symbol === "UKOIL" || symbol.includes("WTI")) {
    return "oil";
  }
  if (/^[A-Z]{6}$/.test(symbol)) return "fx";
  return "us-flag";
}

export function buildTickerItemFromRow(row, liveQuotes) {
  const quote = getRowLiveQuote(liveQuotes, row);
  const sellNum = quote?.sellNum;
  const buyNum = quote?.buyNum;
  const mid =
    sellNum != null && buyNum != null
      ? (sellNum + buyNum) / 2
      : sellNum ?? buyNum ?? null;

  const prevClose = quote?.prevClose;
  const isUp =
    mid != null && prevClose != null
      ? mid >= prevClose
      : buyNum != null && sellNum != null
        ? buyNum >= sellNum
        : true;

  return {
    key: row.id ?? row.rawSymbol,
    name: row.symbol || row.name,
    rawSymbol: row.rawSymbol,
    price: mid != null ? formatQuotePrice(mid, row.digits) : "—",
    sell: quote?.sell ?? "—",
    buy: quote?.buy ?? "—",
    isUp,
    icon: inferIconType(row.rawSymbol),
    iconUrl: row.iconUrl,
  };
}

export function useHomeMarketTickerData(pageSize = TICKER_PAGE_SIZE) {
  const [tabs, setTabs] = useState([]);
  const [activeType, setActiveType] = useState("");
  const [rows, setRows] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSymbols, setLoadingSymbols] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initTabs() {
      setLoadingTypes(true);
      try {
        const allTypes = await loadTypes();
        const nextTabs = allTypes
          .map((item) => {
            const type = getTypeName(item);
            if (!type) return null;
            return {
              key: String(item.id ?? type),
              label: type,
              type,
            };
          })
          .filter(Boolean);

        if (!cancelled) {
          setTabs(nextTabs);
          setActiveType(nextTabs[0]?.type ?? "");
        }
      } catch {
        if (!cancelled) {
          setTabs([]);
          setActiveType("");
        }
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    }

    initTabs();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeType) {
      setRows([]);
      setLoadingSymbols(false);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoadingSymbols(true);
      try {
        const list = await loadSymbolsForType(activeType, pageSize);
        if (!cancelled) setRows(list);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoadingSymbols(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeType, pageSize]);

  const symbolList = useMemo(() => rows.map((row) => row.rawSymbol).filter(Boolean), [rows]);
  const liveQuotes = useSymbolQuotesWs(symbolList);

  const items = useMemo(
    () =>
      rows.map((row) => ({
        ...buildTickerItemFromRow(row, liveQuotes),
        category: marketCategoryFromApiType(activeType),
      })),
    [rows, liveQuotes, activeType]
  );

  const setActiveTypeSafe = useCallback((type) => {
    setActiveType(type);
  }, []);

  return {
    tabs,
    activeType,
    setActiveType: setActiveTypeSafe,
    items,
    loading: loadingTypes || loadingSymbols,
    loadingTypes,
  };
}
