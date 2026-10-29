'use client';
/**
 * "Apply for Your GTCFX Trading Server" — dark band: copy + selected-plan summary on the start side,
 * the VPS application form (./VpsApplyForm) on the end side.
 */
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { CircleCheck } from 'lucide-react';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { VpsApplyForm } from './VpsApplyForm';

export function ApplySection({ pkg, onPkg }) {
  const t = useTranslations('vpsHostingPage.apply');
  const packages = useTranslations('vpsHostingPage.plans').raw('items');
  const current = packages.find((p) => p.id === pkg) ?? packages[0];

  return (
    <section id="apply" className="is-dark relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-brand-900 via-brand-950 to-ink py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -start-24 top-1/4 size-96 rounded-full bg-brand-500/30 blur-[120px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 7, repeat: Infinity }} aria-hidden />
      <span className="absolute -end-24 bottom-0 size-96 rounded-full bg-gold/10 blur-[120px]" aria-hidden />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal y={16}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-200">{t('eyebrow')}</p>
          <h2 className="heading-section mt-4">
            <AccentTitle text={t('title')} accentClassName="text-gradient-gold" />
          </h2>
          <p className="mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-white/70 md:text-base">{t('text')}</p>

          {/* selected package summary */}
          <AnimatePresence mode="wait">
            <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="mt-9 max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{current.name}</span>
                <span dir="ltr" className="text-gradient-gold text-2xl font-bold">
                  {current.price}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {current.features.slice(0, 3).map((f) => (
                  <div key={f.icon} className="rounded-xl bg-white/[0.06] px-2 py-2.5 ring-1 ring-white/10">
                    <div className="text-xs font-bold text-white">{f.value}</div>
                    <div className="mt-0.5 text-[10px] text-white/50">{f.label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-green-300">
                <CircleCheck className="mt-px size-3.5 shrink-0" />
                {current.free}
              </p>
            </motion.div>
          </AnimatePresence>
        </Reveal>

        <Reveal y={24} delay={0.1}>
          <VpsApplyForm pkg={current.id} onPkg={onPkg} packages={packages} />
        </Reveal>
      </div>
    </section>
  );
}
