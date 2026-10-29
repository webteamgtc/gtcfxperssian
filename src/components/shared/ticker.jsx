'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { quotesWsManager } from '@/lib/symbols/gtcTraderQuotesWs';
import { cn } from '@/lib/utils';

/**
 * Live quotes for the tickers, menus and app mock-ups.
 * Prices come only from the GTC live feed (src/lib/symbols/gtcTraderQuotesWs.js).
 * Until a symbol's first tick arrives its row has bid/ask/change = null and the
 * helpers below render "—" — the site never shows made-up prices.
 * `s` must match the feed's symbol name, `d` is the display decimals.
 */
export const TICKER_GROUPS = [
  [
    { s: 'XAUUSD', n: 'Gold', d: 2 },
    { s: 'XAGUSD', n: 'Silver', d: 3 },
    { s: 'XPTUSD', n: 'Platinum', d: 2 },
    { s: 'XPDUSD', n: 'Palladium', d: 2 }
  ],
  [
    { s: 'UKOIL', n: 'Brent Crude', d: 2 },
    { s: 'USOIL', n: 'WTI Crude', d: 2 },
    { s: 'NGAS', n: 'Natural Gas', d: 3 },
    { s: 'GASOIL', n: 'Gasoil', d: 1 }
  ],
  [
    { s: 'EURGBP', n: 'Euro / Pound', d: 5 },
    { s: 'EURJPY', n: 'Euro / Yen', d: 3 },
    { s: 'GBPJPY', n: 'Pound / Yen', d: 3 },
    { s: 'AUDNZD', n: 'Aussie / Kiwi', d: 5 }
  ],
  [
    { s: 'AAPL', n: 'Apple', d: 2 },
    { s: 'NVDA', n: 'NVIDIA', d: 2 },
    { s: 'TSLA', n: 'Tesla', d: 2 },
    { s: 'AMZN', n: 'Amazon', d: 2 }
  ],
  [
    { s: 'US30', n: 'Dow Jones', d: 1 },
    { s: 'NAS100', n: 'Nasdaq 100', d: 1 },
    { s: 'SPX500', n: 'S&P 500', d: 1 },
    { s: 'GER40', n: 'DAX 40', d: 1 }
  ],
  // extra groups (not shown as ticker tabs): crypto, soft commodities
  [
    { s: 'BTCUSD', n: 'Bitcoin', d: 1 },
    { s: 'ETHUSD', n: 'Ethereum', d: 1 },
    { s: 'SOLUSD', n: 'Solana', d: 2 },
    { s: 'XRPUSD', n: 'Ripple', d: 3 }
  ],
  [
    { s: 'COFFEE', n: 'Coffee', d: 1 },
    { s: 'COCOA', n: 'Cocoa', d: 1 },
    { s: 'SUGAR', n: 'Sugar', d: 2 },
    { s: 'WHEAT', n: 'Wheat', d: 1 }
  ],
  // 7: menu "Recommendations"
  [
    { s: 'EURUSD', n: 'Euro / Dollar', d: 5 },
    { s: 'GBPUSD', n: 'Pound / Dollar', d: 5 },
    { s: 'USDJPY', n: 'Dollar / Yen', d: 3 },
    { s: 'USDCHF', n: 'Dollar / Franc', d: 5 },
    { s: 'XAUUSD', n: 'Gold', d: 2 }
  ],
  // 8: menu "Popular indices"
  [
    { s: 'US30', n: 'Wall Street', d: 1 },
    { s: 'SPX500', n: 'US SP 500', d: 1 },
    { s: 'NAS100', n: 'US Tech 100', d: 1 }
  ]
];
export const TAB_GROUPS = 5;

const HISTORY = 24;
const blank = (x) => ({ ...x, bid: null, ask: null, low: null, high: null, dir: 1, change: null, hist: [], tick: 0, live: false });

