'use client';
import { useMemo, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function makeCandles(n = 32, seed = 7, start = 100) {
  const r = rand(seed);
  const out = [];
  let o = start;
  for (let i = 0; i < n; i++) {
    const c = o + (r() - 0.45) * 6;
    const h = Math.max(o, c) + r() * 3;
    const l = Math.min(o, c) - r() * 3;
    out.push({ o, c, h, l });
    o = c;
  }
  return out;
}

/** Animated candlestick chart — candles grow in one after another */
/** `data` ([{ o, h, l, c }]) draws real candles; without it a seeded demo series is drawn. */
export function CandleChart({ n = 32, seed = 7, data, className, dark = false, animateIn = true, showLine = true, trigger = 'view' }) {
  const candles = useMemo(() => (data?.length ? data : makeCandles(n, seed)), [data, n, seed]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const show = !animateIn || trigger === 'mount' || inView;
  const W = 320;
  const H = 160;
  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const y = (v) => H - ((v - min) / (max - min || 1)) * (H - 10) - 5;
  const cw = W / candles.length;
  const line = candles.map((c, i) => `${i ? 'L' : 'M'}${(i * cw + cw / 2).toFixed(1)},${y(c.c).toFixed(1)}`).join(' ');

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={cn('w-full', className)} preserveAspectRatio="none" aria-hidden>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(41,59,147,0.08)'} strokeDasharray="3 4" />
      ))}
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const color = up ? '#16a34a' : '#dc2626';
        const x = i * cw + cw / 2;
        return (
          <motion.g
            key={i}
            initial={animateIn ? { opacity: 0, scaleY: 0 } : false}
            animate={show ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
            transition={{ delay: i * 0.03, duration: 0.5 }}
            style={{ originY: `${y((c.o + c.c) / 2)}px`, transformBox: 'view-box' }}
          >
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1" />
            <rect x={x - cw * 0.3} width={cw * 0.6} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={color} rx="0.8" />
          </motion.g>
        );
      })}
      {showLine && (
        <motion.path
          d={line}
          fill="none"
          stroke="#b68756"
          strokeWidth="1.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: show ? 1 : 0 }}
          transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
        />
      )}
    </svg>
  );
}

/** Smooth area line chart */
export function AreaChart({ className, seed = 3, dark = false, color = '#293b93' }) {
  const pts = useMemo(() => {
    const r = rand(seed);
    let v = 50;
    return Array.from({ length: 40 }, (_, i) => {
      v += (r() - 0.42) * 8;
      return [i * (400 / 39), v];
    });
  }, [seed]);
  const min = Math.min(...pts.map((p) => p[1]));
  const max = Math.max(...pts.map((p) => p[1]));
  const yy = (v) => 140 - ((v - min) / (max - min)) * 120 - 10;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${yy(p[1]).toFixed(1)}`).join(' ');
  const gid = `ac-${seed}`;
  return (
    <svg viewBox="0 0 400 150" className={cn('w-full', className)} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={dark ? 0.45 : 0.25} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L400,150 L0,150 Z`}
        fill={`url(#${gid})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.8 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function TradeScreen({ symbol = 'EURUSD', price = '1.16035', dark = false, compact = false, seed = 7 }) {
  return (
    <div className={cn('flex h-full flex-col', dark ? 'bg-[#0d1130] text-white' : 'bg-white text-ink')}>
      <div className="flex items-center justify-between px-3 pt-3">
        <span className={cn('text-[10px] font-black tracking-tight', dark ? 'text-white' : 'text-brand')}>GTC</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn('size-1.5 rounded-full', dark ? 'bg-white/30' : 'bg-brand/20')} />
          ))}
        </span>
      </div>
      <div className="px-3 pt-2">
        <div className="text-[9px] font-semibold opacity-60">{symbol}</div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn('font-bold tabular-nums', compact ? 'text-sm' : 'text-base')}>{price}</span>
          <span className="text-[9px] font-semibold text-up">+0.42%</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 px-1 py-2">
        <CandleChart n={compact ? 22 : 34} seed={seed} dark={dark} className="h-full" trigger="mount" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-2">
        <div className="rounded-md bg-down py-1.5 text-center text-[9px] font-bold text-white">SELL</div>
        <div className="rounded-md bg-up py-1.5 text-center text-[9px] font-bold text-white">BUY</div>
      </div>
    </div>
  );
}

export function PhoneMockup({ className, dark = false, symbol, price, seed }) {
  return (
    <div className={cn('relative aspect-[9/19] w-[220px] rounded-[2.4rem] border-[7px] border-[#16181f] bg-[#16181f] shadow-2xl shadow-brand/30', className)}>
      <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />
      <div className="h-full overflow-hidden rounded-[1.9rem] pt-5">
        <TradeScreen dark={dark} compact symbol={symbol} price={price} seed={seed} />
      </div>
    </div>
  );
}

export function TabletMockup({ className, dark = false, symbol = 'XAUUSD', price = '4,158.99', seed = 11 }) {
  return (
    <div className={cn('relative aspect-[4/3] w-[460px] rounded-[1.8rem] border-[10px] border-[#16181f] bg-[#16181f] shadow-2xl shadow-brand/30', className)}>
      <div className="h-full overflow-hidden rounded-[1.1rem]">
        <TradeScreen dark={dark} symbol={symbol} price={price} seed={seed} />
      </div>
    </div>
  );
}

export function LaptopMockup({ className, dark = false, symbol = 'GBPUSD', price = '1.34218', seed = 21 }) {
  return (
    <div className={cn('relative w-[520px]', className)}>
      <div className="aspect-[16/10] rounded-t-2xl border-[9px] border-b-0 border-[#16181f] bg-[#16181f] shadow-2xl shadow-brand/30">
        <div className="h-full overflow-hidden rounded-t-md">
          <TradeScreen dark={dark} symbol={symbol} price={price} seed={seed} />
        </div>
      </div>
      <div className="mx-[-6%] h-3.5 rounded-b-2xl bg-gradient-to-b from-[#2b2e38] to-[#14161c]" />
    </div>
  );
}

export function DeviceFor({ k, ...props }) {
  if (k === 'mt5') return <PhoneMockup symbol="EURUSD" price="1.16035" seed={5} {...props} />;
  if (k === 'mt4') return <TabletMockup symbol="XAUUSD" price="4,158.99" seed={11} {...props} />;
  return <LaptopMockup symbol="GBPUSD" price="1.34218" seed={21} {...props} />;
}
