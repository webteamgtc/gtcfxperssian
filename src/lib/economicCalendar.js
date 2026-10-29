/**
 * Economic calendar events for the /gtc-news/economic-calendar hero card — server side only.
 * Source: the TradingView economic calendar feed (the same data as the embedded TradingView widget).
 * It is not an official public API, so every failure resolves to `[]` and the card falls back to sample rows.
 *
 * Event: { id, title, currency, country, date (ISO, UTC), importance (1 high · 0 medium), actual, forecast, previous, unit, scale }
 */
const FEED = 'https://economic-calendar.tradingview.com/events';
const COUNTRIES = ['US', 'EU', 'GB', 'JP', 'CN', 'AU', 'CA', 'CH', 'DE', 'NZ'];
const DAY = 86400000;
const REVALIDATE = 300;

const num = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

export async function getEconomicCalendar() {
  const now = Date.now();
  // yesterday … end of next week covers every hero tab (Yesterday / Today / Tomorrow / This Week)
  const params = new URLSearchParams({
    from: new Date(now - 2 * DAY).toISOString(),
    to: new Date(now + 8 * DAY).toISOString(),
    countries: COUNTRIES.join(','),
    minImportance: '0'
  });
  try {
    const res = await fetch(`${FEED}?${params}`, {
      headers: { Origin: 'https://www.tradingview.com' },
      next: { revalidate: REVALIDATE, tags: ['economic-calendar'] },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json?.result)) return [];
    return json.result
      .filter((e) => e?.title && e?.date)
      .map((e) => ({
        id: String(e.id),
        title: e.title,
        currency: e.currency || e.country || '',
        country: e.country || '',
        date: e.date,
        importance: Number(e.importance) || 0,
        actual: num(e.actual),
        forecast: num(e.forecast),
        previous: num(e.previous),
        unit: e.unit || '',
        scale: e.scale || ''
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}
