'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { BadgeEuro, Gauge, Landmark } from 'lucide-react';
import RingCard from '@/components/shared/RingCard';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const BRING_ICONS = [Gauge, BadgeEuro, Landmark];

/** Balance scale that gently tips — the "neutral third party" (decorative). */
function BalanceScale() {
  return (
    <div dir="ltr" className="relative mx-auto h-40 w-60" aria-hidden>
      <span className="absolute bottom-0 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-white/15" />
      <span className="absolute bottom-3 left-1/2 h-28 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/30 to-white/70" />
      <motion.div className="absolute left-1/2 top-6 w-56 -translate-x-1/2" animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="block h-1.5 w-full rounded-full bg-gradient-to-r from-gold-200 via-white to-gold-200" />
        <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_14px_rgba(182,135,86,0.9)]" />
        {['left-0', 'right-0'].map((side, i) => (
          <motion.span key={side} className={`absolute top-1 ${side} flex flex-col items-center`} animate={{ rotate: [6, -6, 6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="h-10 w-px bg-white/40" />
            <span className="h-4 w-16 rounded-b-full border-2 border-t-0 border-gold-200 bg-white/10" />
            <span className={`mt-[-26px] grid size-5 place-items-center rounded-full text-[9px] font-bold text-white ${i ? 'bg-brand-400' : 'bg-gold'}`}>{i ? 'B' : 'A'}</span>
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/** What is the Financial Commission (navy panel with the scale) + what it brings (three numbered benefit cards). */
export function AboutFc() {
  const t = useTranslations('compensationFundPage.about');
  const bring = t.raw('bring');

  return (
    <section id="about-fc" className="relative bg-white py-14 text-ink md:py-24">
      <div className="container-x relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
        <Reveal y={24}>
          <div className="is-dark relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-8 text-white shadow-2xl shadow-brand/30 md:p-10">
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <motion.span className="absolute -end-20 -top-20 size-64 rounded-full bg-gold/25 blur-[90px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
            <div className="relative">
              <BalanceScale />
              <h2 className="heading-title mt-8">{t('whatTitle')}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/75 md:text-base">{t('whatText')}</p>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col">
          <Reveal y={16}>
            <h2 className="heading-title">
              <span className="heading-accent">{t('bringTitle')}</span>
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid flex-1 gap-4" stagger={0.12}>
            {bring.map((b, i) => {
              const Icon = BRING_ICONS[i % BRING_ICONS.length];
              return (
                <StaggerItem key={b} className="h-full">
                  <RingCard lift={4} innerClassName="flex-row items-center gap-5 p-5 md:p-6">
                    <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                      <motion.span className="absolute inset-0 rounded-2xl ring-2 ring-gold/40" animate={{ scale: [1, 1.3], opacity: [0.7, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }} aria-hidden />
                      <Icon className="size-6" />
                    </span>
                    <p className="flex-1 text-[15px] font-medium leading-relaxed text-ink/80 md:text-base">{b}</p>
                    <span className="hidden text-3xl font-black text-brand/10 transition-colors duration-500 group-hover:text-gold/40 sm:block">0{i + 1}</span>
                  </RingCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
