/**
 * Market holiday schedule (server only).
 *
 * Strapi `holiday-schedules` entries { date, file: <uploaded .xlsx> } — one upload per month and language
 * (en, zh-Hans, vi, th). Each sheet is a matrix:
 *   row 0     "Instrument" | "01 Oct 2026, Thursday" | "12 Oct 2026, Monday" | …
 *   row 1..n  "Indices - HK50c" | "Closed" | "" | "Early Close @ 21:30" | …
 * The newest MONTHS uploads for the page language (English when it has none) are read and merged into
 * events: { date: 'YYYY-MM-DD', market, group, name, status: 'closed' | 'early', time, label }.
 */
import { strapiGet, strapiLocale, mediaUrl } from './strapi';
import { readXlsx } from './earnings';

const REVALIDATE = Number(process.env.STRAPI_REVALIDATE ?? 300);
const MONTHS = 4; // current month + a few before it, so the calendar can page back

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const excelDate = (n) => new Date(Date.UTC(1899, 11, 30) + Math.round(n * 86400000)).toISOString().slice(0, 10);
const pad = (n) => String(n).padStart(2, '0');

/** Header cell → 'YYYY-MM-DD' ("01 Oct 2026, Thursday", "2026-10-01", an Excel serial, "2026年10月1日"). */
function headerDate(value) {
  const s = String(value ?? '')
    .trim()
    .replace(/[٠-٩]/g, (c) => c.charCodeAt(0) - 0x0660)
    .replace(/[۰-۹]/g, (c) => c.charCodeAt(0) - 0x06f0);
  if (!s) return null;
  if (/^\d{5}(\.\d+)?$/.test(s)) return excelDate(Number(s));
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})/);
  if (m && MONTH_NAMES.includes(m[2].slice(0, 3).toLowerCase())) return `${m[3]}-${pad(MONTH_NAMES.indexOf(m[2].slice(0, 3).toLowerCase()) + 1)}-${pad(m[1])}`;
  m = s.match(/([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (m && MONTH_NAMES.includes(m[1].slice(0, 3).toLowerCase())) return `${m[3]}-${pad(MONTH_NAMES.indexOf(m[1].slice(0, 3).toLowerCase()) + 1)}-${pad(m[2])}`;
  m = s.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  return null;
}

// localised sheets use their own words; anything else non-empty counts as "closed"
const EARLY = [/early\s*clos/i, /提前|提早/, /مبكر/, /sớm/i, /ก่อนเวลา|ปิดเร็ว/, /anticip/i];
const EMPTY = [/^-+$/, /^n\/?a$/i, /^(normal|open)$/i, /^mở\s*cửa$/i, /^ß$/];

/** Cell → { status, time, label } or null for an ordinary trading day. */
function parseCell(cell) {
  const label = String(cell ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!label || EMPTY.some((re) => re.test(label))) return null;
  const time = label.match(/(\d{1,2}:\d{2})/)?.[1] ?? '';
  return { status: EARLY.some((re) => re.test(label)) ? 'early' : 'closed', time, label };
}

/** "Indices - HK50c" → Indices / HK50c · "Asia Shares:Exchanges - HKEX" → Asia Shares / HKEX · "OIL/Energies (BRNUSD)" → Energies / BRNUSD */
function splitMarket(market) {
  let m = market.match(/^(.+?)\s*:\s*Exchanges?\s*-\s*(.+)$/i);
  if (m) return { group: m[1].trim(), name: m[2].trim() };
  m = market.match(/^(?:oil\/)?(.+?)\s*\(([^)]+)\)$/i);
  if (m) return { group: m[1].trim(), name: m[2].trim() };
  m = market.match(/^(.+?)\s+-\s+(.+)$/);
  if (m) return { group: m[1].trim(), name: m[2].trim() };
  return { group: market, name: market };
}

export function parseHolidaySheet({ columns, rows }) {
  const dates = columns.map((c, i) => (i === 0 ? null : headerDate(c)));
  const events = [];
  for (const row of rows) {
    const market = String(row[0] ?? '').trim();
    if (!market) continue;
    dates.forEach((date, col) => {
      if (!date) return;
      const cell = parseCell(row[col]);
      if (cell) events.push({ date, market, ...splitMarket(market), ...cell });
    });
  }
  return events;
}

const rel = (r) => {
  const d = r?.data !== undefined ? r.data : r;
  const one = Array.isArray(d) ? d[0] : d;
  return one ? (one.attributes ? { id: one.id, ...one.attributes } : one) : null;
};

async function entriesFor(locale) {
  const json = await strapiGet('holiday-schedules', {
    locale,
    tags: ['holiday-schedules'],
    query: { sort: ['createdAt:desc'], populate: { file: { fields: ['url', 'name'] } }, pagination: { pageSize: MONTHS * 2 } }
  });
  return Array.isArray(json?.data) ? json.data.map((e) => (e.attributes ? { id: e.id, ...e.attributes } : e)) : [];
}

async function readFile(url) {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE, tags: ['holiday-schedules'] } });
    if (!res.ok) return [];
    return parseHolidaySheet(readXlsx(await res.arrayBuffer()));
  } catch (error) {
    console.error('Holiday schedule file error:', url, error?.message);
    return [];
  }
}

/** Holiday events (sorted by date) for the page locale, or [] when Strapi isn't configured / reachable. */
export async function getMarketHolidays(locale = 'en') {
  const code = strapiLocale(locale);
  let entries = code === 'en' ? [] : await entriesFor(code);
  if (!entries.length) entries = await entriesFor('en');

  const urls = [...new Set(entries.map((e) => mediaUrl(rel(e.file))).filter(Boolean))].slice(0, MONTHS * 2);
  const sheets = await Promise.all(urls.map(readFile));

  // newest upload wins for any date that appears in more than one file
  const seenDates = new Set();
  const events = [];
  for (const sheet of sheets) {
    const own = new Set(sheet.map((e) => e.date));
    if (!sheet.length || [...own].every((d) => seenDates.has(d))) continue;
    for (const e of sheet) if (!seenDates.has(e.date)) events.push(e);
    own.forEach((d) => seenDates.add(d));
    if (new Set(events.map((e) => e.date.slice(0, 7))).size >= MONTHS) break;
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.market.localeCompare(b.market));
}
