'use client';
/** Template A hero (odd pages: Forex, Indices, Shares, Futures) */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { PORTAL } from '@/config/menu';
import { MARKETS } from '@/config/markets';
import NavLink from '@/components/shared/nav/NavLink';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useLiveRows, FlashPrice, pct } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { useMarket, usePageT, MarketCrumb, changeTone } from './shared';
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
          {td('live')}
        </LiveAccountButton>
        <NavLink href={PORTAL.demo} className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
          {td('demo')}
        </NavLink>
      </motion.div>
    </div>
  );
}

function Stats({ className, boxed = false }) {
  const t = usePageT();
  const stats = t.raw('hero.stats');
  return (
    <motion.dl className={cn('grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4', boxed ? 'rounded-2xl border border-white/10 bg-white/10' : '', className)} initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } } }}>
      {stats.map((s) => (
        <motion.div key={s.label} variants={{ h: { opacity: 0, y: 14 }, s: { opacity: 1, y: 0 } }} className={cn('flex flex-col items-center px-4 py-5 text-center', boxed ? 'bg-ink/80 backdrop-blur' : '')}>
          <dt className="order-2 mt-1.5 text-xs text-white/55 md:text-sm">{s.label}</dt>
          <dd dir="ltr" className="heading-accent text-2xl font-bold tracking-tight md:text-4xl">
            <Stat value={s.value} />
          </dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}

const Shell = ({ children, className }) => (
  <section className={cn('is-dark relative overflow-hidden bg-ink pt-36 text-white md:pt-44', className)}>
    <HeroBackdrop />
    <div className="container-x relative">{children}</div>
  </section>
);

/** Orbit — copy on the start side; the market's symbols orbit a glowing coin that shows the focused symbol's live price. */
export function HeroOrbitA() {
  const { page, symbols } = useMarket();
  const t = useTranslations('marketsPage.detail.labels');
  const ring = useMemo(() => symbols.slice(0, 8), [symbols]);
  const rows = useLiveRows(ring, 1000);
  const [focus, setFocus] = useState(0);
  useEffect(() => {
    if (ring.length < 2) return undefined;
    const id = setInterval(() => setFocus((f) => (f + 1) % ring.length), 2600);
    return () => clearInterval(id);
  }, [ring.length]);
  const MIcon = MARKETS.find((m) => m.id === page.id)?.icon;
  const r = rows[focus] ?? rows[0];

  return (
    <Shell className="pb-20 md:pb-28">
      <MarketCrumb className="lg:justify-start" />
      <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Copy />
          <Stats className="mt-10 border-t border-white/10 pt-2 md:grid-cols-4 [&>div]:items-start [&>div]:px-0 [&>div]:text-start" />
        </div>
        <div dir="ltr" className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
          <div className="absolute inset-[6%] rounded-full border border-white/10" />
          <div className="absolute inset-[20%] rounded-full border border-dashed border-gold/25" />
          <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
            {rows.map((x, i) => {
              const a = (i / rows.length) * Math.PI * 2;
              const on = i === focus;
              return (
                <span key={x.s} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + Math.cos(a) * 44}%`, top: `${50 + Math.sin(a) * 44}%` }}>
                  <motion.span className="block" animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                    <span className={cn('block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold shadow-lg transition-all duration-500', on ? 'scale-110 bg-gold text-white shadow-gold/40' : 'bg-white/10 text-white/80 ring-1 ring-white/15 backdrop-blur')}>{x.s}</span>
                  </motion.span>
                </span>
              );
            })}
          </motion.div>
          <div className="absolute inset-[27%] grid place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#5b6ed2,#293b93_55%,#141d4d)] shadow-[0_0_80px_rgba(91,110,210,0.55),inset_0_-12px_30px_rgba(0,0,0,0.4)]">
            <div className="text-center">
              {MIcon && <MIcon className="mx-auto size-6 text-gold-200" />}
              {r ? (
                <>
                  <p className="mt-2 text-xs font-semibold text-white/60">{r.s}</p>
                  <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-2xl font-bold text-white md:text-3xl" />
                  <p className={cn('mt-1 text-xs font-semibold tabular-nums', changeTone(r.change, true))}>{r.live ? pct(r.change) : t('waiting')}</p>
                </>
              ) : (
                <p className="mt-2 px-6 text-xs font-semibold text-white/60">{t('noSymbols')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
