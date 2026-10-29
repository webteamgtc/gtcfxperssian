'use client';
/**
 * Content sections of the copy-trading page: What is copy trading (steps), How it works (cards), Risk disclosure.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useSpring } from 'motion/react';
import { Check, Copy, ShieldAlert, UserPlus, Users } from 'lucide-react';
import NumberedSteps from '@/components/shared/NumberedSteps';
import RingCard from '@/components/shared/RingCard';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

export function WhatIsCopy() {
  const t = useTranslations('copyTradingPage.what');
  return (
    <section id="what-is-copy-trading" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-10 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <NumberedSteps steps={t.raw('steps')} ringClass="ring-white" className="mt-12 md:mt-16" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ how it works */

/** 1 · account form: fields fill in one by one, then a verified check pops. */
function AccountVisual() {
  return (
    <div dir="ltr" className="relative w-full max-w-[220px] rounded-2xl bg-white p-3.5 shadow-xl shadow-black/20" aria-hidden>
      {[0, 1, 2].map((k) => (
        <div key={k} className="mb-2 h-6 overflow-hidden rounded-md bg-brand-50">
          <motion.div className="h-full rounded-md bg-gradient-to-r from-brand-200 to-brand-100" initial={{ width: 0 }} whileInView={{ width: ['0%', `${90 - k * 18}%`] }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 + k * 0.35, ease: EASE }} />
        </div>
      ))}
      <motion.div className="mt-1 flex h-7 items-center justify-center gap-1.5 rounded-md bg-brand text-[10px] font-bold text-white" initial={{ opacity: 0.4 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.4 }}>
        <UserPlus className="size-3.5" />
      </motion.div>
      <motion.span className="absolute -end-3 -top-3 grid size-8 place-items-center rounded-full bg-up text-white shadow-lg ring-4 ring-white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 1.7 }}>
        <Check className="size-4" strokeWidth={3} />
      </motion.span>
    </div>
  );
}

/** 2 · trader picker: three rows, the highlight cycles between them. */
function PickVisual() {
  const [on, setOn] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => (v + 1) % 3), 1600);
    return () => clearInterval(id);
  }, []);
  const rows = [
    ['from-brand-300 to-brand-600', '+38.4%', 'w-14'],
    ['from-gold-200 to-gold-700', '+52.1%', 'w-20'],
    ['from-emerald-300 to-emerald-600', '+29.5%', 'w-10']
  ];
  return (
    <div dir="ltr" className="w-full max-w-[220px] space-y-2" aria-hidden>
      {rows.map(([g, roi, w], k) => (
        <motion.div key={k} animate={{ scale: on === k ? 1.04 : 1, x: on === k ? 6 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className={cn('flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-lg shadow-black/15 ring-2 transition-colors', on === k ? 'ring-gold' : 'ring-transparent')}>
          <span className={cn('size-7 shrink-0 rounded-lg bg-gradient-to-br', g)} />
          <span className={cn('h-2 rounded-full bg-ink/15', w)} />
          <span className="ms-auto text-[10px] font-bold text-up">{roi}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** 3 · allocation slider sliding up while the equity line climbs. */
function CopyVisual() {
  return (
    <div dir="ltr" className="w-full max-w-[220px] rounded-2xl bg-white p-3.5 shadow-xl shadow-black/20" aria-hidden>
      <svg viewBox="0 0 200 60" className="h-14 w-full">
        <motion.path d="M0 52 L30 46 L55 48 L80 36 L105 38 L130 24 L160 20 L200 6" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.3 }} />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-ink/50">
        <span>$0</span>
        <span className="text-brand">$1,000</span>
      </div>
      <div className="relative mt-1.5 h-2 rounded-full bg-brand-50">
        <motion.div className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-brand to-gold" initial={{ width: '10%' }} whileInView={{ width: '72%' }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE, delay: 0.4 }} />
        <motion.span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow ring-2 ring-gold" initial={{ left: '10%' }} whileInView={{ left: '72%' }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE, delay: 0.4 }} />
      </div>
    </div>
  );
}

const HOW_VISUALS = [AccountVisual, PickVisual, CopyVisual];
const HOW_ICONS = [UserPlus, Users, Copy];

/**
 * Three step cards joined by a line that fills as the section scrolls in. Each card has a live mini-visual,
 * a numbered icon badge and its copy.
 */
export function HowItWorks() {
  const t = useTranslations('copyTradingPage.how');
  const steps = t.raw('steps');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <div ref={ref} className="relative mt-12 md:mt-16">
          {/* connector */}
          <div dir="ltr" className="pointer-events-none absolute inset-x-[16.6%] top-[10.5rem] hidden h-0.5 rounded-full bg-brand/10 lg:block" aria-hidden>
            <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-brand via-brand-400 to-gold" style={{ scaleX: fill }} />
          </div>

          <Stagger className="grid gap-6 lg:grid-cols-3 lg:gap-8" stagger={0.15}>
            {steps.map((s, i) => {
              const Visual = HOW_VISUALS[i % HOW_VISUALS.length];
              const Icon = HOW_ICONS[i % HOW_ICONS.length];
              return (
                <StaggerItem key={s.title} className="h-full">
                  <RingCard innerClassName="p-2">
                    <div className="relative grid h-40 place-items-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink px-6">
                      <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
                      <span className="absolute -end-10 -top-10 size-32 rounded-full bg-gold/20 blur-2xl transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-100" aria-hidden />
                      <span dir="ltr" className="text-gradient-gold absolute start-5 top-3 text-3xl font-bold tracking-tight">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="relative flex w-full justify-center">
                        <Visual />
                      </div>
                    </div>
                    {/* badge sits on the connector line */}
                    <div className="relative z-10 -mt-6 flex justify-center">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand shadow-lg shadow-brand/15 ring-1 ring-brand/10 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-brand group-hover:text-white">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-5 pb-6 pt-4 text-center">
                      <h3 className="heading-card">{s.title}</h3>
                      <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{s.text}</p>
                    </div>
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

/* ------------------------------------------------------------ risk disclosure */

/** Split card: navy side with a pulsing shield, the disclosure text on the other side. */
export function RiskDisclosure() {
  const t = useTranslations('copyTradingPage.disclosure');
  return (
    <section id="disclosure" className="relative bg-white pb-14 md:pb-24">
      <div className="container-x">
        <Reveal y={20}>
          <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand/10 ring-1 ring-brand/10 md:grid-cols-[minmax(0,280px)_1fr]">
            <div className="is-dark relative flex items-center gap-4 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white md:flex-col md:items-start md:justify-between md:p-8">
              <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
              <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15">
                {[0, 1].map((k) => (
                  <motion.span key={k} className="absolute inset-0 rounded-2xl border border-gold/40" animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 2.4, delay: k * 1.2, repeat: Infinity, ease: 'easeOut' }} aria-hidden />
                ))}
                <ShieldAlert className="relative size-7" />
              </span>
              <h2 className="relative text-xl font-semibold leading-snug md:text-2xl">{t('title')}</h2>
            </div>
            <div className="relative p-6 md:p-9">
              <motion.span className="absolute inset-x-6 top-0 h-px origin-left bg-gradient-to-r from-gold via-brand/30 to-transparent md:inset-x-9 rtl:origin-right" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} aria-hidden />
              <p className="text-pretty text-[15px] leading-[1.8] text-ink/65">{t('text')}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
