'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { MapPin, CalendarCheck, Globe2 } from 'lucide-react';

import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

// stepped tower outline (half-widths from the base up) — a line-art nod to the Dubai skyline
const TIERS = [
  [62, 330],
  [50, 282],
  [40, 236],
  [31, 192],
  [23, 150],
  [16, 112],
  [10, 78],
  [5, 46]
];
const CX = 200;
const BASE = 380;
function towerPath() {
  // up the left side, step by step, to the spire…
  let d = `M${CX - TIERS[0][0]} ${BASE}`;
  TIERS.forEach(([w, top], i) => {
    d += ` L${CX - w} ${top}`;
    if (TIERS[i + 1]) d += ` L${CX - TIERS[i + 1][0]} ${top}`;
  });
  d += ` L${CX} 8`;
  // …and back down the right side
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const [w, top] = TIERS[i];
    d += ` L${CX + w} ${top}`;
    d += ` L${CX + w} ${i > 0 ? TIERS[i - 1][1] : BASE}`;
  }
  return d;
}
const TOWER = towerPath();
// low-rise neighbours [x, width, height]
const BLOCKS = [
  [40, 34, 90],
  [80, 26, 130],
  [108, 22, 70],
  [272, 24, 110],
  [300, 36, 150],
  [340, 26, 80]
];

function Skyline({ t }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-brand/10 bg-gradient-to-b from-white to-[#e9ecf5] shadow-sm">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-70" aria-hidden />
      <svg viewBox="0 -44 400 444" className="relative mx-auto block w-full max-w-[460px]" aria-hidden>
        <defs>
          <linearGradient id="wgg-tower" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#b68756" />
            <stop offset="1" stopColor="#293b93" />
          </linearGradient>
        </defs>
        {/* sun arc */}
        <motion.circle cx={CX} cy={170} r={120} fill="#b68756" fillOpacity="0.08" initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE }} />
        {/* signal rings from the spire */}
        {[0, 1, 2].map((i) => (
          <motion.circle key={i} cx={CX} cy={8} r={6} fill="none" stroke="#b68756" strokeWidth="1.2" animate={{ r: [6, 70], opacity: [0.7, 0] }} transition={{ duration: 3, delay: i, repeat: Infinity, ease: 'easeOut' }} />
        ))}
        {BLOCKS.map(([x, w, h], i) => (
          <motion.rect key={i} x={x} y={BASE - h} width={w} height={h} fill="none" stroke="#293b93" strokeOpacity="0.35" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 + i * 0.08 }} />
        ))}
        <motion.path d={TOWER} fill="url(#wgg-tower)" fillOpacity="0.08" stroke="url(#wgg-tower)" strokeWidth="1.6" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: EASE }} />
        {/* windows */}
        {TIERS.slice(0, 6).map(([w, top], i) => (
          <motion.line key={i} x1={CX - w + 6} x2={CX + w - 6} y1={top + 18} y2={top + 18} stroke="#293b93" strokeOpacity="0.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.4 + i * 0.1, duration: 0.6 }} />
        ))}
        <line x1="10" x2="390" y1={BASE} y2={BASE} stroke="#293b93" strokeOpacity="0.4" />
        <motion.circle cx={CX} cy={8} r="4" fill="#b68756" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 2.2, type: 'spring' }} />
      </svg>
      {/* location chip */}
      <div className="absolute start-5 top-5 flex items-center gap-2 rounded-full border border-brand/10 bg-white/90 px-3.5 py-2 text-xs font-semibold text-ink shadow-sm backdrop-blur">
        <MapPin className="size-4 text-gold-700" />
        <span className="text-ink/50">{t('badge')}</span>
        <span>{t('city')}</span>
      </div>
    </div>
  );
}

export function Rooted() {
  const t = useTranslations('whyGtcGroupPage.rooted');
  const paragraphs = t.raw('paragraphs');
  const chips = [
    { Icon: CalendarCheck, label: t('since') },
    { Icon: Globe2, label: t('reach') }
  ];
  return (
    <section id="dubai" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-start">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('title')} />
            </h2>
          </Reveal>
          <Stagger className="mt-6 space-y-4" stagger={0.1}>
            {paragraphs.map((p) => (
              <StaggerItem key={p.slice(0, 24)} as="p" className="mx-auto max-w-xl text-pretty text-[15px] leading-relaxed text-ink/65 md:text-base lg:mx-0">
                {p}
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal y={12} delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {chips.map(({ Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm">
                <Icon className="size-4 text-gold-700" />
                {label}
              </span>
            ))}
          </Reveal>
          <Reveal y={12} delay={0.25} className="mt-9 flex justify-center lg:justify-start">
            <LiveAccountButton variant="primary">{t('cta')}</LiveAccountButton>
          </Reveal>
        </div>
        <Reveal y={24} delay={0.1}>
          <Skyline t={t} />
        </Reveal>
      </div>
    </section>
  );
}
