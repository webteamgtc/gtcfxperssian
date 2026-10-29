'use client';
/**
 * /gtc-news/market-holidays
 * UI copy: messages/<locale>/gtcNewsPage.json → `marketHolidaysPage`; holidays: Strapi uploads (src/lib/marketHolidays.js via page.js)
 * Rhythm: dark hero (live quotes) → white (trading hours) → gray (holiday calendar) → white (instruments) → navy CTA → dark footer.
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import MarketHolidaysHeroSection from './MarketHolidaysHeroSection';
import TradingHoursSection from './TradingHoursSection';
import HolidayCalendarSection from './HolidayCalendarSection';
import TradeableInstrumentsSection from './TradeableInstrumentsSection';
import MarketHolidaysCtaSection from './MarketHolidaysCtaSection';

export default function MarketHolidaysPage({ holidays = [], today }) {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <MarketHolidaysHeroSection />
        <TradingHoursSection />
        <HolidayCalendarSection events={holidays} today={today} />
        <TradeableInstrumentsSection />
        <MarketHolidaysCtaSection />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
