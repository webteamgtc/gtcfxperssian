/**
 * Markets section: one entry per asset class (same order as the Markets menu).
 * Text lives in messages/<locale>/marketsPage.json → marketsPage.instruments.items.<id>.
 *
 * `symbols` are the live-feed symbol names (they must match the quotes WebSocket exactly),
 * `n` is the display name and `d` the price decimals. Confirm the names against the MT5 server
 * (the current site shows e.g. BRNUSD / WTIUSD for oil) and replace any that differ.
 */
import { Globe, Flame, ChartColumn, Gem, Landmark, Wheat } from 'lucide-react';

export const MARKETS = [
  {
    id: 'forex',
    href: '/markets/forex',
    icon: Globe,
    symbols: [
      { s: 'EURUSD', n: 'EUR/USD', d: 5 },
      { s: 'GBPUSD', n: 'GBP/USD', d: 5 },
      { s: 'USDJPY', n: 'USD/JPY', d: 3 }
    ]
  },
  {
    id: 'metals',
    href: '/markets/metals',
    icon: Gem,
    symbols: [
      { s: 'XAUUSD', n: 'Gold', d: 2 },
      { s: 'XAGUSD', n: 'Silver', d: 3 },
      { s: 'XPTUSD', n: 'Platinum', d: 2 }
    ]
  },
  {
    id: 'energy',
    href: '/markets/energy',
    icon: Flame,
    symbols: [
      { s: 'BRNUSD', n: 'Brent', d: 2 },
      { s: 'WTIUSD', n: 'WTI', d: 2 },
      { s: 'NGAS', n: 'Natural Gas', d: 3 }
    ]
  },
  {
    id: 'indices',
    href: '/markets/indices',
    icon: ChartColumn,
    symbols: [
      { s: 'SPX500', n: 'S&P 500', d: 1 },
      { s: 'NAS100', n: 'Nasdaq 100', d: 1 },
      { s: 'UK100', n: 'FTSE 100', d: 1 }
    ]
  },
  {
    id: 'shares',
    href: '/markets/shares',
    icon: Landmark,
    symbols: [
      { s: 'AAPL', n: 'Apple', d: 2 },
      { s: 'NVDA', n: 'NVIDIA', d: 2 },
      { s: 'TSLA', n: 'Tesla', d: 2 }
    ]
  },
  {
    id: 'futures',
    href: '/markets/future-cfds',
    icon: Wheat,
    symbols: [
      { s: 'COFFEE', n: 'Coffee', d: 2 },
      { s: 'COCOA', n: 'Cocoa', d: 1 },
      { s: 'SUGAR', n: 'Sugar', d: 2 }
    ]
  }
];

/** Mixed live strip under the Markets hero (first symbol of every market + a few majors). */
export const MARKETS_TAPE = [
  { s: 'EURUSD', n: 'EUR/USD', d: 5 },
  { s: 'XAUUSD', n: 'Gold', d: 2 },
  { s: 'SPX500', n: 'S&P 500', d: 1 },
  { s: 'BRNUSD', n: 'Brent', d: 2 },
  { s: 'GBPUSD', n: 'GBP/USD', d: 5 },
  { s: 'NAS100', n: 'Nasdaq 100', d: 1 },
  { s: 'XAGUSD', n: 'Silver', d: 3 },
  { s: 'USDJPY', n: 'USD/JPY', d: 3 },
  { s: 'NVDA', n: 'NVIDIA', d: 2 },
  { s: 'WTIUSD', n: 'WTI', d: 2 }
];

/** next-intl locale → TradingView widget locale (unsupported languages fall back to English). */
export const TRADINGVIEW_LOCALE = {
  en: 'en', ar: 'ar_AE', es: 'es', fr: 'fr', it: 'it', pt: 'br', ru: 'ru', tr: 'tr', zh: 'zh_CN', 'zh-TW': 'zh_TW',
  vi: 'vi_VN', th: 'th_TH', id: 'id_ID', ms: 'ms_MY', hi: 'in'
};

/** First symbol of every market, for overview boards. */
export const MARKETS_LEAD = MARKETS.map((m) => ({ ...m.symbols[0], market: m.id }));
