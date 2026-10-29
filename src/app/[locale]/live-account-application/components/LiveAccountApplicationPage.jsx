'use client';
/**
 * /live-account-application[?account=<slug>][&code|ref|partner_id|…]
 * UI copy: messages/<locale>/liveApplicationPage.json → `liveAccountApplicationPage`;
 * form fields: tradingPage.liveForm (shared with the Trading page form, src/components/shared/LiveApplicationForm.jsx).
 * Rhythm: dark hero → form card lifted over the hero beside a sticky side column (account types, help) → dark footer.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { LiveAccountForm } from '@/components/shared/LiveApplicationForm';
import Toaster from '@/components/shared/Toaster';
import { Reveal, ScrollProgress } from '@/components/motion';
import LiveAccountApplicationHeroSection from './LiveAccountApplicationHeroSection';
import LiveAccountApplicationSidebar from './LiveAccountApplicationSidebar';

export default function LiveAccountApplicationPage({ accountKey, showAccount }) {
  const t = useTranslations('liveAccountApplicationPage.form');
  return (
    <div className="overflow-x-clip bg-[#f6f7fb] text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <LiveAccountApplicationHeroSection accountKey={accountKey} showAccount={showAccount} />
        <section className="relative pb-16 md:pb-24">
          <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
          <motion.span className="absolute -start-40 top-1/3 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 8, repeat: Infinity }} aria-hidden />
          <motion.span className="absolute -end-40 bottom-10 size-[420px] rounded-full bg-gold/[0.1] blur-[120px]" animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 8, repeat: Infinity }} aria-hidden />
          <div className="container-x relative -mt-28 md:-mt-32">
            <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
              <Reveal y={40} className="relative">
                <span className="absolute -inset-px -z-10 rounded-[1.85rem] bg-gradient-to-br from-gold/50 via-brand-300/30 to-brand/50 blur-sm" aria-hidden />
                <LiveAccountForm variant="page" title={t('title')} subtitle={t('subtitle')} />
              </Reveal>
              <LiveAccountApplicationSidebar />
            </div>
          </div>
        </section>
      </main>
      <Footer theme="dark" />
      <Toaster />
    </div>
  );
}
