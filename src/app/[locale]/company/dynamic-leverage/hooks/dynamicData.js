"use client";

import { useEffect, useMemo, useState } from "react";
import { langOf } from '@/i18n/locales';

/** Same-origin proxy (src/app/api/leverage/route.js) for the S3 leverage JSON. */
const LEVERAGE_API = "/api/leverage";

const DATA_COLUMNS = ["Column2", "Column3", "Column4", "Column5", "Column6"];

export const TAB_I18N_KEYS = {
  Forex: "forex",
  Metals: "metals",
  Energies: "energies",
  "Cash Index": "cashIndex",
  "Future Index": "futureIndex",
};

export function countCategoryRows(sections) {
  if (!Array.isArray(sections)) return 0;

  return sections.reduce((sum, section) => {
    const rowCount = section?.data?.length ?? 0;
    return sum + Math.max(0, rowCount - 1);
  }, 0);
}

export function filterCategorySections(sections, query) {
  if (!Array.isArray(sections)) return [];
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return sections;

  return sections
    .map((section) => {
      if (section.title?.toLowerCase().includes(trimmed)) {
        return section;
      }

      const header = section.data?.[0];
      if (!header) return null;

      const bodyRows = section.data.slice(1).filter((row) =>
        DATA_COLUMNS.some((column) =>
          String(row[column] ?? "")
            .toLowerCase()
            .includes(trimmed)
        )
      );

      if (!bodyRows.length) return null;

      return {
        ...section,
        data: [header, ...bodyRows],
      };
    })
    .filter(Boolean);
}

async function fetchLeverageJson(locale) {
  const response = await fetch(
    `${LEVERAGE_API}?locale=${encodeURIComponent(langOf(locale))}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load leverage data for ${locale}`);
  }

  return response.json();
}

export function useLeverageData(locale) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const localesToTry = [...new Set([locale, "en"])];

      for (const currentLocale of localesToTry) {
        try {
          const json = await fetchLeverageJson(currentLocale);
          if (!cancelled) {
            setData(json);
            setLoading(false);
          }
          return;
        } catch (loadError) {
          if (currentLocale === localesToTry[localesToTry.length - 1] && !cancelled) {
            setError(loadError);
            setData(null);
            setLoading(false);
          }
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const categories = useMemo(() => {
    if (!data) return [];
    return Object.keys(data);
  }, [data]);

  return { data, categories, loading, error };
}
