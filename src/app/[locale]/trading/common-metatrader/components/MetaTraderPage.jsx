'use client';
/**
 * One page component for every MetaTrader page.
 *
 *   <MetaTraderPage ns="mt4Page" version="mt4" />                                  // /trading/mt4-platform
 *   <MetaTraderPage ns="mt5Page" version="mt5" />                                  // /trading/mt5-platform
 *   <MetaTraderPage ns="metatraderIpadPage" bodyNs="mt4Page" version="mt4" device="ios" />
 *   <MetaTraderPage ns="metatraderAndroidPage" bodyNs="mt4Page" version="mt4" device="android" />
 *
 * `ns` holds the hero text; `bodyNs` (defaults to `ns`) holds the rest, so the device pages reuse the MT4 body.
 * Rhythm: dark hero → white (capabilities) → gray (devices) → white (edge) → gray (steps) → white (FAQ) → navy CTA.
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { DeviceHero, PlatformHero } from './MtHero';
import { BetterEdge, Capabilities, CrossDevice, MtCta, MtFaq, ThreeSteps } from './MtSections';

export default function MetaTraderPage({ ns, bodyNs, version = 'mt4', device,links }) {
  const body = bodyNs ?? ns;
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        {device ? <DeviceHero ns={ns} device={device} links={links}/> : <PlatformHero ns={ns} version={version} links={links}/>}
        <Capabilities ns={body} version={version} />
        <CrossDevice ns={body} version={version} />
        <BetterEdge ns={body} />
        <ThreeSteps ns={body} />
        <MtFaq ns={body} />
        <MtCta ns={body} version={version} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
