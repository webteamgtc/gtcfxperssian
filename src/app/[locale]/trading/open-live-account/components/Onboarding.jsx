'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Clock3 } from 'lucide-react';
import { Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

/** Three steps; a gold progress line draws through them as they come into view. */
export function Onboarding() {
  const t = useTranslations('openLiveAccountPage.onboarding');
  const steps = t.raw('steps');

  return (
    <section id="onboarding" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} />

        <div className="relative mt-14 md:mt-16">
          {/* connecting line (desktop) */}
          <div className="pointer-events-none absolute inset-x-[16%] top-[3.25rem] hidden h-0.5 rounded-full bg-brand/10 lg:block" aria-hidden>
            <motion.span className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-gold to-brand rtl:bg-gradient-to-l" initial={{ width: '0%' }} whileInView={{ width: '100%' }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.3 }} />
          </div>

          <Stagger className="grid gap-5 lg:grid-cols-3 lg:gap-8" stagger={0.2}>
            {steps.map((s, i) => (
              <StaggerItem key={s.title} className={cn('h-full', i === 1 && 'lg:-mt-6')}>
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="group relative h-full rounded-[2rem] bg-brand/10 p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1.5px)] bg-white p-7">
                    <div className="flex items-center justify-between">
                      <span dir="ltr" className="heading-accent select-none font-serif text-6xl italic leading-none opacity-40 transition-opacity duration-500 group-hover:opacity-100">
                        0{i + 1}
                      </span>
                      <motion.span
                        className="grid size-10 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand ring-4 ring-white"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.5 + i * 0.5 }}
                      >
                        {i + 1}
                      </motion.span>
                    </div>
                    <h3 className="heading-card mt-6">{s.title}</h3>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/65">{s.text}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-brand/10 pt-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-ink/50">
                        <Clock3 className="size-3.5" /> {t('reviewTime')}
                      </span>
                      <span dir="ltr" className="font-semibold text-brand">
                        {s.value}
                      </span>
                    </div>
                  </div>
                </motion.article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
