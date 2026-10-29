'use client';
/**
 * Small looping illustrations for the /trading page (decorative, aria-hidden).
 * Same visual language as the company page: light "stages", navy chips, gold accents.
 */
import { motion } from 'motion/react';
import { CalendarClock, ChartNoAxesColumn, CircleDollarSign, DollarSign, MonitorSmartphone, RadioTower, RefreshCw, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ---------- demo card stages ---------- */

function BarsStage() {
  const bars = [38, 62, 45, 78, 54, 88, 66];
  return (
    <div dir="ltr" className="flex h-20 items-end gap-1.5" aria-hidden>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className={cn('w-3 rounded-t-md', i % 2 ? 'bg-gradient-to-t from-gold/30 to-gold' : 'bg-gradient-to-t from-brand/30 to-brand')}
          animate={{ height: [`${h}%`, `${Math.min(100, h + 18)}%`, `${Math.max(20, h - 14)}%`, `${h}%`] }}
          transition={{ duration: 3 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

function CalendarStage() {
  const cols = [4, 6, 5];
  return (
    <div dir="ltr" className="flex items-end gap-2" aria-hidden>
      {cols.map((rows, c) => (
        <div key={c} className="grid grid-cols-2 gap-1 rounded-t-lg bg-brand/10 p-1.5 ring-1 ring-brand/10">
          {Array.from({ length: rows * 2 }).map((_, k) => (
            <motion.span key={k} className="size-2 rounded-[2px] bg-brand/20" animate={{ backgroundColor: ['rgba(41,59,147,0.2)', 'rgba(182,135,86,0.9)', 'rgba(41,59,147,0.2)'] }} transition={{ duration: 3, repeat: Infinity, delay: ((k * 7 + c * 5) % 11) * 0.35 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function CoinStage() {
  return (
    <div dir="ltr" className="relative grid size-20 place-items-center" aria-hidden>
      <motion.span className="absolute inset-0 rounded-full border-2 border-dashed border-gold/40" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
      <motion.span className="grid size-12 place-items-center rounded-full bg-gradient-to-b from-gold-200 to-gold text-white shadow-lg shadow-gold/30" animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <DollarSign className="size-6" strokeWidth={2.5} />
      </motion.span>
    </div>
  );
}

function DevicesStage() {
  return (
    <div dir="ltr" className="flex items-end gap-1.5" aria-hidden>
      {[
        ['h-14 w-20', 0],
        ['h-11 w-8', 0.3],
        ['h-9 w-5', 0.6]
      ].map(([size, d], i) => (
        <motion.div key={i} className={cn('flex flex-col gap-1 rounded-md bg-white p-1.5 shadow-sm ring-1 ring-brand/10', size)} animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: d }}>
          <span className="h-1 w-full rounded-full bg-brand/20" />
          <span className="flex-1 rounded-sm bg-gradient-to-t from-brand/20 to-gold/30" />
        </motion.div>
      ))}
    </div>
  );
}

function PulseStage() {
  return (
    <div dir="ltr" className="relative grid size-20 place-items-center" aria-hidden>
      {[0, 1, 2].map((r) => (
        <motion.span key={r} className="absolute inset-0 rounded-full border border-gold/50" animate={{ scale: [0.5, 1.4], opacity: [0.8, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: r * 0.8, ease: 'easeOut' }} />
      ))}
      <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 shadow ring-1 ring-brand/10">
        {[0, 1, 2].map((d) => (
          <motion.span key={d} className="size-1.5 rounded-full bg-brand/60" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }} />
        ))}
      </span>
    </div>
  );
}

function TopUpStage() {
  return (
    <div dir="ltr" className="flex h-20 w-14 flex-col items-center" aria-hidden>
      <span className="h-1.5 w-5 rounded-t-sm bg-brand/30" />
      <div className="relative w-full flex-1 overflow-hidden rounded-lg bg-white ring-2 ring-brand/20">
        <motion.span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand to-gold" animate={{ height: ['15%', '100%', '100%', '15%'] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.55, 0.85, 1], ease: 'easeInOut' }} />
      </div>
    </div>
  );
}

export const DEMO_LOOKS = [
  { Icon: ChartNoAxesColumn, Stage: BarsStage },
  { Icon: CalendarClock, Stage: CalendarStage },
  { Icon: CircleDollarSign, Stage: CoinStage, chip: 'from-gold to-gold-600 shadow-gold/30' },
  { Icon: MonitorSmartphone, Stage: DevicesStage },
  { Icon: RadioTower, Stage: PulseStage },
  { Icon: RefreshCw, Stage: TopUpStage, chip: 'from-brand-800 to-ink shadow-ink/30' }
];

/* ---------- VPS server rack ---------- */

export function ServerRack({ units = 3, dark = false }) {
  return (
    <div dir="ltr" className="space-y-1.5" aria-hidden>
      {Array.from({ length: units }).map((_, u) => (
        <div key={u} className={cn('flex items-center gap-2 rounded-md px-2.5 py-1.5 ring-1', dark ? 'bg-white/10 ring-white/15' : 'bg-white ring-brand/10')}>
          <Server className={cn('size-3.5', dark ? 'text-gold-200' : 'text-brand')} />
          <span className={cn('h-1 flex-1 rounded-full', dark ? 'bg-white/15' : 'bg-brand/10')} />
          {[0, 1, 2].map((l) => (
            <motion.span key={l} className="size-1.5 rounded-full bg-up" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9 + l * 0.35, repeat: Infinity, delay: u * 0.2 + l * 0.15 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- leverage gauge ---------- */

export function LeverageArc({ className }) {
  const R = 90;
  const C = Math.PI * R;
  return (
    <svg viewBox="0 0 220 120" className={className} aria-hidden>
      <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="14" strokeLinecap="round" />
      <motion.path
        d="M20 110 A90 90 0 0 1 200 110"
        fill="none"
        stroke="url(#tp-lev)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={C}
        initial={{ strokeDashoffset: C }}
        whileInView={{ strokeDashoffset: C * 0.04 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <defs>
        <linearGradient id="tp-lev" x1="0" x2="1">
          <stop offset="0%" stopColor="#8390d4" />
          <stop offset="100%" stopColor="#d2a67a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
