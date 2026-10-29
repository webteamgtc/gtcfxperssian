/**
 * Endpoints used by the event registration form (Events & Exhibitions hero).
 * They are proxy routes on this site (same pattern as /api/gtc/* for the account forms) —
 * point them at the CRM / Strapi form handler once it exists. Expected contract:
 *
 *  POST sendOtp   { phone: "+971501234567", email }                → { code: 200 } | { code: 4xx, msg }
 *  POST register  { eventId, eventSlug, eventTitle, firstName, lastName, email,
 *                   country, phone, otp, locale, terms: true }    → { code: 200 } | { code: 4xx, msg }
 */
export const EVENT_API = {
  sendOtp: '/api/gtc/event-otp',
  register: '/api/gtc/event-register'
};

export const EVENT_TERMS_URL = 'https://www.gtcfx.com/terms';

/**
 * Contact Us ticket form (multipart/form-data so an attachment can be sent).
 * Fields: existingClient ("yes"|"no"), queryType, ticketType, subject, firstName, lastName,
 *         email, phone (+E.164), country, description, locale, attachment (optional file, ≤ 5 MB)
 * Response: { code: 200, data: { caseNumber } } | { code: 4xx, msg }
 */
export const CONTACT_API = { ticket: '/api/gtc/contact-ticket' };
export const CONTACT = {
  phone: '+44 800 048 8461',
  email: 'support@gtcfx.com',
  whatsapp: 'https://wa.me/448000488461',
  privacyUrl: 'https://www.gtcfx.com/privacy'
};
