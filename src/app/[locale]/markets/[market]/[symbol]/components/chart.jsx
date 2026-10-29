'use client';
/**
 * Candlestick chart for a symbol page — plain SVG (no chart library, nothing heavy to download).
 *
 * Data: history from /api/symbols/chart (the symbols API's /kchart/chart), then the live bid keeps the
 * last candle moving and opens a new one each period. If the history can't be loaded, the chart is built
 * from live prices only, starting from the first tick. Nothing is invented: until data arrives it says so.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { fmt } from '@/components/shared/ticker';
import { cn } from '@/lib/utils';

export const TIMEFRAMES = [1, 15, 30, 60, 240, 1440]; // minutes, as the API expects
const COUNT = 120;
const UP = '#16a34a';
const DOWN = '#dc2626';

/** One kline entry → { t (ms), o, h, l, c }. Accepts [t, o, h, l, c] arrays or objects with the usual names. */
function toCandle(x) {
  const pick = (...k) => {
    for (const n of k) if (x?.[n] !== undefined && x[n] !== null) return x[n];
    return undefined;
  };
  const [t, o, h, l, c] = Array.isArray(x) ? x : [pick('time', 't', 'ctm', 'date', 'timestamp', 'datetime'), pick('open', 'o'), pick('high', 'h'), pick('low', 'l'), pick('close', 'c')];
  let ms = typeof t === 'string' && !/^\d+$/.test(t) ? Date.parse(t) : Number(t);
  if (ms < 1e12) ms *= 1000; // seconds
  const v = [o, h, l, c].map(Number);
  return Number.isFinite(ms) && v.every(Number.isFinite) ? { t: ms, o: v[0], h: v[1], l: v[2], c: v[3] } : null;
}

