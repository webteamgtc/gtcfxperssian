'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';

import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/** Dark band: awards as an animated list; each row lights up on hover. */
export function Recognition() {
  const t = useTranslations('aboutUsPage.recognition');
  const items = t.raw('items');
  return (
    <section id="recognition" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute left-1/2 top-1/3 size-[520px] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />

        <ul className="is-dark mx-auto mt-12 max-w-5xl md:mt-14">
          {items.map((a, i) => (
            <motion.li
              key={a.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
              className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/10 px-2 py-5 md:grid-cols-[auto_1.3fr_1fr_auto] md:gap-8 md:px-5"
            >
              <span className="absolute inset-0 origin-left scale-x-0 rounded-2xl bg-white/[0.05] transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" aria-hidden />
              <span className="relative grid size-11 place-items-center rounded-2xl bg-white/5 text-gold-200 ring-1 ring-white/10 transition-all duration-500 group-hover:bg-gold group-hover:text-white">
                <Award className="size-5" />
              </span>
              <div className="relative min-w-0">
                <h3 className="heading-card">{a.title}</h3>
                <p className="mt-1 text-sm text-white/50 md:hidden">{a.by}</p>
              </div>
              <p className="relative hidden text-sm text-white/55 md:block">{a.by}</p>
              <div className="relative text-end">
                <div dir="ltr" className="heading-accent text-xl font-bold md:text-2xl">
                  {a.year}
                </div>
                <div className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 sm:block">{a.tag}</div>
              </div>
            </motion.li>
          ))}
        </ul>

        <Reveal y={12} className="mt-10 flex justify-center">
          <LiveAccountButton variant="gold">
            {t('cta')}
          </LiveAccountButton>
        </Reveal>
      </div>
    </section>
  );
}
