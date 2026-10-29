'use client';
/**
 * /company/regulations — content: messages/<locale>/companyPage.json → `regulationsPage`
 * dark hero (regulator seal + flags strip) → white (entity cards) → gray (3D globe)
 * → dark (fund protection shield) → white (GTC network diagram + notices)
 * → navy CTA band with the steps timeline → dark footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { RegHero, RegMap, Protection, Network, RegCta } from './RegSections';
import { RegEntities } from './RegEntities';

export default function RegulationsPage() {
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <RegHero />
        <RegEntities />
        <RegMap />
        <Protection />
        <Network />
        <RegCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
