import { NextResponse } from 'next/server';
import { createOtp } from '@/lib/otpStore';

export const runtime = 'nodejs';

/**
 * POST { phone: "+971501234567", locale? } → sends a 6-digit code by WhatsApp (Infobip template).
 * env: INFOBIP_BASE_URL, INFOBIP_API_KEY, INFOBIP_WHATSAPP_SENDER, WHATSAPP_TEMPLATE_NAME
 * The code is never returned to the browser; /api/verify-otp checks it.
 */
const { INFOBIP_BASE_URL = '', INFOBIP_API_KEY = '', INFOBIP_WHATSAPP_SENDER = '', WHATSAPP_TEMPLATE_NAME = '' } = process.env;
const digits = (v = '') => String(v).replace(/\D/g, '');

export async function POST(req) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ success: false, message: 'Phone number is required for OTP delivery.' }, { status: 400 });
    if (!INFOBIP_BASE_URL || !INFOBIP_API_KEY || !INFOBIP_WHATSAPP_SENDER || !WHATSAPP_TEMPLATE_NAME) {
      return NextResponse.json({ success: false, message: 'OTP service is not configured.' }, { status: 500 });
    }
    const to = digits(phone);
    if (to.length < 7) return NextResponse.json({ success: false, message: 'Invalid phone number.' }, { status: 400 });

    const otp = createOtp(phone);
    const res = await fetch(`${INFOBIP_BASE_URL}/whatsapp/1/message/template`, {
      method: 'POST',
      headers: { Authorization: `App ${INFOBIP_API_KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            from: digits(INFOBIP_WHATSAPP_SENDER),
            to,
            messageId: `otp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            content: {
              templateName: WHATSAPP_TEMPLATE_NAME,
              // template: "{{1}} is your verification code." + a copy-code URL button
              templateData: { body: { placeholders: [otp] }, buttons: [{ type: 'URL', parameter: otp }] },
              language: 'en'
            }
          }
        ]
      })
    });
    if (!res.ok) throw new Error(`WhatsApp provider error ${res.status}`);
    const data = await res.json();
    const msg = Array.isArray(data.messages) ? data.messages[0] : data;
    if (msg?.status?.groupName === 'REJECTED') throw new Error(`WhatsApp message rejected: ${msg.status.description || msg.status.name}`);

    return NextResponse.json({ success: true, message: 'OTP sent via WhatsApp.' });
  } catch (error) {
    console.error('WhatsApp OTP error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Error sending WhatsApp OTP.' }, { status: 500 });
  }
}
