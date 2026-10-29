'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ShieldCheck, Quote } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';

/** Regulators strip + a connector line into the mission statement. */
export function RegulatedMission() {
  const t = useTranslations('aboutUsPage');
  const regs = t.raw('regulated.items');
  return (
    <section id="regulated" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal y={16} className="max-w-2xl">
            <h2 className="heading-section">
              <AccentTitle text={t('regulated.title')} />
            </h2>
          </Reveal>
          <Reveal y={12} delay={0.1}>
            <ArrowLink href="/company/regulations">{t('regulated.cta')}</ArrowLink>
          </Reveal>
        </div>

        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" stagger={0.07}>
          {regs.map((r) => (
            <StaggerItem key={r.code}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }} className="group relative overflow-hidden rounded-2xl border border-brand/10 bg-white p-5 text-center shadow-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-brand/10">
                <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold to-brand transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" aria-hidden />
                <ShieldCheck className="mx-auto size-5 text-gold-700" />
                <div dir="ltr" className="heading-accent mt-3 text-2xl font-bold">
                  {r.code}
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">{r.country}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* connector */}
        <div className="flex justify-center py-10 md:py-14" aria-hidden>
          <div className="flex flex-col items-center">
            <motion.span className="w-px origin-top bg-gradient-to-b from-brand/0 to-brand" initial={{ height: 0 }} whileInView={{ height: 96 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} />
            <motion.span className="size-3 rotate-45 bg-brand" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, type: 'spring' }} />
          </div>
        </div>

        {/* mission */}
        <Reveal y={20} className="relative mx-auto max-w-4xl text-center">
          <Quote className="mx-auto size-10 text-gold/60 rtl:-scale-x-100" aria-hidden />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">{t('mission.label')}</p>
          <blockquote className="heading-section mt-5">
            “<AccentTitle text={t('mission.quote')} />”
          </blockquote>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">{t('mission.signature')}</p>
        </Reveal>
      </div>
    </section>
  );
}
