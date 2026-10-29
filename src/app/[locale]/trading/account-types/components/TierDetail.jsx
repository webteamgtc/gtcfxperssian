'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ChartNoAxesColumn, DollarSign, LayoutGrid, Quote, Receipt, Waves, Zap } from 'lucide-react';

import { Reveal, Stagger, StaggerItem, TiltCard } from '@/components/motion';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const FEATURE_ICONS = {
  ecn: [Waves, ChartNoAxesColumn, Zap],
  standard: [DollarSign, Receipt, LayoutGrid]
};

/** Tier card: tilts with the pointer; big tier code with a gradient sweep, orbit ring, deposit + spread. */
function TierCard({ tier, labels, featured }) {
  return (
    <TiltCard max={7} className="rounded-[2rem]">
      <div className={cn('relative overflow-hidden rounded-[2rem] border p-6 md:p-7', featured ? 'is-dark border-brand bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white shadow-2xl shadow-brand/30' : 'border-brand/10 bg-white shadow-xl shadow-brand/10')}>
        <div className={cn('absolute inset-0 opacity-50', featured ? 'bg-grid-dark' : 'bg-grid-light')} aria-hidden />
        <div className="relative flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em]">
          <span className={featured ? 'text-white/55' : 'text-ink/40'}>{tier.tier}</span>
          <span className="text-gold-700">/ {tier.code}</span>
        </div>

        <div dir="ltr" className="relative my-6 grid h-40 place-items-center" aria-hidden>
          {[1, 2].map((r) => (
            <motion.span key={r} className={cn('absolute rounded-full border', featured ? 'border-white/10' : 'border-brand/10')} style={{ width: 110 + r * 60, height: 110 + r * 60 }} animate={{ rotate: r % 2 ? 360 : -360 }} transition={{ duration: 24 + r * 8, repeat: Infinity, ease: 'linear' }}>
              <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_rgba(182,135,86,0.8)]" />
            </motion.span>
          ))}
          <motion.span
            className={cn('relative bg-[length:250%_100%] bg-clip-text text-6xl font-black tracking-tight text-transparent md:text-7xl', featured ? 'bg-[linear-gradient(110deg,#ffffff_35%,#d2a67a_50%,#ffffff_65%)]' : 'bg-[linear-gradient(110deg,#293b93_35%,#b68756_50%,#293b93_65%)]')}
            animate={{ backgroundPositionX: ['100%', '-100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
          >
            {tier.short}
          </motion.span>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {[
            [tier.deposit, labels.minDeposit],
            [tier.spread, labels.from]
          ].map(([v, k]) => (
            <div key={k} className={cn('rounded-2xl px-4 py-4 text-center ring-1', featured ? 'bg-white/[0.06] ring-white/10' : 'bg-[#f4f6fb] ring-brand/5')}>
              <div dir="ltr" className={cn('text-xl font-bold', featured ? 'text-white' : 'text-brand-900')}>
                {v}
              </div>
              <div className={cn('mt-0.5 text-xs', featured ? 'text-white/55' : 'text-ink/50')}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    </TiltCard>
  );
}

/** "A closer look at each tier": one row per tier, copy + features + quote beside a tilting tier card. */
export function TierDetail() {
  const t = useTranslations('accountTypesPage.detail');
  const tiers = t.raw('tiers');
  const labels = { minDeposit: t('minDeposit'), from: t('from') };

  return (
    <section id="tiers" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mt-14 divide-y divide-brand/10">
          {tiers.map((tier, i) => {
            const icons = FEATURE_ICONS[tier.id] ?? FEATURE_ICONS.ecn;
            const flip = i % 2 === 1;
            return (
              <div key={tier.id} className="grid items-center gap-10 py-12 first:pt-0 last:pb-0 lg:grid-cols-[1.15fr_1fr] lg:gap-16 md:py-16">
                <div className={cn(flip && 'lg:order-2')}>
                  <Reveal y={14}>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      <span className="h-px w-6 bg-gold" aria-hidden />
                      {tier.label}
                    </p>
                    <h3 className="heading-title mt-4">
                      <AccentTitle text={tier.title} />
                    </h3>
                    <p className="mt-4 border-s-2 border-gold ps-4 text-[15px] leading-relaxed text-ink/65 md:text-base">{tier.text}</p>
                  </Reveal>

                  <Stagger className="mt-7 space-y-4" stagger={0.1}>
                    {tier.features.map((f, k) => {
                      const Icon = icons[k % icons.length];
                      return (
                        <StaggerItem key={f.title} className="group flex gap-4">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                            <Icon className="size-5" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-ink">{f.title}</h4>
                            <p className="mt-0.5 text-sm text-ink/55">{f.text}</p>
                          </div>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>

                  <Reveal y={12} delay={0.2}>
                    <blockquote className="relative mt-7 overflow-hidden rounded-2xl border border-dashed border-brand/20 bg-[#f6f7fb] p-5 ps-14 text-[15px] italic leading-relaxed text-ink/70">
                      <Quote className="absolute start-4 top-5 size-6 text-gold rtl:-scale-x-100" aria-hidden />
                      {tier.quote}
                    </blockquote>
                  </Reveal>
                </div>

                <Reveal y={24} delay={0.1} className={cn('flex flex-col items-center gap-6', flip && 'lg:order-1')}>
                  <div className="w-full max-w-[440px]">
                    <TierCard tier={tier} labels={labels} featured={tier.id === 'standard'} />
                  </div>
                  <LiveAccountButton variant="primary">{t('cta')}</LiveAccountButton>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
