'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowLeftRight, ChevronRight, PieChart, User } from 'lucide-react';
import RingCard from '@/components/shared/RingCard';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';

const ICONS = [User, ArrowLeftRight, PieChart];

/** 1 · several investor coins dropping into one pool. */
function DepositVisual() {
  return (
    <div dir="ltr" className="relative flex h-full items-end justify-center gap-3 pb-5" aria-hidden>
      {[0, 1, 2].map((k) => (
        <div key={k} className="flex flex-col items-center gap-1.5">
          <motion.span className="size-4 rounded-full bg-gradient-to-b from-gold-200 to-gold-700 shadow" animate={{ y: [-14, 18], opacity: [0, 1, 0] }} transition={{ duration: 1.8, delay: k * 0.45, repeat: Infinity, ease: 'easeIn' }} />
          <span className="grid size-8 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
            <User className="size-4 text-white/80" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** 2 · one manager node pulsing out trades. */
function TradeVisual() {
  return (
    <div dir="ltr" className="relative grid h-full place-items-center" aria-hidden>
      {[0, 1, 2].map((k) => (
        <motion.span key={k} className="absolute size-14 rounded-full border border-gold/50" animate={{ scale: [1, 2.4], opacity: [0.7, 0] }} transition={{ duration: 2.4, delay: k * 0.8, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      <span className="relative grid size-14 place-items-center rounded-2xl bg-white text-brand shadow-xl">
        <ArrowLeftRight className="size-6" />
      </span>
    </div>
  );
}

/** 3 · a pie splitting into shares. */
function DistributeVisual() {
  const shares = [0.45, 0.3, 0.25];
  const C = 2 * Math.PI * 22;
  let acc = 0;
  return (
    <div dir="ltr" className="grid h-full place-items-center" aria-hidden>
      <svg viewBox="0 0 60 60" className="size-20 -rotate-90">
        {shares.map((s, i) => {
          const off = acc;
          acc += s;
          return <motion.circle key={i} cx="30" cy="30" r="22" fill="none" strokeWidth="12" stroke={['#d2a67a', '#8390d4', '#ffffff'][i]} strokeDasharray={`${s * C - 2} ${C}`} initial={{ strokeDashoffset: -off * C + C * 0.2, opacity: 0 }} whileInView={{ strokeDashoffset: -off * C, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 + i * 0.2, ease: EASE }} />;
        })}
      </svg>
    </div>
  );
}

const VISUALS = [DepositVisual, TradeVisual, DistributeVisual];

export function WhatIsPamm() {
  const t = useTranslations('pammPage.what');
  const steps = t.raw('steps');

  return (
    <section id="what-is-pamm" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <Stagger className="relative mt-12 grid gap-5 md:mt-14 lg:grid-cols-3 lg:gap-8" stagger={0.15}>
          {steps.map((s, i) => {
            const Icon = ICONS[i];
            const Visual = VISUALS[i];
            return (
              <StaggerItem key={s.title} className="relative h-full">
                <RingCard innerClassName="p-2">
                  <div className="relative h-36 overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink">
                    <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
                    <span className="absolute end-4 top-3 text-xs font-semibold text-white/50">/ 0{i + 1}</span>
                    <Visual />
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="heading-card mt-4">{s.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{s.text}</p>
                  </div>
                </RingCard>
                {i < steps.length - 1 && (
                  <motion.span className="absolute -end-[1.4rem] top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-lg shadow-brand/15 ring-1 ring-brand/10 lg:grid" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }} aria-hidden>
                    <ChevronRight className="size-4 rtl:-scale-x-100" />
                  </motion.span>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mt-8 md:mt-10" y={20}>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brand/10 bg-gradient-to-r from-brand-50/80 to-white p-6 md:p-8">
            <motion.span className="absolute inset-y-0 start-0 w-1 origin-top bg-gradient-to-b from-brand to-gold" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} aria-hidden />
            <p className="text-pretty text-[15px] leading-relaxed text-ink/70 md:text-base">
              {t.rich('callout', { b: (c) => <strong className="font-semibold text-ink">{c}</strong> })}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
