'use client';
/**
 * /company/about-us — content: messages/<locale>/companyPage.json → `aboutUsPage`
 * dark hero → white (numbers) → gray (brand story) → white (why GTCFX) → dark (recognition)
 * → gray (regulation + mission) → white (explore) → navy CTA band → dark footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { AboutHero } from './AboutHero';
import { Strength } from './Strength';
import { Story } from './Story';
import { WhyChoose } from './WhyChoose';
import { Recognition } from './Recognition';
import { RegulatedMission } from './RegulatedMission';
import { Explore } from './Explore';
import { AboutCta } from './AboutCta';

export default function AboutUsPage() {
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <AboutHero />
        <Strength />
        <Story />
        <WhyChoose />
        <Recognition />
        <RegulatedMission />
        <Explore />
        <AboutCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
