'use client';
/**
 * /company/awards — content: messages/<locale>/companyPage.json → `awardsPage`; award images: public/awards/<n>.webp
 * dark hero (trophy on a lit stage, stats, issuers) → gray (year filter + awards) → dark (award cities map)
 * → navy CTA (open-account steps) → dark footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { AwardsHero, AwardsGallery, AwardsMapBand } from './AwardsSections';
import { AwardsCta } from './shared';

export default function AwardsPage() {
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main className="text-ink">
        <AwardsHero />
        <AwardsGallery />
        <AwardsMapBand />
        <AwardsCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
