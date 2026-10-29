'use client';
/**
 * /trading/account-types — dark hero → gray (compare) → white (tier detail) → gray (platforms & tools)
 * → white (open in three steps) → navy CTA band → footer
 */
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import { ScrollProgress } from '@/components/motion';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { AtHero } from './AtHero';
import { CompareAccounts } from './CompareAccounts';
import { TierDetail } from './TierDetail';
import { PlatformsTools } from './PlatformsTools';
import { OpenSteps } from './OpenSteps';

function AtCta() {
  const t = useTranslations('accountTypesPage.cta');
  return <CtaBand id="start" title={t('title')} description={t('description')} primary={{ label: t('live'), href: LIVE_ACCOUNT_HREF }} />;
}

export default function AccountTypesPage() {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <AtHero />
        <CompareAccounts />
        <TierDetail />
        <PlatformsTools />
        <OpenSteps />
        <AtCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
