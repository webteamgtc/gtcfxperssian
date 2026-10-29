'use client';
/**
 * /markets — dark hero (coins + live tape) → white (market instruments, slats) → gray (market news carousel)
 * → dark band (forex sessions + economic calendar) → navy CTA (split + live prices) → footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { MarketsHero } from './MarketsHero';
import { Instruments } from './Instruments';
import NewsCarousel from '@/components/shared/news/NewsCarousel';
import { EconomicCalendar } from './EconomicCalendar';
import { MarketsCta } from './MarketsCta';

export default function MarketsPage({ news }) {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <MarketsHero />
        <Instruments />
        <NewsCarousel articles={news} />
        <EconomicCalendar />
        <MarketsCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
