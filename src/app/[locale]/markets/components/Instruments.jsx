'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink } from 'lucide-react';
import { MARKETS } from '@/config/markets';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { buildInstrumentWidget, useMarketsInstrumentsData } from '@/lib/hooks/useMarketsInstrumentsData';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

/** Placeholder while the market's symbols load. */
function QuoteSkeleton() {
  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-brand/10 bg-[#f8f9fd] p-4" aria-hidden>
      <div className="h-5 w-28 animate-pulse rounded bg-brand-100/60" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 animate-pulse rounded-xl bg-brand-100/60" />
        <div className="h-16 animate-pulse rounded-xl bg-brand-100/60" />
      </div>
      <div className="h-2 animate-pulse rounded-full bg-brand-100/60" />
    </div>
  );
}

/**
 * Live quote panel for the open market: the first 3 API symbols of the market as tabs, then
 * sell / spread / buy, today's low–high and where the price sits in that range.
 * Only real API symbols + live quotes are shown — no demo values.
 */
function QuotePanel({ market, apiRows, liveQuotes }) {
  const t = useTranslations('marketsPage.instruments');
  const [sel, setSel] = useState(0);
  const rows = apiRows.slice(0, 3);
  const w = buildInstrumentWidget(rows[Math.min(sel, rows.length - 1)], liveQuotes);
  const name = t(`items.${market.id}.name`);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.35, ease: EASE }} className="mt-6 rounded-2xl border border-brand/10 bg-[#f8f9fd] p-4">
      {rows.length > 1 && (
        <div dir="ltr" role="tablist" className="mb-4 flex flex-wrap gap-1.5">
          {rows.map((r, k) => {
            const on = k === Math.min(sel, rows.length - 1);
            return (
              <button key={r.rawSymbol || k} type="button" role="tab" aria-selected={on} onClick={(e) => { e.stopPropagation(); setSel(k); }} className={cn('relative rounded-full px-3 py-1 text-xs font-semibold transition-colors', on ? 'text-white' : 'bg-white text-brand ring-1 ring-brand/10 hover:ring-brand/30')}>
                {on && <motion.span layoutId={`inst-sym-${market.id}`} className="absolute inset-0 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">{r.symbol}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink" dir="ltr">
            {w.symbol}
          </p>
          <p className="truncate text-xs text-ink/50">{w.name}</p>
        </div>
        <NavLink href={market.href} aria-label={t('open', { market: name })} className="grid size-9 shrink-0 place-items-center rounded-xl text-brand ring-1 ring-brand/15 transition-colors hover:bg-brand hover:text-white">
          <ExternalLink className="size-4" />
        </NavLink>
      </div>

      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-down px-3 py-2.5 text-white">
          <span className="text-[11px] font-bold uppercase tracking-wide opacity-85">{t('sell')}</span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-base font-bold tabular-nums 2xl:text-lg">{w.sellPrice}</span>
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/90 text-down">
              <ArrowDown className="size-3.5" strokeWidth={2.5} />
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-up px-3 py-2.5 text-end text-white">
          <span className="text-[11px] font-bold uppercase tracking-wide opacity-85">{t('buy')}</span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/90 text-up">
              <ArrowUp className="size-3.5" strokeWidth={2.5} />
            </span>
            <span className="truncate text-base font-bold tabular-nums 2xl:text-lg">{w.buyPrice}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2 text-[11px] text-ink/50">
          <span>
            {t('low')} <b dir="ltr" className="font-semibold text-ink/70">{w.low}</b>
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-brand ring-1 ring-brand/10">
            {t('spread')} <span dir="ltr">{w.spread}</span>
          </span>
          <span>
            {t('high')} <b dir="ltr" className="font-semibold text-ink/70">{w.high}</b>
          </span>
        </div>
        <div dir="ltr" title={t('dayRange')} className="relative mt-2.5 h-2 rounded-full bg-gradient-to-r from-down via-[#e5e7f0] to-up">
          {w.rangePercent != null && <motion.span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand shadow" animate={{ left: `${w.rangePercent}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />}
        </div>
        {!w.live && <p className="mt-3 text-center text-[11px] text-ink/40">{t('waiting')}</p>}
      </div>
    </motion.div>
  );
}

/**
 * Market Instruments: 7 tall slats; the hovered (or tapped) one widens to show its text and live quote
 * (only for markets the symbols API returns symbols for).
 * On mobile the slats stack and work as an accordion.
 */
export function Instruments() {
  const t = useTranslations('marketsPage.instruments');
  const [i, setI] = useState(0);
  const { symbolsByKey, liveQuotes, loading } = useMarketsInstrumentsData();
  return (
    <section className="relative bg-white py-14 text-ink md:py-24">
      <div className="container-x">
        <SectionIntro layout="split" title={t('title')} description={t('description')} />
        <div className="mt-10 flex flex-col gap-3 md:mt-14 lg:h-[560px] lg:flex-row">
          {MARKETS.map((m, k) => {
            const Icon = m.icon;
            const on = k === i;
            return (
              <motion.div
                key={m.id}
                layout
                onMouseEnter={() => setI(k)}
                onClick={() => setI(k)}
                transition={{ layout: { duration: 0.55, ease: EASE } }}
                className={cn('relative cursor-pointer overflow-hidden rounded-3xl border transition-colors duration-500', on ? 'border-brand/20 bg-gradient-to-b from-[#f3f5fb] to-white lg:flex-[6]' : 'border-brand/10 bg-white hover:bg-[#f8f9fd] lg:flex-1')}
              >
                {/* collapsed: icon + vertical name */}
                <div className={cn('flex items-center gap-3 p-5 lg:h-full lg:flex-col lg:justify-between lg:py-7', on && 'hidden')}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[15px] font-bold lg:rotate-180 lg:[writing-mode:vertical-rl]">{t(`items.${m.id}.name`)}</span>
                </div>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="flex h-full flex-col p-6 md:p-8 lg:min-w-[420px]">
                      <div className="flex items-center gap-3.5">
                        <span className="grid size-12 place-items-center rounded-2xl bg-brand text-white">
                          <Icon className="size-5" />
                        </span>
                        <h3 className="heading-card">{t(`items.${m.id}.name`)}</h3>
                      </div>
                      <p className="mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-ink/60">{t(`items.${m.id}.text`)}</p>
                      {loading ? (
                        <div className="max-w-md">
                          <QuoteSkeleton />
                        </div>
                      ) : symbolsByKey[m.id]?.length ? (
                        <div className="max-w-md">
                          <QuotePanel market={m} apiRows={symbolsByKey[m.id]} liveQuotes={liveQuotes} />
                        </div>
                      ) : null}
                      <NavLink href={m.href} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-brand hover:text-gold-700">
                        {t('learnMore')} <ArrowRight className="size-4 rtl:-scale-x-100" />
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
