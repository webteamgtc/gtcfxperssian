'use client';
/**
 * /company — Company hub. Same rhythm as the homepage (Draft 4):
 * dark hero → white (legal) → gray (awards) → white (leverage) → gray (trust) → white (help) → dark (partners) → white (CTA) → dark footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { CompanyHero } from './CompanyHero';
import { Legal } from './Legal';
import { Awards } from './Awards';
import { Leverage } from './Leverage';
import { TrustPromise } from './TrustPromise';
import { HelpCenter } from './HelpCenter';
import { Partner } from './Partner';
import { SupportCta } from './SupportCta';

export default function CompanyPage() {
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <CompanyHero />
        <Legal />
        <Awards />
        <Leverage />
        <TrustPromise />
        <HelpCenter />
        <Partner />
        <SupportCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
