import { NextResponse } from "next/server";
import { fetchSymbolTypes } from "@/lib/symbols/gtcTraderSymbolsApi";

export async function GET() {
  try {
    const data = await fetchSymbolTypes();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch symbol types" },
      { status: 500 }
    );
  }
}
