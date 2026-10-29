'use client';
/**
 * Decorative, animated "terminal" panels for the MetaTrader feature rows (aria-hidden).
 * Labels inside are mock UI, like the other device mockups on the site.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { useTicker, FlashPrice, pct } from '@/components/shared/ticker';
import { CountUp } from '@/components/motion';
import { cn } from '@/lib/utils';

/** Mac-style window with a label chip. */
export function AppWindow({ label, children, className }) {
  return (
    <div dir="ltr" className={cn('relative overflow-hidden rounded-[1.5rem] border border-brand/10 bg-white shadow-[0_30px_80px_-40px_rgba(41,59,147,0.45)]', className)} aria-hidden>
      <div className="flex items-center gap-1.5 border-b border-brand/10 bg-[#f6f7fb] px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-auto rounded-md bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand/70">{label}</span>
      </div>
      {children}
    </div>
  );
}

/* 01 — chart with indicators, a line that draws in and BUY / TP markers */
export function ChartPanel() {
  const W = 400;
  const H = 180;
  const path = 'M0 150 C 40 130, 70 110, 110 112 S 150 128, 180 112 S 240 60, 280 52 S 340 40, 400 18';
  return (
    <AppWindow label="XAUUSD · H1">
      <div className="relative p-4">
        <div className="flex gap-2">
          {['RSI · 64.2', 'MACD · 0.0023', 'BBands · 20'].map((c) => (
            <span key={c} className="rounded-md border border-brand/10 bg-white px-2 py-0.5 text-[10px] text-ink/55">
              {c}
            </span>
          ))}
        </div>
        <div className="bg-grid-light relative mt-3 h-48 overflow-hidden rounded-xl">
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mt-chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#293b93" stopOpacity="0.18" />
                <stop offset="1" stopColor="#293b93" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path d={`${path} L${W} ${H} L0 ${H} Z`} fill="url(#mt-chart-fill)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.8 }} />
            <motion.path d={path} fill="none" stroke="#293b93" strokeWidth="2.5" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
            <path d="M0 170 L400 90" fill="none" stroke="#b68756" strokeWidth="1.5" strokeDasharray="5 5" />
          </svg>
          {[
            [18, 42, 'bg-up'],
            [36, 30, 'bg-down'],
            [56, 26, 'bg-up'],
            [70, 18, 'bg-up'],
            [86, 22, 'bg-up']
          ].map(([x, h, c], i) => (
            <motion.span key={i} className={cn('absolute bottom-[38%] w-1.5 rounded-sm', c)} style={{ left: `${x}%` }} initial={{ height: 0 }} whileInView={{ height: h }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.15 }} />
          ))}
          <motion.span className="absolute left-[28%] top-[52%] rounded-md bg-up/10 px-1.5 py-0.5 text-[11px] font-bold text-up" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1 }}>
            BUY 2.50
          </motion.span>
          <motion.span className="absolute right-[18%] top-[12%] rounded-md bg-down/10 px-1.5 py-0.5 text-[11px] font-bold text-down" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.6 }}>
            TP 2,418
          </motion.span>
        </div>
      </div>
    </AppWindow>
  );
}

/* 02 — Expert Advisors running, returns ticking, backtest curve */
const EAS = [
  { id: 'T1', name: 'TrendPro v2.4', meta: 'EURUSD · M15 · 142 trades', ret: 18.4, cls: 'bg-brand' },
  { id: 'SC', name: 'ScalpEdge', meta: 'XAUUSD · M5 · 86 trades', ret: 12.1, cls: 'bg-gold' },
  { id: 'GR', name: 'GridReversal', meta: 'GBPUSD · H1 · 38 trades', ret: 7.8, cls: 'bg-up' }
];
export function EaPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <AppWindow label="Expert Advisors · 3 active">
      <div className="space-y-2.5 p-4">
        {EAS.map((ea, i) => {
          const v = (ea.ret + Math.sin((tick + i * 2) / 2) * 0.3).toFixed(1);
          return (
            <motion.div key={ea.id} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex items-center gap-3 rounded-xl border border-brand/10 bg-white px-3.5 py-3">
              <span className={cn('grid size-8 place-items-center rounded-lg text-[10px] font-bold text-white', ea.cls)}>{ea.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{ea.name}</span>
                <span className="block text-[10px] text-ink/45">{ea.meta}</span>
              </span>
              <span className="text-end">
                <span className="block text-sm font-bold tabular-nums text-up">+{v}%</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-ink/45">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-up" />
                  </span>
                  running
                </span>
              </span>
            </motion.div>
          );
        })}
        <div className="rounded-xl border border-brand/10 bg-white px-3.5 py-3">
          <div className="flex justify-between text-[11px]">
            <span className="text-ink/45">Backtest · 12 months</span>
            <span className="font-bold text-up">+ 42.7%</span>
          </div>
          <svg viewBox="0 0 300 50" className="mt-1 h-12 w-full" preserveAspectRatio="none">
            <motion.path d="M0 45 C 60 42, 110 38, 160 30 S 240 14, 300 10" fill="none" stroke="#293b93" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, delay: 0.3 }} />
          </svg>
        </div>
      </div>
    </AppWindow>
  );
}

