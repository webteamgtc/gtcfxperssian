'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { CalendarCheck, Users, Trophy } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, CountUp } from '@/components/motion';

const ICONS = [CalendarCheck, Users, Trophy];

/** "Numbers are our most honest language" — three big counters with a growing underline. */
export function Strength() {
  const t = useTranslations('aboutUsPage.strength');
  const items = t.raw('items');
  return (
    <section id="numbers" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-sm md:mt-14 md:grid-cols-3" stagger={0.12}>
          {items.map((it, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <StaggerItem key={it.label} className="group relative border-brand/10 p-7 transition-colors duration-500 hover:bg-[#f6f7fb] max-md:border-b max-md:last:border-b-0 md:border-e md:p-10 md:last:border-e-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">{it.tag}</span>
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div dir="ltr" className="heading-accent mt-6 text-start text-5xl font-bold tracking-tight md:text-6xl rtl:text-end">
                  {it.plain ? it.value : <CountUp value={it.value} prefix={it.prefix} suffix={it.suffix} />}
                </div>
                <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink/60">{it.text}</p>
                <div className="mt-8 flex items-center gap-3">
                  <motion.span className="h-0.5 origin-left rounded-full bg-gradient-to-r from-gold to-brand rtl:origin-right" initial={{ width: 0 }} whileInView={{ width: 40 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 + i * 0.1 }} />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">{it.label}</span>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
