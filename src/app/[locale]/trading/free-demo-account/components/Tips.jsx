'use client';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useSpring } from 'motion/react';
import { DollarSign, FastForward, Flag, NotebookPen } from 'lucide-react';

import { Reveal } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const TIP_ICONS = [DollarSign, NotebookPen, Flag, FastForward];

/** "Wind tunnel": streamlines flowing across the card, bending around a wing shape. */
function WindTunnel() {
  const lines = Array.from({ length: 9 }, (_, i) => 20 + i * 20);
  return (
    <svg dir="ltr" viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-60" aria-hidden>
      <defs>
        <linearGradient id="wt-line" x1="0" x2="1">
          <stop offset="0" stopColor="#d2a67a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#d2a67a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {lines.map((y, i) => {
        const bend = (y - 100) * 0.35;
        const d = `M-20 ${y} C 120 ${y}, 160 ${y + (y < 100 ? -18 : 18) + bend * 0.2}, 240 ${y + (y < 100 ? -10 : 10)} S 360 ${y}, 420 ${y}`;
        return (
          <motion.path
            key={y}
            d={d}
            fill="none"
            stroke="url(#wt-line)"
            strokeWidth="1.4"
            strokeDasharray="60 340"
            animate={{ strokeDashoffset: [400, 0] }}
            transition={{ duration: 2.4 + (i % 3) * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.18 }}
          />
        );
      })}
      <ellipse cx="200" cy="100" rx="46" ry="9" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

/** Tips as a timeline (the gold line fills as you scroll) + a sticky editor's note card. */
export function Tips() {
  const t = useTranslations('freeDemoAccount.tips');
  const items = t.raw('items');
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.75', 'end 0.55'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="tips" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -end-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mt-12 grid items-start gap-10 md:mt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* timeline */}
          <ol ref={listRef} className="relative space-y-6">
            <span className="absolute bottom-8 start-6 top-8 w-0.5 rounded-full bg-brand/10" aria-hidden />
            <motion.span className="absolute start-6 top-8 w-0.5 origin-top rounded-full bg-gradient-to-b from-gold to-brand" style={{ scaleY: fill, bottom: '2rem' }} aria-hidden />
            {items.map((tip, i) => {
              const Icon = TIP_ICONS[i % TIP_ICONS.length];
              return (
                <motion.li
                  key={tip.title}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                  className="group relative flex gap-5"
                >
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-lg shadow-brand/10 ring-1 ring-brand/15 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5" />
                    <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-white ring-2 ring-white">{i + 1}</span>
                  </span>
                  <div className="flex-1 rounded-[1.5rem] border border-brand/10 bg-gradient-to-br from-white to-[#f6f7fb] p-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-brand/25 group-hover:shadow-xl group-hover:shadow-brand/10 md:p-6">
                    <h3 className="heading-card text-base md:text-lg">{tip.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{tip.text}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>

          {/* editor's note */}
          <Reveal y={28} delay={0.1} className="lg:sticky lg:top-28">
            <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-8 text-white shadow-2xl shadow-brand/30 md:p-10">
              <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
              <motion.span className="absolute -end-20 -top-20 size-64 rounded-full bg-gold/20 blur-[80px]" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
              <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
              <WindTunnel />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
                  <span className="size-1.5 rounded-full bg-gold" />
                  {t('note.badge')}
                </span>
                <h3 className="heading-title mt-6">{t('note.title')}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-white/75">{t('note.text')}</p>
                <motion.blockquote
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-[15px] italic leading-relaxed text-white/90 backdrop-blur"
                >
                  <span className="mb-1 block font-serif text-4xl not-italic leading-none text-gold-200" aria-hidden>
                    “
                  </span>
                  {t('note.quote').replace(/^[“"]|[”"]$/g, '')}
                </motion.blockquote>
                <LiveAccountButton variant="light" className="relative mt-9 w-full justify-between">
                  {t('note.cta')}
                </LiveAccountButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
