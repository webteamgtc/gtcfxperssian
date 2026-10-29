'use client';
/**
 * /knowledge-to-learn/platform-guide — GTC Go app + client-portal guides (Google Drive) and tutorial videos (YouTube).
 * Rhythm: dark hero → gray (guide browser) → navy CTA.
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import PlatformHeroSection from './PlatformHeroSection';
import PlatformContentSection from './PlatformContentSection';
import PlatformCtaSection from './PlatformCtaSection';

export default function PlatformGuidePage() {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <PlatformHeroSection />
        <PlatformContentSection />
        <PlatformCtaSection />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
