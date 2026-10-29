'use client';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowLeftRight, Clock3, Fingerprint, ShieldHalf, UserCog } from 'lucide-react';
import { Reveal, EASE } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';

const ICONS = [ArrowLeftRight, UserCog, ShieldHalf];

/** Clock ring that sweeps round with a turning hand (decorative). */
function TimerRing() {
  const R = 44;
  const C = 2 * Math.PI * R;
  return (
    <div dir="ltr" className="relative grid size-28 shrink-0 place-items-center" aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
        <motion.circle cx="50" cy="50" r={R} fill="none" stroke="url(#steps-ring)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: C * 0.3 }} viewport={{ once: true }} transition={{ duration: 2, ease: EASE }} />
        <defs>
          <linearGradient id="steps-ring" x1="0" x2="1">
            <stop offset="0" stopColor="#d2a67a" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
      <motion.span className="absolute left-1/2 top-1/2 h-9 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gold" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
      <span className="relative size-2.5 rounded-full bg-white" />
    </div>
  );
}

/** Heading + timer card on the start side; a vertical stepper whose line fills as you scroll on the end side. */
export function OpenSteps() {
  const t = useTranslations('accountTypesPage.steps');
  const items = t.raw('items');
  const meta = t.raw('meta');
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.75', 'end 0.55'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="steps" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -end-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />

      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* start side */}
        <Reveal y={16} className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>

          <div className="is-dark relative mt-9 flex items-center gap-6 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-6 text-white shadow-2xl shadow-brand/25 md:p-7">
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <motion.span className="absolute -end-16 -top-16 size-48 rounded-full bg-gold/25 blur-[70px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <TimerRing />
            <ul className="relative space-y-3">
              {meta.map((m, i) => (
                <motion.li key={m} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.15 }} className="flex items-center gap-2.5 text-sm font-medium text-white/85 md:text-[15px]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-200 ring-1 ring-white/15">{i === 0 ? <Clock3 className="size-3.5" /> : <Fingerprint className="size-3.5" />}</span>
                  {m}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* stepper */}
        <ol ref={listRef} className="relative space-y-5">
          <span className="absolute bottom-10 start-7 top-10 w-0.5 rounded-full bg-brand/10" aria-hidden />
          <motion.span className="absolute start-7 top-10 w-0.5 origin-top rounded-full bg-gradient-to-b from-gold to-brand" style={{ scaleY: fill, bottom: '2.5rem' }} aria-hidden />
          {items.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.li key={s.title} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }} className="group relative flex gap-5">
                <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-900 text-white shadow-xl shadow-brand/25 ring-4 ring-white transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                  <Icon className="size-6" />
                  <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-gold text-[11px] font-bold text-white ring-2 ring-white">{i + 1}</span>
                </span>
                <div className="flex-1 rounded-[1.5rem] border border-brand/10 bg-gradient-to-br from-white to-[#f6f7fb] p-6 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-brand/25 group-hover:shadow-xl group-hover:shadow-brand/10">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
                    {t('step')} {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="heading-card mt-2">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{s.text}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
