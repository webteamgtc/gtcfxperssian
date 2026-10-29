'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { DollarSign, Euro } from 'lucide-react';

import { Reveal } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const NODES = [
  [8, 30],
  [22, 72],
  [88, 22],
  [92, 70],
  [70, 92]
];

/** Euro ⇄ dollar swapping places around a circular arrow loop, on a quiet network backdrop. */
function SwapVisual() {
  return (
    <div dir="ltr" className="relative mx-auto aspect-[4/3] w-full max-w-[480px]" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {NODES.map(([x, y], i) => (
          <motion.line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#8390d4" strokeOpacity="0.35" strokeWidth="0.3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.15 }} />
        ))}
      </svg>
      {NODES.map(([x, y], i) => (
        <motion.span key={i} className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] bg-brand-200 shadow" style={{ left: `${x}%`, top: `${y}%` }} animate={{ y: [0, -4, 0] }} transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      <div className="absolute left-1/2 top-1/2 grid size-56 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] bg-white shadow-2xl shadow-brand/15 ring-1 ring-brand/10 md:size-64">
        {/* dotted arrow loop */}
        <motion.svg viewBox="0 0 100 100" className="absolute inset-6" animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#8390d4" strokeWidth="1.2" strokeDasharray="2 4" />
          <path d="M88 44 l3 6 l-7 -1 z" fill="#8390d4" />
          <path d="M12 56 l-3 -6 l7 1 z" fill="#8390d4" />
        </motion.svg>
        {/* the two coins orbit and trade places */}
        <motion.div className="absolute inset-0" animate={{ rotate: [0, 180, 180, 360, 360] }} transition={{ duration: 6, repeat: Infinity, times: [0, 0.35, 0.5, 0.85, 1], ease: 'easeInOut' }}>
          <motion.span className="absolute start-[18%] top-[18%] grid size-20 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-xl shadow-brand/40 md:size-24" animate={{ rotate: [0, -180, -180, -360, -360] }} transition={{ duration: 6, repeat: Infinity, times: [0, 0.35, 0.5, 0.85, 1], ease: 'easeInOut' }}>
            <Euro className="size-9" strokeWidth={2.4} />
          </motion.span>
          <motion.span className="absolute bottom-[18%] end-[18%] grid size-16 place-items-center rounded-full bg-gradient-to-br from-white to-brand-50 text-brand shadow-xl shadow-brand/20 ring-1 ring-brand/10 md:size-20" animate={{ rotate: [0, -180, -180, -360, -360] }} transition={{ duration: 6, repeat: Infinity, times: [0, 0.35, 0.5, 0.85, 1], ease: 'easeInOut' }}>
            <DollarSign className="size-8" strokeWidth={2.6} />
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}

export function SwapUpdate() {
  const t = useTranslations('tradingPage.swap');
  return (
    <section id="swap" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('text')}</p>
          <LiveAccountButton variant="primary" className="mt-8">
            {t('cta')}
          </LiveAccountButton>
        </Reveal>
        <Reveal y={28} delay={0.1}>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f3f5fb] to-[#eaedf6] p-6 ring-1 ring-brand/10 md:p-8">
            <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
            <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[80px]" aria-hidden />
            <div className="relative">
              <SwapVisual />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
