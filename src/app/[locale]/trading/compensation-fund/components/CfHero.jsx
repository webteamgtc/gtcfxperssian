'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Euro, FileDown, ShieldCheck } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';

export const FC_URL = 'https://financialcommission.org';

/** Shield inside protection rings, coins orbiting, the two key figures floating as chips. */
function ShieldVault() {
  const tn = useTranslations('compensationFundPage.numbers');
  const coins = [0, 1, 2, 3, 4, 5];
  return (
    <div dir="ltr" className="relative mx-auto grid size-[340px] place-items-center md:size-[400px]" aria-hidden>
      <div className="absolute size-72 rounded-full bg-gradient-to-br from-brand/50 via-gold/25 to-transparent blur-3xl" />
      {[1, 2, 3].map((r) => (
        <motion.span key={r} className="absolute rounded-full border border-white/10" style={{ width: 120 + r * 80, height: 120 + r * 80 }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: r * 0.4, repeat: Infinity }} />
      ))}
      <motion.div className="absolute size-[300px]" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
        {coins.map((i) => {
          const a = (i / coins.length) * Math.PI * 2;
          return (
            <motion.span key={i} className="absolute grid size-9 place-items-center rounded-full bg-gradient-to-b from-gold-200 to-gold text-white shadow-lg" style={{ left: `calc(50% + ${Math.cos(a) * 150}px - 18px)`, top: `calc(50% + ${Math.sin(a) * 150}px - 18px)` }} animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
              <Euro className="size-4" strokeWidth={2.5} />
            </motion.span>
          );
        })}
      </motion.div>

      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.3 }} className="relative">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative grid size-36 place-items-center rounded-[2.2rem] bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 text-white shadow-2xl shadow-brand/40 ring-1 ring-white/20">
          <span className="absolute inset-0 rounded-[2.2rem] bg-grid-dark opacity-40" />
          <ShieldCheck className="relative size-16" strokeWidth={1.4} />
          <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] rounded-[2.2rem] bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ left: ['-50%', '150%'] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }} />
        </motion.div>
      </motion.div>

      <motion.div className="absolute end-0 top-8 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-brand/15 ring-1 ring-brand/10" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, y: [0, -6, 0] }} transition={{ opacity: { delay: 0.8 }, x: { delay: 0.8 }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}>
        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold-700">{tn('coverage.badge')}</span>
        <span className="text-2xl font-bold text-brand-900">{tn('coverage.value')}</span>
      </motion.div>
      <motion.div className="absolute bottom-10 start-0 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-brand/15 ring-1 ring-brand/10" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, y: [0, 6, 0] }} transition={{ opacity: { delay: 1 }, x: { delay: 1 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}>
        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand">{tn('funding.badge')}</span>
        <span className="text-2xl font-bold text-brand-900">{tn('funding.value')}</span>
      </motion.div>
    </div>
  );
}

export function CfHero() {
  const t = useTranslations('compensationFundPage.hero');
  const tb = useTranslations('compensationFundPage.breadcrumb');

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

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-200 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <ArrowLink href={FC_URL} variant="gold" target="_blank" rel="noopener noreferrer">
                {t('ctaVisit')}
              </ArrowLink>
              <a href="#" className="group inline-flex h-13 items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                <FileDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                {t('ctaPdf')}
              </a>
            </motion.div>
          </div>

          <ShieldVault />
        </div>

      </div>
    </section>
  );
}
