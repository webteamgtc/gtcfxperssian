'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Activity, Bitcoin, BarChart3, DollarSign, Fuel, Gem, Globe, Landmark, Layers, Monitor, Wheat } from 'lucide-react';
import { useTicker, FlashPrice, Sparkline, fmt } from '@/components/shared/ticker';
import { CandleChart } from '@/components/shared/devices';
import RingCard from '@/components/shared/RingCard';
import { CountUp, Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

/* ---------- one live visual per card ---------- */

/** 01 — live order-book style quotes */
function QuotesVisual() {
  const rows = useTicker(7, 1200).slice(0, 4);
  return (
    <div dir="ltr" className="w-full space-y-1.5" aria-hidden>
      {rows.map((r) => (
        <div key={r.s} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-brand/5">
          <span className="font-semibold text-ink">{r.s}</span>
          <span className="rounded-md bg-down/10 px-2 py-0.5 text-xs font-bold tabular-nums text-down">
            <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} />
          </span>
          <span className="rounded-md bg-up/10 px-2 py-0.5 text-xs font-bold tabular-nums text-up">{fmt(r.ask, r.d)}</span>
        </div>
      ))}
    </div>
  );
}

/** 02 — balance that counts up, with a filling capital bar */
function FundsVisual() {
  return (
    <div dir="ltr" className="w-full text-center" aria-hidden>
      <div className="heading-accent text-5xl font-bold tracking-tight md:text-6xl">
        $<CountUp value={50000} />
      </div>
      <div className="mx-auto mt-5 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-brand/10">
        <motion.span className="block h-full rounded-full bg-gradient-to-r from-gold to-brand" initial={{ width: '0%' }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 2.2, ease: 'easeOut' }} />
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="grid size-8 place-items-center rounded-full bg-gradient-to-b from-gold-200 to-gold text-white shadow" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}>
            <DollarSign className="size-4" strokeWidth={2.5} />
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/** 03 — desktop + phone in sync: a candle chart on the monitor, a live line on the phone,
 *  a pulse travelling between them, and the three platforms taking turns as "active". */
