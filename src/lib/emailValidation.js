/**
 * Business-email rules shared by the forms (client side) and /api/validate-email (server side):
 * no disposable / temporary domains, and no plus aliases (name+tag@…) except on our own domain.
 */
export const BLOCKED_EMAIL_DOMAINS = [
  'suijiyou.net',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  '10minutemail.com',
  'tempmail.com',
  'throwaway.email',
  'temp-mail.org',
  'mohmal.com',
  'trashmail.com',
  'maildrop.cc',
  'tempail.com',
  'getnada.com',
  'mintemail.com',
  'mytrashmail.com',
  'sharklasers.com',
  'spamgourmet.com',
  'mailnesia.com',
  'meltmail.com',
  'mailcatch.com',
  'emailondeck.com',
  'fakeinbox.com',
  'dispostable.com',
  'emailfake.com',
  'getairmail.com',
  'mailin8r.com',
  'mailme.lv',
  'tempr.email',
  'tmpmail.org',
  'mail.tm',
  'emailnator.com'
];

/** Domains where plus-address aliases (e.g. team+test@…) are allowed for internal QA. */
export const PLUS_ALIAS_ALLOWED_DOMAINS = ['gtcfx.com'];

/** → { valid, reason: 'valid' | 'required' | 'invalid' | 'blocked_domain' | 'plus_alias' } */
export function validateBusinessEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, reason: 'required' };
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf('@');
  if (at <= 0 || at === trimmed.length - 1) return { valid: false, reason: 'invalid' };
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) return { valid: false, reason: 'blocked_domain' };
  if (local.includes('+') && !PLUS_ALIAS_ALLOWED_DOMAINS.includes(domain)) return { valid: false, reason: 'plus_alias' };
  return { valid: true, reason: 'valid' };
}
