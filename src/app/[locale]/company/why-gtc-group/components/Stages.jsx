'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Presentation, Cpu, Scale } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { SpotlightCard, EASE } from '@/components/motion';

const ICONS = { expo: Presentation, fintech: Cpu, commission: Scale };

/** Dark band: three stages on a timeline rail — node lights up, card rises in. */
export function Stages() {
  const t = useTranslations('whyGtcGroupPage.recognition');
  const items = t.raw('items');
  return (
    <section id="recognition" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[140px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />

        <div className="is-dark relative mt-12 md:mt-16">
          {/* rail */}
          <div className="absolute inset-x-0 top-[22px] hidden h-px bg-white/10 md:block" aria-hidden>
            <motion.span
              className="block h-px origin-left bg-gradient-to-r from-gold/0 via-gold to-gold/0 rtl:origin-right"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.6, ease: EASE }}
            />
          </div>

          <ol className="grid gap-6 md:grid-cols-3 md:gap-6">
            {items.map((it, i) => {
              const Icon = ICONS[it.id] ?? Presentation;
              return (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: EASE }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative grid size-11 place-items-center rounded-full bg-ink ring-1 ring-gold/50">
                      <span className="absolute inset-0 animate-ping rounded-full bg-gold/20 [animation-duration:2.6s]" aria-hidden />
                      <span className="size-2.5 rounded-full bg-gold shadow-[0_0_12px_rgba(182,135,86,0.9)]" />
                    </span>
                    <span dir="ltr" className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-200">
                      <bdi>{it.date}</bdi>
                    </span>
                  </div>
                  <SpotlightCard className="group mt-5 flex-1 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-colors duration-500 hover:border-gold/30 md:p-7">
                    <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-gold group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="heading-card mt-6">{it.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/60">{it.text}</p>
                  </SpotlightCard>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
