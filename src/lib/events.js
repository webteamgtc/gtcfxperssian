/**
 * Events & Exhibitions data from Strapi (v4 REST):
 *   upcoming — collection `future-events`  (title, descreption, date, city, country, image)
 *   archive  — collection `comments`       (title, shortDescreption, longDescription, date, year, booth, location, images, featureImage)
 * Override the collection ids with STRAPI_FUTURE_EVENTS_COLLECTION / STRAPI_EVENTS_COLLECTION.
 *
 * Each collection is fetched once in English with `populate=*`, which also returns the entry's
 * translations (`localizations`). Dates, images and booth numbers come from the English entry;
 * the text fields are swapped for the page locale's translation when one exists.
 *
 * Pages call getEventsPageData(locale) on the server; components only see the normalised shape:
 * { id, slug, title, shortTitle, summary, body: string[], startDate, endDate ('YYYY-MM-DD'),
 *   venue, city, country, booth, role, featured, registrationOpen,
 *   cover: {url, alt, width, height} | null, gallery: [{url, alt, width, height}],
 *   year, dateLabel, place, status: 'upcoming' | 'live' | 'past' }
 */
import { strapiGet, strapiConfigured, strapiLocale, toImage } from './strapi';
import { intlLocale, langOf } from '@/i18n/locales';

const UPCOMING_COLLECTION = process.env.STRAPI_FUTURE_EVENTS_COLLECTION || 'future-events';
const ARCHIVE_COLLECTION = process.env.STRAPI_EVENTS_COLLECTION || 'comments';

// text fields that are translated in Strapi (dates, images and booth numbers are taken from English)
const TEXT_FIELDS = ['title', 'descreption', 'shortDescreption', 'longDescription', 'location', 'city', 'country'];

/* ---------------- Strapi v4 helpers ---------------- */

const flat = (raw) => (raw?.attributes ? { id: raw.id, ...raw.attributes } : raw ?? {});

/** Media field (`{ data: [...] }`, `{ data: {...} }` or already flat) → array of media objects. */
function mediaList(field) {
  const data = field?.data !== undefined ? field.data : field;
  return (Array.isArray(data) ? data : data ? [data] : []).map(flat);
}

/** English entry with its text fields replaced by the `locale` translation (when there is one). */
function localise(entry, locale) {
  const code = strapiLocale(locale);
  if (!code || code === 'en') return { ...entry, translated: true };
  const loc = mediaList(entry.localizations).find((l) => l.locale === code);
  if (!loc) return { ...entry, translated: false };
  const text = Object.fromEntries(TEXT_FIELDS.filter((k) => typeof loc[k] === 'string' && loc[k].trim()).map((k) => [k, loc[k]]));
  return { ...entry, ...text, translated: true };
}

async function fetchCollection(collection, sort) {
  if (!strapiConfigured()) return null;
  const json = await strapiGet(collection, {
    locale: 'en',
    tags: ['events'],
    query: { populate: '*', sort: [sort], pagination: { start: 0, limit: 200 } }
  });
  return Array.isArray(json?.data) ? json.data.map(flat) : null;
}

/* ---------------- text helpers ---------------- */

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const label = (v) => str(v).replace(/^[,،\s]+|[,،\s]+$/g, '');
const paragraphs = (v) =>
  str(v)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
