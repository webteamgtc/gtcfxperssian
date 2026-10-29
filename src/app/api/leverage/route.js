import { NextResponse } from "next/server";

/**
 * Server-side proxy for the dynamic leverage schedule.
 * The browser calls /api/leverage?locale=xx (same origin) and the server fetches the S3 JSON,
 * so client networks that block or reset S3 connections still get the data.
 */
const LEVERAGE_DATA_BASE =
  "https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/leverage";

/** Only plain locale codes ("en", "zh-TW") may be used in the S3 path. */
const LOCALE_RE = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/;

async function fetchLocale(locale) {
  const response = await fetch(`${LEVERAGE_DATA_BASE}/${locale}.json`, {
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Leverage data ${locale}: ${response.status}`);
  return response.json();
}

export async function GET(request) {
  const requested = new URL(request.url).searchParams.get("locale") || "en";
  const locale = LOCALE_RE.test(requested) ? requested : "en";

  for (const current of [...new Set([locale, "en"])]) {
    try {
      const data = await fetchLocale(current);
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    } catch {
      // try the next locale
    }
  }

  return NextResponse.json(
    { error: "Failed to load leverage data" },
    { status: 502 }
  );
}