/** History + live updates for one symbol and timeframe. status: loading | ready | live (from ticks only) */
export function useCandles(symbol, tf, bid) {
  const [state, setState] = useState({ key: '', candles: [], status: 'loading' });
  const key = `${symbol}:${tf}`;
  const anchor = useRef(null); // real-time bucket of the last candle we moved (server times may be offset)

  useEffect(() => {
    let alive = true;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    anchor.current = null;
    fetch(`/api/symbols/chart?symbol=${encodeURIComponent(symbol)}&date=${tf}&count=${COUNT}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        const list = (Array.isArray(j?.data) ? j.data : []).map(toCandle).filter(Boolean).sort((a, b) => a.t - b.t);
        if (alive) setState({ key, candles: list.slice(-COUNT), status: list.length ? 'ready' : 'live' });
      })
      .catch(() => {
        if (alive) setState({ key, candles: [], status: 'live' });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      ctl.abort();
    };
  }, [symbol, tf, key]);

  useEffect(() => {
    if (bid == null) return;
    const step = tf * 60000;
    const bucket = Math.floor(Date.now() / step) * step;
    setState((s) => {
      if (s.key !== key || s.status === 'loading') return s;
      const list = s.candles.slice();
      const last = list[list.length - 1];
      if (last && (anchor.current === null || anchor.current === bucket)) {
        list[list.length - 1] = { ...last, h: Math.max(last.h, bid), l: Math.min(last.l, bid), c: bid };
      } else {
        list.push({ t: last ? last.t + step : bucket, o: last ? last.c : bid, h: bid, l: bid, c: bid });
      }
      anchor.current = bucket;
      return { ...s, candles: list.slice(-COUNT) };
    });
  }, [bid, tf, key]);

  return state.key === key ? state : { key, candles: [], status: 'loading' };
}

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/**
 * The chart itself. `dark` switches the grid and labels for dark backgrounds.
 * Hover (or touch) shows a crosshair with that candle's open / high / low / close.
 */
export function CandleChart({ candles, status, digits, bid, tf, height = 360, dark = false, className }) {
  const t = useTranslations('marketsPage.symbol');
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const padR = 68;
  const padB = 26;
  const plotW = Math.max(0, width - padR);
  const plotH = height - padB;
  const n = Math.max(10, Math.min(COUNT, Math.floor(plotW / 8)));
  const view = useMemo(() => candles.slice(-n), [candles, n]);

  const { lo, hi } = useMemo(() => {
    if (!view.length) return { lo: 0, hi: 1 };
    let a = Math.min(...view.map((c) => c.l));
    let b = Math.max(...view.map((c) => c.h));
    if (bid != null) {
      a = Math.min(a, bid);
      b = Math.max(b, bid);
    }
    const pad = (b - a || Math.abs(b) * 0.001 || 1) * 0.08;
    return { lo: a - pad, hi: b + pad };
  }, [view, bid]);

  const y = (v) => plotH - ((v - lo) / (hi - lo)) * plotH;
  const step = view.length ? plotW / n : 0;
  const x = (i) => (n - view.length + i) * step + step / 2;
  const body = Math.max(1, step * 0.62);
  const ticks = Array.from({ length: 6 }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / 6);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat('en-GB', tf >= 1440 ? { day: 'numeric', month: 'short', timeZone: 'UTC' } : { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }), [tf]);
  const times = view.length > 4 ? [0.12, 0.37, 0.62, 0.87].map((f) => Math.floor(f * (view.length - 1))) : [];

  const grid = dark ? 'rgba(255,255,255,0.08)' : 'rgba(41,59,147,0.08)';
  const label = dark ? 'rgba(255,255,255,0.45)' : 'rgba(11,11,15,0.45)';
  const h = hover != null ? view[hover] : null;

  const onMove = (e) => {
    if (!view.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.touches?.[0]?.clientX ?? e.clientX) - r.left;
    const i = Math.floor(px / step) - (n - view.length);
    setHover(i >= 0 && i < view.length ? i : null);
  };

  return (
    <div ref={ref} dir="ltr" className={cn('relative w-full select-none', className)} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} className="block" role="img" aria-label={t('chartLabel')} onMouseMove={onMove} onTouchMove={onMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <clipPath id="cc-reveal">
              <motion.rect key={`${tf}-${view.length > 0}`} x="0" y="0" height={height} initial={{ width: 0 }} animate={{ width }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
            </clipPath>
          </defs>
          {ticks.map((v) => (
            <g key={v}>
              <line x1="0" x2={plotW} y1={y(v)} y2={y(v)} stroke={grid} strokeDasharray="3 4" />
              <text x={width - 4} y={y(v) + 4} textAnchor="end" fontSize="11" fill={label} className="tabular-nums">
                {fmt(v, digits)}
              </text>
            </g>
          ))}
          {times.map((i) => (
            <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="11" fill={label}>
              {timeFmt.format(view[i].t)}
            </text>
          ))}
          <g clipPath="url(#cc-reveal)">
            {view.map((c, i) => {
              const color = c.c >= c.o ? UP : DOWN;
              const top = y(Math.max(c.o, c.c));
              return (
                <g key={c.t} opacity={hover == null || hover === i ? 1 : 0.55}>
                  <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1" />
                  <rect x={x(i) - body / 2} y={top} width={body} height={Math.max(1, y(Math.min(c.o, c.c)) - top)} fill={color} rx={body > 4 ? 1 : 0} />
                </g>
              );
            })}
          </g>
          {bid != null && view.length > 0 && (
            <g>
              <line x1="0" x2={plotW} y1={y(bid)} y2={y(bid)} stroke={dark ? '#c9a27a' : '#293b93'} strokeWidth="1.2" />
              <rect x={plotW + 2} y={y(bid) - 11} width={padR - 4} height="22" rx="5" fill={dark ? '#b68756' : '#293b93'} />
              <text x={plotW + padR / 2} y={y(bid) + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" className="tabular-nums">
                {fmt(bid, digits)}
              </text>
            </g>
          )}
          {h && (
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={plotH} stroke={dark ? 'rgba(255,255,255,0.35)' : 'rgba(41,59,147,0.35)'} strokeDasharray="2 3" />
          )}
        </svg>
      )}
      {h && (
        <div className={cn('pointer-events-none absolute start-2 top-2 flex flex-wrap gap-x-3 gap-y-0.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold tabular-nums backdrop-blur', dark ? 'bg-white/10 text-white' : 'bg-white/90 text-ink shadow-sm ring-1 ring-brand/10')}>
          <span className="opacity-60">{timeFmt.format(h.t)}</span>
          {['o', 'h', 'l', 'c'].map((k) => (
            <span key={k}>
              <span className="opacity-50">{t(`ohlc.${k}`)}</span> {fmt(h[k], digits)}
            </span>
          ))}
        </div>
      )}
      {!view.length && (
        <div className={cn('absolute inset-0 grid place-items-center text-sm', dark ? 'text-white/50' : 'text-ink/45')}>
          <span className="inline-flex items-center gap-2">
            <span className={cn('size-2 animate-pulse rounded-full', dark ? 'bg-gold-200' : 'bg-brand')} />
            {status === 'loading' ? t('chartLoading') : t('chartWaiting')}
          </span>
        </div>
      )}
    </div>
  );
}

/** 1m · 15m · 30m · 1h · 4h · 1d pill switcher */
export function TimeframeTabs({ value, onChange, dark = false, className }) {
  const t = useTranslations('marketsPage.symbol.timeframes');
  return (
    <div role="tablist" aria-label={t('label')} dir="ltr" className={cn('flex items-center gap-1', className)}>
      {TIMEFRAMES.map((m) => (
        <button key={m} type="button" role="tab" aria-selected={m === value} onClick={() => onChange(m)} className={cn('relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-3.5 sm:text-[13px]', m === value ? 'text-white' : dark ? 'text-white/55 hover:text-white' : 'text-ink/50 hover:text-brand')}>
          {m === value && <motion.span layoutId={`tf-${dark ? 'd' : 'l'}`} className={cn('absolute inset-0 rounded-full', dark ? 'bg-gold' : 'bg-brand')} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative">{t(String(m))}</span>
        </button>
      ))}
    </div>
  );
}
