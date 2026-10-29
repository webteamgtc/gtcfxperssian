import { NextResponse } from "next/server";

const GTC_GET_CODE_URL = `${process.env.GTC_PORTAL_API || "https://web.mygtc.app/api/pub"}/get_code`;

export async function POST(req) {
  try {
    const body = await req.json();
    const response = await fetch(GTC_GET_CODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ code: 500, message: "Failed to reach GTC API", data: [] }, { status: 500 });
  }
}
