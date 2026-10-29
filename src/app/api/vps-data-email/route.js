import { NextResponse } from "next/server";

/**
 * VPS application intake (posted by the VPS Application Form).
 *  1. validates + normalises the application and adds the client IP,
 *  2. forwards it to the Zapier webhook (CRM),
 *  3. e-mails the support team through Mailgun (src/config/nodemailer.js).
 * Succeeds when at least one channel accepts it, so a lead is never lost to a single outage.
 * Env: VPS_ZAPIER_HOOK_URL (Zapier catch hook) and MAILGUN_API_KEY (optionally MAILGUN_USERNAME / MAILGUN_API_URL).
 */
const ZAPIER_HOOK = process.env.VPS_ZAPIER_HOOK_URL?.trim();
const MAIL_TO = "support@gtcfx.com";
const MAIL_CC = "mohammad.zeeshan@gtcfx.com";
const SUBJECT = "VPS Hosting - New Application Submitted";

const PLATFORMS = ["mt4", "mt5"];
const PACKAGES = { bronze: "Bronze — $40.00/month", silver: "Silver — $70.00/month", gold: "Gold — $120.00/month" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);

/** Escape user input before it goes into the e-mail HTML. */
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip") || "").trim();
}

/* ------------------------------------------------------------ e-mail */

const SOCIALS = [
  ["Facebook", "https://www.facebook.com/GTCFXGlobalTradeCapital", "facebook"],
  ["X", "https://x.com/GTC_fx", "twitter"],
  ["LinkedIn", "https://www.linkedin.com/company/gtcfx-official", "linkedin"],
  ["YouTube", "https://www.youtube.com/channel/UCnKWakjm1b9Bm63xgwNFXHA", "youtube"],
  ["Instagram", "https://www.instagram.com/gtcfxofficial/", "instagram"],
  ["TikTok", "https://www.tiktok.com/@gtcgroup_official", "tiktok"],
];

const row = (label, value, last = false) => `
  <tr>
    <td style="padding:12px 16px;width:40%;font-size:13px;color:#6b7194;background:#f6f7fb;${last ? "" : "border-bottom:1px solid #e6e9f2;"}">${label}</td>
    <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#0d153a;${last ? "" : "border-bottom:1px solid #e6e9f2;"}">${value || "—"}</td>
  </tr>`;

function generateEmailContent(d) {
  const name = `${esc(d.first_name)} ${esc(d.last_name)}`.trim();
  const submitted = new Date().toUTCString();
  const applicant = [
    ["First Name", esc(d.first_name)],
    ["Last Name", esc(d.last_name)],
    ["Email", `<a href="mailto:${esc(d.email)}" style="color:#293b93;text-decoration:none;">${esc(d.email)}</a>`],
    ["Phone Number", `<a href="tel:${esc(d.phone)}" style="color:#293b93;text-decoration:none;">${esc(d.phone)}</a>`],
    ["Country", esc(d.country)],
  ];
  const vps = [
    ["Package", esc(PACKAGES[d.package] ?? d.package)],
    ["Platform", esc(d.platform.toUpperCase())],
    ["Account Number", esc(d.account_no)],
  ];
  const tracking = [
    ["IP Address", esc(d.ip)],
    ["UTM Campaign", esc(d.utm_campain)],
    ["UTM Source", esc(d.utm_source)],
    ["Submitted (UTC)", esc(submitted)],
  ];
  const table = (rows) =>
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:separate;border:1px solid #e6e9f2;border-radius:14px;overflow:hidden;">${rows
      .map(([l, v], i) => row(l, v, i === rows.length - 1))
      .join("")}</table>`;
  const heading = (text) => `<h2 style="margin:28px 0 12px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#b68756;">${text}</h2>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background:#eef0f5;font-family:Arial,Helvetica,sans-serif;color:#0d153a;line-height:22px;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="width:100%;background:#eef0f5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(13,21,58,0.12);">
          <!-- header -->
          <tr>
            <td style="background:#0d153a;background-image:linear-gradient(135deg,#293b93,#0d153a);padding:28px 32px;text-align:center;">
              <img src="https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/email-test.png" alt="GTCFX" style="max-width:150px;height:auto;background:#ffffff;border-radius:12px;padding:8px 14px;" />
              <p style="margin:18px 0 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#d2a67a;">VPS Hosting</p>
              <h1 style="margin:6px 0 0;font-size:22px;line-height:30px;color:#ffffff;">New Application Submitted</h1>
            </td>
          </tr>
          <!-- body -->
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0 0 6px;font-size:15px;">Dear <em>Team</em>,</p>
              <p style="margin:0;font-size:15px;color:#3d4366;">A new VPS hosting application has been submitted by <strong style="color:#0d153a;">${name}</strong>.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-top:20px;">
                <tr>
                  <td style="background:#f6f7fb;border:1px solid #e6e9f2;border-radius:14px;padding:14px 16px;">
                    <span style="font-size:12px;color:#6b7194;">Selected plan</span><br />
                    <strong style="font-size:18px;color:#293b93;">${esc(PACKAGES[d.package] ?? d.package)}</strong>
                    <span style="display:inline-block;margin-left:8px;padding:2px 10px;border-radius:99px;background:#293b93;color:#ffffff;font-size:12px;font-weight:700;">${esc(d.platform.toUpperCase())}</span>
                  </td>
                </tr>
              </table>
              ${heading("Applicant")}
              ${table(applicant)}
              ${heading("VPS Details")}
              ${table(vps)}
              ${heading("Tracking")}
              ${table(tracking)}
              <p style="margin:28px 0 0;font-size:15px;line-height:26px;">Best Regards,<br /><strong style="color:#293b93;">GTCFX Team</strong></p>
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td style="padding:24px 32px 28px;background:#f6f7fb;border-top:1px solid #e6e9f2;">
              <div style="text-align:center;padding-bottom:14px;">
                ${SOCIALS.map(([alt, href, icon]) => `<a href="${href}" target="_blank" style="text-decoration:none;"><img alt="${alt}" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/${icon}_96.png" style="width:24px;height:24px;margin:0 5px;" /></a>`).join("")}
              </div>
              <p style="margin:0 0 8px;font-size:10px;line-height:15px;color:#6b7194;">Company name: GTCFX / Website: www.gtcfx.com / Email: support@gtcfx.com</p>
              <p style="margin:0 0 8px;font-size:10px;line-height:15px;color:#6b7194;">Disclaimers: The information in this email is for general purposes only and does not constitute personal financial advice. Please assess the relevance of this information to your own financial goals and situation. Investing in contract for difference products carries significant risks and may not be suitable for all investors. Losses may exceed the initial deposit. You do not have ownership rights to the underlying assets of the contract. We advise seeking professional guidance to fully understand the risks before trading. Please review our user terms, risk warnings, privacy policy, and other relevant documents before making financial decisions.</p>
              <p style="margin:0;font-size:10px;line-height:15px;color:#6b7194;">Note that our products and services are not available in restricted countries.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const plain = [
    ["First Name", d.first_name],
    ["Last Name", d.last_name],
    ["Email", d.email],
    ["Phone Number", d.phone],
    ["Country", d.country],
    ["Package", PACKAGES[d.package] ?? d.package],
    ["Platform", d.platform.toUpperCase()],
    ["Account Number", d.account_no],
    ["IP Address", d.ip],
    ["UTM Campaign", d.utm_campain],
    ["UTM Source", d.utm_source],
    ["Submitted (UTC)", submitted],
  ];
  const text = [SUBJECT, "", `A new VPS hosting application has been submitted by ${d.first_name} ${d.last_name}.`, "", ...plain.map(([l, v]) => `${l}: ${v || "-"}`)].join("\n");

  return { html, text };
}

