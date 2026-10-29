"use client";

import { useEffect, useState } from "react";
import { normalizePlatformGuideLocale } from "@/lib/platform-guide/locales";

export function usePlatformGuideVideosHook(guideLocale, enabled = true) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    playlistId: null,
    playlistTitle: null,
    playlistEmbedUrl: null,
    requestedLocale: null,
    resolvedLocale: null,
    fallbackUsed: false,
  });

  useEffect(() => {
    if (!enabled) {
      setVideos([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();

    async function fetchVideos() {
      try {
        setLoading(true);
        setError(null);
        setVideos([]);

        const normalizedLocale = normalizePlatformGuideLocale(guideLocale);
        const searchParams = new URLSearchParams({ locale: normalizedLocale });

        const response = await fetch(
          `/api/platform-guide/youtube?${searchParams.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(result.message || "Failed to load tutorial videos.");
        }

        setVideos(Array.isArray(result?.data?.videos) ? result.data.videos : []);
        setMeta({
          playlistId: result.playlistId || null,
          playlistTitle: result.playlistTitle || null,
          playlistEmbedUrl: result.playlistEmbedUrl || null,
          requestedLocale: result.requestedLocale || normalizedLocale,
          resolvedLocale: result.resolvedLocale || normalizedLocale,
          fallbackUsed: Boolean(result.fallbackUsed),
        });
      } catch (requestError) {
        if (requestError?.name === "AbortError") return;

        setVideos([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load tutorial videos."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchVideos();

    return () => controller.abort();
  }, [guideLocale, enabled]);

  return { videos, loading, error, meta };
}
