'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Server } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, TiltCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const TONE = { brand: 'text-brand', ink: 'text-ink', up: 'text-up' };

/** Ping trace: a heartbeat line that keeps scrolling, with a jittering ms readout. */
function PingTrace() {
  const [ms, setMs] = useState(0.42);
  useEffect(() => {
    const id = setInterval(() => setMs(0.3 + Math.random() * 0.4), 1200);
    return () => clearInterval(id);
  }, []);
  const beat = 'M0 20 H18 L22 8 L26 32 L30 14 L33 20 H60';
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#f6f7fb] px-3.5 py-2.5 ring-1 ring-brand/5">
      <div className="relative h-8 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]" aria-hidden>
        <motion.svg viewBox="0 0 240 40" preserveAspectRatio="none" className="absolute inset-y-0 left-0 h-full w-[200%]" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={beat} transform={`translate(${i * 60} 0)`} fill="none" stroke="#293b93" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          ))}
        </motion.svg>
      </div>
      <span dir="ltr" className="w-16 text-end text-xs font-bold tabular-nums text-brand">
        <motion.span key={ms.toFixed(2)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
          {ms.toFixed(2)}
        </motion.span>{' '}
        ms
      </span>
    </div>
  );
}

/** "Live Server Status" card: four metric tiles, ping trace, node dots. */
function ServerStatus() {
  const t = useTranslations('vpsHostingPage.hero.status');
  const tiles = t.raw('tiles');

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[500px] py-6">
      <div className="absolute -inset-6 rounded-[3rem] bg-brand/40 blur-3xl" aria-hidden />
      {[0, 1].map((k) => (
        <motion.span key={k} className="absolute left-1/2 top-1/2 hidden rounded-full border border-white/10 lg:block" style={{ width: 540 + k * 140, height: 540 + k * 140, marginLeft: -(270 + k * 70), marginTop: -(270 + k * 70) }} animate={{ rotate: k ? -360 : 360 }} transition={{ duration: 50 + k * 20, repeat: Infinity, ease: 'linear' }} aria-hidden>
          <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-gold-200 shadow-[0_0_12px_rgba(210,166,122,0.9)]" />
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 40, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}>
        <TiltCard max={6} className="group rounded-[1.75rem]">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.75)] ring-1 ring-white/20">
            <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-brand-500 to-gold" aria-hidden />
            <div className="p-5 pt-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50">{t('title')}</span>
                <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand ring-1 ring-brand/10">
                  <Server className="size-4" />
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {tiles.map((tile, i) => (
                  <motion.div key={tile.label} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 220, damping: 20 }} className="relative overflow-hidden rounded-xl bg-[#f6f7fb] p-4 ring-1 ring-brand/10 transition-shadow duration-300 hover:shadow-md">
                    <div className={cn('flex items-center gap-2 text-2xl font-bold tracking-tight', TONE[tile.tone])}>
                      {tile.tone === 'up' && (
                        <span className="relative flex size-2.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-up" />
                        </span>
                      )}
                      {tile.value}
                    </div>
                    <div className="mt-1 text-sm text-ink/55">{tile.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3">
                <PingTrace />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/60">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-up shadow-[0_0_8px_rgba(22,163,74,0.8)]" />
                  {t('footer')}
                </span>
                <span className="text-ink/25">·</span>
                <span>{t('nodes')}</span>
                <span className="ms-auto flex gap-1.5" aria-hidden>
                  {[0, 1, 2, 3].map((k) => (
                    <motion.span key={k} className="h-3 w-1.5 rounded-full bg-up" animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.4, delay: k * 0.2, repeat: Infinity }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}

export function VpsHero() {
  const t = useTranslations('vpsHostingPage.hero');
  const tb = useTranslations('vpsHostingPage.breadcrumb');
  const stats = t.raw('stats');

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />

        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <ArrowLink href="#apply" variant="gold">
                {t('apply')}
              </ArrowLink>
              <a href="#plans" className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                {t('pricing')}
              </a>
            </motion.div>
          </div>
          <ServerStatus />
        </div>

        {/* stat band */}
        <Stagger className="mt-14 grid grid-cols-2 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur md:mt-20 lg:grid-cols-4" stagger={0.1}>
          {stats.map((s, i) => (
            <StaggerItem key={s.label} className={cn('group relative px-6 py-7 text-center transition-colors duration-500 hover:bg-white/[0.05]', i % 2 === 0 && 'border-e border-white/10', i < 2 && 'border-b border-white/10 lg:border-b-0', i === 1 && 'lg:border-e')}>
              <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
              <div dir="ltr" className="text-gradient-gold text-3xl font-bold tracking-tight md:text-4xl">
                <StatValue value={s.value} />
              </div>
              <div className="mt-1.5 text-sm text-white/60">{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