async function sendEmail(d) {
  if (!process.env.MAILGUN_API_KEY) throw new Error("MAILGUN_API_KEY is not set");
  // imported lazily so a missing key doesn't break the module (the Mailgun client validates its key on creation)
  const { MAILGUN_DOMAIN, MAILGUN_FROM, mailgunClient } = await import("@/config/nodemailer");
  const { html, text } = generateEmailContent(d);
  await mailgunClient.messages.create(MAILGUN_DOMAIN, {
    from: MAILGUN_FROM,
    to: MAIL_TO,
    cc: MAIL_CC,
    "h:Reply-To": d.email,
    subject: `${SUBJECT} — ${d.first_name} ${d.last_name} (${d.package})`,
    text,
    html,
  });
}

async function sendZapier(d) {
  if (!ZAPIER_HOOK) throw new Error("VPS_ZAPIER_HOOK_URL is not set");
  const res = await fetch(ZAPIER_HOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  });
  if (!res.ok) throw new Error(`Zapier ${res.status}`);
}

/* ------------------------------------------------------------ handler */

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const payload = {
    ip: str(body?.ip, 64) || clientIp(request),
    utm_campain: str(body?.utm_campain, 300),
    utm_source: str(body?.utm_source, 200),
    first_name: str(body?.first_name, 80),
    last_name: str(body?.last_name, 80),
    platform: str(body?.platform, 10).toLowerCase(),
    account_no: str(body?.account_no, 20),
    package: str(body?.package, 20).toLowerCase(),
    phone: str(body?.phone, 20),
    email: str(body?.email, 160),
    country: str(body?.country, 100),
    terms: Boolean(body?.terms),
  };

  // same rules as the form
  const valid =
    payload.first_name.length >= 2 &&
    payload.last_name.length >= 2 &&
    PLATFORMS.includes(payload.platform) &&
    /^\d{6,9}$/.test(payload.account_no) &&
    payload.package in PACKAGES &&
    EMAIL_RE.test(payload.email) &&
    /^\+\d{6,15}$/.test(payload.phone) &&
    payload.country.length > 0;

  if (!valid) {
    return NextResponse.json({ ok: false, error: "Missing or invalid VPS application fields" }, { status: 422 });
  }

  const [zapier, email] = await Promise.allSettled([sendZapier(payload), sendEmail(payload)]);
  if (zapier.status === "rejected") console.error("[vps-data-email] Zapier:", zapier.reason?.message);
  if (email.status === "rejected") console.error("[vps-data-email] Mailgun:", email.reason?.message);

  if (zapier.status === "fulfilled" || email.status === "fulfilled") {
    return NextResponse.json({ ok: true, message: "Success" });
  }
  return NextResponse.json({ ok: false, error: "Failed to submit application" }, { status: 502 });
}
