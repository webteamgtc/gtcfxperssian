'use client';
/**
 * /trading/open-live-account — dark hero → white (regulation) → gray (accounts) → white (onboarding)
 * → dark (platforms) → gray (why GTCFX) → white (toolkit) → navy CTA → footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { OlaHero } from './OlaHero';
import { Regulation } from './Regulation';
import { ChooseAccount } from './ChooseAccount';
import { Onboarding } from './Onboarding';
import { PlatformsGrid } from './PlatformsGrid';
import { WhyGtcfx } from './WhyGtcfx';
import { Toolkit } from './Toolkit';
import { OlaCta } from './OlaCta';

export default function OpenLiveAccountPage() {
  return (
    <div className="dark overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <OlaHero />
        <Regulation />
        <ChooseAccount />
        <Onboarding />
        <PlatformsGrid />
        <WhyGtcfx />
        <Toolkit />
        <OlaCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
