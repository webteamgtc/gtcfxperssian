'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { animate, motion } from 'motion/react';
import { Calculator, Gift, TriangleAlert } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, EASE } from '@/components/motion';
import { intlLocale } from '@/i18n/locales';
import { cn } from '@/lib/utils';

/* the promotion's rules (see terms → "Bonus Size and Structure") */
const MIN_DEPOSIT = 500;
const TIER_LIMIT = 10_000;
const MAX_BONUS = 20_000;
const SLIDER = { min: 500, max: 100_000, step: 500 };

/** 50% of the first $10,000 + 20% of the rest, capped at $20,000 (nothing under the $500 minimum). */
function bonusFor(deposit) {
  if (deposit < MIN_DEPOSIT) return 0;
  return Math.min(MAX_BONUS, 0.5 * Math.min(deposit, TIER_LIMIT) + 0.2 * Math.max(deposit - TIER_LIMIT, 0));
}

/** "$12,500" that glides to each new value. */
function Money({ value, locale, className }) {
  const ref = useRef(null);
  const from = useRef(value);
  const fmt = (n) => `$${Math.round(n).toLocaleString(locale)}`;
  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.5,
      ease: EASE,
      onUpdate: (n) => {
        from.current = n;
        if (ref.current) ref.current.textContent = fmt(n);
      }
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {fmt(value)}
    </span>
  );
}

/** Deposit slider → bonus, with the deposit/bonus split bar and the active tier highlighted. */
function BonusCalculator() {
  const t = useTranslations('marginBonusPage.calculator');
  const locale = intlLocale(useLocale());
  const [deposit, setDeposit] = useState(5_000);
  const bonus = bonusFor(deposit);
  const total = deposit + bonus;
  const tiers = t.raw('tiers');
  const fill = ((deposit - SLIDER.min) / (SLIDER.max - SLIDER.min)) * 100;

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[480px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-brand/40 blur-3xl" aria-hidden />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.25 }} className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.75)] ring-1 ring-white/20">
        <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-brand-500 to-gold" aria-hidden />
        <div className="p-6 pt-7">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50">{t('title')}</span>
            <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand ring-1 ring-brand/10">
              <Calculator className="size-4" />
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f6f7fb] p-4 ring-1 ring-brand/10">
              <div className="text-xs text-ink/55">{t('deposit')}</div>
              <Money value={deposit} locale={locale} className="mt-1 block text-2xl font-bold tracking-tight text-ink" />
            </div>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-900 p-4 text-white">
              <motion.span className="absolute -end-6 -top-6 size-20 rounded-full bg-gold/30 blur-2xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden />
              <div className="relative flex items-center gap-1.5 text-xs text-white/70">
                <Gift className="size-3.5 text-gold-200" />
                {t('bonus')}
              </div>
              <Money value={bonus} locale={locale} className="relative mt-1 block text-2xl font-bold tracking-tight text-gold-200" />
            </div>
          </div>

          {/* deposit slider */}
          <div className="mt-6">
            <input
              type="range"
              min={SLIDER.min}
              max={SLIDER.max}
              step={SLIDER.step}
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              aria-label={t('deposit')}
              className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(41,59,147,0.3),0_4px_12px_rgba(41,59,147,0.4)]"
              style={{ background: `linear-gradient(90deg, #293b93 ${fill}%, #e6e9f2 ${fill}%)` }}
            />
            <div className="mt-2 flex justify-between text-[11px] text-ink/40">
              <span>${SLIDER.min.toLocaleString(locale)}</span>
              <span>${SLIDER.max.toLocaleString(locale)}</span>
            </div>
          </div>

          {/* usable margin: deposit + bonus */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-ink/55">{t('usable')}</span>
              <Money value={total} locale={locale} className="text-base font-bold text-brand" />
            </div>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-[#eef0f5]">
              <motion.span className="h-full bg-brand" animate={{ width: `${(deposit / total) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
              <motion.span className="h-full bg-gradient-to-r from-gold to-gold-200" animate={{ width: `${(bonus / total) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
            </div>
          </div>

          {/* tiers */}
          <div className="mt-5 flex flex-wrap gap-2">
            {tiers.map((tier, i) => {
              const active = i === 0 || deposit > TIER_LIMIT;
              return (
                <span key={tier} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors duration-300', active ? 'bg-brand-50 text-brand ring-brand/20' : 'bg-white text-ink/35 ring-ink/10')}>
                  {tier}
                </span>
              );
            })}
            {bonus >= MAX_BONUS && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-700 ring-1 ring-gold/30">
                {t('capped')}
              </motion.span>
            )}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-ink/45">{t('note')}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function MarginHero() {
  const t = useTranslations('marginBonusPage.hero');
  const tb = useTranslations('marginBonusPage.breadcrumb');
  const summary = useTranslations('marginBonusPage').raw('summary');

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />

        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <Gift className="size-3.5" />
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>
            <motion.p className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-gold/25 bg-gold/[0.08] px-4 py-3 text-start text-sm leading-relaxed text-gold-100 lg:mx-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}>
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold-200" />
              {t('warning')}
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <ArrowLink href="#apply" variant="gold">
                {t('apply')}
              </ArrowLink>
              <a href="#terms" className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                {t('terms')}
              </a>
            </motion.div>
          </div>
          <BonusCalculator />
        </div>

        {/* summary band */}
        <Stagger className="mt-14 grid grid-cols-2 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur md:mt-20 lg:grid-cols-4" stagger={0.1}>
          {summary.map((s, i) => (
            <StaggerItem key={s.label} className={cn('group relative px-6 py-7 text-center transition-colors duration-500 hover:bg-white/[0.05]', i % 2 === 0 && 'border-e border-white/10', i < 2 && 'border-b border-white/10 lg:border-b-0', i === 1 && 'lg:border-e')}>
              <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
              <div dir="ltr" className="text-gradient-gold text-3xl font-bold tracking-tight md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1.5 text-sm text-white/60">{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
