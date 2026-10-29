'use client';
import NavLink from '@/components/shared/nav/NavLink';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Headphones } from 'lucide-react';
import { SectionHeading, Ambient } from '@/components/shared/blocks';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

export function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items');
  const [active, setActive] = useState(0);
  const total = String(items.length).padStart(2, '0');

  return (
    <section id="faq" className="relative overflow-hidden bg-[#f5f5f6] py-10 text-ink md:py-16">
      <Ambient tone="light" />
      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-[70px]">
          <SectionHeading title={t('titleA')} titleB={t('titleB')} align="start" className="max-w-xl" />
          <Reveal y={12} delay={0.12} className="max-w-[375px] justify-self-start pb-1 lg:justify-self-end lg:text-end">
            <p className="text-base leading-[1.8] text-ink/60">{t('subtitle')}</p>
            <NavLink href="/company/contact-us" className="mt-3 inline-flex items-center gap-2 py-2 text-sm font-semibold text-brand transition hover:text-brand-700">
              <Headphones className="size-[19px] text-gold" strokeWidth={1.75} />
              {t('contact')}
            </NavLink>
          </Reveal>
        </div>

        <div className="mt-12 grid min-w-0 items-stretch gap-5 lg:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-[30px]">
          <Reveal delay={0.1} className="min-w-0">
            <div
              className="flex flex-col gap-[11px] max-lg:-mx-1 max-lg:flex-row max-lg:overflow-x-auto max-lg:pb-3 max-lg:snap-x max-lg:snap-proximity max-lg:scrollbar-thin"
              role="tablist"
              aria-label={t('questions')}
            >
              {items.map((it, i) => {
                const on = active === i;
                return (
                  <button
                    key={it.q}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(i)}
                    className={cn(
                      'group relative isolate grid min-h-[86px] w-full shrink-0 grid-cols-[40px_1fr_22px] items-center gap-[17px] overflow-hidden rounded-[10px] border bg-white px-6 py-[19px] text-start text-base leading-normal transition-[border-color,color,transform] duration-500 max-lg:min-h-[105px] max-lg:w-[255px] max-lg:snap-start max-lg:px-[17px] md:px-6',
                      on ? 'border-brand/25 text-brand' : 'border-[#e5e5e7] text-ink hover:-translate-y-0.5 hover:border-gold hover:text-brand max-lg:grid-cols-[34px_1fr]'
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="faq-selected-question"
                        className="absolute inset-0 rounded-[9px] bg-brand/[0.03] shadow-[inset_3px_0_0_0_#b68756] rtl:shadow-[inset_-3px_0_0_0_#b68756]"
                        transition={{ duration: 0.7, ease: EASE }}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-[1] grid size-[37px] shrink-0 place-items-center rounded-full border text-xs tabular-nums transition-[background,border-color,color] duration-[650ms] max-lg:size-[31px]',
                        on ? 'border-brand bg-brand text-white' : 'border-[#e5e5e7] bg-white text-[#75757c]'
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="relative z-[1] min-w-0 text-base font-medium tracking-tight max-lg:text-[15px]">{it.q}</span>
                    <motion.span
                      aria-hidden
                      className={cn(
                        'relative z-[1] justify-self-end text-2xl font-light leading-none text-[#73737b] transition-[transform,color] duration-[650ms] max-lg:hidden',
                        on && 'rotate-45 text-brand'
                      )}
                    >
                      +
                    </motion.span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.2} y={24} className="relative flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-brand px-8 pb-[34px] pt-[42px] text-white md:min-h-[520px] md:px-11">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gold" aria-hidden />
            <div className="relative mb-8 flex items-center justify-between gap-5 md:mb-10">
              <div className="flex min-h-[60px] items-baseline gap-2 overflow-hidden tabular-nums">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: 35, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -35, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="inline-block text-[47px] font-normal leading-none tracking-[-0.07em] text-[#d9b48e] md:text-[56px]"
                  >
                    {String(active + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xs tracking-[0.08em] text-[#c8cee6]">/ {total}</span>
              </div>
              <span className="text-xs tracking-[0.16em] text-[#d3d7e9]">GTCFX</span>
            </div>

            <div className="relative flex flex-1 flex-col" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 26, y: 12 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="flex-1"
                >
                  <h3 className="heading-title is-dark">
                    {items[active].q}
                  </h3>
                  <p className="mt-6 text-base leading-[1.9] text-[#dce0f0]">{items[active].a}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative mt-10 flex gap-2" aria-hidden>
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  tabIndex={-1}
                  onClick={() => setActive(i)}
                  className={cn(
                    'h-0.5 rounded-full bg-white/15 transition-[width,background-color] duration-700',
                    i === active ? 'w-[70px] bg-gold' : 'w-[25px]'
                  )}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
