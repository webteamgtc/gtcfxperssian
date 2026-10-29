import { NextResponse } from "next/server";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function getSalesforceToken() {
  const loginUrl = requireEnv("SALESFORCE_LOGIN_URL") || "";
  const clientId = requireEnv("SALESFORCE_CLIENT_ID");
  const clientSecret = requireEnv("SALESFORCE_CLIENT_SECRET");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    // keep it server-side; no caching
    cache: "no-store",
  });
  

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `Token failed: status=${res.status} message=${data?.error_description ?? data?.error ?? "unknown"}`
    );
  }

  if (!data?.access_token) throw new Error("Token failed: missing access_token");
  return data.access_token;
}

async function callContactUsApi(accessToken, payload) {
  const instanceUrl = requireEnv("SALESFORCE_LOGIN_URL");
  const res = await fetch(`${instanceUrl}/services/apexrest/contactus/v1`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  // Salesforce may return 200 with {status:"error"} OR non-2xx; handle both
  if (!res.ok) {
    return { ok: false, status: res.status, data };
  }
  if (data?.status === "error") {
    return { ok: false, status: 400, data };
  }

  return { ok: true, status: 200, data };
}

export async function POST(req) {
  try {
    // We accept multipart/form-data to support file uploads
    const contentType = req.headers.get("content-type") || "";

    let payload;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      // Expect JSON payload in "data"
      const raw = form.get("data");
      if (!raw || typeof raw !== "string") {
        return NextResponse.json(
          { status: "error", message: 'Missing "data" (JSON) field in form-data.' },
          { status: 400 }
        );
      }

      const parsed = JSON.parse(raw);

      // Build files array from uploaded file fields (field name: "files")
      const fileEntries = form.getAll("files");
      const files = [];

      for (const entry of fileEntries) {
        if (entry instanceof File) {
          const arrayBuffer = await entry.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString("base64");

          files.push({
            fileName: entry.name,
            contentType: entry.type || "application/octet-stream",
            base64Data,
          });
        }
      }

      payload = {
        ...parsed,
        additionalFields: parsed.additionalFields ?? {},
        files,
      };
    } else {
      // Also allow JSON-only requests (no attachments)
      const parsed = await req.json();
      payload = {
        ...parsed,
        additionalFields: parsed.additionalFields ?? {},
        files: parsed.files ?? [],
      };
    }

    // Basic server validation (minimal)
    const required = [
      "email",
      "firstName",
      "lastName",
      "phone",
      "country",
      "ticketType",
      "subject",
      "description",
      "registeredClient",
    ];

    for (const key of required) {
      if (!payload[key]) {
        return NextResponse.json(
          { status: "error", message: `Missing required field: ${key}` },
          { status: 400 }
        );
      }
    }

    const token = await getSalesforceToken();
    console.log("token", token);
    const result = await callContactUsApi(token, payload);
    console.log("result", result);
    if (!result.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: result.data?.message ?? "Salesforce request failed",
          salesforce: result.data,
        },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
