import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';

export const runtime = 'nodejs';

/**
 * POST { phone, otp } or { email, otp } → { success, message }
 * Codes come from /api/send-phone-otp (WhatsApp) or /api/otp-smtp (email); single use, 10 minutes.
 */
export async function POST(req) {
  try {
    const { phone, email, otp } = await req.json();
    const identifier = phone || email;
    if (!identifier || !otp) return NextResponse.json({ success: false, message: 'Phone/Email and OTP are required.' }, { status: 400 });
    const result = verifyOtp(identifier, otp);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error?.message || 'Error verifying OTP.' }, { status: 500 });
  }
}
