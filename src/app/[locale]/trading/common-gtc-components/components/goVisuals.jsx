'use client';
/**
 * GTC Go visuals: app tile (GTCFX-ICON.svg), floating hero chips, iPhone home screen,
 * the five in-app screens used by the pillars strip and the multi-device cluster.
 */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Bell, Calendar, Camera, ChevronLeft, Clock3, Cloud, Copy, Folder, Headphones, Home, Image as ImageIcon, LayoutGrid, LineChart, Mail, Map as MapIcon, Minus, Newspaper, Plus, Search, Send, Shield, Wallet } from 'lucide-react';
import { CandleChart } from '@/components/shared/devices';
import { useTicker, FlashPrice, Sparkline, fmt, pct } from '@/components/shared/ticker';
import { CountUp, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------ brand bits */

const GTCFX_APP_ICON = '/GTCFX-ICON.svg';

/** Rounded app icon tile — public/GTCFX-ICON.svg (home screen, push toast, hero). */
export function AppTile({ className, badge = false }) {
  return (
    <span className={cn('relative grid size-16 shrink-0 place-items-center overflow-visible rounded-2xl', className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-brand-700 to-brand-950 shadow-xl shadow-brand/40 ring-1 ring-white/15"
      />
      <Image src={GTCFX_APP_ICON} alt="" width={64} height={64} unoptimized className="relative z-[1] size-[70%] object-contain" />
      {badge && (
        <span className="absolute end-0 top-0 z-[2] grid size-5 translate-x-1/3 -translate-y-1/3 place-items-center rounded-full bg-down text-[10px] font-bold text-white ring-2 ring-black">
          <motion.span className="absolute inset-0 rounded-full bg-down" animate={{ scale: [1, 1.8], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
          <span className="relative">1</span>
        </span>
      )}
    </span>
  );
}

/** 24/7 support gauge card. */
export function SupportChip({ label, className }) {
  return (
    <div className={cn('w-28 rounded-2xl bg-white/15 p-3 text-center text-white shadow-2xl ring-1 ring-white/25 backdrop-blur-md', className)}>
      <svg viewBox="0 0 80 46" className="mx-auto w-16" aria-hidden>
        <path d="M6 42a34 34 0 0 1 68 0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" strokeLinecap="round" />
        <motion.path d="M6 42a34 34 0 0 1 68 0" fill="none" stroke="#2a3fa8" strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: EASE, delay: 0.8 }} />
        <text x="40" y="40" textAnchor="middle" className="fill-white text-[13px] font-bold">24/7</text>
      </svg>
      <div className="mt-1 flex justify-center gap-0.5 text-[8px] text-gold-200">★★★★★</div>
      <div className="mt-1 text-[10px] font-medium text-white/80">{label}</div>
    </div>
  );
}

/** "Execution 38 ms · No requotes" pill. */
export function ExecutionChip({ label, value, className }) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-ink shadow-2xl shadow-black/30', className)}>
      <span className="relative grid size-6 place-items-center rounded-full bg-up/15 text-up">
        <motion.span className="absolute inset-0 rounded-full bg-up/30" animate={{ scale: [1, 1.7], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
        <svg viewBox="0 0 16 16" className="relative size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="m3 8.5 3 3 7-7" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-[9px] text-ink/45">{label}</span>
        <span className="block whitespace-nowrap text-xs font-bold">{value}</span>
      </span>
    </div>
  );
}

/** Small white candle-chart card with a price axis. */
export function ChartChip({ className, seed = 14 }) {
  return (
    <div dir="ltr" className={cn('w-56 rounded-xl bg-white p-2.5 shadow-2xl shadow-black/30', className)}>
      <div className="flex">
        <div className="h-24 flex-1">
          <CandleChart n={18} seed={seed} className="h-full" trigger="mount" showLine={false} />
        </div>
        <div className="flex flex-col justify-between ps-1.5 text-[7px] text-ink/40">
          {['$38K', '$36K', '$34K', '$32K', '$30K'].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
      </div>
      <div className="mt-1 flex justify-between pe-6 text-[7px] text-ink/40">
        {['Apr', 'May', 'Jun', 'Jul'].map((v) => (
          <span key={v}>{v}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ iPhone home screen */

const HOME_APPS = [
  { name: 'Calendar', Icon: Calendar, cls: 'bg-white text-down' },
  { name: 'Photos', Icon: ImageIcon, cls: 'bg-gradient-to-br from-amber-300 via-pink-400 to-sky-400 text-white' },
  { name: 'Camera', Icon: Camera, cls: 'bg-gradient-to-b from-zinc-300 to-zinc-500 text-zinc-800' },
  { name: 'Message', Icon: Mail, cls: 'bg-gradient-to-b from-sky-400 to-blue-600 text-white' },
  { name: 'Maps', Icon: MapIcon, cls: 'bg-gradient-to-br from-emerald-200 to-sky-300 text-blue-600' },
  { name: 'Clock', Icon: Clock3, cls: 'bg-white text-ink' },
  { name: 'Weather', Icon: Cloud, cls: 'bg-gradient-to-b from-sky-400 to-blue-500 text-white' },
  { name: 'File', Icon: Folder, cls: 'bg-white text-sky-500' },
  { name: 'Home', Icon: Home, cls: 'bg-white text-amber-500' },
  { name: 'Newsstand', Icon: Newspaper, cls: 'bg-gradient-to-br from-lime-200 to-emerald-400 text-emerald-900' }
];

/** Big tilted iPhone showing a home screen, the GTCFX app first with a pulsing notification. */
export function HomeScreenPhone({ className }) {
  return (
    <div dir="ltr" className={cn('relative aspect-[9/16] w-[340px] rounded-[3.2rem] bg-gradient-to-br from-zinc-100 to-zinc-400 p-[10px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.6)]', className)} aria-hidden>
      <span className="absolute -start-[4px] top-28 h-10 w-[4px] rounded-s bg-zinc-500" />
      <span className="absolute -start-[4px] top-44 h-16 w-[4px] rounded-s bg-zinc-500" />
      <span className="absolute -start-[4px] top-64 h-16 w-[4px] rounded-s bg-zinc-500" />
      <div className="relative h-full overflow-visible rounded-[2.6rem] px-5 pt-4">
        <div className="absolute inset-0 overflow-hidden rounded-[2.6rem] bg-black" aria-hidden />
        <div className="relative flex items-center justify-between text-[13px] font-semibold text-white">
          <span>11:00</span>
          <span className="h-6 w-24 rounded-full bg-zinc-900" />
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border-2 border-up" />
            <span className="h-2.5 w-5 rounded-sm border border-white/80" />
          </span>
        </div>
        <div className="relative mt-7 grid grid-cols-4 gap-x-3 gap-y-5 px-0.5 pt-1">
          <motion.div className="flex flex-col items-center gap-1.5 overflow-visible" initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }}>
            <AppTile badge className="size-14 rounded-[1.1rem] text-[15px]" />
            <span className="text-[10px] text-white/85">GTCFX</span>
          </motion.div>
          {HOME_APPS.map(({ name, Icon, cls }, i) => (
            <motion.div key={name} className="flex flex-col items-center gap-1.5" initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.3 + i * 0.05 }}>
              <span className={cn('grid size-14 place-items-center rounded-[1.1rem] shadow-md', cls)}>
                <Icon className="size-7" strokeWidth={1.8} />
              </span>
              <span className="text-[10px] text-white/85">{name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ in-app screens (pillars) */

/** Light app-screen card shell, like a cropped screenshot. */
export function AppScreen({ children, className }) {
  return (
    <div dir="ltr" className={cn('relative overflow-hidden rounded-2xl bg-white text-ink shadow-[0_24px_60px_-28px_rgba(41,59,147,0.45)] ring-1 ring-brand/10', className)} aria-hidden>
      {children}
    </div>
  );
}

function AppTopBar() {
  return (
    <div className="flex items-center justify-between px-3 pt-3">
      <span className="text-[11px] font-black italic tracking-tighter text-brand">GTC</span>
      <span className="flex gap-2 text-ink/50">
        <Search className="size-3" />
        <Bell className="size-3" />
        <Headphones className="size-3" />
      </span>
    </div>
  );
}

/** 1 · welcome + market list. */
export function WelcomeScreen() {
  const rows = useTicker(0, 1100);
  const quick = [
    { Icon: LayoutGrid, l: 'Quick Trade' },
    { Icon: Send, l: 'Refer & Earn' },
    { Icon: Shield, l: 'Market Insights' },
    { Icon: Newspaper, l: 'Report Center' }
  ];
  return (
    <AppScreen>
      <AppTopBar />
      <div className="mx-3 mt-3 flex items-center justify-between rounded-xl bg-brand-50/60 p-2.5">
        <span>
          <span className="block text-[10px] font-bold">Welcome back!</span>
          <span className="block text-[7px] text-ink/50">Global markets, trade in one tap</span>
        </span>
        <span className="rounded-full bg-brand-900 px-2.5 py-1 text-[8px] font-semibold text-white">Login</span>
      </div>
      <div className="mt-3 grid grid-cols-4 px-2">
        {quick.map(({ Icon, l }) => (
          <span key={l} className="flex flex-col items-center gap-1 text-center text-[6.5px] text-ink/60">
            <span className="grid size-6 place-items-center rounded-lg bg-brand-50 text-brand">
              <Icon className="size-3" />
            </span>
            {l}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2.5 border-b border-brand/10 px-3 pb-1.5 text-[7.5px] text-ink/45">
        <span className="font-bold text-ink">Metals</span>
        <span>Energy</span>
        <span>FX Minors</span>
        <span>Index</span>
        <span>Stock</span>
      </div>
      <div className="divide-y divide-brand/5 px-3 pb-3">
        {rows.map((r) => (
          <div key={r.s} className="flex items-center justify-between py-2 text-[8.5px]">
            <span>
              <span className="block font-bold">{r.s}</span>
              <span className={cn('text-[7px]', r.change >= 0 ? 'text-up' : 'text-down')}>
                {r.change >= 0 ? '↗' : '↘'} {pct(r.change, true)}
              </span>
            </span>
            <span className="flex gap-3 font-semibold">
              <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-down" />
              <FlashPrice value={r.ask} decimals={r.d} dir={r.dir} tick={r.tick} className="text-down" />
            </span>
          </div>
        ))}
      </div>
    </AppScreen>
  );
}

/** 2 · order ticket with a lot stepper and a pulsing buy button. */
export function OrderScreen() {
  const [r] = useTicker(0, 900);
  const [lot, setLot] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setLot((v) => (v >= 5 ? 1 : v + 1)), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <AppScreen>
      <div className="flex items-center gap-2 border-b border-brand/10 px-3 py-2.5">
        <ChevronLeft className="size-3" />
        <span>
          <span className="block text-[9px] font-bold">Live | 12345678</span>
          <span className="block text-[6.5px] text-ink/45">Balance: 5,327.74 USC · Floating P&L <span className="text-down">-1,042.87</span></span>
        </span>
      </div>
      <div className="flex items-center justify-between px-3 pt-3 text-[10px] font-bold">
        <span>XAUUSD.c ▾</span>
        <LineChart className="size-3 text-ink/50" />
      </div>
      <div className="mx-3 mt-2.5 grid grid-cols-2 overflow-hidden rounded-lg text-center text-[8px] font-semibold">
        <span className="bg-zinc-100 py-1.5">
          Sell
          <span className="block text-[9px]">{fmt(r.bid, 2)}</span>
        </span>
        <span className="bg-up py-1.5 text-white">
          Buy
          <span className="block text-[9px]">{fmt(r.ask, 2)}</span>
        </span>
      </div>
      <div className="mx-3 mt-2 grid grid-cols-2 rounded-lg bg-brand-50/60 p-0.5 text-center text-[8px]">
        <span className="rounded-md bg-white py-1 font-semibold text-brand shadow-sm">Market Order</span>
        <span className="py-1 text-ink/50">Limit Order</span>
      </div>
      <div className="mx-3 mt-2.5 flex items-center justify-between rounded-lg border border-brand/15 px-2.5 py-2 text-[9px] font-semibold">
        <motion.span key={lot} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {(lot * 0.5).toFixed(2)}
        </motion.span>
        <span className="flex gap-2 text-ink/50">
          <Minus className="size-3" />
          <Plus className="size-3" />
        </span>
      </div>
      <div className="mx-3 mt-3 h-1 rounded-full bg-zinc-100">
        <motion.div className="h-full rounded-full bg-up" animate={{ width: `${lot * 18}%` }} transition={{ duration: 0.5, ease: EASE }} />
      </div>
      <div className="mx-3 mt-2 flex justify-between text-[7px] text-ink/45">
        <span>Take Profit & Stop Loss</span>
        <span className="h-3 w-5 rounded-full bg-zinc-200" />
      </div>
      <motion.div className="mx-3 mb-3 mt-3 rounded-lg bg-up py-2 text-center text-[9px] font-bold text-white" animate={{ scale: [1, 0.96, 1] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1 }}>
        {fmt(r.ask, 2)}
        <span className="block">Buy</span>
      </motion.div>
    </AppScreen>
  );
}

/** 3 · account management card with equity count-up. */
export function AccountScreen() {
  const actions = [
    { Icon: LineChart, l: 'Trade', on: true },
    { Icon: Wallet, l: 'Deposit' },
    { Icon: Copy, l: 'Withdraw' },
    { Icon: LayoutGrid, l: 'More' }
  ];
  return (
    <AppScreen>
      <div className="px-3 pt-3 text-[10px] font-bold">Account Management</div>
      <div className="mx-3 mt-2.5 flex gap-1.5 text-[7.5px]">
        <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand">Real</span>
        <span className="px-2 py-0.5 text-ink/45">Demo</span>
        <span className="px-2 py-0.5 text-ink/45">Archived</span>
      </div>
      <div className="mx-3 mt-2.5 rounded-xl border border-ink/80 p-2.5">
        <div className="text-[9px] font-semibold">ml</div>
        <div className="text-[7px] text-ink/45">ID · 12345678 · MT5</div>
        <div className="mt-1 text-base font-bold">
          <CountUp value={5327.74} duration={1.8} /> <span className="text-[8px] font-semibold text-brand">USC</span>
        </div>
        <div className="mt-2 space-y-1 text-[7.5px]">
          {[
            ['Equity', '4,294.18 USC'],
            ['Free Margin', '4,279.47 USC'],
            ['Leverage', '1:100 (Max 1:500)']
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-ink/50">{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 text-center text-[7px]">
          {actions.map(({ Icon, l, on }) => (
            <span key={l} className="flex flex-col items-center gap-1">
              <span className={cn('grid size-6 place-items-center rounded-full', on ? 'bg-brand-900 text-white' : 'bg-zinc-100 text-ink/60')}>
                <Icon className="size-3" />
              </span>
              {l}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-3 mb-3 mt-2.5 grid grid-cols-2 gap-1.5 text-center text-[7.5px] font-semibold">
        <span className="rounded-lg bg-brand-50 py-2 text-brand">Bind External Account</span>
        <span className="rounded-lg bg-brand-900 py-2 text-white">Create Platform Account</span>
      </div>
    </AppScreen>
  );
}

/** 4 · copy-trading providers with return rates. */
export function CopyScreen() {
  const providers = [
    { n: 'Alpha FX', r: 3212.72, s: [2, 3, 3, 5, 4, 7, 9, 12] },
    { n: 'Gold Desk', r: 2976.51, s: [1, 2, 2, 3, 6, 9, 10, 12] },
    { n: 'Trend Lab', r: 2555.41, s: [3, 3, 4, 4, 5, 8, 11, 12] }
  ];
  return (
    <AppScreen>
      <div className="flex items-center justify-between px-3 pt-3 text-[10px] font-bold">
        <ChevronLeft className="size-3" />
        Copy Trading
        <Search className="size-3 text-ink/50" />
      </div>
      <div className="mt-2 flex justify-around border-b border-brand/10 pb-1.5 text-[7.5px] text-ink/45">
        <span className="font-bold text-ink">Smart Copy</span>
        <span>PAMM</span>
        <span>Standard MT4/5 Copy</span>
      </div>
      <div className="divide-y divide-brand/5 px-3 pb-2">
        {providers.map((p, i) => (
          <motion.div key={p.n} className="py-2.5" initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.12 }}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[8.5px] font-bold">
                <span className="size-4 rounded-full bg-gradient-to-br from-brand-400 to-brand-900" />
                {p.n}
              </span>
              <span className="rounded bg-brand-900 px-2 py-0.5 text-[7px] font-semibold text-white">Copy</span>
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <span>
                <span className="block text-[6.5px] text-ink/45">Return Rate</span>
                <span className="text-[11px] font-bold text-up">{fmt(p.r, 2)}%</span>
              </span>
              <Sparkline data={p.s} up width={56} height={20} />
            </div>
          </motion.div>
        ))}
      </div>
    </AppScreen>
  );
}

/** 5 · quote details: chart + sentiment bar + sell/buy. */
export function ChartScreen() {
  const rows = useTicker(7, 1000);
  const gold = rows.find((r) => r.s === 'XAUUSD') ?? rows[0];
  return (
    <AppScreen>
      <div className="flex items-start justify-between px-3 pt-3">
        <span>
          <span className="block text-[9px] font-bold">XAUUSD</span>
          <FlashPrice value={gold.bid} decimals={2} dir={gold.dir} tick={gold.tick} className="text-base font-bold" />
          <span className={cn('block text-[7px]', gold.change >= 0 ? 'text-up' : 'text-down')}>
            {pct(gold.change)}
          </span>
        </span>
        <span className="grid grid-cols-2 gap-x-2 text-[6.5px] text-ink/45">
          <span>High</span>
          <span>Low</span>
          <span className="text-ink">{fmt(gold.p * 1.004, 2)}</span>
          <span className="text-ink">{fmt(gold.p * 0.993, 2)}</span>
        </span>
      </div>
      <div className="mt-2 flex gap-2 px-3 text-[7px] text-ink/45">
        {['1m', '15m', '1h', '4h', '1D', '1W'].map((v, i) => (
          <span key={v} className={cn(i === 0 && 'rounded bg-brand-50 px-1 font-semibold text-brand')}>
            {v}
          </span>
        ))}
      </div>
      <div className="h-40 px-1 pt-1">
        <CandleChart n={30} seed={23} className="h-full" />
      </div>
      <div className="flex h-8 items-end gap-[2px] px-3">
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className={cn('flex-1 rounded-t-[1px]', (i * 7) % 5 < 2 ? 'bg-down/60' : 'bg-up/60')} style={{ height: `${25 + ((i * 37) % 70)}%` }} />
        ))}
      </div>
      <div className="mx-3 mt-2.5 flex h-1 overflow-hidden rounded-full">
        <motion.span className="bg-down" initial={{ width: '50%' }} whileInView={{ width: '66%' }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE }} />
        <span className="flex-1 bg-up" />
      </div>
      <div className="mx-3 mb-3 mt-2.5 grid grid-cols-2 gap-2 text-center text-[8px] font-bold text-white">
        <span className="rounded-md bg-down py-1.5">{fmt(gold.bid, 2)} Sell</span>
        <span className="rounded-md bg-up py-1.5">{fmt(gold.ask, 2)} Buy</span>
      </div>
    </AppScreen>
  );
}

export const PILLAR_SCREENS = [WelcomeScreen, OrderScreen, AccountScreen, CopyScreen, ChartScreen];

/* ------------------------------------------------------------ device cluster */

/** Workstation section art in public/ — layout matches scroll-driven DeviceCluster animation. */
const WORKSTATION_IMAGES = {
  monitor: { src: '/bigscreen1.webp', width: 2163, height: 1921 },
  tablet: { src: '/ipad.webp', width: 918, height: 1290 },
  phoneLeft: { src: '/mobile1.webp', width: 439, height: 887 },
  phoneRight: { src: '/mobile2.webp', width: 444, height: 887 },
  laptop: { src: '/rightlaptop.webp', width: 1968, height: 1220 }
};

function WorkstationDevice({ asset, className }) {
  return (
    // Native img: large PNG mockups load reliably and skip Next image sizing edge cases.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      loading="lazy"
      decoding="async"
      className={cn('block h-auto w-full max-w-full select-none object-contain object-bottom drop-shadow-2xl', className)}
      draggable={false}
    />
  );
}

/**
 * Tablet · phones · laptop composition. `tabletX`, `laptopX` and `phonesY` take motion values,
 * so the parent can "open" the cluster as it scrolls into view.
 */
export function DeviceCluster({ tabletX, laptopX, phonesY, className }) {
  return (
    <div
      dir="ltr"
      className={cn(
        'relative isolate mx-auto w-full max-w-6xl overflow-visible',
        'min-h-[320px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[580px]',
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-x-[8%] bottom-[4%] h-14 rounded-[100%] bg-brand/25 blur-2xl" />
      {/* centre monitor (back) */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-[1] w-[50%] -translate-x-1/2 sm:w-[48%] lg:w-[46%]">
        <WorkstationDevice asset={WORKSTATION_IMAGES.monitor} />
      </div>
      {/* iPad (front-left) */}
      <motion.div className="absolute bottom-0 left-0 z-[3] w-[30%] min-w-[120px] max-w-[320px] sm:w-[28%] md:w-[26%]" style={{ x: tabletX }}>
        <WorkstationDevice asset={WORKSTATION_IMAGES.tablet} />
      </motion.div>
      {/* laptop (front-right) */}
      <motion.div className="absolute bottom-0 right-0 z-[3] w-[40%] min-w-[140px] max-w-[480px] sm:w-[38%] md:w-[36%]" style={{ x: laptopX }}>
        <WorkstationDevice asset={WORKSTATION_IMAGES.laptop} />
      </motion.div>
      {/* phones — mobile1 (left), mobile2 (right) */}
      <motion.div
        className="absolute bottom-0 left-[26%] z-[4] flex w-[26%] min-w-[140px] max-w-[300px] items-end justify-center gap-[5%] md:left-[28%] md:w-[24%]"
        style={{ y: phonesY }}
      >
        <WorkstationDevice asset={WORKSTATION_IMAGES.phoneLeft} className="min-h-[1px] w-[47%] flex-shrink-0" />
        <WorkstationDevice asset={WORKSTATION_IMAGES.phoneRight} className="min-h-[1px] w-[47%] flex-shrink-0" />
      </motion.div>
    </div>
  );
}
