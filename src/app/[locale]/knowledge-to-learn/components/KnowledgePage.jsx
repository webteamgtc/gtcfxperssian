'use client';
/**
 * /knowledge-to-learn — Knowledge hub.
 * Rhythm: dark hero → white (materials) → navy (GTC Go) → gray (demo account) → white (Q&A) → navy CTA.
 */
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import { ScrollProgress } from '@/components/motion';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { KnowledgeHero } from './KnowledgeHero';
import { MaterialsGrid } from './MaterialsGrid';
import { GoAppPromo } from '@/components/shared/GoAppPromo';
import { DemoAccountBand } from './DemoAccountBand';
import { QandA } from './QandA';

export default function KnowledgePage() {
  const t = useTranslations('knowledgePage.tradingJourneyCta');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <KnowledgeHero />
        <MaterialsGrid />
        <GoAppPromo />
        <DemoAccountBand />
        <QandA />
        <CtaBand id="start" title={t('title')} description={t('description')} primary={{ label: t('openAccount'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: t('contactUs'), href: '/company/contact-us' }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
