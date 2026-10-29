import { NextResponse } from "next/server";

/**
 * Copy-trading leaderboard proxy (ratings.gtccopy.com, widget 7).
 *   GET /api/copy-trading/ratings?top=12&skip=0&orderby=rank%20asc
 * Returns { count, items } with each trader slimmed to the fields the page uses and the equity curve
 * downsampled — the raw feed is ~12 KB per trader. Cached for 10 minutes (the upstream is slow: ~1 s per trader on a cold request).
 */
const LEADER_URL = (process.env.LEADER_URL || process.env.NEXT_PUBLIC_LEADER_URL || "https://ratings.gtccopy.com/api/").replace(/\/?$/, "/");
const WIDGET = "7";
const WIDGET_KEY = "social_platform_ratings";
const ORDER_BY = new Set(["rank asc", "totalProfit desc", "maxProfit desc", "maxDrawdown asc", "sharpeRatio desc"]);
const TREND_POINTS = 40;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/** Keep at most `n` evenly spaced equity points (always including the last one). */
function trend(entries) {
  if (!Array.isArray(entries) || !entries.length) return [];
  const vals = entries.map((e) => Number(e?.eb)).filter(Number.isFinite);
  if (vals.length <= TREND_POINTS) return vals;
  const step = (vals.length - 1) / (TREND_POINTS - 1);
  return Array.from({ length: TREND_POINTS }, (_, i) => vals[Math.round(i * step)]);
}

/** Latest positive equity-balance in the history (AUM), else account equity / balance. */
function aum(item) {
  const entries = item?.history?.entries;
  if (Array.isArray(entries)) {
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const eb = Number(entries[i]?.eb);
      if (Number.isFinite(eb) && eb > 0) return eb;
    }
  }
  return num(item?.account?.equity) || num(item?.account?.balance);
}

function slim(item) {
  return {
    profileId: item?.profileId ?? null,
    accountId: item?.accountId ?? null,
    rank: num(item?.rank),
    name: item?.accountName || item?.public?.alternativeName || "—",
    avatar: item?.public?.avatarPath || "",
    country: item?.account?.country || "",
    countryCode: String(item?.account?.countryCode || "").toLowerCase(),
    currency: item?.account?.currency || "",
    leverage: num(item?.account?.leverage),
    pnl: num(item?.totalProfit),
    roi: num(item?.maxProfit),
    mdd: num(item?.maxDrawdown),
    sharpe: num(item?.sharpeRatio),
    aum: aum(item),
    trend: trend(item?.history?.entries),
  };
}

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const top = Math.min(100, Math.max(1, parseInt(sp.get("top") || "12", 10) || 12));
  const skip = Math.max(0, parseInt(sp.get("skip") || "0", 10) || 0);
  const orderby = ORDER_BY.has(sp.get("orderby")) ? sp.get("orderby") : "rank asc";

  const qs = new URLSearchParams({ $top: String(top), $skip: String(skip), $count: "true", $orderby: orderby, widget_key: WIDGET_KEY });
  try {
    const res = await fetch(`${LEADER_URL}rating/${WIDGET}?${qs}`, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`ratings ${res.status}`);
    const data = await res.json();
    return NextResponse.json(
      { count: num(data?.count) ?? 0, items: (data?.items || []).map(slim) },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } }
    );
  } catch (error) {
    console.error("[copy-trading/ratings]", error?.message);
    return NextResponse.json({ count: 0, items: [], error: "Failed to load ratings" }, { status: 502 });
  }
}
