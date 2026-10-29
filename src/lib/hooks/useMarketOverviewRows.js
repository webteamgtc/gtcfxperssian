"use client";

import { useMemo } from "react";
import { useLeverageData } from "@/app/[locale]/company/dynamic-leverage/hooks/useLeverageData";
import { useLocale } from "@/app/[locale]/LocaleProvider";
import { resolveMarketOverviewRows } from "../marketOverviewData";
import { mergeOverviewRowsWithLeverage } from "../utils/marketOverviewLeverage";

export function useMarketOverviewRows(overview) {
  const locale = useLocale();
  const { data, loading } = useLeverageData(locale);

  const rows = useMemo(() => {
    const baseRows = resolveMarketOverviewRows(overview?.rows);
    return mergeOverviewRowsWithLeverage(baseRows, data);
  }, [overview?.rows, data]);

  return { rows, leverageLoading: loading, hasLiveLeverage: Boolean(data) };
}
