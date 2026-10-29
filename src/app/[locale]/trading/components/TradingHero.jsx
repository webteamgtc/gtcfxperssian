'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { LaptopMockup, PhoneMockup } from '@/components/shared/devices';
import { Reveal, EASE } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import HeroTradingBackdrop from '@/components/shared/HeroBackdrop';
import { LiveAccountForm } from '@/components/shared/LiveApplicationForm';

export function TradingHero() {
  const t = useTranslations('tradingPage.hero');
  const tb = useTranslations('tradingPage.breadcrumb');

  return (
    <section id="apply" className="is-dark relative scroll-mt-20 overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <HeroTradingBackdrop />

      <div className="container-x relative">
        <Breadcrumb items={[{ label: tb('home'), href: '/' }, { label: tb('trading') }]} className="lg:justify-start" />

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-start">
            <motion.h1 className="heading-page max-w-xl lg:max-w-none" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} words={1} />
            </motion.h1>
            <motion.p className="mt-4 text-xl font-semibold text-gold-200 md:text-2xl" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}>
              {t('subtitle')}
            </motion.p>
            <Reveal y={24} delay={0.35} className="relative mt-12 hidden md:block">
              <div className="relative flex items-end justify-center gap-5 lg:justify-start">
                <LaptopMockup className="w-[min(100%,360px)]" symbol="EURUSD" price="1.16035" seed={21} />
                <PhoneMockup className="mb-8 w-[145px]" symbol="XAUUSD" price="4158.99" seed={11} />
              </div>
            </Reveal>
          </div>

          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.85, ease: EASE }}>
            <LiveAccountForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
