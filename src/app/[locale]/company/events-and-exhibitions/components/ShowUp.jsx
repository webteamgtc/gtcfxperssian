'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Users, RefreshCcw, ShieldCheck } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { SpotlightCard, EASE } from '@/components/motion';

const ICONS = { face: Users, sync: RefreshCcw, trust: ShieldCheck };

/** Dark band: three reasons, each icon sits in a slowly turning dashed ring. */
export function ShowUp() {
  const t = useTranslations('eventsPage.philosophy');
  const items = t.raw('items');
  return (
    <section id="why-we-show-up" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[140px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />
        <ul className="is-dark mt-12 grid gap-5 md:mt-14 md:grid-cols-3">
          {items.map((it, i) => {
            const Icon = ICONS[it.id] ?? Users;
            return (
              <motion.li key={it.id} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }} className="h-full">
                <SpotlightCard className="group h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors duration-500 hover:border-gold/30 md:p-8">
                  <span className="relative grid size-16 place-items-center">
                    <motion.span className="absolute inset-0 rounded-full border border-dashed border-gold/50" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} aria-hidden />
                    <span className="grid size-11 place-items-center rounded-full bg-white/10 text-gold-200 ring-1 ring-white/15 transition-all duration-500 group-hover:bg-gold group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                  </span>
                  <h3 className="heading-card mt-6">{it.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/60">{it.text}</p>
                </SpotlightCard>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
