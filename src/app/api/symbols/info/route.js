import { NextResponse } from "next/server";
import { fetchSymbolInfo } from "@/lib/symbols/gtcTraderSymbolsApi";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const data = await fetchSymbolInfo({ symbol });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch symbol info" },
      { status: 500 }
    );
  }
}
