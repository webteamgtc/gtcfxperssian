'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, EASE } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

// pins on the globe: [longitude offset °, latitude °] — they travel round as the globe turns
const PINS = [
  [20, 25],
  [110, -10],
  [200, 40],
  [290, -30]
];

/** Wireframe globe: meridians sweep to fake rotation, pins ride the surface, a dotted orbit circles it. */
function Globe({ t }) {
  const R = 150;
  return (
    <div dir="ltr" className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
      {/* corner frame */}
      <span className="absolute start-0 top-0 h-10 w-10 border-s-2 border-t-2 border-gold/60" />
      <span className="absolute bottom-0 end-0 h-10 w-10 border-b-2 border-e-2 border-gold/60" />
      <span className="absolute start-14 top-0 -translate-y-1/2 bg-ink px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
        <span className="me-1.5 inline-block size-1.5 animate-pulse rounded-full bg-up align-middle" />
        {t('network')}
      </span>
      <span className="absolute bottom-0 end-14 translate-y-1/2 bg-ink px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-200">{t('markets')}</span>

      <svg viewBox="-200 -200 400 400" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id="globe-fill" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#5565bd" stopOpacity="0.35" />
            <stop offset="1" stopColor="#0a0e26" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r={R + 34} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 6" />
        <circle r={R} fill="url(#globe-fill)" stroke="rgba(255,255,255,0.28)" />
        {/* latitudes */}
        {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => (
          <ellipse key={k} cx="0" cy={k * R} rx={Math.sqrt(1 - k * k) * R} ry={Math.sqrt(1 - k * k) * R * 0.22} fill="none" stroke="rgba(255,255,255,0.12)" />
        ))}
        {/* meridians that sweep across (rotation illusion) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.ellipse
            key={i}
            cx="0"
            cy="0"
            ry={R}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            initial={{ rx: R }}
            animate={{ rx: [R, 0, R] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: -i * 2 }}
          />
        ))}
        {/* tilted dotted orbit with a travelling dot */}
        <g transform="rotate(-28)">
          <ellipse rx={R * 1.02} ry={R * 0.42} fill="none" stroke="rgba(210,166,122,0.55)" strokeDasharray="3 5" />
          <motion.circle r="4" fill="#d2a67a" animate={{ cx: [R * 1.02, 0, -R * 1.02, 0, R * 1.02], cy: [0, R * 0.42, 0, -R * 0.42, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }} />
        </g>
      </svg>

      {/* pins riding the surface */}
      {PINS.map(([lng, lat], i) => (
        <motion.span
          key={i}
          className="absolute size-3 rounded-full bg-gold shadow-[0_0_14px_rgba(182,135,86,0.9)]"
          style={{ top: `calc(50% - ${Math.sin((lat * Math.PI) / 180) * 37.5}% - 6px)` }}
          animate={{
            left: Array.from({ length: 13 }, (_, k) => `calc(50% + ${Math.sin(((lng + k * 30) * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * 37.5}% - 6px)`),
            opacity: Array.from({ length: 13 }, (_, k) => (Math.cos(((lng + k * 30) * Math.PI) / 180) > 0 ? 1 : 0.15)),
            scale: Array.from({ length: 13 }, (_, k) => (Math.cos(((lng + k * 30) * Math.PI) / 180) > 0 ? 1 : 0.6))
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/60" />
        </motion.span>
      ))}
    </div>
  );
}

export function AboutHero() {
  const t = useTranslations('aboutUsPage.hero');
  const tb = useTranslations('aboutUsPage.breadcrumb');
  const facts = t.raw('facts');

  return (
    <section className="is-dark relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="text-center lg:text-start">
            {/* visible at first paint (LCP); only a light slide */}
            <motion.h1 className="heading-page" initial={{ y: 18 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0">{t('description')}</p>
            <motion.div className="mt-9 flex justify-center lg:justify-start" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE }}>
              <LiveAccountButton variant="gold">
                {t('cta')}
              </LiveAccountButton>
            </motion.div>

            <Stagger className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-start sm:grid-cols-4" stagger={0.08} delay={0.4}>
              {facts.map((f) => (
                <StaggerItem key={f.label} className="bg-ink/80 px-4 py-4 backdrop-blur">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{f.label}</div>
                  <div className="mt-1.5 text-sm font-bold text-white md:text-[15px]">
                    <bdi>{f.value}</bdi>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 1, ease: EASE }}>
            <Globe t={t} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
