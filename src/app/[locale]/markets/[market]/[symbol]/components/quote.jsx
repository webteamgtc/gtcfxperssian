'use client';
/**
 * Symbol page — top section: dark "terminal" hero with the live quote, Sell / Buy, the chart and a stats strip.
 * Copy: marketsPage.symbol. The H1 is the symbol. Prices come from the live feed ("—" until the first tick).
 * Behind it, two faint layers of candles drift sideways (decoration only, see CandleBackdrop).
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Info } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { FlashPrice, fmt, pct } from '@/components/shared/ticker';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { LiveDot, rangePos } from '../../components/shared';
import { useSymbol, useSymT, useFigures, Swap, SymbolCrumb } from './shared';
import { CandleChart, TimeframeTabs, useCandles } from './chart';

/** Load-time stagger for above-the-fold tiles (no waiting on scroll observers). */
const Rise = ({ i = 0, className, children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 + i * 0.06, ease: EASE }} className={className}>
    {children}
  </motion.div>
);

/* ---------- decorative backdrop: drifting candles ---------- */

/** Fixed pseudo-random candles (same on server and browser, so no hydration mismatch). Not market data. */
function makeCandles(n, seed, w, h) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let price = h * 0.55;
  const step = w / n;
  return Array.from({ length: n }, (_, i) => {
    const o = price;
    const c = Math.min(h * 0.85, Math.max(h * 0.2, o + (rnd() - 0.48) * h * 0.12));
    const hi = Math.min(o, c) - rnd() * h * 0.05;
    const lo = Math.max(o, c) + rnd() * h * 0.05;
    price = c;
    return { x: i * step + step / 2, o, c, hi, lo, up: c <= o, bw: step * 0.55 };
  });
}
const FAR = makeCandles(48, 7, 1600, 520);
const NEAR = makeCandles(28, 42, 1600, 360);

/** One strip of candles, drawn twice side by side so the drift loops without a seam. */
function CandleStrip({ data, width, height, className, style }) {
  const strip = (dx) =>
    data.map((c) => (
      <g key={`${dx}-${c.x}`}>
        <line x1={c.x + dx} x2={c.x + dx} y1={c.hi} y2={c.lo} stroke={c.up ? '#22c55e' : '#ef4444'} strokeWidth="2" />
        <rect x={c.x + dx - c.bw / 2} y={Math.min(c.o, c.c)} width={c.bw} height={Math.max(3, Math.abs(c.c - c.o))} rx="2" fill={c.up ? '#22c55e' : '#ef4444'} />
      </g>
    ));
  return (
    <div className={cn('candle-drift absolute flex w-[200%]', className)} style={style}>
      <svg viewBox={`0 0 ${width * 2} ${height}`} preserveAspectRatio="none" className="h-full w-full">
        {strip(0)}
        {strip(width)}
      </svg>
    </div>
  );
}

/** Two candle layers at different depths + a slow glow. Faded at the edges and kept faint so text stays readable. */
function CandleBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_80%,transparent)]" aria-hidden>
      <CandleStrip data={FAR} width={1600} height={520} className="inset-x-0 top-[6%] h-[64%] opacity-[0.16]" style={{ '--drift': '90s' }} />
      <CandleStrip data={NEAR} width={1600} height={360} className="inset-x-0 bottom-[4%] h-[42%] opacity-[0.24]" style={{ '--drift': '55s' }} />
      <motion.span className="absolute -start-32 top-20 size-[420px] rounded-full bg-brand/40 blur-[120px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 7, repeat: Infinity }} />
      <span className="absolute -end-24 bottom-0 size-80 rounded-full bg-gold/15 blur-[110px]" />
    </div>
  );
}

/* ---------- pieces ---------- */

function Pills() {
  const { page } = useSymbol();
  const t = useSymT();
  const tp = useTranslations(`marketsPage.pages.${page.id}`);
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-white backdrop-blur">
        <LiveDot />
        {t('liveQuote')}
      </span>
      <span className="text-white/60">{t('brand', { market: tp('name') })}</span>
    </div>
  );
}

function Title() {
  const { sym } = useSymbol();
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <h1 className="heading-display is-dark" dir="ltr">
        {sym.s}
      </h1>
      <p className="text-lg text-white/65 md:text-xl">{sym.n}</p>
    </div>
  );
}

