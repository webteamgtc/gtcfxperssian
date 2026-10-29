import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyOtp } from '@/lib/otpStore';

export const runtime = 'nodejs';

/**
 * Margin Bonus sign-up (form on /trading/margin-bonus).
 *
 * GET ?email=… → { registered } — is the e-mail a GTCFX client (Client_mail_list)? Shown as a hint under the field.
 *
 * POST { Full_name, email, otp, phone, account_no, deposit_amount, country, terms, utm_campain, utm_source, fbclid, qr_code_id, user_referrer }
 *   1. validates the fields,
 *   2. the e-mail must be a registered client and must not have applied before (marketing_campaign),
 *   3. checks the e-mail code sent by /api/otp-smtp,
 *   4. saves the sign-up in marketing_campaign,
 *   5. forwards it to the Zapier hook (CRM) and e-mails it to the margin bonus team (mailOptions in src/config/nodemailer.js).
 * → { ok: true } or { ok: false, error: 'invalid' | 'notRegistered' | 'alreadyApplied' | 'otp' | 'server' }
 * Env: DB_* (src/lib/db.js), MAILGUN_API_KEY, MARGIN_BONUS_ZAPIER_URL (optional, defaults to the campaign hook).
 */
const ZAPIER_HOOK = process.env.MARGIN_BONUS_ZAPIER_URL?.trim() || 'https://hooks.zapier.com/hooks/catch/16420445/3kq25sj/';
const SUBJECT = 'Margin Bonus application';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LETTERS_RE = /^[\p{L}\p{M}\s'’.-]+$/u;

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// outside production the response also carries the underlying reason (e.g. the database error) for debugging
const DEV = process.env.NODE_ENV !== 'production';
const fail = (error, status, cause) => NextResponse.json({ ok: false, error, ...(DEV && cause ? { detail: cause.message } : {}) }, { status });

const isClient = async (email) => (await query('SELECT TOP 1 email FROM Client_mail_list WHERE email = @email', { email })).length > 0;
const hasApplied = async (email) => (await query('SELECT TOP 1 Email_address FROM marketing_campaign WHERE Email_address = @email', { email })).length > 0;

/** Campaign code = submission date, e.g. 28oct2026 (same format as the original campaign forms). */
function campaignCode(date = new Date()) {
  return `${date.getDate()}${date.toLocaleString('en', { month: 'short' }).toLowerCase()}${date.getFullYear()}`;
}

function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip') || '').trim();
}

async function sendEmail(d) {
  if (!process.env.MAILGUN_API_KEY) throw new Error('MAILGUN_API_KEY is not set');
  const { MAILGUN_DOMAIN, mailgunClient, mailOptions } = await import('@/config/nodemailer');
  const rows = [
    ['Full name', d.Full_name],
    ['Email', d.email],
    ['Phone', d.phone],
    ['Account number', d.account_no],
    ['Deposit amount', `$${d.deposit_amount}`],
    ['Country', d.country],
    ['Page', d.utm_campain],
    ['UTM source', d.utm_source],
    ['IP', d.ip],
    ['Submitted', new Date().toUTCString()]
  ];
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0d153a">
    <h2 style="color:#293b93;margin:0 0 16px">${SUBJECT}</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e6e9f2">${rows
      .map(([k, v]) => `<tr><td style="padding:10px 14px;width:35%;background:#f6f7fb;font-size:13px;color:#6b7194;border-bottom:1px solid #e6e9f2">${k}</td><td style="padding:10px 14px;font-size:14px;border-bottom:1px solid #e6e9f2">${esc(v) || '—'}</td></tr>`)
      .join('')}</table></div>`;
  const text = rows.map(([k, v]) => `${k}: ${v || '—'}`).join('\n');
  await mailgunClient.messages.create(MAILGUN_DOMAIN, { ...mailOptions, 'h:Reply-To': d.email, subject: `${SUBJECT} — ${d.Full_name} (${d.account_no})`, text, html });
}

async function sendZapier(d) {
  const res = await fetch(ZAPIER_HOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
  if (!res.ok) throw new Error(`Zapier ${res.status}`);
}

export async function GET(request) {
  const email = str(new URL(request.url).searchParams.get('email'), 160);
  if (!EMAIL_RE.test(email)) return NextResponse.json({ registered: false }, { status: 400 });
  try {
    return NextResponse.json({ registered: await isClient(email) });
  } catch (err) {
    console.error('[margin-bonus] client check:', err.message);
    return NextResponse.json({ registered: null, ...(DEV ? { detail: err.message } : {}) }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail('invalid', 400);
  }
  const d = {
    Full_name: str(body?.Full_name, 100),
    email: str(body?.email, 160),
    phone: str(body?.phone, 24),
    account_no: str(body?.account_no, 12),
    deposit_amount: str(body?.deposit_amount, 12),
    country: str(body?.country, 80),
    terms: body?.terms === true,
    utm_campain: str(body?.utm_campain, 300),
    utm_source: str(body?.utm_source, 200),
    fbclid: str(body?.fbclid, 300),
    qr_code_id: str(body?.qr_code_id, 100),
    user_referrer: str(body?.user_referrer, 300),
    ip: clientIp(request)
  };
  const otp = str(body?.otp, 6);
  const valid =
    d.Full_name.length >= 2 &&
    LETTERS_RE.test(d.Full_name) &&
    EMAIL_RE.test(d.email) &&
    /^\+?[\d\s()-]{7,20}$/.test(d.phone) &&
    /^\d{6,8}$/.test(d.account_no) &&
    Number(d.deposit_amount) > 0 &&
    d.country.length >= 2 &&
    d.terms &&
    /^\d{6}$/.test(otp);
  if (!valid) return fail('invalid', 422);

  try {
    if (!(await isClient(d.email))) return fail('notRegistered', 403);
    if (await hasApplied(d.email)) return fail('alreadyApplied', 409);
    if (!verifyOtp(d.email, otp).success) return fail('otp', 400);

    await query(
      `INSERT INTO marketing_campaign (Full_name, Email_address, Account_number, Country, Campaign_code, Campaign_name, Phone_number, create_time)
       VALUES (@Full_name, @Email_address, @Account_number, @Country, @Campaign_code, @Campaign_name, @Phone_number, @create_time)`,
      {
        Full_name: d.Full_name,
        Email_address: d.email,
        Account_number: d.account_no,
        Country: d.country,
        Campaign_code: campaignCode(),
        Campaign_name: d.utm_campain.replace(/^\//, ''),
        Phone_number: d.phone,
        create_time: new Date()
      }
    );
  } catch (err) {
    console.error('[margin-bonus] database:', err.message);
    return fail('server', 500, err);
  }

  // the sign-up is saved; notifications failing must not fail the request
  const [zapier, email] = await Promise.allSettled([sendZapier(d), sendEmail(d)]);
  if (zapier.status === 'rejected') console.error('[margin-bonus] Zapier:', zapier.reason?.message);
  if (email.status === 'rejected') console.error('[margin-bonus] Mailgun:', email.reason?.message);
  return NextResponse.json({ ok: true });
}
