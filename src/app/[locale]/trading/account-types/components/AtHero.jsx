'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import StatValue from '@/components/shared/StatValue';
import { useTicker, FlashPrice, pct } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const BARS = [28, 40, 34, 52, 44, 62, 50, 72, 60, 80, 68, 76];

/** Brand card: live EUR/USD, the GTC mark with a gradient sweep, rising bars, spread + execution. */
function BrandCard() {
  const t = useTranslations('accountTypesPage.hero.card');
  const rows = useTicker(7, 1400);
  const eur = rows.find((r) => r.s === 'EURUSD') ?? rows[0];
  const up = eur.change >= 0;

  return (
    <div className="relative mx-auto w-full max-w-[480px] px-3 pb-6 pt-4 sm:px-6" aria-hidden>
      {/* stacked "paper" behind */}
      <motion.div className="absolute inset-x-6 inset-y-4 rounded-[2rem] border border-dashed border-white/20 bg-white/[0.04]" initial={{ rotate: 0 }} animate={{ rotate: 3 }} transition={{ duration: 1, ease: EASE, delay: 0.5 }} />
      <motion.div initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: -1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.25 }} className="relative">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative overflow-hidden rounded-[2rem] border border-brand/10 bg-white p-6 shadow-[0_40px_100px_-30px_rgba(41,59,147,0.7)] ring-1 ring-white/20 md:p-7">
          <div className="bg-grid-light absolute inset-0 opacity-60" />
          <div className="absolute -end-20 -top-20 size-56 rounded-full bg-gold/15 blur-3xl" />

          <div dir="ltr" className="relative flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wide text-ink/45">{t('pair')}</span>
              <div className="mt-1 flex items-baseline gap-2">
                <FlashPrice value={eur.bid} decimals={4} dir={eur.dir} tick={eur.tick} className="text-2xl font-bold text-brand-900" />
                <span className={cn('text-xs font-bold', up ? 'text-up' : 'text-down')}>
                  {up ? '▲' : '▼'} {pct(eur.change, true)}
                </span>
              </div>
            </div>
            <span className="relative mt-1 flex size-4 items-center justify-center rounded-full bg-brand/15">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/30" />
              <span className="relative size-2 rounded-full bg-brand" />
            </span>
          </div>

          <div className="relative mt-8 text-center">
            <motion.div dir="ltr" className="bg-[linear-gradient(110deg,#293b93_35%,#b68756_50%,#293b93_65%)] bg-[length:250%_100%] bg-clip-text text-7xl font-black tracking-tight text-transparent md:text-8xl" animate={{ backgroundPositionX: ['100%', '-100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}>
              {t('brand')}
            </motion.div>
            <p className="mt-2 text-base text-ink/55 md:text-lg">{t('tagline')}</p>
          </div>

          <div dir="ltr" className="relative mt-7 flex h-28 items-end gap-1.5">
            {BARS.map((h, i) => (
              <motion.span
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-brand-800 to-brand-400"
                initial={{ height: '0%' }}
                animate={{ height: [`${h}%`, `${Math.min(100, h + 12)}%`, `${h}%`] }}
                transition={{ height: { duration: 3 + (i % 4) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 + i * 0.06 } }}
              />
            ))}
          </div>

          <div dir="ltr" className="relative mt-5 flex items-end justify-between border-t border-brand/10 pt-4">
            <div>
              <div className="text-2xl font-bold text-brand-900">{t('spread')}</div>
              <div className="text-xs text-ink/50">{t('spreadLabel')}</div>
            </div>
            <div className="text-end">
              <div className="text-2xl font-bold text-brand-900">{t('execution')}</div>
              <div className="text-xs text-ink/50">{t('executionLabel')}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function AtHero() {
  const t = useTranslations('accountTypesPage.hero');
  const tb = useTranslations('accountTypesPage.breadcrumb');
  const stats = t.raw('stats');

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-28 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb
          className="lg:justify-start"
          items={[
            { label: tb('home'), href: '/' },
            { label: tb('trading'), href: '/trading' },
            { label: tb('current') }
          ]}
        />

        <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('badge')}
            </motion.span>

            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>

            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <LiveAccountButton variant="gold">
                {t('ctaLive')}
              </LiveAccountButton>
              <NavLink href="/trading/free-demo-account" className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                {t('ctaDemo')}
              </NavLink>
            </motion.div>

            <motion.dl className="mt-10 grid grid-cols-2 gap-y-6 border-t border-white/10 pt-7 sm:grid-cols-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.45 } } }}>
              {stats.map((s) => (
                <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="flex flex-col items-center lg:items-start">
                  <dt className="order-2 mt-1 text-xs text-white/55 md:text-sm">{s.label}</dt>
                  <dd dir="ltr" className="heading-accent text-3xl font-bold tracking-tight md:text-4xl">
                    <StatValue value={s.value} />
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>

          <BrandCard />
        </div>
      </div>
    </section>
  );
}
