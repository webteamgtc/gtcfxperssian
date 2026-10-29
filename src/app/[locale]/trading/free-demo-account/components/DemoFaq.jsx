'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { MessageCircleQuestion } from 'lucide-react';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal } from '@/components/motion';

/** Floating question bubble in orbit rings (decorative). */
function QuestionOrb() {
  return (
    <div dir="ltr" className="relative mx-auto mt-10 grid size-56 place-items-center lg:mx-0" aria-hidden>
      {[1, 2, 3].map((r) => (
        <motion.span key={r} className="absolute rounded-full border border-brand/10" style={{ width: 70 + r * 50, height: 70 + r * 50 }} animate={{ scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: r * 0.4, repeat: Infinity }} />
      ))}
      <motion.span className="absolute size-[220px] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_14px_rgba(182,135,86,0.9)]" />
      </motion.span>
      <motion.span className="relative grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand to-brand-900 text-white shadow-2xl shadow-brand/30" animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <MessageCircleQuestion className="size-9" strokeWidth={1.6} />
      </motion.span>
    </div>
  );
}

/** FAQ: sticky intro + orb on the start side, numbered accordion on the end side. */
export function DemoFaq() {
  const t = useTranslations('freeDemoAccount.faq');
  return (
    <section id="faq" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-white/70 blur-[100px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal y={16} className="text-center lg:sticky lg:top-28 lg:self-start lg:text-start">
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base lg:mx-0">{t('description')}</p>
          <div className="hidden lg:block">
            <QuestionOrb />
          </div>
        </Reveal>
        <FaqAccordion items={t.raw('items')} numbered />
      </div>
    </section>
  );
}
