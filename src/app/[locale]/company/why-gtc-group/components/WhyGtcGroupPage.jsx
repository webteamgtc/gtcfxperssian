'use client';
/**
 * /company/why-gtc-group — content: messages/<locale>/companyPage.json → `whyGtcGroupPage`
 * dark hero (numbers) → white (mission + commitments) → gray (rooted in Dubai) → dark (recognition)
 * → white (what makes us different) → gray (client voices) → navy CTA band → dark footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { WhyHero } from './WhyHero';
import { Commitments } from './Commitments';
import { Rooted } from './Rooted';
import { Stages } from './Stages';
import { Edge } from './Edge';
import { Voices } from './Voices';
import { WhyCta } from './WhyCta';

export default function WhyGtcGroupPage() {
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <WhyHero />
        <Commitments />
        <Rooted />
        <Stages />
        <Edge />
        <Voices />
        <WhyCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
