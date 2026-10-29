'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, BadgePercent, Check, Clock3, Gauge, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';

import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useTicker, FlashPrice, Sparkline } from '@/components/shared/ticker';
import { CountUp, Stagger, StaggerItem, TiltCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const pad = (n) => String(n).padStart(2, '0');

/** UTC clock + how far through the swap day we are (rendered after mount to avoid a hydration mismatch). */
function useUtcNow() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** One flip-style digit pair: slides the new value in from above. */
function Digits({ value }) {
  return (
    <span className="relative inline-grid h-10 w-11 place-items-center overflow-hidden rounded-lg bg-white text-xl font-bold text-brand shadow-sm ring-1 ring-brand/10">
      <span className="absolute inset-x-0 top-1/2 h-px bg-brand/10" aria-hidden />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="tabular-nums">
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function UtcClock({ label }) {
  const now = useUtcNow();
  const parts = now ? [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()].map(pad) : ['--', '--', '--'];
  const dayPct = now ? ((now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()) / 86400) * 100 : 0;
  return (
    <div className="rounded-2xl bg-[#f6f7fb] p-4 ring-1 ring-brand/5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] text-ink/45">
          <Clock3 className="size-3.5" />
          {label}
        </span>
        <span className="flex items-center gap-1">
          {parts.map((p, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <motion.span className="font-bold text-brand/40" animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  :
                </motion.span>
              )}
              <Digits value={p} />
            </span>
          ))}
          <span className="ms-1.5 text-xs font-bold text-brand/60">UTC</span>
        </span>
      </div>
      {/* progress through the swap day (00:00 → 24:00 GMT) */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-brand/10">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-brand to-gold" initial={{ width: 0 }} animate={{ width: `${dayPct}%` }} transition={{ duration: 0.8, ease: EASE }} />
      </div>
    </div>
  );
}

/** Semi-circle gauge: GTCFX spread sits 33% below the benchmark. */
function SpreadGauge() {
  const R = 34;
  const L = Math.PI * R;
  return (
    <div className="relative h-14 w-24" aria-hidden>
      <svg viewBox="0 0 84 46" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="swap-gauge" x1="0" x2="1">
            <stop offset="0" stopColor="#16a34a" />
            <stop offset="1" stopColor="#d2a67a" />
          </linearGradient>
        </defs>
        <path d={`M8 42 A${R} ${R} 0 0 1 76 42`} fill="none" stroke="rgba(41,59,147,0.1)" strokeWidth="7" strokeLinecap="round" />
        <motion.path d={`M8 42 A${R} ${R} 0 0 1 76 42`} fill="none" stroke="url(#swap-gauge)" strokeWidth="7" strokeLinecap="round" strokeDasharray={L} initial={{ strokeDashoffset: L }} animate={{ strokeDashoffset: L * 0.67 }} transition={{ duration: 1.6, ease: EASE, delay: 0.9 }} />
      </svg>
      <motion.span className="absolute bottom-1 left-1/2 h-8 w-0.5 origin-bottom -translate-x-1/2 rounded-full bg-ink" initial={{ rotate: -90 }} animate={{ rotate: [-90, -25, -32] }} transition={{ duration: 1.8, ease: EASE, delay: 0.9 }} />
      <span className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-ink ring-2 ring-white" />
    </div>
  );
}

/** Long / short swap cell with direction icon and a magnitude bar. */
function SwapCell({ label, value, max }) {
  const n = parseFloat(String(value).replace(/[^0-9.+-]/g, '')) || 0;
  const up = n >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <div className={cn('group/cell relative overflow-hidden rounded-xl px-3 py-2.5 ring-1 transition-colors duration-300', up ? 'bg-up/[0.04] ring-up/15 hover:bg-up/[0.08]' : 'bg-down/[0.04] ring-down/15 hover:bg-down/[0.08]')}>
      <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-ink/45">
        {label}
        <Icon className={cn('size-3.5', up ? 'text-up' : 'text-down')} />
      </div>
      <div className={cn('mt-0.5 text-base font-bold tabular-nums', up ? 'text-up' : 'text-down')}>{value}</div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink/5">
        <motion.div className={cn('h-full rounded-full', up ? 'bg-up' : 'bg-down')} initial={{ width: 0 }} animate={{ width: `${(Math.abs(n) / max) * 100}%` }} transition={{ duration: 1, ease: EASE, delay: 1.1 }} />
      </div>
    </div>
  );
}

/** Instrument row: live price + sparkline, spread pill, long/short swaps. */
function InstrumentRow({ it, live, max, labels, delay }) {
  const up = live ? live.change >= 0 : true;
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.6, ease: EASE }} className="rounded-2xl p-3 ring-1 ring-brand/10 transition-shadow duration-500 hover:shadow-lg hover:shadow-brand/10">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-[10px] font-bold text-white shadow-md shadow-brand/30">{it.symbol.slice(0, 3)}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold leading-tight">{it.symbol}</span>
          <span className="block text-xs text-ink/50">{it.name}</span>
        </span>
        {live && (
          <span className="hidden text-end sm:block">
            <FlashPrice value={live.bid} decimals={live.d} dir={live.dir} tick={live.tick} className="block text-sm font-bold tabular-nums" />
            <span className={cn('text-[10px] font-semibold', up ? 'text-up' : 'text-down')}>
              {up ? '+' : ''}
              {live?.change?.toFixed(2)}%
            </span>
          </span>
        )}
        {live && <Sparkline data={live.hist} up={up} width={56} height={26} className="hidden sm:block" />}
        <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-end ring-1 ring-brand/10">
          <span className="block text-sm font-bold leading-tight text-brand">{it.spread}</span>
          <span className="block text-[9px] text-ink/50">{it.unit}</span>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <SwapCell label={labels.long} value={it.long} max={max} />
        <SwapCell label={labels.short} value={it.short} max={max} />
      </div>
    </motion.div>
  );
}