const slugify = (v) =>
  str(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const boothFrom = (text) => str(text).match(/booth\s*(?:no\.?\s*)?#?\s*([A-Z0-9-]+)/i)?.[1] ?? '';
const roleFrom = (text) => {
  const m = str(text).match(/\b(grand|title|diamond|platinum|gold|silver|bronze|headline|official)\s+(sponsor|partner)\b/i);
  return m ? m[0].replace(/\b\w/g, (c) => c.toUpperCase()) : '';
};

/* ---------------- dates ---------------- */

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/**
 * Free-text CMS date → { start, end } ('YYYY-MM-DD'), or null.
 * Handles "14 NOVEMBER 2026", "2–5 November 2026", "11 - 13 February, 2026", "14–15th May 2025",
 * "30 October – 2 November 2026", "October 8–9, 2026", "October 2024".
 */
export function parseDateRange(text) {
  const s = str(text)
    .toLowerCase()
    .replace(/(\d)(st|nd|rd|th)\b/g, '$1');
  const year = s.match(/\b(\d{4})\b/)?.[1];
  if (!year) return null;

  const parts = [];
  let carry = null;
  for (const [, day, word] of s.replace(year, ' ').matchAll(/(\d{1,2})|([a-z]{3,})/g)) {
    if (day) parts.push({ day: Number(day), month: carry });
    else {
      const month = MONTHS.indexOf(word.slice(0, 3)) + 1;
      if (!month) continue;
      const open = parts.filter((p) => !p.month);
      if (open.length) open.forEach((p) => (p.month = month));
      else carry = month;
      if (!parts.length) parts.push({ day: 1, month, implied: true });
    }
  }
  const dated = parts.filter((p) => p.month && p.day >= 1 && p.day <= 31);
  if (!dated.length) return null;
  const first = dated.find((p) => !p.implied) ?? dated[0];
  const last = dated[dated.length - 1];
  const start = iso(year, first.month, first.day);
  const end = iso(year, last.month, last.day);
  return { start, end: end >= start ? end : start };
}

/** "30–31 October 2026" in the page language (UTC so server and browser agree). */
// "en" would give US order (October 30 – 31); the site uses day-month-year
export const dateLocale = (locale) => intlLocale(locale);

export function formatRange(start, end, locale) {
  try {
    const fmt = new Intl.DateTimeFormat(dateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    const a = new Date(`${start}T00:00:00Z`);
    const b = new Date(`${end || start}T00:00:00Z`);
    return start === end || !end ? fmt.format(a) : fmt.formatRange(a, b);
  } catch {
    return end && end !== start ? `${start} – ${end}` : start;
  }
}

/* ---------------- normalisers ---------------- */

/** `future-events` entry → normalised event (null when the date can't be read). */
export function normaliseUpcoming(raw, locale) {
  const en = flat(raw);
  const range = parseDateRange(en.date);
  if (!range) return null;
  const a = localise(en, locale);
  const title = str(a.title);
  const [image] = mediaList(en.image);
  return {
    id: `event-${en.id}`,
    slug: slugify(en.title) || `event-${en.id}`,
    title,
    shortTitle: title.split(/:\s/)[0] || title,
    summary: str(a.descreption ?? a.description),
    body: paragraphs(a.descreption ?? a.description),
    startDate: range.start,
    endDate: range.end,
    venue: '',
    city: label(a.city),
    country: label(a.country),
    booth: boothFrom(en.title) || boothFrom(en.descreption),
    role: a.translated && langOf(locale) === 'en' ? roleFrom(en.title) || roleFrom(en.descreption) : '',
    featured: false,
    registrationOpen: true,
    cover: toImage(image, 'large'),
    gallery: []
  };
}

/** `comments` (archive) entry → normalised event. */
export function normaliseArchived(raw, locale) {
  const en = flat(raw);
  const a = localise(en, locale);
  const range = parseDateRange(en.date);
  const startDate = /^\d{4}-\d{2}-\d{2}/.test(str(en.year)) ? str(en.year).slice(0, 10) : range?.start || str(en.createdAt).slice(0, 10);
  const endDate = range && range.start === startDate ? range.end : startDate;
  const location = str(a.location);
  const segments = location.split(',').map((x) => x.trim()).filter(Boolean);
  const images = mediaList(en.images).map((m) => toImage(m, 'large')).filter(Boolean);
  const feature = toImage(mediaList(en.featureImage)[0], 'large');
  const title = str(a.title);
  return {
    id: `archive-${en.id}`,
    slug: slugify(en.title) || `archive-${en.id}`,
    title,
    shortTitle: title,
    summary: str(a.shortDescreption ?? a.shortDescription),
    body: paragraphs(a.longDescription),
    startDate,
    endDate,
    venue: segments.length > 1 ? segments.slice(0, -1).join(', ') : '',
    city: segments.at(-1) ?? '',
    country: '',
    booth: str(en.booth).replace(/^booth\s*/i, '').replace(/^#/, ''),
    role: '',
    featured: false,
    registrationOpen: false,
    cover: feature ?? images[0] ?? null,
    gallery: images,
    place: location
  };
}

function decorate(e, locale, today) {
  const status = e.endDate < today ? 'past' : e.startDate <= today ? 'live' : 'upcoming';
  const place = e.place || [e.venue, e.city, e.country].filter(Boolean).join(', ');
  return { ...e, year: e.startDate.slice(0, 4), dateLabel: formatRange(e.startDate, e.endDate, locale), place, status };
}

const byYear = (events) =>
  [...new Set(events.map((e) => e.year))].sort((a, b) => b.localeCompare(a)).map((year) => ({ year, events: events.filter((e) => e.year === year) }));

/**
 * Everything the Events page needs:
 *  upcoming — not finished yet, soonest first (featured one first)
 *  archive  — past events grouped by year (newest first), each year newest first
 *  source   — 'strapi' | 'sample' (sample data is used when Strapi isn't configured or a request fails)
 */
export async function getEventsPageData(locale) {
  const today = new Date().toISOString().slice(0, 10);
  const [upcomingRaw, archiveRaw] = await Promise.all([fetchCollection(UPCOMING_COLLECTION, 'createdAt:asc'), fetchCollection(ARCHIVE_COLLECTION, 'createdAt:desc')]);
 
  const upcoming = (upcomingRaw ? upcomingRaw.map((r) => normaliseUpcoming(r, locale)).filter(Boolean).map((e) => decorate(e, locale, today)) : [])
    .filter((e) => e.title && e.status !== 'past')
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.startDate.localeCompare(b.startDate));

  const past = (archiveRaw ? archiveRaw.map((r) => decorate(normaliseArchived(r, locale), locale, today)) : [])
    .filter((e) => e.title)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return { upcoming, archive: byYear(past), source: upcomingRaw || archiveRaw ? 'strapi' : 'sample' };
}
