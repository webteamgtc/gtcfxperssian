'use client';
/**
 * /trading/vps-hosting-services
 * Rhythm: dark hero (server status + stat band) → gray (plans) → white (PC vs VPS) → white (FAQ) → dark (apply form).
 * The selected plan is shared: "Subscribe Now" on a plan preselects it in the application form.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { ScrollProgress } from '@/components/motion';
import { VpsHero } from './VpsHero';
import { Plans } from './Plans';
import { Compare } from './Compare';
import { ApplySection } from './ApplySection';

function VpsFaq() {
  const t = useTranslations('vpsHostingPage.faq');
  return (
    <section id="faq" className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <FaqAccordion items={t.raw('items')} numbered className="mx-auto mt-10 max-w-3xl md:mt-12" />
      </div>
    </section>
  );
}

export default function VpsPage() {
  const [pkg, setPkg] = useState('bronze');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <VpsHero />
        <Plans onSelect={setPkg} />
        <Compare />
        <VpsFaq />
        <ApplySection pkg={pkg} onPkg={setPkg} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