const PLATFORMS = [
  { label: 'MT4', Icon: Monitor },
  { label: 'MT5', Icon: Layers },
  { label: 'WebTrader', Icon: Globe }
];
function DevicesVisual() {
  const rows = useTicker(7, 1300);
  const eur = rows.find((r) => r.s === 'EURUSD') ?? rows[0];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % PLATFORMS.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[320px]" aria-hidden>
      <div className="relative flex items-end justify-center gap-5">
        {/* monitor */}
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative">
          <div className="w-[210px] overflow-hidden rounded-xl bg-white shadow-xl shadow-brand/15 ring-1 ring-brand/15">
            <div className="flex items-center gap-1 border-b border-brand/10 bg-[#f6f7fb] px-2.5 py-1.5">
              <span className="size-1.5 rounded-full bg-[#ff5f57]" />
              <span className="size-1.5 rounded-full bg-[#febc2e]" />
              <span className="size-1.5 rounded-full bg-[#28c840]" />
              <span className="ms-auto text-[9px] font-bold text-brand">EURUSD</span>
            </div>
            <div className="h-[92px] px-1.5 pt-1">
              <CandleChart n={18} seed={21} className="h-full w-full" trigger="mount" />
            </div>
          </div>
          <div className="mx-auto h-3 w-8 bg-gradient-to-b from-brand/30 to-brand/10" />
          <div className="mx-auto h-1.5 w-20 rounded-full bg-brand/20" />
        </motion.div>

        {/* phone */}
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} className="mb-2">
          <div className="w-[68px] rounded-[1rem] bg-ink p-[3px] shadow-xl shadow-brand/25">
            <div className="flex h-[118px] flex-col overflow-hidden rounded-[0.8rem] bg-white px-1.5 pb-1.5 pt-2.5">
              <span className="mx-auto mb-1.5 h-1 w-5 rounded-full bg-ink/15" />
              <span className="text-[7px] font-bold text-ink/50">EURUSD</span>
              <FlashPrice value={eur.bid} decimals={4} dir={eur.dir} tick={eur.tick} className="text-[10px] font-bold text-ink" />
              <Sparkline data={eur.hist} up={eur.change >= 0} width={56} height={40} className="mt-1 w-full flex-1" />
              <div className="mt-1 grid grid-cols-2 gap-0.5">
                <span className="h-2.5 rounded-sm bg-down/80" />
                <span className="h-2.5 rounded-sm bg-up/80" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* sync pulse between the devices */}
      <div className="pointer-events-none absolute left-[60%] top-[38%] h-px w-[16%] border-t border-dashed border-brand/30">
        <motion.span className="absolute -top-[3px] size-1.5 rounded-full bg-gold shadow-[0_0_10px_rgba(182,135,86,0.9)]" animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* platforms */}
      <div className="mt-5 flex justify-center gap-2">
        {PLATFORMS.map(({ label, Icon }, i) => (
          <span key={label} className={cn('relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors duration-500', active === i ? 'text-white' : 'bg-white text-brand ring-1 ring-brand/15')}>
            {active === i && <motion.span layoutId="why-platform" className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            <Icon className="relative size-3.5" />
            <span className="relative">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** 04 — market icons orbiting a hub */
const MARKETS = [Landmark, Gem, BarChart3, Bitcoin, Fuel, Wheat, Globe];
function MarketsVisual() {
  const R = 78;
  return (
    <div dir="ltr" className="relative mx-auto size-[200px]" aria-hidden>
      <span className="absolute inset-[22px] rounded-full border border-dashed border-brand/20" />
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
        {MARKETS.map((Icon, i) => {
          const a = (i / MARKETS.length) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              className="absolute grid size-10 place-items-center rounded-xl bg-white text-brand shadow-md ring-1 ring-brand/10"
              style={{ left: `calc(50% + ${Math.cos(a) * R}px - 20px)`, top: `calc(50% + ${Math.sin(a) * R}px - 20px)` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              <Icon className="size-4" />
            </motion.span>
          );
        })}
      </motion.div>
      <motion.span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-900 text-xl font-bold text-white shadow-xl shadow-brand/30" animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 2.6, repeat: Infinity }}>
        6+
      </motion.span>
    </div>
  );
}

const CARDS = [
  { Icon: Activity, Visual: QuotesVisual, span: 'lg:col-span-7' },
  { Icon: DollarSign, Visual: FundsVisual, span: 'lg:col-span-5' },
  { Icon: Monitor, Visual: DevicesVisual, span: 'lg:col-span-5' },
  { Icon: Globe, Visual: MarketsVisual, span: 'lg:col-span-7' }
];

/** Why trade with demo: bento of four cards, each with its own live illustration. */
export function WhyDemo() {
  const t = useTranslations('freeDemoAccount.why');
  const items = t.raw('items');

  return (
    <section id="why-demo" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-12" stagger={0.1}>
          {items.map((it, i) => {
            const { Icon, Visual, span } = CARDS[i % CARDS.length];
            const wide = span.includes('7');
            return (
              <StaggerItem key={it.title} className={cn('h-full', span)}>
                <RingCard innerClassName={cn('p-2', wide && 'lg:flex-row')}>
                  <div className={cn('relative grid min-h-[230px] place-items-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#f3f5fb] via-white to-[#eaedf6] p-6', wide && 'lg:w-[55%] lg:shrink-0')}>
                    <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
                    <div className="absolute size-48 rounded-full bg-brand/10 blur-3xl" aria-hidden />
                    <div className="relative w-full transition-transform duration-700 group-hover:scale-[1.03]">
                      <Visual />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center px-5 pb-6 pt-5 lg:px-7">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-xs font-bold tracking-[0.2em] text-ink/30">0{i + 1}</span>
                    </div>
                    <h3 className="heading-card mt-4">{it.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{it.text}</p>
                    <span className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-brand transition-all duration-700 group-hover:w-24 rtl:bg-gradient-to-l" aria-hidden />
                  </div>
                </RingCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
