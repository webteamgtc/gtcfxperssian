import { NextResponse } from 'next/server';
import { validateBusinessEmail } from '@/lib/emailValidation';

/** POST { email } → { valid, reason } (reason: valid | required | invalid | blocked_domain | plus_alias) */
export async function POST(req) {
  try {
    const { email } = await req.json();
    const result = validateBusinessEmail(email);
    return NextResponse.json(result, { status: result.reason === 'required' ? 400 : 200 });
  } catch (error) {
    return NextResponse.json({ valid: false, reason: 'validation_error', error: error?.message }, { status: 500 });
  }
}
