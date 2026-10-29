'use client';
/**
 * /trading/copy-trading
 * Rhythm: dark hero → white (what is copy trading) → gray (top traders: carousel, features, live leaderboard)
 * → white (how it works + risk disclosure).
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { CopyHero } from './CopyHero';
import { TopTraders } from './TopTraders';
import { HowItWorks, RiskDisclosure, WhatIsCopy } from './CopySections';

export default function CopyTradingPage() {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <CopyHero />
        <WhatIsCopy />
        <TopTraders />
        <HowItWorks />
        <RiskDisclosure />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
