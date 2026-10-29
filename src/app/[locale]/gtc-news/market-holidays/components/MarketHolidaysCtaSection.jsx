'use client';
/** Navy CTA band (split): heading, copy and two caution chips on one side, account / support buttons on the other. */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Headset } from 'lucide-react';
import BandLine from '@/components/shared/BandLine';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

export default function MarketHolidaysCtaSection() {
  const t = useTranslations('marketHolidaysPage.cta');
  return (
    <section id="start" className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div dir="ltr" className="pointer-events-none absolute end-[12%] top-1/2 -translate-y-1/2" aria-hidden>
        {[260, 420, 580, 740].map((sz, i) => (
          <motion.span key={sz} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/15" style={{ width: sz, height: sz }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: i * 0.6, repeat: Infinity }} />
        ))}
      </div>
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div className="text-center lg:text-start">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('heading')} words={2} />
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base lg:mx-0">{t('sub')}</p>
          </Reveal>
          <Stagger className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start" stagger={0.1} delay={0.2}>
            {[t('hoursBadge'), t('liquidityBadge')].map((b) => (
              <StaggerItem key={b} className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/85 ring-1 ring-white/15 backdrop-blur">
                {b}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <Reveal y={16} delay={0.12} className="mx-auto flex w-full max-w-sm flex-col gap-3 lg:me-0">
          <LiveAccountButton variant="gold" className="justify-between">
            {t('openCta')}
          </LiveAccountButton>
          <NavLink href="/company/contact-us" className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
            <Headset className="size-4" />
            {t('contactCta')}
          </NavLink>
        </Reveal>
      </div>
    </section>
  );
}
