'use client';
/**
 * /trading/swap-update
 * Rhythm: dark hero (live cost dashboard) → white (swap table) → navy CTA.
 */
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import { ScrollProgress } from '@/components/motion';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { SwapHero } from './SwapHero';
import { SwapTable } from './SwapTable';

export default function SwapUpdatePage() {
  const t = useTranslations('swapUpdatePage.cta');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <SwapHero />
        <SwapTable />
        <CtaBand id="start" title={t('title')} description={t('description')} primary={{ label: t('live'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: t('demo'), href: '/trading/free-demo-account' }} riskTitle={t('riskTitle')} risk={t('risk')} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
