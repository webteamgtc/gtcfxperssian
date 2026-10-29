"use client";

import { useCallback, useEffect, useState } from "react";
import { mapSymbolToQuoteRow } from "@/lib/symbols/gtcTraderSymbolsApi";

/** Which API type names to show per market page slug. */
export const PAGE_TYPES = {
  forex: ["FX Minors"],
  energy: ["Energy"],
  metals: ["Metals"],
  indices: ["Index"],
  shares: ["Stock"],
  commodities: ["Energy", "Metals"],
  "future-cfds": ["Future"],
};

function getTypeName(item) {
  return item?.title_name || item?.title || "";
}

async function loadTypes() {
  const res = await fetch("/api/symbols/types");
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to load types");
  return Array.isArray(json.data) ? json.data : [];
}

async function loadSymbols(type, page = 1, pageSize = 15) {
  const params = new URLSearchParams({
    type,
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/symbols/list?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to load symbols");
  return {
    list: Array.isArray(json.data?.list) ? json.data.list : [],
    total: Number(json.data?.total) || 0,
  };
}

export function useMarketLiveQuotes(slug, pageSize = 15) {
  const [tabs, setTabs] = useState([]);
  const [activeType, setActiveType] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initTabs() {
      setLoading(true);
      try {
        const allTypes = await loadTypes();
        const allowed = PAGE_TYPES[slug];
        const filtered = allowed?.length
          ? allTypes.filter((item) => allowed.includes(getTypeName(item)))
          : allTypes;

        const nextTabs = filtered.map((item) => ({
          key: String(item.id),
          label: getTypeName(item),
          type: getTypeName(item),
        }));

        if (!cancelled) {
          setTabs(nextTabs);
          setActiveType(nextTabs[0]?.type ?? "");
        }
      } catch {
        if (!cancelled) {
          setTabs([]);
          setActiveType("");
          setRows([]);
          setTotal(0);
          setLoading(false);
        }
      }
    }

    initTabs();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!activeType) {
      setRows([]);
      setTotal(0);
      setPage(1);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setPage(1);
      try {
        const { list, total: nextTotal } = await loadSymbols(activeType, 1, pageSize);
        if (!cancelled) {
          setRows(list.map(mapSymbolToQuoteRow));
          setTotal(nextTotal);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeType, pageSize]);

  const hasMore = rows.length < total;

  const loadMore = useCallback(async () => {
    if (!activeType || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const { list, total: nextTotal } = await loadSymbols(activeType, nextPage, pageSize);
      setRows((current) => [...current, ...list.map(mapSymbolToQuoteRow)]);
      setTotal(nextTotal);
      setPage(nextPage);
    } catch {
      // keep existing rows on error
    } finally {
      setLoadingMore(false);
    }
  }, [activeType, hasMore, loadingMore, page, pageSize]);

  return {
    tabs,
    activeType,
    setActiveType,
    rows,
    loading,
    loadingMore,
    hasMore,
    loadMore,
  };
}
