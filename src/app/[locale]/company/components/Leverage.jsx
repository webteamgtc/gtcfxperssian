'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Boxes, Scale, TrendingUp } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { AccentTitle } from '@/components/shared/SectionIntro';

const POINTS = [
  { id: 'multiplier', Icon: TrendingUp },
  { id: 'margin', Icon: Scale },
  { id: 'lots', Icon: Boxes }
];
const LEVERAGES = [50, 100, 200, 500, 1000];
const usd = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: n < 100 ? 2 : 0 });

/** Small, honest illustration of the maths on the left: margin = value ÷ leverage; a 1% move = leverage % of margin. */
function Calculator() {
  const t = useTranslations('companyPage.leverageSection.calculator');
  const [lev, setLev] = useState(100);
  const [value, setValue] = useState(10000);
  const margin = value / lev;
  const move = value * 0.01;
  const pct = Math.round((move / margin) * 100);
  const bar = Math.min(100, (margin / move) * 100); // margin bar relative to the 1% move

  return (
    <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-950 to-ink p-6 text-white shadow-2xl shadow-brand/25 md:p-8">
      <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -end-20 -top-20 size-64 rounded-full bg-gold/20 blur-[90px]" aria-hidden />
      <div className="relative">
        <h3 className="heading-card">{t('title')}</h3>

        {/* leverage */}
        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{t('leverage')}</div>
          <div dir="ltr" className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('leverage')}>
            {LEVERAGES.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lev === l}
                onClick={() => setLev(l)}
                className={cn('relative rounded-full px-3.5 py-1.5 text-sm font-semibold tabular-nums transition-colors', lev === l ? 'text-ink' : 'text-white/70 hover:text-white')}
              >
                {lev === l && <motion.span layoutId="lev-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="relative">1:{l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* position value */}
        <label className="mt-6 block">
          <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
            {t('position')}
            <span dir="ltr" className="text-base font-bold normal-case tracking-normal text-white tabular-nums">
              {usd(value)}
            </span>
          </span>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#b68756]"
          />
        </label>

        {/* results */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/55">{t('margin')}</div>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={margin} dir="ltr" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.3 }} className="mt-1 text-2xl font-bold tabular-nums">
                {usd(margin)}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <div className="text-xs text-white/55">{t('move')}</div>
            <div dir="ltr" className="mt-1 text-2xl font-bold tabular-nums text-gold-200">±{usd(move)}</div>
            <div className="mt-0.5 text-xs text-white/60">{t('ofMargin', { pct })}</div>
          </div>
        </div>

        {/* bars: margin vs the 1% move */}
        <div className="mt-6 space-y-3 text-[11px] text-white/50">
          <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
            <span className="truncate">{t('margin')}</span>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-white/70" animate={{ width: `${Math.max(2, bar)}%` }} transition={{ duration: 0.6, ease: EASE }} />
            </div>
          </div>
          <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
            <span dir="ltr" className="truncate text-start">±1%</span>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-gold to-gold-200" />
            </div>
          </div>
        </div>

        <div dir="ltr" className="mt-6 rounded-xl bg-black/25 px-4 py-3 font-mono text-[13px] text-white/75">
          {usd(value)} ÷ {lev} = <span className="font-semibold text-gold-200">{usd(margin)}</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/45">{t('note')}</p>
      </div>
    </div>
  );
}

export function Leverage() {
  const t = useTranslations('companyPage.leverageSection');
  return (
    <section id="leverage" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('title')} />
            </h2>
          </Reveal>
          <Stagger className="mt-10 space-y-7" stagger={0.1}>
            {POINTS.map(({ id, Icon }) => (
              <StaggerItem key={id} className="group flex gap-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="heading-card">{t(`points.${id}.title`)}</h3>
                  <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink/60 md:text-base">{t(`points.${id}.description`)}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal y={12} delay={0.1} className="mt-10">
            <ArrowLink href="/dynamic-leverage">{t('viewMore')}</ArrowLink>
          </Reveal>
        </div>
        <Reveal y={30} delay={0.1}>
          <Calculator />
        </Reveal>
      </div>
    </section>
  );
}