function BigPrice() {
  const { row } = useSymbol();
  const f = useFigures();
  const up = row.change == null || row.change >= 0;
  return (
    <div className="flex flex-wrap items-center gap-4" dir="ltr">
      <FlashPrice value={row.bid} decimals={f.d} dir={row.dir} tick={row.tick} className="text-4xl font-bold tracking-tight text-white md:text-5xl" />
      <span className={cn('inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold tabular-nums', row.change == null ? 'bg-white/10 text-white/50' : up ? 'bg-green-400/15 text-green-300' : 'bg-red-400/15 text-red-300')}>
        {pct(row.change)}
        {f.changeAbs != null && ` (${f.changeAbs >= 0 ? '+' : ''}${fmt(f.changeAbs, f.d)})`}
      </span>
    </div>
  );
}

function RangeBar() {
  const { row } = useSymbol();
  const f = useFigures();
  const t = useSymT();
  const p = rangePos(row);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>{t('range')}</span>
        <span dir="ltr" className="tabular-nums">
          {fmt(row.low, f.d)} – {fmt(row.high, f.d)}
        </span>
      </div>
      <div dir="ltr" className="relative mt-2 h-2 rounded-full bg-gradient-to-r from-down via-gold to-up opacity-90">
        {p != null && <motion.span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand shadow" animate={{ left: `${p}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />}
      </div>
    </div>
  );
}

/* ---------- section ---------- */

export function QuoteTerminal() {
  const { sym, row } = useSymbol();
  const f = useFigures();
  const t = useSymT();
  const [tf, setTf] = useState(1);
  const chart = useCandles(sym.s, tf, row.bid);
  const cells = [
    ['spread', <span key="s" dir="ltr">{f.spread}</span>],
    ['dayHigh', <span key="h" dir="ltr" className="tabular-nums">{fmt(row.high, f.d)}</span>],
    ['dayLow', <span key="l" dir="ltr" className="tabular-nums">{fmt(row.low, f.d)}</span>],
    ['swapLong', <Swap key="sl" value={f.swapLong} />],
    ['swapShort', <Swap key="ss" value={f.swapShort} />]
  ];
  return (
    <section className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-950 via-[#0d1233] to-ink pb-16 pt-28 text-white md:pb-24 md:pt-36">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <CandleBackdrop />
      <div className="container-x relative">
        <SymbolCrumb tone="dark" className="justify-start" />
        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="space-y-5">
            <Pills />
            <Title />
            <BigPrice />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: EASE }} className="grid grid-cols-2 gap-3 sm:w-96" dir="ltr">
            {[
              ['sellNow', row.bid, 'bg-[#e23b3b] hover:bg-[#c92f2f]'],
              ['buyNow', row.ask, 'bg-[#0ea371] hover:bg-[#0b8a5f]']
            ].map(([k, v, bg]) => (
              <NavLink key={k} href={LIVE_ACCOUNT_HREF} className={cn('rounded-2xl px-4 py-3.5 text-center shadow-lg transition-colors', bg)}>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/85">{t(k)}</span>
                <span className="mt-0.5 block text-xl font-bold tabular-nums">{fmt(v, f.d)}</span>
              </NavLink>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: EASE }} className="mt-10 rounded-[2rem] border border-white/10 bg-brand-950/55 p-4 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)] backdrop-blur-[6px] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/85" dir="ltr">
              <LiveDot /> {sym.s} · {sym.n}
            </p>
            <TimeframeTabs value={tf} onChange={setTf} dark />
          </div>
          <CandleChart className="mt-4" candles={chart.candles} status={chart.status} digits={f.d} bid={row.bid} tf={tf} height={420} dark />
        </motion.div>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-6">
          {cells.map(([k, v], i) => (
            <Rise key={k} i={i} className="bg-brand-950/85 px-4 py-4">
              <p className="text-xs text-white/55">{t(k)}</p>
              <p className="mt-1 text-[15px] font-semibold">{v}</p>
            </Rise>
          ))}
          <Rise i={cells.length} className="bg-brand-950/85 px-4 py-4">
            <RangeBar />
          </Rise>
        </div>
        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-white/55">
          <Info className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden />
          {t('disclaimer')}
        </p>
      </div>
    </section>
  );
}
