/**
 * Indicative trading sessions (GMT+0), Monday → Friday, per instrument category.
 * Row: { symbol, label?: index into marketHolidaysPage.tradingHours.symbols.<tab>, always?: trades at weekends too,
 *        days: [[pricing, trading] × 5] } — a session string may hold several ranges: "02:50-09:30,10:10-23:59".
 */
export const HOURS_TABS = ['fx', 'goldSilver', 'crudeOil', 'cashIndices', 'stocks'];

/** Mon–Thu share one session; Friday may differ. */
const week = (pricing, trading, friPricing = pricing, friTrading = trading) => [...Array(4).fill([pricing, trading]), [friPricing, friTrading]];
/** Monday opens later after the weekend; Tue–Fri share one session. */
const mondayOpen = (monPricing, monTrading, pricing, trading, friPricing = pricing, friTrading = trading) => [[monPricing, monTrading], [pricing, trading], [pricing, trading], [pricing, trading], [friPricing, friTrading]];

export const TRADING_HOURS = {
  fx: [
    { symbol: 'Majors', label: 0, days: week('00:00 - 23:59', '00:01 - 23:59') },
    { symbol: 'Cross & Exotics', label: 1, days: week('00:00 - 23:59', '00:01 - 23:59', '00:00 - 23:59', '00:01 - 23:55') },
    { symbol: 'JPY Symbols', label: 2, days: mondayOpen('00:03 - 23:59', '00:08 - 23:55', '00:03 - 23:59', '00:05 - 23:55') }
  ],
  goldSilver: [
    { symbol: 'XAUUSD', label: 0, days: mondayOpen('01:00 - 24:00', '01:05 - 23:59', '01:00 - 24:00', '01:01 - 23:59', '01:00 - 24:00', '01:01 - 23:55') },
    { symbol: 'XAGUSD', label: 1, days: mondayOpen('01:00 - 23:59', '01:05 - 23:55', '01:00 - 23:59', '01:01 - 23:55', '01:00 - 23:59', '01:01 - 23:50') }
  ],
  crudeOil: [
    { symbol: 'WTIUSD', label: 0, days: mondayOpen('01:00 - 24:00', '01:05 - 23:59', '01:00 - 24:00', '01:01 - 23:55', '01:00 - 23:59', '01:01 - 23:59') },
    { symbol: 'BRNUSD', label: 1, days: mondayOpen('01:00 - 23:59', '01:05 - 23:59', '03:00 - 23:59', '03:01 - 23:59') }
  ],
  cashIndices: [
    { symbol: 'AUS200c', days: week('02:50-09:30, 10:10-23:59', '02:51-09:30, 10:11-23:57', '00:50-08:30, 09:10-22:57', '00:51-08:30, 09:11-22:57') },
    { symbol: 'CN50c', days: [['04:00-13:10, 22:00-23:45', '04:02-13:10, 22:00-23:43'], ['04:00-13:10, 22:00-23:45', '04:00-13:10, 22:00-23:45'], ...Array(3).fill(['04:00-13:10, 22:00-23:45', '04:02-13:10, 22:00-23:43'])] },
    { symbol: 'EU50c', days: week('03:15-22:59', '03:16-22:56') },
    { symbol: 'GER40c', days: week('01:00-23:59', '01:01-23:58') },
    { symbol: 'HK50c', days: week('04:15-07:00, 08:00-13:10, 15:22-00:00', '04:18-07:00, 08:00-11:30, 12:15-21:59', '04:15-07:00, 08:00-13:10, 15:22-00:00', '04:18-07:00, 08:00-11:30, 12:15-21:56') },
    { symbol: 'JPN225c', days: week('01:00-23:59', '01:01-23:58', '01:00-23:56', '01:01-23:56') },
    { symbol: 'UK100c', days: week('01:00-23:59', '01:01-23:58', '01:00-23:57', '01:01-23:57') },
    { symbol: 'US30c', days: week('01:00-24:00', '01:01-23:59', '01:00-23:57', '01:01-23:56') },
    { symbol: 'US500c', days: week('01:00-23:59', '01:01-23:58', '01:00-23:57', '01:01-23:56') },
    { symbol: 'USTECHc', days: week('01:00-23:59', '01:01-23:58', '01:00-23:56', '01:01-23:56') }
  ],
  stocks: [
    { symbol: 'US Stocks', label: 0, days: week('16:30 - 23:00', '16:31 - 23:00', '16:30 - 22:59', '16:31 - 22:59') },
    { symbol: 'EU Stocks', label: 1, days: week('10:00 - 19:29', '10:01 - 19:29') },
    { symbol: 'Asia Stocks', days: week('03:30 - 07:00, 08:00 - 11:00', '03:30 - 07:00, 08:00 - 11:00') }
  ]
};

const minutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** "02:50-09:30, 10:10-23:59" → [[170, 570], [610, 1439]] (an end of 00:00 after the start means midnight). */
export function parseSessions(text) {
  return String(text)
    .split(',')
    .map((part) => part.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/))
    .filter(Boolean)
    .map(([, a, b]) => {
      const start = minutes(a);
      const end = minutes(b);
      return [start, end <= start ? 1440 : end];
    });
}

/** Is `row` tradable at `date`? Weekday index 0 = Monday (GMT). */
export function isOpenAt(row, date) {
  const day = (date.getUTCDay() + 6) % 7;
  if (day > 4) return Boolean(row.always);
  const now = date.getUTCHours() * 60 + date.getUTCMinutes();
  return parseSessions(row.days[day][1]).some(([a, b]) => now >= a && now < b);
}

/** Session strings split for display: "02:50-09:30, 10:10-23:59" → ["02:50 – 09:30", "10:10 – 23:59"]. */
export const sessionLines = (text) =>
  String(text)
    .split(',')
    .map((s) => s.trim().replace(/\s*-\s*/, ' – '))
    .filter(Boolean);