/**
 * "Live Cost Dashboard": spread gauge, live-ticking instruments with swaps, flip clock with swap-day progress,
 * floating proof chips. Tilts toward the cursor on desktop.
 */
function CostDashboard() {
  const t = useTranslations('swapUpdatePage.hero.dashboard');
  const items = t.raw('instruments');
  const chips = t.raw('chips');
  const feed = useTicker(7, 1300);
  const max = Math.max(...items.flatMap((it) => [it.long, it.short].map((v) => Math.abs(parseFloat(String(v).replace(/[^0-9.+-]/g, '')) || 0))), 1);

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[500px] py-6">
      {/* glow + orbit rings */}
      <div className="absolute -inset-6 rounded-[3rem] bg-brand/40 blur-3xl" aria-hidden />
      {[0, 1].map((k) => (
        <motion.span key={k} className="absolute left-1/2 top-1/2 hidden rounded-full border border-white/10 lg:block" style={{ width: 560 + k * 140, height: 560 + k * 140, marginLeft: -(280 + k * 70), marginTop: -(280 + k * 70) }} animate={{ rotate: k ? -360 : 360 }} transition={{ duration: 50 + k * 20, repeat: Infinity, ease: 'linear' }} aria-hidden>
          <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-gold-200 shadow-[0_0_12px_rgba(210,166,122,0.9)]" />
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 40, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}>
        <TiltCard max={6} className="group rounded-[1.75rem]">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.75)] ring-1 ring-white/20">
            {/* header */}
            <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 px-5 py-4 text-white">
              <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
              <motion.span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/15 to-transparent" animate={{ left: ['-33%', '133%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }} aria-hidden />
              <span className="relative flex items-center gap-2.5 font-semibold">
                <span className="grid size-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Gauge className="size-4 text-gold-200" />
                </span>
                {t('title')}
              </span>
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-up/15 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-green-300 ring-1 ring-up/30">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-up" />
                </span>
                {t('live')}
              </span>
            </div>

            <div className="space-y-3 p-4 md:p-5">
              {/* avg spread + gauge */}
              <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-white p-4 ring-1 ring-brand/10">
                <div>
                  <div className="text-xs text-ink/50">{t('avgLabel')}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-brand">
                      <CountUp value={Number(t('avgValue'))} duration={1.6} />
                    </span>
                    <span className="text-xs text-ink/45">{t('avgUnit')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <SpreadGauge />
                  <span className="text-[10px] text-ink/45">{t('benchmark')}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-up/10 px-2 py-0.5 text-[11px] font-semibold text-up">
                    <motion.span animate={{ y: [0, 2, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                      <ArrowDown className="size-3" />
                    </motion.span>
                    {t('vsIndustry')}
                  </span>
                </div>
              </div>

              {/* instruments */}
              {items.map((it, i) => (
                <InstrumentRow key={it.symbol} it={it} live={feed.find((r) => r.s === it.symbol)} max={max} labels={{ long: t('longSwap'), short: t('shortSwap') }} delay={0.7 + i * 0.15} />
              ))}

              <UtcClock label={t('updated')} />
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* floating proof chips */}
      {chips.map((c, i) => {
        const Icon = i ? BadgePercent : ShieldCheck;
        return (
          <motion.div key={c} className={cn('absolute z-10 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-semibold text-ink shadow-xl shadow-brand/25 ring-1 ring-brand/10 sm:flex', i ? '-end-4 bottom-24 md:-end-10' : '-start-4 top-20 md:-start-12')} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, i ? 7 : -7, 0] }} transition={{ opacity: { delay: 1.2 + i * 0.2 }, scale: { delay: 1.2 + i * 0.2, type: 'spring' }, y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' } }}>
            <span className={cn('grid size-7 place-items-center rounded-lg', i ? 'bg-gold/15 text-gold-700' : 'bg-up/10 text-up')}>
              <Icon className="size-4" />
            </span>
            {c}
          </motion.div>
        );
      })}
    </div>
  );
}

export function SwapHero() {
  const t = useTranslations('swapUpdatePage.hero');
  const tb = useTranslations('swapUpdatePage.breadcrumb');
  const points = t.raw('points');

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-28 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />

        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="size-1.5 rounded-full bg-gold" />
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>

            <Stagger as="ul" className="mx-auto mt-7 inline-flex flex-col gap-3 text-start lg:mx-0 lg:flex" stagger={0.1} delay={0.3}>
              {points.map((p) => (
                <StaggerItem as="li" key={p} className="flex items-center gap-3 text-[15px] text-white/80">
                  <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-200 ring-1 ring-white/15">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {p}
                </StaggerItem>
              ))}
            </Stagger>

            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}>
              <LiveAccountButton variant="gold">
                {t('live')}
              </LiveAccountButton>
              <NavLink href="/trading/free-demo-account" className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                {t('demo')}
              </NavLink>
            </motion.div>
          </div>
          <CostDashboard />
        </div>
      </div>
    </section>
  );
}
