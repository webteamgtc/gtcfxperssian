import { NextResponse } from "next/server";

const GTC_GET_COUNTRY_URL = `${process.env.GTC_PORTAL_API || "https://web.mygtc.app/api/pub"}/get_country`;

export async function POST() {
  try {
    const response = await fetch(GTC_GET_COUNTRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { code: 500, message: "Failed to reach GTC API", data: [] },
      { status: 500 }
    );
  }
}
