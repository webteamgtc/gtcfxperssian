'use client';
import { useTranslations } from 'next-intl';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal } from '@/components/motion';

/** First six questions cover tiered leverage, the rest cover HMR (two lists, as in the design). */
const SPLIT = 6;

export function DlFaq() {
  const t = useTranslations('dynamicLeveragePage.faq');
  const items = t.raw('items');
  return (
    <section id="faq" className="relative overflow-clip bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-1/3 size-[420px] rounded-full bg-brand/[0.05] blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
        <Reveal className="lg:sticky lg:top-28 lg:self-start" y={16}>
          <h2 className="heading-section text-center lg:text-start">
            <AccentTitle text={t('title')} />
          </h2>
        </Reveal>
        <div className="space-y-10">
          <FaqAccordion items={items.slice(0, SPLIT)} />
          <FaqAccordion items={items.slice(SPLIT)} defaultOpen={-1} />
        </div>
      </div>
    </section>
  );
}
