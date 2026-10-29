import { NextResponse } from 'next/server';
import { CAT5_LANGUAGES } from '@/config/regions';

/**
 * GTC Financial Consultancy L.L.C. (UAE CAT 5) enquiry, posted by the form on the CAT 5 site (/en-ae, /ar).
 *  1. validates and normalises the enquiry and adds the client IP,
 *  2. e-mails it through Mailgun with mailOptionsSupports (src/config/nodemailer.js: support@gtcfx.com, bcc zeeshan@gtcfx.com),
 *  3. optionally forwards it to a Zapier hook (CRM) when UAE_ENQUIRY_ZAPIER_URL is set.
 * Succeeds when at least one channel accepts it, so a lead is never lost to a single outage.
 * Env: MAILGUN_API_KEY (+ MAILGUN_USERNAME / MAILGUN_API_URL as for the VPS form), UAE_ENQUIRY_ZAPIER_URL.
 */
const ZAPIER_HOOK = process.env.UAE_ENQUIRY_ZAPIER_URL?.trim();
const SUBJECT = 'Enquiry: GTC Financial Consultancy (Category 5)';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LANGUAGE_LABEL = { fa: 'Farsi', en: 'English' };

const str = (v, max = 200) =>
  String(v ?? '')
    .trim()
    .slice(0, max);
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip') || '').trim();
}

function emailContent(d) {
  const rows = [
    ['Name', esc(d.name)],
    ['Email', `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`],
    ['Phone', `<a href="tel:${esc(d.phone)}">${esc(d.phone)}</a>`],
    ['Country of residence', esc(d.residence)],
    ['Preferred language', esc(LANGUAGE_LABEL[d.language])],
    ['Message', esc(d.message).replace(/\n/g, '<br>') || '—'],
    ['Country (IP)', esc(d.country) || '—'],
    ['IP', esc(d.ip) || '—'],
    ['Page', esc(d.page) || '—'],
    ['Submitted', new Date().toUTCString()]
  ];
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0d153a">
    <h2 style="color:#293b93;margin:0 0 16px">${SUBJECT}</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e6e9f2">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:10px 14px;width:35%;background:#f6f7fb;font-size:13px;color:#6b7194;border-bottom:1px solid #e6e9f2">${k}</td><td style="padding:10px 14px;font-size:14px;border-bottom:1px solid #e6e9f2">${v}</td></tr>`
      )
      .join('')}</table>
    <p style="font-size:12px;color:#6b7194">The visitor agreed that GTC Financial Consultancy L.L.C. may contact them by email regarding this enquiry.</p></div>`;
  const text = rows.map(([k, v]) => `${k}: ${String(v).replace(/<[^>]+>/g, '')}`).join('\n');
  return { html, text };
}

async function sendEmail(d) {
  if (!process.env.MAILGUN_API_KEY) throw new Error('MAILGUN_API_KEY is not set');
  const { MAILGUN_DOMAIN, mailgunClient, mailOptionsSupports } = await import('@/config/nodemailer');
  const { html, text } = emailContent(d);
  await mailgunClient.messages.create(MAILGUN_DOMAIN, { ...mailOptionsSupports, 'h:Reply-To': d.email, subject: `${SUBJECT} — ${d.name} (${d.residence}, ${LANGUAGE_LABEL[d.language]})`, text, html });
}

async function sendZapier(d) {
  if (!ZAPIER_HOOK) throw new Error('UAE_ENQUIRY_ZAPIER_URL is not set');
  const res = await fetch(ZAPIER_HOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
  if (!res.ok) throw new Error(`Zapier ${res.status}`);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  const d = {
    name: str(body?.name, 100),
    email: str(body?.email, 160),
    phone: str(body?.phone, 24),
    residence: str(body?.country, 80),
    language: str(body?.language, 5),
    message: str(body?.message, 2000),
    consent: body?.consent === true,
    page: str(body?.page, 300),
    utm_source: str(body?.utm_source, 200),
    utm_campaign: str(body?.utm_campaign, 300),
    country: (request.headers.get('x-vercel-ip-country') || '').toUpperCase(),
    ip: clientIp(request)
  };
  const valid = d.name.length >= 2 && EMAIL_RE.test(d.email) && /^\+?[\d\s()-]{7,20}$/.test(d.phone) && d.residence.length >= 2 && CAT5_LANGUAGES.includes(d.language) && d.consent;
  if (!valid) return NextResponse.json({ ok: false, error: 'Missing or invalid fields' }, { status: 422 });
  // honeypot: bots fill hidden fields; pretend success
  if (str(body?.website)) return NextResponse.json({ ok: true });

  const [email, zapier] = await Promise.allSettled([sendEmail(d), ZAPIER_HOOK ? sendZapier(d) : Promise.reject(new Error('skipped'))]);
  if (email.status === 'rejected') console.error('[uae-enquiry] Mailgun:', email.reason?.message);
  if (zapier.status === 'rejected' && ZAPIER_HOOK) console.error('[uae-enquiry] Zapier:', zapier.reason?.message);
  if (email.status === 'fulfilled' || zapier.status === 'fulfilled') return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false, error: 'Failed to send enquiry' }, { status: 502 });
}
