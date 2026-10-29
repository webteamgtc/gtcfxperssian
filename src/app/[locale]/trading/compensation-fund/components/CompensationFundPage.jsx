'use client';
/**
 * /trading/compensation-fund — dark hero → white (what is / what it brings) → gray (how funds are managed)
 * → white (by the numbers) → gray (coverage scope) → navy CTA band → footer
 */
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import { ScrollProgress } from '@/components/motion';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { CfHero } from './CfHero';
import { AboutFc } from './AboutFc';
import { FundsManaged } from './FundsManaged';
import { ByNumbers } from './ByNumbers';
import { CoverageScope } from './CoverageScope';

function CfCta() {
  const t = useTranslations('compensationFundPage.cta');
  return <CtaBand id="learn-more" title={t('title')} description={t('description')} primary={{ label: t('live'), href: LIVE_ACCOUNT_HREF }} />;
}

export default function CompensationFundPage() {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <CfHero />
        <AboutFc />
        <FundsManaged />
        <ByNumbers />
        <CoverageScope />
        <CfCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
