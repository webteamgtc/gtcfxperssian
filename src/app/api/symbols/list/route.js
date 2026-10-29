import { NextResponse } from "next/server";
import { fetchSymbolsByType } from "@/lib/symbols/gtcTraderSymbolsApi";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 15);

  if (!type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  try {
    const data = await fetchSymbolsByType({ type, page, pageSize });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch symbols" },
      { status: 500 }
    );
  }
}
