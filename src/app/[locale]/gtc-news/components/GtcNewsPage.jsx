'use client';
/**
 * /gtc-news — GTC News hub (posts from Strapi `blogs`, src/lib/news.js).
 * Rhythm: dark hero (latest event / article / company news / market update) → gray (market trends: a block per category) → white (knowledge hub: latest event)
 * → navy swap-free activation band.
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import NewsHubHero from './NewsHubHero';
import TrendsSection from './TrendsSection';
import KnowledgeHubSection from './KnowledgeHubSection';
import ActivationBand from './ActivationBand';

export default function GtcNewsPage({ sections, featured }) {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <NewsHubHero sections={sections} featured={featured} />
        <TrendsSection sections={sections} />
        <KnowledgeHubSection featured={featured} />
        <ActivationBand />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
