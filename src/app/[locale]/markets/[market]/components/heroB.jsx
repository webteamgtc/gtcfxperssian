'use client';
/** Template B hero (Energy, Metals, Crypto, Futures): centred copy over up to three live price cards (only real API symbols). */
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useLiveRows, FlashPrice, Sparkline, fmt, pct } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { useMarket, usePageT, MarketCrumb, changeTone, useSymbolHref } from './shared';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const Stat = ({ value }) => (String(value).includes(',') ? value : <StatValue value={value} />);

function Copy({ center = false }) {
  const t = usePageT();
  const td = useTranslations('marketsPage.detail.cta');
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'text-center lg:text-start'}>
      <motion.h1 className="heading-page" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
        <AccentTitle text={t('hero.title')} />
      </motion.h1>
      <motion.p className={cn('mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg', center ? 'mx-auto' : 'mx-auto lg:mx-0')} initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
        {t('hero.text')}
      </motion.p>
      <motion.div className={cn('mt-9 flex flex-wrap items-center gap-3', center ? 'justify-center' : 'justify-center lg:justify-start')} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <LiveAccountButton variant="gold">
          {td('start')}
        </LiveAccountButton>
        <NavLink href={PORTAL.demo} className="inline-flex h-13 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
          <Play className="size-4" /> {td('demo')}
        </NavLink>
      </motion.div>
    </div>
  );
}

function StatRow({ className, center = false }) {
  const t = usePageT();
  return (
    <motion.dl className={cn('grid grid-cols-2 gap-y-6 border-t border-white/10 pt-7 sm:grid-cols-4', className)} initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } } }}>
      {t.raw('hero.stats').map((s) => (
        <motion.div key={s.label} variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0 } }} className={cn('flex flex-col', center ? 'items-center text-center' : 'items-center text-center lg:items-start lg:text-start')}>
          <dt className="order-2 mt-1 text-xs text-white/55 md:text-sm">{s.label}</dt>
          <dd dir="ltr" className="heading-accent text-2xl font-bold tracking-tight md:text-3xl">
            <Stat value={s.value} />
          </dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}

const Shell = ({ children, className }) => (
  <section className={cn('is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-28 md:pt-44', className)}>
    <HeroBackdrop />
    <div className="container-x relative">{children}</div>
  </section>
);

/** Spotlight — centred copy, then three large live price cards that rise in, with sparklines; stats underneath. */
export function HeroSpotlightB() {
  const { symbols } = useMarket();
  const t = useTranslations('marketsPage.detail.labels');
  const href = useSymbolHref();
  const lead = useMemo(() => symbols.slice(0, 3), [symbols]);
  const rows = useLiveRows(lead, 900);
  return (
    <Shell>
      <MarketCrumb />
      <div className="mt-12">
        <Copy center />
      </div>
      {rows.length > 0 && (
      <div dir="ltr" className={cn('mx-auto mt-14 grid max-w-5xl gap-4', rows.length === 1 ? 'max-w-sm' : rows.length === 2 ? 'max-w-3xl md:grid-cols-2' : 'md:grid-cols-3')}>
        {rows.map((r, k) => (
          <motion.div key={r.s} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + k * 0.12, duration: 0.8, ease: EASE }} whileHover={{ y: -6 }}>
            <NavLink href={href(r.s)} prefetch={false} className={cn('group relative block overflow-hidden rounded-3xl p-5 ring-1 transition-colors', k === 1 ? 'bg-white text-ink ring-white' : 'bg-white/[0.06] text-white ring-white/10 backdrop-blur hover:bg-white/[0.1]')}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black">{r.s}</span>
                <span className={cn('text-xs font-semibold tabular-nums', changeTone(r.change, k !== 1))}>{pct(r.change)}</span>
              </div>
              <p className={cn('text-xs', k === 1 ? 'text-ink/50' : 'text-white/50')}>{r.n}</p>
              <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="mt-4 block text-3xl font-bold" />
              <Sparkline data={r.hist} up={(r.change ?? 0) >= 0} width={260} height={46} className="mt-3 w-full" />
              <div className={cn('mt-3 flex justify-between text-[11px]', k === 1 ? 'text-ink/50' : 'text-white/50')}>
                <span>
                  {t('dayLow')} <b className="font-semibold tabular-nums">{fmt(r.low, r.d)}</b>
                </span>
                <span>
                  {t('dayHigh')} <b className="font-semibold tabular-nums">{fmt(r.high, r.d)}</b>
                </span>
              </div>
            </NavLink>
          </motion.div>
        ))}
      </div>
      )}
      <StatRow center className="mx-auto mt-14 max-w-4xl" />
    </Shell>
  );
}
