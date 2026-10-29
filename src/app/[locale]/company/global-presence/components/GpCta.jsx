'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

import BandLine from '@/components/shared/BandLine';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/** Navy band (same family as the Company / About CTAs): headline + text, one action. */
export function GpCta() {
  const t = useTranslations('globalPresencePage.cta');
  return (
    <section id="get-started" className="relative bg-white py-14 text-white md:py-20">
      <div className="container-x">
        <Reveal y={24}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 p-6 shadow-2xl shadow-brand/25 md:p-12">
            <span className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
            <motion.span className="absolute -end-24 -top-24 size-80 rounded-full bg-gold/25 blur-[100px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <BandLine />

            <div className="relative grid items-center gap-8 text-center lg:grid-cols-[1.3fr_auto] lg:gap-14 lg:text-start">
              <div>
                <h2 className="heading-section">
                  <AccentTitle text={t('title')} />
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-white/70 md:text-base lg:mx-0">{t('text')}</p>
              </div>
              <div className="flex justify-center">
                <LiveAccountButton variant="gold">
                  {t('live')}
                </LiveAccountButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
