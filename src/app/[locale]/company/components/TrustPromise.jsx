'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Leaf, HeartHandshake, Landmark } from 'lucide-react';
import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import { SectionIntro } from '@/components/shared/SectionIntro';

const PANELS = [
  { id: 'environment', Icon: Leaf, letter: 'E', tint: 'from-brand-50 via-white to-brand-50/40', chip: 'from-brand to-brand-700 shadow-brand/30' },
  { id: 'social', Icon: HeartHandshake, letter: 'S', tint: 'from-gold-50 via-white to-gold-50/40', chip: 'from-gold to-gold-600 shadow-gold/30' },
  { id: 'governance', Icon: Landmark, letter: 'G', tint: 'from-[#eef0f5] via-white to-[#eef0f5]/50', chip: 'from-brand-800 to-ink shadow-ink/30' }
];

/** ESG pillars on gray: each card has a lit "letter stage" on top and the copy below. */
export function TrustPromise() {
  const t = useTranslations('companyPage.trustPromiseSection');
  return (
    <section id="trust" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-3" stagger={0.12}>
          {PANELS.map(({ id, Icon, letter, tint, chip }, i) => (
            <StaggerItem key={id} className="h-full">
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group relative h-full rounded-[2rem] bg-brand/10 p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15"
              >
                {/* gradient ring on hover */}
                <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                <div className="relative flex h-full flex-col rounded-[calc(2rem-1.5px)] bg-white p-2">

                {/* letter stage */}
                <div className={cn('relative h-44 overflow-hidden rounded-[1.6rem] bg-gradient-to-br md:h-52', tint)}>
                  <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
                  <motion.span
                    dir="ltr"
                    className="heading-accent absolute -bottom-8 end-4 select-none text-[10rem] font-black leading-none opacity-90 transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105 md:text-[12rem]"
                    aria-hidden
                  >
                    {letter}
                  </motion.span>
                  {/* orbit */}
                  <div dir="ltr" className="absolute start-7 top-7 size-24" aria-hidden>
                    <span className="absolute inset-0 rounded-full border border-dashed border-brand/20" />
                    <motion.span className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'linear' }}>
                      <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(182,135,86,0.8)]" />
                    </motion.span>
                    <span className={cn('absolute inset-5 grid place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110', chip)}>
                      <Icon className="size-6" />
                    </span>
                  </div>
                </div>

                {/* copy */}
                <div className="flex flex-1 flex-col px-5 pb-6 pt-6 md:px-6">
                  <h3 className="heading-title">{t(`panels.${id}.title`)}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/60">{t(`panels.${id}.description`)}</p>
                  <div className="mt-6 flex items-center gap-3" aria-hidden>
                    <span className="h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-brand transition-all duration-700 group-hover:w-24 rtl:bg-gradient-to-l" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/35">ESG</span>
                  </div>
                </div>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