/* 03 — order ticket; the order type cycles and the place button pulses */
export function OrderTicket({ types = ['Buy Limit', 'Sell Limit', 'Buy Stop', 'Sell Stop'] }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((v) => (v + 1) % types.length), 1800);
    return () => clearInterval(id);
  }, [types.length]);
  const field = 'rounded-lg border border-brand/10 bg-white px-3 py-2 text-xs';
  return (
    <AppWindow label="Order Ticket · EURUSD">
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-up/50 bg-up/5 px-3 py-2.5">
            <span className="block text-[9px] text-ink/40">BID</span>
            <span className="text-sm font-bold text-up">BUY · 1.08742</span>
          </div>
          <div className="rounded-xl border-2 border-down/50 bg-down/5 px-3 py-2.5">
            <span className="block text-[9px] text-ink/40">ASK</span>
            <span className="text-sm font-bold text-down">SELL · 1.08745</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px] text-ink/50">
          <div>
            Volume (lots)
            <div className={cn(field, 'mt-1 text-ink')}>1.00</div>
          </div>
          <div>
            Type
            <motion.div key={k} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={cn(field, 'mt-1 font-semibold text-brand')}>
              {types[k]} ▾
            </motion.div>
          </div>
          <div>
            Stop Loss
            <div className={cn(field, 'mt-1 text-down')}>1.08600</div>
          </div>
          <div>
            Take Profit
            <div className={cn(field, 'mt-1 text-up')}>1.09000</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-gold/40 bg-gold-50/60 px-3 py-2 text-[11px] text-ink/70">
          <Zap className="size-3.5 text-gold" /> Trailing Stop · 25 pips
        </div>
        <motion.div className="rounded-xl bg-brand py-2.5 text-center text-xs font-semibold text-white" animate={{ boxShadow: ['0 0 0 0 rgba(41,59,147,0.35)', '0 0 0 10px rgba(41,59,147,0)'] }} transition={{ duration: 1.8, repeat: Infinity }}>
          Place Order — 1 click
        </motion.div>
      </div>
    </AppWindow>
  );
}

/* 04 — live positions with a floating P&L that counts up */
const POS = [
  { side: 'BUY', sym: 'EUR / USD', lot: '1.00 lot', pl: '+$420' },
  { side: 'BUY', sym: 'XAU / USD', lot: '0.50 lot', pl: '+$1,640' },
  { side: 'SELL', sym: 'USD/JPY', lot: '0.75 lot', pl: '+$215' },
  { side: 'BUY', sym: 'US500', lot: '2.0 lot', pl: '+$572' }
];
export function PositionsPanel() {
  return (
    <AppWindow label="Live Positions · 4 open">
      <div className="p-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] text-ink/45">Floating P&L</span>
            <div className="text-3xl font-bold text-up">
              +$<CountUp value={2847} />
              .20
            </div>
          </div>
          <div className="text-end">
            <span className="text-[11px] text-ink/45">Equity</span>
            <div className="text-sm font-bold text-ink">$52,847.20</div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {POS.map((p, i) => (
            <motion.div key={p.sym} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-3 rounded-xl border border-brand/10 px-3 py-2.5 text-sm">
              <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold', p.side === 'BUY' ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>{p.side}</span>
              <span className="flex-1 font-semibold text-ink">{p.sym}</span>
              <span className="text-xs text-ink/45">{p.lot}</span>
              <span className="w-16 text-end text-xs font-bold text-up">{p.pl}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
          <span className="rounded-xl bg-brand py-2.5 text-center text-white">Close All</span>
          <span className="rounded-xl border border-brand/15 py-2.5 text-center text-ink">Close Profitable</span>
        </div>
      </div>
    </AppWindow>
  );
}

/* 05 — market watch with live, flashing quotes */
export function MarketWatch() {
  const fx = useTicker(7, 1300);
  const idx = useTicker(8, 1500);
  const metals = useTicker(0, 1600);
  const cols = useMemo(
    () => [
      { head: 'Forex · 60+', rows: fx.slice(0, 3) },
      { head: 'Forex · Crosses', rows: fx.slice(3, 5) },
      { head: 'Indices · 25+', rows: idx.slice(0, 2) },
      { head: 'Commodities', rows: metals.slice(0, 1) }
    ],
    [fx, idx, metals]
  );
  return (
    <AppWindow label="Market Watch · 200+ symbols">
      <div className="grid grid-cols-2 divide-x divide-brand/10">
        {[cols.slice(0, 1).concat(cols.slice(2, 3)), cols.slice(1, 2).concat(cols.slice(3, 4))].map((side, s) => (
          <div key={s}>
            {side.map((g) => (
              <div key={g.head}>
                <div className="border-y border-brand/10 bg-brand-50/60 px-4 py-2 text-[11px] text-ink/50 first:border-t-0">{g.head}</div>
                {g.rows.map((r) => (
                  <div key={r.s} className="flex items-center justify-between border-b border-brand/5 px-4 py-2.5">
                    <span>
                      <span className="block text-xs font-semibold text-ink">{r.s}</span>
                      <span className="block text-[9px] text-ink/40">{r.n}</span>
                    </span>
                    <span className="text-end">
                      <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-xs font-bold text-ink" />
                      <span className={cn('block text-[9px] font-semibold', r.change >= 0 ? 'text-up' : 'text-down')}>
                                                {pct(r.change)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </AppWindow>
  );
}
