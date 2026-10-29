'use client';
/**
 * /company/dynamic-leverage
 * Rhythm: dark hero (+ at-a-glance stats) → white (schedule + basics) → gray (fixed schedule) → white (FAQ) → navy CTA.
 */
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import { ScrollProgress } from '@/components/motion';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { DlHero } from './DlHero';
import { Schedule } from './Schedule';
import { Basics } from './Basics';
import { FixedSchedule } from './FixedSchedule';
import { DlFaq } from './DlFaq';

export default function DynamicLeveragePage() {
  const t = useTranslations('dynamicLeveragePage.cta');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <DlHero />
        <Schedule />
        <Basics />
        <FixedSchedule />
        <DlFaq />
        <CtaBand id="start" eyebrow={t('eyebrow')} title={t('title')} description={t('description')} primary={{ label: t('live'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: t('demo'), href: '/trading/free-demo-account' }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
