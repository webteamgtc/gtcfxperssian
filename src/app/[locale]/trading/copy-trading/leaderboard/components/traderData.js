'use client';
/**
 * Trader-detail data: fetch hook for /api/copy-trading/trader, history filtering and range metrics.
 */
import { useEffect, useState } from 'react';

/** Fetch one part of a trader (`profile` by profileId; `monthly` | `instruments` | `trading` | `positions` by accountId). */
export function useTraderPart(part, id, { skip = 0, enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!enabled || id == null || id === '') return;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    const qs = new URLSearchParams({ part, id: String(id), skip: String(skip) });
    fetch(`/api/copy-trading/trader?${qs}`)
      .then(async (r) => {
        if (!r.ok) throw Object.assign(new Error(String(r.status)), { status: r.status });
        return r.json();
      })
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }));
    return () => {
      alive = false;
    };
  }, [part, id, skip, enabled]);

  return state;
}

const toDate = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

export const RANGES = ['7D', '30D', '90D', 'ALL'];
const DAYS = { '7D': 7, '30D': 30, '90D': 90 };

/** History entries inside the selected range (counted back from the last entry). */
export function filterEntries(entries, range) {
  if (!Array.isArray(entries) || !entries.length || !DAYS[range]) return entries ?? [];
  const last = toDate(entries[entries.length - 1]?.tp);
  if (!last) return entries;
  const cutoff = new Date(last);
  cutoff.setDate(cutoff.getDate() - DAYS[range]);
  return entries.filter((e) => {
    const d = toDate(e?.tp);
    return d ? d >= cutoff : false;
  });
}

/** ROI change and summed PnL over a range, plus chart points for ROI (rebased to 0) or cumulative PnL. */
export function rangeSeries(entries, mode) {
  if (!Array.isArray(entries) || entries.length < 2) return { roi: null, pnl: null, points: [] };
  const first = Number(entries[0]?.rt);
  const last = Number(entries[entries.length - 1]?.rt);
  let cum = 0;
  const points = [];
  for (const e of entries) {
    const x = toDate(e?.tp)?.getTime();
    const rp = Number(e?.rp);
    if (Number.isFinite(rp)) cum += rp;
    if (!Number.isFinite(x)) continue;
    const y = mode === 'roi' ? Number(e?.rt) - first : cum;
    if (Number.isFinite(y)) points.push({ x, y });
  }
  return { roi: Number.isFinite(first) && Number.isFinite(last) ? last - first : null, pnl: cum, points };
}
