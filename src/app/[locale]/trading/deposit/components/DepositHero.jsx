'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, CreditCard, Bitcoin, Smartphone, Wallet, ShieldCheck } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import ArrowLink from '@/components/shared/ArrowLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import StatValue from '@/components/shared/StatValue';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const METHOD_ICONS = { card: CreditCard, crypto: Bitcoin, mobile: Smartphone, wallet: Wallet };

/** Quick Deposit card: the highlighted method cycles, a progress sweep runs on the active row. */
function QuickDepositCard() {
  const t = useTranslations('depositPage.hero.card');
  const methods = t.raw('methods');
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % methods.length), 2200);
    return () => clearInterval(id);
  }, [methods.length]);

  return (
    <div className="relative mx-auto w-full max-w-[460px] px-4 pb-10 pt-8 sm:px-8" aria-hidden>
      <motion.div initial={{ opacity: 0, y: 30, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }} className="relative">
        <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand/40 via-gold/20 to-transparent blur-3xl" />
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative rounded-[1.75rem] border border-brand/10 bg-white p-5 shadow-[0_40px_100px_-30px_rgba(41,59,147,0.7)] ring-1 ring-white/20 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">{t('title')}</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-up/10 px-3 py-1 text-xs font-bold text-up">
              <Check className="size-3.5" strokeWidth={3} /> {t('verified')}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {methods.map((m, i) => {
              const Icon = METHOD_ICONS[m.id] ?? CreditCard;
              const on = active === i;
              return (
                <li key={m.id} className={cn('relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 transition-all duration-500', on ? 'border-brand/30 bg-brand-50/60 shadow-md shadow-brand/10' : 'border-brand/10 bg-white')}>
                  {on && <motion.span key={`sweep-${active}`} className="absolute inset-y-0 start-0 bg-gradient-to-r from-brand/10 to-transparent rtl:bg-gradient-to-l" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.2, ease: 'linear' }} />}
                  <span className={cn('relative grid size-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors duration-500', on ? 'bg-brand text-white ring-brand' : 'bg-brand-50 text-brand ring-brand/10')}>
                    <Icon className="size-4" />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{m.name}</span>
                    <span className="block text-xs text-ink/45">{m.meta}</span>
                  </span>
                  <span className="relative rounded-full bg-up/10 px-2.5 py-1 text-[11px] font-bold text-up">{t('free')}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* floating chips */}
        <motion.span className="absolute -top-5 end-2 z-10 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-up shadow-xl shadow-brand/15 ring-1 ring-brand/10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }} transition={{ opacity: { delay: 0.9 }, scale: { delay: 0.9, type: 'spring' }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}>
          <span className="grid size-6 place-items-center rounded-lg bg-up/10">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          {t('noFees')}
        </motion.span>
        <motion.span className="absolute -bottom-6 -start-2 z-10 inline-flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold text-brand-900 shadow-xl shadow-brand/15 ring-1 ring-brand/10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, 6, 0] }} transition={{ opacity: { delay: 1.05 }, scale: { delay: 1.05, type: 'spring' }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}>
          <motion.span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand" animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}>
            <ShieldCheck className="size-4" />
          </motion.span>
          {t('ssl')}
        </motion.span>
      </motion.div>
    </div>
  );
}

export function DepositHero() {
  const t = useTranslations('depositPage.hero');
  const tb = useTranslations('depositPage.breadcrumb');
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

            {/* stats */}
            <motion.dl className="mt-8 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-5 rtl:divide-x-reverse" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}>
              {stats.map((s) => (
                <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="flex flex-col items-center px-3 first:ps-0 lg:items-start">
                  <dt className="order-2 mt-1 text-xs text-white/55 md:text-sm">{s.label}</dt>
                  <dd dir="ltr" className="heading-accent text-2xl font-bold tracking-tight md:text-3xl rtl:text-end">
                    <StatValue value={s.value} />
                  </dd>
                </motion.div>
              ))}
            </motion.dl>

            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}>
              <ArrowLink href={PORTAL.clientPortal} variant="gold">
                {t('ctaDeposit')}
              </ArrowLink>
              <LiveAccountButton look="button" variant="outlineLight" arrow={false}>
                {t('ctaOpen')}
              </LiveAccountButton>
            </motion.div>
          </div>

          <QuickDepositCard />
        </div>
      </div>
    </section>
  );
}
