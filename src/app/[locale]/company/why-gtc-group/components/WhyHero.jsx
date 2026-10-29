'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Headset, ShieldCheck, Zap, CandlestickChart } from 'lucide-react';

import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, CountUp, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const ICONS = { support: Headset, compensation: ShieldCheck, latency: Zap, markets: CandlestickChart };

/** One number card: icon, big figure, label and a thin bar that fills in. */
function StatCard({ s, i }) {
  const Icon = ICONS[s.id] ?? Zap;
  const gold = i === 1 || i === 2; // diagonal accent
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-5 backdrop-blur-md md:p-6',
        gold ? 'border-gold/30 bg-gradient-to-br from-gold/[0.16] to-white/[0.03]' : 'border-white/12 bg-white/[0.05]'
      )}
    >
      <span className="absolute -end-10 -top-10 size-32 rounded-full bg-white/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
      <span className={cn('grid size-10 place-items-center rounded-xl ring-1', gold ? 'bg-gold/20 text-gold-200 ring-gold/30' : 'bg-white/10 text-white ring-white/15')}>
        <Icon className="size-[18px]" />
      </span>
      <div dir="ltr" className="heading-accent mt-5 text-start text-4xl font-bold tracking-tight md:text-5xl rtl:text-end">
        {s.plain ? s.plain : <CountUp value={s.value} prefix={s.prefix ? `${s.prefix} ` : ''} suffix={s.suffix} />}
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug text-white/85">{s.label}</p>
      {s.note && <p className="mt-1 text-xs leading-relaxed text-white/50">{s.note}</p>}
      <span className="mt-auto block pt-5" aria-hidden>
        <span className="block h-px w-full bg-white/10">
          <motion.span
            className="block h-px origin-left bg-gradient-to-r from-gold to-gold-200 rtl:origin-right"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8 + i * 0.15, duration: 1.2, ease: EASE }}
          />
        </span>
      </span>
    </motion.div>
  );
}

export function WhyHero() {
  const t = useTranslations('whyGtcGroupPage.hero');
  const tb = useTranslations('whyGtcGroupPage.breadcrumb');
  const stats = t.raw('stats');

  return (
    <section className="is-dark relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="text-center lg:text-start">
            <motion.h1 className="heading-page" initial={{ y: 18 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0">{t('description')}</p>
            <motion.div className="mt-9 flex justify-center lg:justify-start" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE }}>
              <LiveAccountButton variant="gold">
                {t('cta')}
              </LiveAccountButton>
            </motion.div>
          </div>

          <div className="relative">
            {/* slow rotating halo behind the grid */}
            <motion.div
              className="absolute left-1/2 top-1/2 size-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
              style={{ background: 'conic-gradient(from 0deg, rgba(41,59,147,0.0), rgba(85,101,189,0.55), rgba(182,135,86,0.45), rgba(41,59,147,0.0))' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              aria-hidden
            />
            <Stagger className="relative grid grid-cols-2 gap-3 md:gap-4" stagger={0.1} delay={0.25}>
              {stats.map((s, i) => (
                <StaggerItem key={s.id} className={cn('h-full', i % 2 === 1 && 'sm:translate-y-6')}>
                  <StatCard s={s} i={i} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
