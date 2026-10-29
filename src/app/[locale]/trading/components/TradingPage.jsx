'use client';
/**
 * /trading — dark hero → white (demo, fund) → gray (account types) → white (platforms) → gray (app)
 * → white (leverage, swap) → gray (advantages) → white (VPS, CTA)
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Toaster from '@/components/shared/Toaster';
import { ScrollProgress } from '@/components/motion';
import { TradingHero } from './TradingHero';
import { DemoAccount } from './DemoAccount';
import { FundAccount } from './FundAccount';
import { AccountTypes } from './AccountTypes';
import { PlatformShowcase } from './PlatformShowcase';
import { AppDownload } from './AppDownload';
import { DynamicLeverage } from './DynamicLeverage';
import { SwapUpdate } from './SwapUpdate';
import { TradingAdvantages } from './TradingAdvantages';
import { VpsPricing } from './VpsPricing';
import { TradingCta } from './TradingCta';

export default function TradingPage() {
  return (
    <div className="dark overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <TradingHero />
        <DemoAccount />
        <FundAccount />
        <AccountTypes />
        <PlatformShowcase />
        <AppDownload />
        <DynamicLeverage />
        <SwapUpdate />
        <TradingAdvantages />
        <VpsPricing />
        <TradingCta />
      </main>
      <Footer theme="dark" />
      <Toaster />
    </div>
  );
}
