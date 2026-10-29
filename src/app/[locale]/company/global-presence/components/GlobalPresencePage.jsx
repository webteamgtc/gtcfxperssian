'use client';
/**
 * /company/global-presence — content: messages/<locale>/companyPage.json → `globalPresencePage`
 * dark hero (world map) → white (five entities carousel) → gray (local support) → dark (philosophy)
 * → navy CTA band → dark footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { GpHero } from './GpHero';
import { Entities } from './Entities';
import { LocalSupport } from './LocalSupport';
import { Philosophy } from './Philosophy';
import { GpCta } from './GpCta';

export default function GlobalPresencePage() {
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <GpHero />
        <Entities />
        <LocalSupport />
        <Philosophy />
        <GpCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
