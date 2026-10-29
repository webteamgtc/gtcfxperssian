'use client';
/**
 * One page component for every GTC Go page.
 *
 *   <GtcGoPage ns="gtcGoApp" />                                 // /trading/gtc-go-app
 *   <GtcGoPage ns="gtcGoAndroidPage" device="android" />        // /trading/gtc-go-app-android
 *   <GtcGoPage ns="gtcGoIosPage" device="ios" />                // /trading/gtc-go-app-ipad
 *
 * `ns` holds the hero text; the body always reads `bodyNs` (default 'gtcGoApp').
 * Rhythm: dark hero → white (asset class + workstation) → gray (pillars + navy app band).
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { AppHero, DeviceHero } from './GoHero';
import { AssetClass, GetTheApp, Pillars, Workstation } from './GoSections';

export default function GtcGoPage({ ns = 'gtcGoApp', bodyNs = 'gtcGoApp', device }) {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        {device ? <DeviceHero ns={ns} device={device} /> : <AppHero ns={ns} />}
        <AssetClass ns={bodyNs} />
        <Workstation ns={bodyNs} />
        <Pillars ns={bodyNs} />
        <GetTheApp ns={bodyNs} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
