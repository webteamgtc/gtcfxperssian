'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { LayoutDashboard } from 'lucide-react';

import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { AreaChart } from '@/components/shared/devices';
import { CountUp, TiltCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const TONE = { brand: 'text-brand', up: 'text-up', ink: 'text-ink' };
const AVATARS = ['from-brand-400 to-brand-700', 'from-gold-200 to-gold-700', 'from-emerald-300 to-emerald-600', 'from-sky-300 to-sky-600', 'from-violet-300 to-violet-600'];

/** "$4,280,000" → <CountUp prefix="$" value={4280000} />; "+12.4%" → +12.4%; non-numeric values as-is. */
function DashValue({ value }) {
  const m = String(value).match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m || /[/]/.test(value)) return value;
  return <CountUp value={Number(m[2].replace(/,/g, ''))} prefix={m[1]} suffix={m[3]} duration={1.8} />;
}

/** "Manager Dashboard": AUM growth chart, stats rows counting up, investor avatar stack. */
function ManagerDashboard() {
  const t = useTranslations('pammPage.hero.dashboard');
  const rows = t.raw('rows');
  const [aum, ...rest] = rows;

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[480px] py-6">
      <div className="absolute -inset-6 rounded-[3rem] bg-brand/40 blur-3xl" aria-hidden />
      {[0, 1].map((k) => (
        <motion.span key={k} className="absolute left-1/2 top-1/2 hidden rounded-full border border-white/10 lg:block" style={{ width: 540 + k * 140, height: 540 + k * 140, marginLeft: -(270 + k * 70), marginTop: -(270 + k * 70) }} animate={{ rotate: k ? -360 : 360 }} transition={{ duration: 50 + k * 20, repeat: Infinity, ease: 'linear' }} aria-hidden>
          <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-gold-200 shadow-[0_0_12px_rgba(210,166,122,0.9)]" />
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 40, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}>
        <TiltCard max={6} className="group rounded-[1.75rem]">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.75)] ring-1 ring-white/20">
            {/* header */}
            <div className="relative flex items-center gap-2.5 overflow-hidden bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 px-5 py-4 font-semibold text-white">
              <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
              <motion.span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/15 to-transparent" animate={{ left: ['-33%', '133%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }} aria-hidden />
              <span className="relative grid size-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <LayoutDashboard className="size-4 text-gold-200" />
              </span>
              <span className="relative">{t('title')}</span>
              <span className="relative ms-auto flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
            </div>

            <div className="p-5">
              {/* AUM + growth chart */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-white p-4 ring-1 ring-brand/10">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-ink/50">{aum.label}</div>
                    <div className="mt-1 text-3xl font-bold tracking-tight text-brand">
                      <DashValue value={aum.value} />
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {AVATARS.map((g, i) => (
                      <motion.span key={g} className={cn('size-7 rounded-full bg-gradient-to-br ring-2 ring-white', g)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.08 }} />
                    ))}
                  </div>
                </div>
                <div className="mt-3 h-16">
                  <AreaChart seed={12} className="h-full" />
                </div>
              </div>

              {/* stat rows */}
              <div className="mt-2 divide-y divide-brand/5">
                {rest.map((r, i) => (
                  <motion.div key={r.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: EASE }} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-ink/60">{r.label}</span>
                    <span className={cn('font-bold', TONE[r.tone] ?? 'text-ink')}>
                      <DashValue value={r.value} />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}

export function PammHero() {
  const t = useTranslations('pammPage.hero');
  const tb = useTranslations('pammPage.breadcrumb');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-28 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />
        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="size-1.5 rounded-full bg-gold" />
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>
            <motion.div className="mt-9 flex justify-center lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <LiveAccountButton variant="gold">
                {t('cta')}
              </LiveAccountButton>
            </motion.div>
          </div>
          <ManagerDashboard />
        </div>
      </div>
    </section>
  );
}
