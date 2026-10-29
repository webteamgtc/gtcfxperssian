'use client';
/**
 * /trading/pamm-account
 * Rhythm: dark hero (manager dashboard) → white (what is PAMM) → gray (leaderboard) → white (steps + FAQ) → navy CTA.
 */
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import FaqAccordion from '@/components/shared/FaqAccordion';
import NumberedSteps from '@/components/shared/NumberedSteps';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { ScrollProgress } from '@/components/motion';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { PammHero } from './PammHero';
import { WhatIsPamm } from './WhatIsPamm';
import { Leaderboard } from './Leaderboard';

function PammSteps() {
  const t = useTranslations('pammPage.steps');
  return (
    <section id="steps" className="relative overflow-hidden bg-white pt-14 md:pt-24">
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <NumberedSteps steps={t.raw('items')} ringClass="ring-white" className="mt-12 md:mt-16" />
      </div>
    </section>
  );
}

function PammFaq() {
  const t = useTranslations('pammPage.faq');
  return (
    <section id="faq" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-1/3 size-[420px] rounded-full bg-brand/[0.05] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <FaqAccordion items={t.raw('items')} numbered className="mx-auto mt-10 max-w-3xl md:mt-12" />
      </div>
    </section>
  );
}

export default function PammPage() {
  const t = useTranslations('pammPage.cta');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <PammHero />
        <WhatIsPamm />
        <Leaderboard />
        <PammSteps />
        <PammFaq />
        <CtaBand id="start" eyebrow={t('eyebrow')} title={t('title')} description={t('description')} primary={{ label: t('live'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: t('investor'), href: LIVE_ACCOUNT_HREF }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
