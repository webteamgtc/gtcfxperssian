'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { PORTAL } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import { Reveal } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import BandLine from '@/components/shared/BandLine';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/**
 * Support CTA: a clean, compact navy band — title and text on one side, the two
 * account buttons on the other, with a quiet animated price line along the bottom.
 */
export function SupportCta() {
  const t = useTranslations('companyPage.ctaSection');
  return (
    <section id="support" className="relative bg-white py-14 text-white md:py-20">
      <div className="container-x">
        <Reveal y={24}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 px-6 py-10 shadow-2xl shadow-brand/25 md:px-12 md:py-14">
            {/* gold hairline + soft glow */}
            <span className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
            <motion.span className="absolute -end-24 -top-24 size-80 rounded-full bg-gold/25 blur-[100px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <BandLine />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_auto] lg:gap-14">
              <div>
                <h2 className="heading-section">
                  <AccentTitle text={t('title')} words={2} />
                </h2>
                <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-white/65 md:text-[15px]">{t('description')}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <LiveAccountButton variant="gold" className="justify-between">
                  {t('live')}
                </LiveAccountButton>
                <NavLink href={PORTAL.demo} className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                  {t('demo')}
                </NavLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
