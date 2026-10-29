'use client';
/**
 * /markets/<slug> — one component for all 7 market pages.
 * Template A (Forex, Indices, Shares):          dark hero (orbit) → white quote cards → gray why (hub) → dark platforms → navy CTA band
 * Template B (Energy, Metals, Crypto, Futures): dark hero (spotlight) → white watchlist → gray overview cards → white why (tabs)
 *                                               → navy promo band → dark FAQ (split) → navy CTA (split + live)
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { MarketCtx } from './shared';
import { HeroOrbitA } from './heroA';
import { HeroSpotlightB } from './heroB';
import { QuotesCards, QuotesWatchlist } from './quotes';
import { WhyHubA } from './whyA';
import { WhyTabsB } from './whyB';
import { PlatformCards } from './platforms';
import { OverviewCards } from './overview';
import { FaqSplit } from './faq';
import { PromoBand } from './promo';
import { CtaCentered, CtaSplitLive } from './cta';

/** Section order per template. The CTA is shared with the symbol pages (MARKET_CTA in ./cta). */
const SECTIONS = {
  A: [HeroOrbitA, QuotesCards, WhyHubA, PlatformCards, CtaCentered],
  B: [HeroSpotlightB, QuotesWatchlist, OverviewCards, WhyTabsB, PromoBand, FaqSplit, CtaSplitLive]
};

export default function MarketPage({ page, symbols }) {
  return (
    <MarketCtx.Provider value={{ page, symbols }}>
      <div className="overflow-x-clip bg-white text-ink">
        <ScrollProgress />
        <Header theme="dark" />
        <main>
          {SECTIONS[page.template].map((S, k) => (
            <S key={k} />
          ))}
        </main>
        <Footer theme="dark" />
      </div>
    </MarketCtx.Provider>
  );
}
