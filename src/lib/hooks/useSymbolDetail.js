"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathTranslation } from "@/app/[locale]/LocaleProvider";
import {
  getRowLiveQuote,
  useSymbolQuotesWs,
} from "../hooks/useSymbolQuotesWs";
import {
  buildSpecsFromInfo,
  getCategoryConfig,
  getDisplaySymbol,
  slugToRawSymbol,
} from "../symbolDetailConfig";
import {
  buildChartStats,
  formatChartPrice,
  formatSpread,
} from "../components/SymbolKlineChart";

function applyParams(template, params) {
  if (!template) return template;
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replaceAll(`{${key}}`, value ?? ""),
    template
  );
}

async function fetchSymbolInfo(symbol) {
  const params = new URLSearchParams({ symbol });
  const res = await fetch(`/api/symbols/info?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to load symbol info");
  return json.data || null;
}

async function fetchDailyCandles(symbol) {
  const params = new URLSearchParams({
    symbol,
    date: "1440",
    count: "2",
  });
  const res = await fetch(`/api/symbols/chart?${params}`);
  const json = await res.json();
  if (!res.ok) return [];
  return Array.isArray(json.data) ? json.data : [];
}

export function useSymbolDetail(category, slug) {
  const t = usePathTranslation("marketsShared.symbolDetail");
  const categoryConfig = useMemo(() => getCategoryConfig(category), [category]);
  const rawSymbol = slugToRawSymbol(slug);

  const [info, setInfo] = useState(null);
  const [dailyCandles, setDailyCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quotes = useSymbolQuotesWs(rawSymbol ? [rawSymbol] : []);

  useEffect(() => {
    if (!rawSymbol) {
      setLoading(false);
      setError("Invalid symbol");
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [nextInfo, candles] = await Promise.all([
          fetchSymbolInfo(rawSymbol),
          fetchDailyCandles(rawSymbol),
        ]);
        if (cancelled) return;
        setInfo(nextInfo);
        setDailyCandles(candles);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load symbol");
          setInfo(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [rawSymbol]);

  const digits = Number.isFinite(Number(info?.digits)) ? Number(info.digits) : 5;

  const liveQuote = useMemo(
    () =>
      getRowLiveQuote(quotes, {
        rawSymbol,
        digits,
      }),
    [quotes, rawSymbol, digits]
  );

  const displaySymbol = getDisplaySymbol(rawSymbol, info);

  const localizedCategoryConfig = useMemo(() => {
    const catKey = category || categoryConfig.slug;
    const badge = t(`categories.${catKey}.badge`, categoryConfig.label);
    const displayLabel = t(
      `categories.${catKey}.displayLabel`,
      categoryConfig.displayLabel
    );
    const tagCount = categoryConfig.tags?.length ?? 0;
    const tags = Array.from({ length: tagCount }, (_, i) =>
      t(`categories.${catKey}.tags.${i}`, categoryConfig.tags[i])
    );
    return { ...categoryConfig, label: badge, displayLabel, tags };
  }, [category, categoryConfig, t]);

  const instrumentDescription = useMemo(() => {
    const fromLocale = t(`instrumentNames.${rawSymbol}`, "");
    if (fromLocale) return fromLocale;
    return info?.description?.trim() || "";
  }, [rawSymbol, info?.description, t]);

  const subtitle =
    instrumentDescription ||
    applyParams(
      t("instrumentFallback", `${categoryConfig.displayLabel} instrument`),
      { category: localizedCategoryConfig.displayLabel }
    );

  const translateSwapDay = useCallback(
    (dayEn) => {
      const key = String(dayEn || "").toLowerCase();
      return t(`swapDays.${key}`, dayEn);
    },
    [t]
  );

  const getSpecLabel = useCallback(
    (key, fallback) => t(`specLabels.${key}`, fallback),
    [t]
  );

  const sellNum = liveQuote?.sellNum ?? null;
  const buyNum = liveQuote?.buyNum ?? null;
  const midNum =
    sellNum != null && buyNum != null
      ? (sellNum + buyNum) / 2
      : sellNum ?? buyNum ?? null;

  const dayStats = useMemo(() => buildChartStats(dailyCandles), [dailyCandles]);

  const changeAbs = dayStats?.change ?? null;
  const changePct = dayStats?.changePct ?? null;
  const changePositive = changeAbs == null ? null : changeAbs >= 0;

  const specs = useMemo(
    () =>
      buildSpecsFromInfo(info || {}, {
        getLabel: getSpecLabel,
        translateSwapDay,
        tradingHoursValue: t("tradingHoursValue", "24/5"),
      }),
    [info, getSpecLabel, translateSwapDay, t]
  );

  const about = useMemo(() => {
    const description =
      instrumentDescription || displaySymbol;
    const group = localizedCategoryConfig.displayLabel;
    const title = applyParams(t("aboutTitle", `About ${displaySymbol}`), {
      symbol: displaySymbol,
    });
    const body = applyParams(
      t(
        "aboutBody",
        `${displaySymbol} (${description}) is available as a CFD instrument in the ${group} market on GTCFX.`
      ),
      { symbol: displaySymbol, description, group }
    );
    return {
      title,
      body,
      tags: localizedCategoryConfig.tags || [],
    };
  }, [
    displaySymbol,
    instrumentDescription,
    localizedCategoryConfig,
    t,
  ]);

  return {
    categoryConfig: localizedCategoryConfig,
    rawSymbol,
    displaySymbol,
    subtitle,
    loading,
    error,
    info,
    liveQuote,
    sellPrice: liveQuote?.sell ?? (sellNum != null ? formatChartPrice(sellNum, digits) : "—"),
    buyPrice: liveQuote?.buy ?? (buyNum != null ? formatChartPrice(buyNum, digits) : "—"),
    midPrice: midNum != null ? formatChartPrice(midNum, digits) : "—",
    sellNum,
    buyNum,
    midNum,
    spread: formatSpread(sellNum, buyNum),
    dayHigh: dayStats?.h != null ? formatChartPrice(dayStats.h, digits) : "—",
    dayLow: dayStats?.l != null ? formatChartPrice(dayStats.l, digits) : "—",
    swapLong: info?.swap_long,
    swapShort: info?.swap_short,
    changeAbs,
    changePct,
    changePositive,
    digits,
    specs,
    about,
  };
}
