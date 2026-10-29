'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Activity, CreditCard, TriangleAlert } from 'lucide-react';
import RingCard from '@/components/shared/RingCard';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

/** i. a small cash block grows into a 100× position bar. */
function MultiplierVisual() {
  return (
    <div dir="ltr" className="flex h-full flex-col justify-center gap-2.5 px-6" aria-hidden>
      <div className="flex items-center gap-3 text-[11px] font-semibold text-white/70">
        <span className="w-16">$1,000</span>
        <span className="h-3 w-[4%] rounded-full bg-gold" />
      </div>
      <div className="flex items-center gap-3 text-[11px] font-semibold text-white/70">
        <span className="w-16">$100,000</span>
        <span className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.span className="block h-full origin-left rounded-full bg-gradient-to-r from-gold to-brand-300" initial={{ scaleX: 0.04 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.3 }} />
        </span>
      </div>
      <span className="text-center text-xs font-bold tracking-[0.2em] text-gold-200">× 100</span>
    </div>
  );
}

/** ii. 1% margin slice of the position. */
function MarginVisual() {
  const C = 2 * Math.PI * 30;
  return (
    <div dir="ltr" className="relative mx-auto grid size-24 place-items-center" aria-hidden>
      <svg viewBox="0 0 80 80" className="absolute inset-0 size-full -rotate-90">
        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        <motion.circle cx="40" cy="40" r="30" fill="none" stroke="#d2a67a" strokeWidth="10" strokeDasharray={C} initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: C * 0.92 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE, delay: 0.3 }} />
      </svg>
      <span className="text-lg font-bold text-white">1%</span>
    </div>
  );
}

/** iii. a see-saw tipping both ways. */
function RiskVisual() {
  return (
    <div dir="ltr" className="relative mx-auto h-20 w-44" aria-hidden>
      <motion.div className="absolute inset-x-0 top-6 flex items-center justify-between" animate={{ rotate: [-9, 9, -9] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="grid size-8 place-items-center rounded-lg bg-up text-xs font-bold text-white">+</span>
        <span className="mx-1 h-1 flex-1 rounded-full bg-white/70" />
        <span className="grid size-8 place-items-center rounded-lg bg-down text-xs font-bold text-white">−</span>
      </motion.div>
      <span className="absolute bottom-0 left-1/2 size-0 -translate-x-1/2 border-x-[14px] border-b-[22px] border-x-transparent border-b-gold" />
    </div>
  );
}

const ICONS = [Activity, CreditCard, TriangleAlert];
const VISUALS = [MultiplierVisual, MarginVisual, RiskVisual];

export function Basics() {
  const t = useTranslations('dynamicLeveragePage.basics');
  const items = t.raw('items');
  return (
    <section id="basics" className="relative overflow-hidden bg-white pb-14 md:pb-24">
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <Stagger className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-3" stagger={0.12}>
          {items.map((it, i) => {
            const Icon = ICONS[i];
            const Visual = VISUALS[i];
            const risk = i === 2;
            return (
              <StaggerItem key={it.title} className="h-full">
                <RingCard innerClassName="p-2">
                  <div className="relative h-36 overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink">
                    <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
                    <span className="absolute -end-10 -top-10 size-32 rounded-full bg-gold/20 blur-2xl transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-100" aria-hidden />
                    <div className="relative grid h-full place-items-center">
                      <Visual />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink/50">{it.tag}</span>
                      <span className={cn('grid size-10 place-items-center rounded-xl ring-1 transition-all duration-500 group-hover:scale-110', risk ? 'bg-down/5 text-down ring-down/15' : 'bg-brand-50 text-brand ring-brand/10 group-hover:bg-brand group-hover:text-white')}>
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <h3 className="heading-card mt-4">{it.title}</h3>
                    <p className="mt-3 flex-1 text-pretty text-[15px] leading-relaxed text-ink/60">{it.text}</p>
                    <p className={cn('mt-5 border-t border-dashed border-brand/15 pt-4 text-sm leading-relaxed', risk ? 'text-down' : 'text-brand')}>{it.example}</p>
                  </div>
                </RingCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
