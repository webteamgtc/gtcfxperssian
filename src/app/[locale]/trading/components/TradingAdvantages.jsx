'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

import { LaptopMockup, PhoneMockup, TabletMockup } from '@/components/shared/devices';
import { Reveal } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/** Allocation donut: investors' shares filling in around the manager. */
function Allocation() {
  const parts = [0.4, 0.25, 0.2, 0.15];
  const colors = ['#293b93', '#b68756', '#8390d4', '#d2a67a'];
  const C = 2 * Math.PI * 16;
  let acc = 0;
  return (
    <div className="relative size-24">
      <svg viewBox="0 0 40 40" className="size-full -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" stroke="#eef0f5" strokeWidth="6" />
        {parts.map((p, i) => {
          const off = acc;
          acc += p;
          return (
            <motion.circle key={i} cx="20" cy="20" r="16" fill="none" stroke={colors[i]} strokeWidth="6" strokeDasharray={`${p * C} ${C}`} strokeDashoffset={-off * C} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.2 }} />
          );
        })}
      </svg>
      <span className="absolute inset-0 grid place-items-center text-brand">
        <Users className="size-6" />
      </span>
    </div>
  );
}

export function TradingAdvantages() {
  const t = useTranslations('tradingPage.advantages');
  return (
    <section id="advantages" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <Reveal y={16} className="text-center">
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
        </Reveal>

        <div className="mt-12 grid items-center gap-12 md:mt-14 lg:grid-cols-2 lg:gap-16">
          <Reveal y={20}>
            <motion.article whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="group relative rounded-[2rem] bg-brand/10 p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15">
              <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
              <div className="relative overflow-hidden rounded-[calc(2rem-1.5px)] bg-white p-7 md:p-10">
                <div className="absolute -end-16 -top-16 size-56 rounded-full bg-brand/10 blur-[70px]" aria-hidden />
                <h3 className="heading-title relative">
                  <AccentTitle text={t('pamm.title')} />
                </h3>
                <p className="relative mt-4 text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('pamm.text')}</p>
                <LiveAccountButton variant="primary" className="relative mt-8">
                  {t('pamm.cta')}
                </LiveAccountButton>
              </div>
            </motion.article>
          </Reveal>

          <Reveal y={28} delay={0.1}>
            <div dir="ltr" className="relative grid min-h-[400px] place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-white to-[#e4e8f3] p-6 ring-1 ring-brand/10" aria-hidden>
              <div className="bg-grid-light absolute inset-0 opacity-70" />
              <div className="absolute size-80 rounded-full bg-brand/20 blur-[90px]" />
              {[1, 2, 3].map((r) => (
                <motion.span key={r} className="absolute rounded-full border border-brand/10" style={{ width: 160 + r * 90, height: 160 + r * 90 }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: r * 0.4, repeat: Infinity }} />
              ))}
              <motion.div className="relative" animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <LaptopMockup className="w-[min(78vw,400px)]" symbol="XAUUSD" price="4,158.99" seed={13} />
              </motion.div>
              <motion.div className="absolute bottom-8 start-6" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
                <TabletMockup className="w-[130px] md:w-[150px]" symbol="EURUSD" price="1.16035" seed={9} />
              </motion.div>
              <motion.div className="absolute bottom-4 start-32 md:start-40" animate={{ y: [0, -12, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>
                <PhoneMockup className="w-[64px] md:w-[72px]" dark symbol="GBPUSD" price="1.34218" seed={3} />
              </motion.div>
              <motion.div className="absolute end-6 top-6 rounded-3xl bg-white p-3 shadow-xl shadow-brand/15 ring-1 ring-brand/10" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.3 }}>
                <Allocation />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
