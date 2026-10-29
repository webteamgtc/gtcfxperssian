import { NextResponse } from "next/server";
import { fetchKlineChart } from "@/lib/symbols/gtcTraderSymbolsApi";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const date = Number(searchParams.get("date") || 1440);
  const count = Number(searchParams.get("count") || 100);

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const data = await fetchKlineChart({ symbol, date, count });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
