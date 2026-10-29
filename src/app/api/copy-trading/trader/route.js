import { NextResponse } from "next/server";

/**
 * Copy-trading trader detail proxy (ratings.gtccopy.com).
 *   GET /api/copy-trading/trader?part=profile&id=<profileId>
 *   GET /api/copy-trading/trader?part=monthly|instruments|trading&id=<accountId>
 *   GET /api/copy-trading/trader?part=positions&id=<accountId>&skip=0
 * Only these parts are allowed and ids must be numeric. Cached for 5 minutes.
 */
const LEADER_URL = (process.env.LEADER_URL || process.env.NEXT_PUBLIC_LEADER_URL || "https://ratings.gtccopy.com/api/").replace(/\/?$/, "/");
const WIDGET_KEY = "widget_key=social_platform_ratings";
const POSITIONS_PAGE = 25;

const PARTS = {
  profile: (id) => `rating/7/profile/${id}?${WIDGET_KEY}`,
  monthly: (id) => `history/${id}/monthly?${WIDGET_KEY}`,
  instruments: (id) => `reports/${id}/instruments?${WIDGET_KEY}`,
  trading: (id) => `reports/${id}/trading?${WIDGET_KEY}`,
  positions: (id, skip) => `trading/${id}/positions/public?scope=Any&%24top=${POSITIONS_PAGE}&%24orderby=openTime%20desc&%24count=true&%24skip=${skip}&${WIDGET_KEY}`,
};

/** Profile history → only the fields the charts use. */
function slimProfile(p) {
  if (!p || typeof p !== "object") return p;
  const entries = Array.isArray(p?.history?.entries) ? p.history.entries.map((e) => ({ tp: e?.tp, rt: e?.rt, rp: e?.rp, eb: e?.eb, ee: e?.ee })) : [];
  return { ...p, history: { entries } };
}

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const part = sp.get("part");
  const id = sp.get("id");
  const skip = Math.max(0, parseInt(sp.get("skip") || "0", 10) || 0);

  if (!PARTS[part] || !/^\d{1,12}$/.test(id || "")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const res = await fetch(`${LEADER_URL}${PARTS[part](id, skip)}`, { next: { revalidate: 300 } });
    if (res.status === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!res.ok) throw new Error(`${part} ${res.status}`);
    const data = await res.json();
    return NextResponse.json(part === "profile" ? slimProfile(data) : data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
    });
  } catch (error) {
    console.error("[copy-trading/trader]", error?.message);
    return NextResponse.json({ error: "Failed to load" }, { status: 502 });
  }
}
