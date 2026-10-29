'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Clock3, MapPin, LockKeyhole, ShieldCheck, Headset, User } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

/* ---------- small looping illustrations (decorative) ---------- */

/** A support chat: question → typing → reply, on a loop. */
function ChatVisual() {
  const loop = { duration: 6, repeat: Infinity, ease: 'easeOut' };
  return (
    <div dir="ltr" className="relative mx-auto flex h-full w-full max-w-[340px] flex-col justify-center gap-3 px-2 md:scale-125" aria-hidden>
      {/* client */}
      <motion.div className="flex items-end justify-end gap-2" animate={{ opacity: [0, 1, 1, 1, 0], y: [10, 0, 0, 0, 0] }} transition={{ ...loop, times: [0, 0.08, 0.5, 0.92, 1] }}>
        <div className="space-y-1.5 rounded-2xl rounded-br-md bg-brand px-4 py-3 shadow-lg shadow-brand/20">
          <span className="block h-1.5 w-32 rounded-full bg-white/70" />
          <span className="block h-1.5 w-20 rounded-full bg-white/40" />
        </div>
        <span className="grid size-8 place-items-center rounded-full bg-white text-brand shadow ring-1 ring-brand/10">
          <User className="size-4" />
        </span>
      </motion.div>
      {/* agent typing → reply */}
      <div className="relative flex items-end gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-600 text-white shadow">
          <Headset className="size-4" />
        </span>
        <div className="relative h-[58px] w-44">
          <motion.div className="absolute bottom-0 start-0 flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow ring-1 ring-brand/10" animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={{ ...loop, times: [0, 0.15, 0.2, 0.45, 0.5, 1] }}>
            {[0, 1, 2].map((d) => (
              <motion.span key={d} className="size-1.5 rounded-full bg-brand/50" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }} />
            ))}
          </motion.div>
          <motion.div className="absolute bottom-0 start-0 space-y-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-lg ring-1 ring-brand/10" animate={{ opacity: [0, 0, 1, 1, 0], y: [8, 8, 0, 0, 0] }} transition={{ ...loop, times: [0, 0.5, 0.56, 0.92, 1] }}>
            <span className="block h-1.5 w-36 rounded-full bg-brand/30" />
            <span className="block h-1.5 w-24 rounded-full bg-gold/50" />
            <span className="block h-1.5 w-28 rounded-full bg-brand/20" />
          </motion.div>
        </div>
      </div>
      {/* timer chip */}
      <div className="absolute end-2 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-md ring-1 ring-brand/10">
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="grid">
          <Clock3 className="size-3.5 text-gold-700" />
        </motion.span>
        24h
      </div>
    </div>
  );
}

const PINS = [
  [110.5, 45.0],
  [83.5, 43.3],
  [69.5, 48.5],
  [122, 42.4],
  [100, 32.0],
  [64, 22],
  [30, 24]
];

/** Dotted world map with pulsing local-team pins. */
function MapVisual() {
  return (
    <div dir="ltr" className="relative mx-auto aspect-[126/62] w-full max-w-[360px]" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/world-dots.svg" alt="" className="absolute inset-0 size-full opacity-30" loading="lazy" />
      {PINS.map(([x, y], i) => (
        <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(x / 126) * 100}%`, top: `${((y + 1) / 62) * 100}%` }}>
          <motion.span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/40" animate={{ scale: [0.6, 2], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
          <span className="relative block size-2.5 rounded-full bg-brand ring-2 ring-white" />
        </span>
      ))}
      <motion.span className="absolute grid size-9 -translate-x-1/2 -translate-y-full place-items-center rounded-full bg-gradient-to-br from-gold to-gold-600 text-white shadow-lg" style={{ left: `${(100 / 126) * 100}%`, top: `${(33 / 62) * 100}%` }} animate={{ y: ['-100%', '-115%', '-100%'] }} transition={{ duration: 2, repeat: Infinity }}>
        <MapPin className="size-4" />
      </motion.span>
    </div>
  );
}

/** Lock in the middle of rotating rings with "encrypted" dots streaming through. */
function LockVisual() {
  return (
    <div dir="ltr" className="relative mx-auto grid size-[170px] place-items-center" aria-hidden>
      <motion.span className="absolute inset-0 rounded-full border-2 border-dashed border-brand/20" animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} />
      <motion.span className="absolute inset-5 rounded-full border border-gold/40" animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold" />
      </motion.span>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span key={i} className="absolute h-1 w-1 rounded-full bg-brand/40" style={{ top: `${20 + i * 8}%` }} animate={{ x: [-90, 90], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: 'linear' }} />
      ))}
      <span className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-800 text-white shadow-xl shadow-brand/30">
        <LockKeyhole className="size-7" />
        <span className="absolute -bottom-2 -end-2 grid size-7 place-items-center rounded-full bg-white text-gold-700 shadow ring-1 ring-brand/10">
          <ShieldCheck className="size-4" />
        </span>
      </span>
    </div>
  );
}

const FEATURES = [
  { id: 'fastResponse', Icon: Clock3, Visual: ChatVisual, big: true },
  { id: 'localExpertise', Icon: MapPin, Visual: MapVisual },
  { id: 'secure', Icon: LockKeyhole, Visual: LockVisual }
];

export function HelpCenter() {
  const t = useTranslations('companyPage.helpCenterSection');
  return (
    <section id="help" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <Reveal y={16}>
            <h2 className="heading-section">{t('title')}</h2>
            <h3 className="heading-title mt-4">
              {t('headlineLine1')} <span className="heading-accent">{t('headlineLine2')}</span>
            </h3>
          </Reveal>
          <Reveal y={12} delay={0.1} className="flex flex-col gap-6 lg:items-end">
            <p className="text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base lg:text-end">{t('description')}</p>
            <ArrowLink href="/faq">{t('viewMore')}</ArrowLink>
          </Reveal>
        </div>

        {/* bento */}
        <Stagger className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2" stagger={0.12}>
          {FEATURES.map(({ id, Icon, Visual, big }) => (
            <StaggerItem key={id} className={cn('h-full', big && 'lg:row-span-2')}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={cn(
                  'group relative flex h-full overflow-hidden rounded-[2rem] border border-brand/10 bg-white p-2 shadow-sm transition-[box-shadow,border-color] duration-500 hover:border-brand/25 hover:shadow-2xl hover:shadow-brand/10',
                  big ? 'flex-col' : 'flex-col sm:flex-row'
                )}
              >
                <div className={cn('relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#f3f5fb] to-[#eaedf6]', big ? 'h-64 md:h-80' : 'h-48 sm:h-auto sm:w-[48%]')}>
                  <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
                  <div className="relative grid h-full place-items-center p-4">
                    <Visual />
                  </div>
                </div>
                <div className={cn('flex flex-1 flex-col justify-center', big ? 'p-6 md:p-8' : 'p-6')}>
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-colors duration-500 group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <h4 className={cn('mt-5', big ? 'heading-title' : 'heading-card')}>{t(`features.${id}.title`)}</h4>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{t(`features.${id}.description`)}</p>
                  <span className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-brand transition-all duration-700 group-hover:w-20 rtl:bg-gradient-to-l" aria-hidden />
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
