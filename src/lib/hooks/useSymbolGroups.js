"use client";

import { useEffect, useState } from "react";
import { getSymbolTypeName, loadSymbols, loadSymbolTypes } from "@/lib/symbols/symbolsClient";

/** Symbol list item → `{ s, n, d, label }` row used by `useLiveRows` (src/components/shared/ticker.jsx). */
export function toTickerItem(item) {
  const s = String(item?.symbol ?? "").trim();
  const digits = Number(item?.digits);
  const name = String(item?.description || s)
    .replace(/\s*24_7\s*$/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    s,
    n: name,
    d: Number.isFinite(digits) ? digits : 2,
    label: s.replace(/_24_7$/, " 24/7"),
  };
}

/**
 * Categories from the symbols API, each with its first `perType` symbols.
 * Categories that return no symbols are dropped.
 * Returns { groups: [{ key, type, items: [{ s, n, d, label }] }], loading, error }.
 * `items` arrays keep a stable reference, so they can be passed straight to `useLiveRows`.
 */
export function useSymbolGroups(perType = 4) {
  const [state, setState] = useState({ groups: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const types = await loadSymbolTypes();
        const results = await Promise.allSettled(
          types.map(async (item) => {
            const type = getSymbolTypeName(item);
            if (!type) return null;
            const { list } = await loadSymbols(type, { pageSize: perType });
            const items = list.map(toTickerItem).filter((x) => x.s).slice(0, perType);
            return items.length ? { key: String(item.id ?? type), type, items } : null;
          })
        );
        const groups = results.map((r) => (r.status === "fulfilled" ? r.value : null)).filter(Boolean);
        if (!cancelled) setState({ groups, loading: false, error: null });
      } catch (error) {
        if (!cancelled) setState({ groups: [], loading: false, error });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [perType]);

  return state;
}
