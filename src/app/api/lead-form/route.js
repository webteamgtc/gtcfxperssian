import { NextResponse } from "next/server";

/**
 * POST lead → Salesforce Apex `leadform/v1` (CommonLeadForm). env: SALESFORCE_LOGIN_URL, SALESFORCE_CLIENT_ID,
 * SALESFORCE_CLIENT_SECRET (+ optional SALESFORCE_TOKEN_URL, SALESFORCE_INSTANCE_URL, SALESFORCE_LEADFORM_APEX_PATH).
 */

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function asBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value !== 0;
  return Boolean(value);
}

function getFirstDefined(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null && `${v}`.trim() !== "") return v;
  }
  return undefined;
}

/**
 * Apex `LeadFormRequest` JSON keys (exact names — no case-variant duplicates).
 *
 * Confirmed working:
 * - first_name, last_name, Email, Phone, Country
 *
 * Terms: `terms_and_conditions` did NOT bind. Send distinct keys that
 * Apex case-insensitive matching will not treat as duplicates of each other.
 * Unknown properties are ignored by Apex JSON.deserialize.
 */
function normalizeLeadPayload(raw) {
  const firstName = getFirstDefined(
    raw.firstName,
    raw.first_name,
    raw.firstname,
    raw.FirstName
  );
  const lastName = getFirstDefined(
    raw.lastName,
    raw.last_name,
    raw.lastname,
    raw.LastName
  );
  const email = getFirstDefined(raw.email, raw.Email);
  const phone = getFirstDefined(
    raw.phone,
    raw.Phone,
    raw.mobile,
    raw.mobilePhone,
    raw.MobilePhone
  );
  const country = getFirstDefined(
    raw.country,
    raw.Country,
    raw.countryCode
  );
  const acceptedTerms = asBoolean(
    getFirstDefined(
      raw.terms,
      raw.termsAccepted,
      raw.TermsAccepted,
      raw.terms_and_conditions,
      raw.termsAndConditions,
      raw.TermsAndConditions,
      raw.acceptTerms,
      raw.optinEmail,
      raw.OptinEmail
    )
  );

  const offer = getFirstDefined(raw.offer, raw.Offer);
  const locale = getFirstDefined(raw.locale, raw.Locale);
  const fbclid = getFirstDefined(raw.fbclid, raw.Fbclid);
  const utmCampaign = getFirstDefined(
    raw.utm_campaign,
    raw.utmCampaign,
    raw.UtmCampaign
  );
  const utmSource = getFirstDefined(
    raw.utm_source,
    raw.utmSource,
    raw.UtmSource
  );

  const payload = {
    first_name: firstName,
    last_name: lastName,
    Email: email,
    Phone: phone,
    Country: country,
    // Terms — try common Apex property names (no case duplicates).
    // Boolean + string forms cover Boolean and String Apex fields.
    // Snake_case mirrors first_name / last_name which already bind.
    terms: acceptedTerms,
    termsAccepted: acceptedTerms,
    accept_terms: acceptedTerms,
    acceptTerms: acceptedTerms,
    acceptedTerms: acceptedTerms,
    optinEmail: acceptedTerms,
    agreeToTerms: acceptedTerms,
    agree_to_terms: acceptedTerms,
    tcAccepted: acceptedTerms,
    termsAcceptedFlag: acceptedTerms ? "true" : "false",
    termsAcceptedValue: acceptedTerms ? "Yes" : "No",
  };

  if (offer != null && `${offer}`.trim() !== "") payload.offer = offer;
  if (locale != null && `${locale}`.trim() !== "") payload.locale = locale;
  if (fbclid != null && `${fbclid}`.trim() !== "") payload.fbclid = fbclid;
  if (utmCampaign != null && `${utmCampaign}`.trim() !== "") {
    payload.utm_campaign = utmCampaign;
  }
  if (utmSource != null && `${utmSource}`.trim() !== "") {
    payload.utm_source = utmSource;
  }

  return payload;
}

async function getSalesforceAccess() {
  const loginUrl = requireEnv("SALESFORCE_LOGIN_URL").replace(/\/$/, "");
  const clientId = requireEnv("SALESFORCE_CLIENT_ID");
  const clientSecret = requireEnv("SALESFORCE_CLIENT_SECRET");
  const tokenUrl = process.env.SALESFORCE_TOKEN_URL?.trim()
    ? process.env.SALESFORCE_TOKEN_URL.trim()
    : `${loginUrl}/services/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `Token failed: status=${res.status} message=${data?.error_description ?? data?.error ?? "unknown"}`
    );
  }

  if (!data?.access_token) throw new Error("Token failed: missing access_token");

  const instanceFromEnv = process.env.SALESFORCE_INSTANCE_URL?.replace(/\/$/, "");
  const instanceUrl = (
    instanceFromEnv ||
    data.instance_url ||
    "https://gtcglobaltradecapital3.my.salesforce.com" ||
    loginUrl
  ).replace(/\/$/, "");

  return { accessToken: data.access_token, instanceUrl };
}

async function callLeadFormApex(accessToken, instanceUrl, payload) {
  const apexPath =
    process.env.SALESFORCE_LEADFORM_APEX_PATH ||
    "/services/apexrest/leadform/v1";
  const url = `${instanceUrl}${apexPath.startsWith("/") ? apexPath : `/${apexPath}`}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw };
  }

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
    const input = await req.json();
    const payload = normalizeLeadPayload(input);

    const required = [
      ["first_name", payload.first_name],
      ["last_name", payload.last_name],
      ["Email", payload.Email],
      ["Phone", payload.Phone],
      ["Country", payload.Country],
    ];
    for (const [key, value] of required) {
      if (value == null || value === "") {
        return NextResponse.json(
          { status: "error", message: `Missing required field: ${key}` },
          { status: 400 }
        );
      }
    }
    if (!payload.termsAccepted) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required field: termsAccepted",
        },
        { status: 400 }
      );
    }

    console.info("[lead-form] Salesforce payload keys:", Object.keys(payload));

    const { accessToken, instanceUrl } = await getSalesforceAccess();
    const result = await callLeadFormApex(accessToken, instanceUrl, payload);

    if (!result.ok) {
      console.error("[lead-form] Salesforce error:", result.data);
      return NextResponse.json(
        {
          status: "error",
          message:
            result.data?.message ?? "Salesforce lead form request failed",
        },
        {
          status:
            result.status >= 400 && result.status < 600 ? result.status : 502,
        }
      );
    }

    return NextResponse.json(result.data ?? { status: "success" }, {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: "error",
        message: e?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
