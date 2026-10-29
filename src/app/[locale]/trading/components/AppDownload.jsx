'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import GtcGoPhone, { StoreBadges } from '@/components/shared/GtcGoPhone';
import { PORTAL } from '@/config/menu';
import ArrowLink from '@/components/shared/ArrowLink';
import { Reveal } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';

const PHONES = [
  { cls: 'z-10 w-[170px] md:w-[190px]', from: { x: 80, rotate: 0 }, to: { x: 0, rotate: -8 }, float: 6 },
  { cls: 'z-20 w-[200px] md:w-[220px]', from: { y: 40 }, to: { y: -12 }, float: 5 },
  { cls: 'z-10 hidden w-[170px] sm:block md:w-[190px]', from: { x: -80, rotate: 0 }, to: { x: 0, rotate: 8 }, float: 7 }
];

/** Dark band: pulsing rings, store badges and three phones that fan out as they come into view. */
export function AppDownload() {
  const t = useTranslations('tradingPage.download');

  return (
    <section id="download" className="is-dark relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div dir="ltr" className="pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        {[320, 520, 720, 920].map((sz, i) => (
          <motion.div key={sz} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" style={{ width: sz, height: sz }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: i * 0.6, repeat: Infinity }} />
        ))}
      </div>
      <motion.div className="absolute left-1/2 top-[62%] size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/40 blur-[120px]" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 8, repeat: Infinity }} aria-hidden />

      <div className="container-x relative text-center">
        <SectionIntro dark title={t('title')} description={t('text')} />
        <Reveal y={16} delay={0.12} className="mt-9 flex flex-col items-center gap-6">
          <StoreBadges dark className="justify-center" />
          <ArrowLink href={PORTAL.demo} variant="gold">
            {t('cta')}
          </ArrowLink>
        </Reveal>

        <div dir="ltr" className="relative mx-auto mt-14 flex max-w-xl items-end justify-center -space-x-6" aria-hidden>
          {PHONES.map((p, i) => (
            <motion.div key={i} className={`relative ${p.cls}`} initial={{ opacity: 0, ...p.from }} whileInView={{ opacity: 1, ...p.to }} viewport={{ once: true, amount: 0.3 }} transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.15 + i * 0.1 }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: p.float, repeat: Infinity, ease: 'easeInOut' }}>
                <GtcGoPhone className="w-full" dark />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
