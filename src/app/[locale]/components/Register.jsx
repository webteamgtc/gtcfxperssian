'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Steps } from '@/components/shared/blocks';
import CommonLeadForm from '@/components/shared/CommonLeadForm';
import { Reveal, WordReveal } from '@/components/motion';

export function Register() {
  const t = useTranslations('register');
  return (
    <section id="register" className="relative overflow-hidden py-10 md:py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" />
      <div dir="ltr" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[300, 500, 700, 900].map((sz, i) => (
          <motion.div key={sz} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" style={{ width: sz, height: sz }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: i * 0.6, repeat: Infinity }} />
        ))}
      </div>
      <div className="container-x relative mx-auto max-w-5xl text-center">
        <h2 className="heading-section is-dark">
          <WordReveal text={t('title')} />
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-5 max-w-md text-white/60">{t('subtitle')}</p>
        </Reveal>
        <div className="mx-auto max-w-2xl">
          <Steps dark />
        </div>
        <Reveal y={40} className="mt-12">
          <div className="border-beam rounded-[2rem] bg-[#10132a]/90 p-5 text-start shadow-2xl backdrop-blur-xl md:p-7">
            <CommonLeadForm dark wide />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
