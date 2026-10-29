'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Euro, PieChart, ShieldCheck } from 'lucide-react';
import RingCard from '@/components/shared/RingCard';
import { CountUp, Stagger, StaggerItem, EASE } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';

/** Donut that fills a 10% slice (funding share of membership fees). */
function FundingDonut() {
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div dir="ltr" className="relative grid size-40 place-items-center" aria-hidden>
      <svg viewBox="0 0 130 130" className="absolute inset-0 -rotate-90">
        <circle cx="65" cy="65" r={R} fill="none" stroke="rgba(41,59,147,0.1)" strokeWidth="14" />
        <motion.circle cx="65" cy="65" r={R} fill="none" stroke="url(#cf-donut)" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: C * 0.9 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE, delay: 0.3 }} />
        <defs>
          <linearGradient id="cf-donut" x1="0" x2="1">
            <stop offset="0" stopColor="#293b93" />
            <stop offset="1" stopColor="#8390d4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10">
        <PieChart className="size-7" />
      </span>
    </div>
  );
}

/** Coin stack that builds up, with a shield on top (max coverage). */
function CoverageStack() {
  return (
    <div dir="ltr" className="relative flex h-40 items-end justify-center gap-2" aria-hidden>
      {[3, 5, 7].map((count, c) => (
        <div key={c} className="flex flex-col-reverse items-center">
          {Array.from({ length: count }).map((_, i) => (
            <motion.span key={i} className="-mt-1.5 block h-3.5 w-12 rounded-[50%] border-b-[3px] border-gold-700 bg-gradient-to-b from-gold-200 to-gold first:mt-0" initial={{ opacity: 0, y: -24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + c * 0.25 + i * 0.07, type: 'spring', stiffness: 260, damping: 18 }} />
          ))}
        </div>
      ))}
      <motion.span className="absolute -top-2 end-6 grid size-11 place-items-center rounded-xl bg-white text-gold-700 shadow-lg ring-1 ring-gold/30" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <ShieldCheck className="size-5" />
      </motion.span>
    </div>
  );
}

export function ByNumbers() {
  const t = useTranslations('compensationFundPage.numbers');

  return (
    <section id="numbers" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} />

        <Stagger className="mt-12 grid gap-6 md:mt-14 md:grid-cols-2" stagger={0.15}>
          <StaggerItem className="h-full">
            <RingCard innerClassName="flex-col gap-6 p-7 sm:flex-row sm:items-center md:p-9">
              <FundingDonut />
              <div className="flex-1">
                <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand ring-1 ring-brand/10">{t('funding.badge')}</span>
                <div dir="ltr" className="heading-accent mt-4 text-5xl font-bold tracking-tight md:text-6xl rtl:text-end">
                  <CountUp value={10} suffix="%" />
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{t('funding.text')}</p>
              </div>
            </RingCard>
          </StaggerItem>
          <StaggerItem className="h-full">
            <RingCard innerClassName="flex-col gap-6 bg-gradient-to-br from-gold-50/70 to-white p-7 sm:flex-row sm:items-center md:p-9">
              <CoverageStack />
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">
                  <Euro className="size-3" />
                  {t('coverage.badge')}
                </span>
                <div dir="ltr" className="mt-4 text-5xl font-bold tracking-tight text-gold-700 md:text-6xl rtl:text-end">
                  <CountUp value={20000} prefix="€" />
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{t('coverage.text')}</p>
              </div>
            </RingCard>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
