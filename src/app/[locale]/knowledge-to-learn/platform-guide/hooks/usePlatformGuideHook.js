"use client";

import { useEffect, useState } from "react";
import { normalizePlatformGuideLocale } from "@/lib/platform-guide/locales";

const EMPTY_DATA = {
  png: [],
  pdf: [],
};

/** Maps UI main-tab keys to API platform identifiers (each uses its own Drive folder). */
const PLATFORM_BY_TAB = {
  gtcgo: "gtcgo",
  gettingStarted: "gettingStarted",
};

function resolvePlatform(mainTab) {
  return PLATFORM_BY_TAB[mainTab] || PLATFORM_BY_TAB.gtcgo;
}

export function usePlatformGuideHook(guideLocale, mainTab = "gtcgo") {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    source: "google-drive",
    platform: "gtcgo",
    requestedLocale: null,
    resolvedLocale: null,
    fallbackUsed: false,
    folderId: null,
    folders: {
      pdf: null,
      png: null,
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPlatformGuides() {
      try {
        setLoading(true);
        setError(null);
        setData(EMPTY_DATA);

        const normalizedLocale = normalizePlatformGuideLocale(guideLocale);

        const platform = resolvePlatform(mainTab);

        const searchParams = new URLSearchParams({
          locale: normalizedLocale,
          platform,
        });

        const response = await fetch(
          `/api/platform-guide?${searchParams.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Failed to load platform guides."
          );
        }

        setData({
          png: Array.isArray(result?.data?.png) ? result.data.png : [],
          pdf: Array.isArray(result?.data?.pdf) ? result.data.pdf : [],
        });

        setMeta({
          source: result.source || "google-drive",
          platform: result.platform || platform,
          requestedLocale: result.requestedLocale || normalizedLocale,
          resolvedLocale: result.resolvedLocale || normalizedLocale,
          fallbackUsed: Boolean(result.fallbackUsed),
          folderId: result.folderId || null,
          folders: result.folders || { pdf: null, png: null },
        });
      } catch (requestError) {
        if (requestError?.name === "AbortError") {
          return;
        }

        setData(EMPTY_DATA);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load platform guides."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPlatformGuides();

    return () => {
      controller.abort();
    };
  }, [guideLocale, mainTab]);

  return {
    data,
    loading,
    error,
    meta,
  };
}
