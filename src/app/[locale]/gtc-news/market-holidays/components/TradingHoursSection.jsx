'use client';
/**
 * Forex & CFD trading hours (white): category tabs, Pricing / Trading switch, a Mon–Fri session table
 * (today's column highlighted, live "open now" status per row; cards on mobile). Data: ./tradingHoursData.js
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Clock3, Globe2 } from 'lucide-react';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { HOURS_TABS, TRADING_HOURS, isOpenAt, sessionLines } from './tradingHoursData';

/** Current time, client only (null during SSR so the markup matches). */
function useNow(every = 30000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), every);
    return () => clearInterval(id);
  }, [every]);
  return now;
}

function Status({ open, t }) {
  if (open === null) return <span className="h-4 w-16 animate-pulse rounded-full bg-brand/5" />;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold', open ? 'text-up' : 'text-ink/40')}>
      <span className="relative flex size-2">
        {open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />}
        <span className={cn('relative inline-flex size-2 rounded-full', open ? 'bg-up' : 'bg-ink/25')} />
      </span>
      {open ? t('openNow') : t('closedNow')}
    </span>
  );
}

function Sessions({ text, strong }) {
  return (
    <span dir="ltr" className="flex flex-col gap-0.5">
      {sessionLines(text).map((line) => (
        <span key={line} className={cn('whitespace-nowrap tabular-nums', strong ? 'font-semibold text-brand' : 'text-ink/70')}>
          {line}
        </span>
      ))}
    </span>
  );
}

export default function TradingHoursSection() {
  const t = useTranslations('marketHolidaysPage.tradingHours');
  const [tab, setTab] = useState('fx');
  const [mode, setMode] = useState(1); // 0 pricing · 1 trading
  const now = useNow();
  const today = now ? (now.getUTCDay() + 6) % 7 : -1; // 0 = Monday (GMT); 5/6 = weekend
  const rows = TRADING_HOURS[tab];
  const labels = t.raw(`symbols.${tab}`);
  const days = t.raw('days');
  const daysShort = t.raw('daysShort');
  const label = (row) => (row.label !== undefined && labels[row.label]) || row.symbol;

  return (
    <section id="trading-hours" className="relative scroll-mt-20 overflow-clip bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-16 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <Reveal y={16} className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand ring-1 ring-brand/10">
            <Clock3 className="size-3.5" />
            {t('eyebrow')}
          </span>
          <h2 className="heading-section mt-5">
            <AccentTitle text={t('heading')} words={2} />
          </h2>
          <p className="mx-auto mt-5 text-pretty text-[15px] leading-relaxed text-ink/60">{t('sub')}</p>
        </Reveal>

        <Reveal y={20} delay={0.1} className="mt-10 md:mt-12">
          <div className="flex flex-col gap-3 rounded-[1.5rem] bg-[#f6f7fb] p-2 ring-1 ring-brand/10 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label={t('tabsLabel')}>
              {HOURS_TABS.map((key) => (
                <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn('relative shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors', tab === key ? 'text-white' : 'text-ink/60 hover:text-brand')}>
                  {tab === key && <motion.span layoutId="th-tab" className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="relative">{t(`tabs.${key}`)}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 px-1 lg:px-0">
              <span dir="ltr" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink/60 ring-1 ring-brand/10">
                <Globe2 className="size-3.5 text-gold-700" />
                {t('timezoneBadge')}
              </span>
              <div className="relative grid grid-cols-2 rounded-full bg-white p-1 ring-1 ring-brand/10" role="radiogroup" aria-label={t('modeLabel')}>
                {[t('pricing'), t('trading')].map((m, i) => (
                  <button key={m} type="button" role="radio" aria-checked={mode === i} onClick={() => setMode(i)} className={cn('relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors', mode === i ? 'text-white' : 'text-ink/55 hover:text-brand')}>
                    {mode === i && <motion.span layoutId="th-mode" className="absolute inset-0 rounded-full bg-gold shadow-md shadow-gold/30" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                    <span className="relative">{m}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={mode} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="mt-3 px-2 text-center text-xs text-ink/50 lg:text-end">
              {mode ? t('tradingHint') : t('pricingHint')}
            </motion.p>
          </AnimatePresence>
        </Reveal>

        {/* desktop table */}
        <Reveal y={24} delay={0.15} className="mt-6 hidden md:block">
          <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-brand/10 ring-1 ring-brand/10">
            <div className="grid grid-cols-[minmax(10rem,1.2fr)_repeat(5,minmax(0,1fr))] bg-gradient-to-r from-brand-800 via-brand to-brand-700 text-white">
              <div className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white/70">{t('symbolsHeader')}</div>
              {days.map((d, i) => (
                <div key={d} className={cn('relative px-4 py-4 text-sm font-semibold', i === today && 'bg-white/10')}>
                  {i === today && <motion.span layoutId="th-today" className="absolute inset-x-0 top-0 h-1 bg-gold" />}
                  <span className="hidden lg:inline">{d}</span>
                  <span className="lg:hidden">{daysShort[i]}</span>
                  {i === today && <span className="ms-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold">{t('today')}</span>}
                </div>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {rows.map((row, r) => (
                  <motion.div key={row.symbol} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: r * 0.04, duration: 0.4, ease: EASE }} className="group grid grid-cols-[minmax(10rem,1.2fr)_repeat(5,minmax(0,1fr))] border-t border-brand/[0.07] text-sm transition-colors first:border-t-0 hover:bg-brand-50/50">
                    <div className="flex flex-col justify-center gap-1 px-5 py-4">
                      <span className="font-bold text-ink">{label(row)}</span>
                      <Status open={now ? isOpenAt(row, now) : null} t={t} />
                    </div>
                    {row.days.map((d, i) => (
                      <div key={i} className={cn('flex items-center px-4 py-4 text-[13px]', i === today && 'bg-gold/[0.07]')}>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                            <Sessions text={d[mode]} strong={i === today} />
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* mobile cards */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} className="mt-6 grid gap-3 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {rows.map((row, r) => (
              <motion.div key={row.symbol} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: r * 0.05 }} className="overflow-hidden rounded-[1.5rem] bg-white shadow-lg shadow-brand/5 ring-1 ring-brand/10">
                <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-brand-800 to-brand px-4 py-3 text-white">
                  <span className="font-bold">{label(row)}</span>
                  <span className="rounded-full bg-white px-2 py-0.5">
                    <Status open={now ? isOpenAt(row, now) : null} t={t} />
                  </span>
                </div>
                <ul className="divide-y divide-brand/[0.07]">
                  {row.days.map((d, i) => (
                    <li key={i} className={cn('flex items-start justify-between gap-4 px-4 py-2.5 text-[13px]', i === today && 'bg-gold/[0.08]')}>
                      <span className={cn('font-semibold', i === today ? 'text-gold-700' : 'text-ink/55')}>{daysShort[i]}</span>
                      <span className="text-end">
                        <Sessions text={d[mode]} strong={i === today} />
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center text-xs text-ink/45">{t('footnote')}</p>
      </div>
    </section>
  );
}