/**
 * Live rows for any list of `{ s, n, d }` items (keep the array reference stable, e.g. a module constant or useMemo).
 * Row: { ...item, bid, ask, low, high, dir, change, hist, tick, live } — prices are null until the first tick.
 * Updates are applied at most every `interval` ms.
 */
export function useLiveRows(base, interval = 1000) {
  const empty = useMemo(() => base.map(blank), [base]);
  const [state, setState] = useState({ base, rows: empty });

  useEffect(() => {
    let latest = {};
    let dirty = false;
    const unsubscribe = quotesWsManager.subscribe(
      base.map((x) => x.s),
      (snapshot) => {
        latest = snapshot;
        dirty = true;
      }
    );
    const id = setInterval(() => {
      if (!dirty) return;
      dirty = false;
      setState((prev) => {
        const rows = (prev.base === base ? prev.rows : empty).map((r) => {
          const q = latest[r.s];
          if (!q || !Number.isFinite(q.sellNum) || !Number.isFinite(q.buyNum)) return r;
          if (q.sellNum === r.bid && q.buyNum === r.ask) return r;
          const bid = q.sellNum;
          return {
            ...r,
            bid,
            ask: q.buyNum,
            low: Number.isFinite(q.dayLow) ? q.dayLow : r.low,
            high: Number.isFinite(q.dayHigh) ? q.dayHigh : r.high,
            dir: r.bid == null || bid >= r.bid ? 1 : -1,
            change: Number.isFinite(q.prevClose) && q.prevClose > 0 ? ((bid - q.prevClose) / q.prevClose) * 100 : r.change,
            hist: [...r.hist, bid].slice(-HISTORY),
            tick: r.tick + 1,
            live: true
          };
        });
        return { base, rows };
      });
    }, interval);
    return () => {
      clearInterval(id);
      unsubscribe();
    };
  }, [base, empty, interval]);

  return state.base === base ? state.rows : empty;
}

/** Rows for one TICKER_GROUPS entry. */
export function useTicker(groupIndex = 0, interval = 1000) {
  return useLiveRows(TICKER_GROUPS[groupIndex] ?? TICKER_GROUPS[0], interval);
}

const DASH = '—';

/** Number with fixed decimals, or "—" while there is no live value. */
export const fmt = (v, d) =>
  v == null || !Number.isFinite(Number(v)) ? DASH : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Percent change: "+0.12%" (or "0.12%" with abs), "—" while loading. */
export const pct = (v, abs = false) => (v == null ? DASH : `${abs ? Math.abs(v).toFixed(2) : `${v >= 0 ? '+' : ''}${v.toFixed(2)}`}%`);


export function Sparkline({ data, up, className, width = 90, height = 30 }) {
  if (!data || data.length < 2) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className={className} width={width} height={height} aria-hidden>
        <path d={`M0,${height / 2} L${width},${height / 2}`} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 3" fill="none" />
      </svg>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / (max - min || 1)) * (height - 4) - 2]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const color = up ? '#16a34a' : '#dc2626';
  const id = `sg-${up ? 'u' : 'd'}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} width={width} height={height} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Price that flashes green/red when it changes */
export function FlashPrice({ value, decimals, dir, tick, className }) {
  return (
    <span className={cn('relative inline-flex tabular-nums', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={tick}
          initial={{ y: dir > 0 ? 10 : -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: dir > 0 ? -10 : 10, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={cn(tick > 0 && (dir > 0 ? 'text-up' : 'text-down'))}
        >
          {fmt(value, decimals)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function SymbolBadge({ symbol, className }) {
  return (
    <span
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-xs font-bold text-brand',
        className
      )}
    >
      {symbol.slice(0, 2)}
    </span>
  );
}

export function UpDown({ dir, className }) {
  return (
    <motion.span animate={{ rotate: dir > 0 ? 0 : 180 }} className={cn('inline-flex', dir > 0 ? 'text-up' : 'text-down', className)}>
      <ArrowUp className="size-3.5" strokeWidth={2.5} />
    </motion.span>
  );
}
