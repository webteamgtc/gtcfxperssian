'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ChartPie, Presentation, Scale, SlidersHorizontal, TrendingUp } from 'lucide-react';

import { CountUp, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import OrbitChip from '@/components/shared/OrbitChip';
import { LeverageArc } from './tradingVisuals';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const LEVELS = ['1:50', '1:100', '1:500', '1:1000'];
const CARD_ICONS = [ChartPie, TrendingUp, Presentation, SlidersHorizontal];
const CHIPS = ['from-brand to-brand-800 shadow-brand/30', 'from-gold to-gold-600 shadow-gold/30', 'from-brand-800 to-ink shadow-ink/30', 'from-brand to-brand-800 shadow-brand/30'];

/** Copy on the start side; a navy gauge card that draws its arc and counts up to 1:2000; four benefit cards below. */
export function DynamicLeverage() {
  const t = useTranslations('tradingPage.leverage');
  const tf = useTranslations('features');
  const cards = t.raw('cards');

  return (
    <section id="leverage" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal y={16}>
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <Scale className="size-5" />
            </span>
            <h2 className="heading-section mt-6">
              <AccentTitle text={t('title')} words={1} />
            </h2>
            <p className="mt-4 max-w-md text-lg font-semibold leading-snug text-ink/80">{t('subtitle')}</p>
            <p className="mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('text')}</p>
            <LiveAccountButton variant="primary" className="mt-8">
              {t('cta')}
            </LiveAccountButton>
          </Reveal>

          <Reveal y={30} delay={0.1}>
            <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-950 to-ink p-6 text-white shadow-2xl shadow-brand/25 md:p-10">
              <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
              <motion.div className="absolute -end-20 -top-20 size-64 rounded-full bg-gold/25 blur-[90px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />

              <div dir="ltr" className="relative mx-auto grid max-w-[340px] place-items-center" aria-hidden>
                {[1, 2].map((r) => (
                  <motion.span key={r} className="absolute rounded-full border border-white/10" style={{ width: 220 + r * 70, height: 220 + r * 70 }} animate={{ rotate: r % 2 ? 360 : -360 }} transition={{ duration: 30 + r * 10, repeat: Infinity, ease: 'linear' }}>
                    <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(182,135,86,0.8)]" />
                  </motion.span>
                ))}
                <div className="relative w-full">
                  <LeverageArc className="w-full" />
                  <div className="absolute inset-x-0 bottom-0 text-center">
                    <div className="text-5xl font-bold tracking-tight">
                      1:<CountUp value={2000} />
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/50">{tf('maxLeverage')}</div>
                  </div>
                </div>
              </div>

              <div dir="ltr" className="relative mt-8 grid grid-cols-4 gap-2">
                {LEVELS.map((l, i) => (
                  <motion.span key={l} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 + i * 0.1 }} className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-sm font-semibold tabular-nums text-white/80">
                    {l}
                  </motion.span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {cards.map((c, i) => (
            <StaggerItem key={c.title} className="h-full">
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group relative h-full rounded-[2rem] bg-brand/10 p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15"
              >
                <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                <div className="relative flex h-full flex-col rounded-[calc(2rem-1.5px)] bg-white p-2">
                  <div className="relative grid h-36 place-items-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#f3f5fb] via-white to-[#eaedf6]">
                    <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
                    <OrbitChip Icon={CARD_ICONS[i % CARD_ICONS.length]} chip={CHIPS[i % CHIPS.length]} speed={10 + i * 2} className="relative" />
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
                    <h3 className="heading-card">{c.title}</h3>
                    <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink/60">{c.text}</p>
                    <span className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-brand transition-all duration-700 group-hover:w-24 rtl:bg-gradient-to-l" aria-hidden />
                  </div>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
