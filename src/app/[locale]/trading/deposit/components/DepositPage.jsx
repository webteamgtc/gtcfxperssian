'use client';
/**
 * /trading/deposit — dark hero → white (payment methods) → gray (how it works)
 * → white (security) → navy CTA card → footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { DepositHero } from './DepositHero';
import { PaymentMethods } from './PaymentMethods';
import { HowItWorks } from './HowItWorks';
import { FundSecurity } from './FundSecurity';
import { DepositCta } from './DepositCta';

export default function DepositPage() {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <DepositHero />
        <PaymentMethods />
        <HowItWorks />
        <FundSecurity />
        <DepositCta />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
