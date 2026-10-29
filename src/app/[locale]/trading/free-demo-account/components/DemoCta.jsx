'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

import BandLine from '@/components/shared/BandLine';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/** Navy closing band: copy + both buttons on one side, four stat tiles on the other. */
export function DemoCta() {
  const t = useTranslations('freeDemoAccount.cta');
  const stats = t.raw('stats');

  return (
    <section id="ready" className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{t('description')}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LiveAccountButton variant="gold">
              {t('live')}
            </LiveAccountButton>
            <a href="#demo-form" className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
              {t('demo')}
            </a>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-2 gap-4" stagger={0.1}>
          {stats.map((s, i) => (
            <StaggerItem key={s.label}>
              <motion.div whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/[0.06] px-5 py-7 text-center backdrop-blur transition-colors duration-500 hover:border-gold/40">
                <span className="absolute -end-10 -top-10 size-24 rounded-full bg-gold/15 blur-2xl transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100" aria-hidden />
                <motion.div dir="ltr" className="relative text-3xl font-bold tracking-tight md:text-4xl" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.2 + i * 0.1 }}>
                  {s.value}
                </motion.div>
                <div className="relative mt-1.5 text-sm text-white/60">{s.label}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
