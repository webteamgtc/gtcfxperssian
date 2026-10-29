/**
 * Earnings & dividends calendar (server only).
 *
 * Strapi `earnings` entries { date, data: <uploaded .xlsx> } — one upload per trading day. The newest entry's
 * spreadsheet is downloaded and its first sheet read into { columns, rows } (cached: STRAPI_REVALIDATE).
 * The .xlsx reader below covers the plain tables these uploads contain (shared / inline strings, numbers,
 * Excel date serials in "date" columns) using only Node's zlib — no spreadsheet dependency.
 */
import { inflateRawSync } from 'zlib';
import { strapiGet, mediaUrl } from './strapi';
import { langOf } from '@/i18n/locales';

const REVALIDATE = Number(process.env.STRAPI_REVALIDATE ?? 300);

/* ------------------------------------------------------------ zip */

function unzip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let n = 0; n < count && buf.readUInt32LE(p) === 0x02014b50; n += 1) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    files.set(name, { method, size, local });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return (name) => {
    const f = files.get(name);
    if (!f) return null;
    const start = f.local + 30 + buf.readUInt16LE(f.local + 26) + buf.readUInt16LE(f.local + 28);
    const raw = buf.subarray(start, start + f.size);
    return (f.method === 8 ? inflateRawSync(raw) : raw).toString('utf8');
  };
}

/* ------------------------------------------------------------ xlsx */

const XML_ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const xmlText = (s) => s.replace(/<[^>]+>/g, '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (XML_ENT[e] ?? m)));
const colIndex = (ref) => [...ref.replace(/\d+/g, '')].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

/** Excel serial (days since 1899-12-30) → 'YYYY-MM-DD'. */
const excelDate = (n) => new Date(Date.UTC(1899, 11, 30) + Math.round(n * 86400000)).toISOString().slice(0, 10);

/** First worksheet of an .xlsx buffer → { columns: string[], rows: string[][] }. */
export function readXlsx(buffer) {
  const file = unzip(Buffer.from(buffer));
  const shared = [...(file('xl/sharedStrings.xml') ?? '').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => xmlText(m[1]).trim());

  // first sheet in workbook order → its part via the workbook relationships
  const firstRid = /<sheet\b[^>]*r:id="([^"]+)"/.exec(file('xl/workbook.xml') ?? '')?.[1];
  const target = firstRid && new RegExp(`<Relationship\\b[^>]*Id="${firstRid}"[^>]*Target="([^"]+)"`).exec(file('xl/_rels/workbook.xml.rels') ?? '')?.[1];
  const sheetXml = file(target ? `xl/${target.replace(/^\/?xl\//, '')}` : 'xl/worksheets/sheet1.xml') ?? file('xl/worksheets/sheet1.xml') ?? '';

  const grid = [...sheetXml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
    const cells = [];
    for (const c of row[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1];
      const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1];
      const type = /\bt="([^"]+)"/.exec(attrs)?.[1];
      const body = c[2] ?? '';
      const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value = '';
      if (type === 's') value = shared[Number(v)] ?? '';
      else if (type === 'inlineStr') value = xmlText(/<is>([\s\S]*?)<\/is>/.exec(body)?.[1] ?? '').trim();
      else if (v != null) value = xmlText(v).trim();
      cells[ref ? colIndex(ref) : cells.length] = value;
    }
    return Array.from(cells, (x) => x ?? '');
  });

  const rows = grid.filter((r) => r.some((x) => String(x).trim()));
  const [header = [], ...body] = rows;
  const columns = header.map((h) => String(h).trim());
  const width = columns.length;
  const dateCols = columns.map((h) => /date/i.test(h));
  const fmt = (x, i) => (dateCols[i] && /^\d+(\.\d+)?$/.test(x) ? excelDate(Number(x)) : /^-?\d+\.\d{7,}$/.test(x) ? String(Number(Number(x).toFixed(6))) : x);
  return { columns, rows: body.map((r) => Array.from({ length: width }, (_, i) => fmt(String(r[i] ?? ''), i))) };
}

/* ------------------------------------------------------------ strapi */

const rel = (r) => {
  const d = r?.data !== undefined ? r.data : r;
  return d ? (d.attributes ? { id: d.id, ...d.attributes } : d) : null;
};

/**
 * Newest calendar upload → { date: 'YYYY-MM-DD', columns, rows } or null (no entry, no file, or unreadable).
 * Rows keep the spreadsheet order, sorted by its first date column (newest first) when there is one.
 */
export async function getEarningsCalendar(locale = 'en') {
  for (const loc of locale && langOf(locale) !== 'en' ? [langOf(locale), 'en'] : ['en']) {
    const json = await strapiGet('earnings', { locale: loc, tags: ['earnings'], query: { sort: ['date:desc', 'createdAt:desc'], populate: { data: { fields: ['url', 'name', 'ext'] } }, pagination: { pageSize: 1 } } });
    const entry = json?.data?.[0];
    if (!entry) continue;
    const a = entry.attributes ?? entry;
    const url = mediaUrl(rel(a.data));
    if (!url) return null;
    try {
      const res = await fetch(url, { next: { revalidate: REVALIDATE, tags: ['earnings'] } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { columns, rows } = readXlsx(await res.arrayBuffer());
      const d = columns.findIndex((h) => /date/i.test(h));
      if (d >= 0) rows.sort((x, y) => String(y[d]).localeCompare(String(x[d])));
      return { date: String(a.date ?? a.publishedAt ?? '').slice(0, 10), columns, rows };
    } catch (error) {
      console.error('Earnings calendar file error:', error);
      return null;
    }
  }
  return null;
}
