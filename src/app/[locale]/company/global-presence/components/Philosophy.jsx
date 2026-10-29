'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Landmark, SearchCheck, ShieldCheck } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { SpotlightCard, EASE } from '@/components/motion';

const ICONS = { licence: Landmark, transparent: SearchCheck, layered: ShieldCheck };

/** Dark band: "the line" is drawn across, each principle hangs from it. */
export function Philosophy() {
  const t = useTranslations('globalPresencePage.philosophy');
  const items = t.raw('items');
  return (
    <section id="philosophy" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[140px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />

        <div className="is-dark relative mt-14 md:mt-20">
          {/* the line */}
          <div className="absolute inset-x-0 top-7 hidden md:block" aria-hidden>
            <motion.span
              className="block h-px origin-center bg-gradient-to-r from-gold/0 via-gold to-gold/0"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.6, ease: EASE }}
            />
            <motion.span className="absolute -top-[3px] size-[7px] rounded-full bg-gold shadow-[0_0_12px_rgba(182,135,86,0.9)]" animate={{ left: ['5%', '95%', '5%'] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
          </div>

          <ul className="grid gap-6 md:grid-cols-3">
            {items.map((it, i) => {
              const Icon = ICONS[it.id] ?? ShieldCheck;
              return (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.15, ease: EASE }}
                  className="flex flex-col items-center"
                >
                  <span className="relative z-10 grid size-14 place-items-center rounded-full bg-ink text-gold-200 ring-1 ring-gold/50">
                    <span className="absolute inset-0 animate-ping rounded-full bg-gold/15 [animation-duration:2.8s]" aria-hidden />
                    <Icon className="relative size-6" />
                  </span>
                  <span className="h-6 w-px bg-gradient-to-b from-gold/60 to-white/10" aria-hidden />
                  <SpotlightCard className="group w-full flex-1 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur transition-colors duration-500 hover:border-gold/30 md:p-8">
                    <h3 className="heading-card">{it.title}</h3>
                    <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-white/60">{it.text}</p>
                  </SpotlightCard>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
