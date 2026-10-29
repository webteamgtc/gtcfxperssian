'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { CountUp, Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import OrbitChip from '@/components/shared/OrbitChip';
import { DEMO_LOOKS } from './tradingVisuals';

/** Start With A Demo: six cards, each with a lit stage (orbit chip + live mini illustration) over the copy. */
export function DemoAccount() {
  const t = useTranslations('tradingPage.demo');
  const cards = [...t.raw('stats'), ...t.raw('features')];

  return (
    <section id="demo" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />

      <div className="container-x relative">
        <SectionIntro layout="split" title={`${t('titleA')} ${t('titleB')}`} sub={t('lead')} description={t('text')} />

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3" stagger={0.08}>
          {cards.map((c, i) => {
            const { Icon, Stage, chip } = DEMO_LOOKS[i % DEMO_LOOKS.length];
            const num = Number(c.value);
            return (
              <StaggerItem key={`${c.title}-${i}`} className="h-full">
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="group relative h-full rounded-[2rem] bg-brand/10 p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15"
                >
                  {/* gradient ring on hover */}
                  <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                  <div className="relative flex h-full flex-col rounded-[calc(2rem-1.5px)] bg-white p-2">
                    {/* stage */}
                    <div className="relative flex h-40 items-center justify-between overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#f3f5fb] via-white to-[#eaedf6] px-6 md:h-44">
                      <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
                      <OrbitChip Icon={Icon} chip={chip} speed={10 + i * 2} className="relative" />
                      <div className="relative transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-105">
                        <Stage />
                      </div>
                      {c.tag && (
                        <span className="absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand shadow-sm ring-1 ring-brand/10">
                          {c.tag}
                        </span>
                      )}
                    </div>
                    {/* copy */}
                    <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
                      {c.value && (
                        <div dir="ltr" className="mb-2 text-3xl font-bold tracking-tight text-ink rtl:text-end">
                          {Number.isFinite(num) ? <CountUp value={num} /> : c.value}
                          {c.unit && <span className="heading-accent ms-1">{c.unit}</span>}
                        </div>
                      )}
                      <h3 className="heading-card">{c.title}</h3>
                      <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink/60">{c.text}</p>
                      <span className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-brand transition-all duration-700 group-hover:w-24 rtl:bg-gradient-to-l" aria-hidden />
                    </div>
                  </div>
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
