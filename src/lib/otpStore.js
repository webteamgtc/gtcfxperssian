/**
 * One-time codes for phone or email verification (server only). `identifier` is a phone number or an email. In-memory, shared across route modules of the
 * same server process via `global`; codes expire after 10 minutes and are deleted once verified.
 * On a multi-instance deployment, replace with a shared store (Redis, KV…) — send and verify must hit
 * the same storage.
 */
import { randomInt } from 'crypto';

const TTL = 10 * 60 * 1000;
const store = (global.__gtcOtpStore ??= new Map());

const keyOf = (id = '') => {
  const s = String(id).trim();
  return s.includes('@') ? `email:${s.toLowerCase()}` : `phone:${s.replace(/\D/g, '')}`;
};

/** New 6-digit code for a phone number or email (replaces any previous one). */
export function createOtp(identifier) {
  const otp = String(randomInt(0, 1_000_000)).padStart(6, '0');
  store.set(keyOf(identifier), { otp, expiresAt: Date.now() + TTL });
  return otp;
}

/** → { success, message } */
export function verifyOtp(identifier, otp) {
  const key = keyOf(identifier);
  const entry = store.get(key);
  if (!entry) return { success: false, message: 'No OTP found. Please request a new OTP.' };
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return { success: false, message: 'OTP has expired. Please request a new OTP.' };
  }
  if (entry.otp !== String(otp)) return { success: false, message: 'Invalid OTP. Please try again.' };
  store.delete(key);
  return { success: true, message: 'OTP verified successfully.' };
}
