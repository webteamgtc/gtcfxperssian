'use client';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Search, TriangleAlert } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { SCHEDULE_TAB_EVENT } from './scheduleEvents';
import { TAB_I18N_KEYS, countCategoryRows, filterCategorySections, useLeverageData } from '../hooks/dynamicData';

/** Column keys in the leverage feed: tier, lot size, trade size, margin, max leverage. */
const COLS = ['Column2', 'Column3', 'Column4', 'Column5', 'Column6'];

/** "1:125" → 125 */
const ratio = (s) => Number(String(s ?? '').split(':')[1]) || 0;

/** "Trade Size (eg. EURUSD)" → "EURUSD"; falls back to the section title. */
function symbolOf(section) {
  const m = String(section.data?.[0]?.Column4 ?? '').match(/\(eg\.?\s*([^)]+)\)/i);
  return (m ? m[1] : section.title ?? '').trim();
}

/** Bars stepping down: the tier ladder of one instrument. */
function TierLadder({ rows, max }) {
  return (
    <div dir="ltr" className="hidden h-9 items-end gap-1 sm:flex" aria-hidden>
      {rows.map((r, i) => (
        <motion.span key={`${r.Column2}-${i}`} className="w-2.5 rounded-t-sm bg-gradient-to-t from-brand to-brand-300" initial={{ height: 0 }} whileInView={{ height: `${Math.max(8, (ratio(r.Column6) / max) * 100)}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: EASE }} />
      ))}
    </div>
  );
}

function SectionTable({ section }) {
  const [header, ...rows] = section.data;
  const max = Math.max(1, ...rows.map((r) => ratio(r.Column6)));
  const symbol = symbolOf(section);

  return (
    <Reveal y={20} amount={0.1}>
      <div className="group overflow-hidden rounded-[1.5rem] border border-brand/10 bg-white shadow-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-brand/10">
        <div className="flex items-center justify-between gap-4 border-b border-brand/10 px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span dir="ltr" className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-[10px] font-bold text-brand ring-1 ring-brand/10 transition-colors duration-500 group-hover:bg-brand group-hover:text-white">
              {symbol.slice(0, 4)}
            </span>
            <h3 className="text-lg font-semibold text-brand">{section.title}</h3>
          </div>
          <TierLadder rows={rows} max={max} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-start text-sm">
            <thead>
              <tr className="bg-[#f6f7fb] text-ink/50">
                {COLS.map((c) => (
                  <th key={c} scope="col" className="px-5 py-3 text-start font-medium md:px-6">
                    {header?.[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand/5">
              {rows.map((r, i) => (
                <motion.tr key={`${r.Column2}-${i}`} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i, duration: 0.4 }} className="transition-colors hover:bg-brand-50/50">
                  <th scope="row" className="px-5 py-3.5 text-start font-semibold text-ink md:px-6">
                    {r.Column2}
                  </th>
                  <td className="px-5 py-3.5 text-ink/70 md:px-6">{r.Column3}</td>
                  <td className="px-5 py-3.5 text-ink/70 md:px-6">{r.Column4}</td>
                  <td className="px-5 py-3.5 tabular-nums text-ink/70 md:px-6">{r.Column5}</td>
                  <td className="px-5 py-3.5 md:px-6">
                    <span className="flex items-center gap-3">
                      <span dir="ltr" className="inline-flex min-w-16 items-center gap-1.5 font-semibold text-brand">
                        <span className="size-1.5 rounded-full bg-brand" />
                        {r.Column6}
                      </span>
                      {ratio(r.Column6) > 0 && (
                        <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-brand/10 lg:block">
                          <motion.span className="block h-full rounded-full bg-gradient-to-r from-brand to-gold" initial={{ width: 0 }} whileInView={{ width: `${(ratio(r.Column6) / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 * i, ease: EASE }} />
                        </span>
                      )}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Reveal>
  );
}

/** Placeholder tables while the feed loads. */
function Skeleton({ label }) {
  return (
    <div className="grid gap-6" role="status" aria-label={label}>
      {[0, 1].map((k) => (
        <div key={k} className="overflow-hidden rounded-[1.5rem] border border-brand/10 bg-white">
          <div className="flex items-center gap-3 border-b border-brand/10 px-6 py-4">
            <span className="size-10 animate-pulse rounded-xl bg-brand-50" />
            <span className="h-4 w-40 animate-pulse rounded bg-brand-50" />
          </div>
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <span key={r} className="block h-4 animate-pulse rounded bg-brand-50/70" style={{ width: `${100 - (r % 3) * 8}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Instrument schedule: category tabs from the live leverage feed (`useLeverageData`), search, then one tier
 * table per instrument section with an animated tier ladder and leverage bars.
 */
export function Schedule() {
  const t = useTranslations('dynamicLeveragePage.schedule');
  const locale = useLocale();
  const { data, categories, loading, error } = useLeverageData(locale);
  const [tab, setTab] = useState(null);
  const [q, setQ] = useState('');

  const keyOf = (name) => TAB_I18N_KEYS[name] ?? name;
  const labelOf = (name) => (TAB_I18N_KEYS[name] ? t(`tabs.${TAB_I18N_KEYS[name]}`) : name);
  const fallback = categories.find((c) => keyOf(c) === t('defaultTab')) ?? categories[0] ?? null;
  const active = categories.includes(tab) ? tab : fallback;

  // hero quick links send an i18n key ("forex", "futureIndex"…)
  useEffect(() => {
    const on = (e) => setTab(categories.find((c) => keyOf(c) === e.detail) ?? fallback);
    window.addEventListener(SCHEDULE_TAB_EVENT, on);
    return () => window.removeEventListener(SCHEDULE_TAB_EVENT, on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, fallback]);

  const sections = useMemo(() => (data && active ? filterCategorySections(data[active] ?? [], q) : []), [data, active, q]);
  const total = data && active ? countCategoryRows(data[active]) : 0;
  const shown = countCategoryRows(sections);

  return (
    <section id="schedule" className="relative scroll-mt-24 overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-20 size-[460px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        {!error && (
          <Reveal className="mt-10 flex flex-col gap-4 md:mt-12" y={16}>
            <div role="tablist" aria-label={t('eyebrow')} className="no-scrollbar -mx-1 flex min-h-11 gap-2 overflow-x-auto px-1 pb-1">
              {loading
                ? [0, 1, 2, 3, 4].map((k) => <span key={k} className="h-11 w-28 shrink-0 animate-pulse rounded-full bg-brand-50" />)
                : categories.map((c) => {
                    const on = c === active;
                    return (
                      <button key={c} type="button" role="tab" aria-selected={on} onClick={() => setTab(c)} className={cn('relative inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-300', on ? 'border-transparent text-white' : 'border-brand/15 bg-white text-ink hover:border-brand/40')}>
                        {on && <motion.span layoutId="dl-tab" className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                        <span className="relative">{labelOf(c)}</span>
                        <span className={cn('relative text-xs', on ? 'text-white/70' : 'text-ink/40')}>{countCategoryRows(data[c])}</span>
                      </button>
                    );
                  })}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} disabled={loading} placeholder={t('search')} aria-label={t('search')} className="h-12 w-full rounded-xl border border-brand/15 bg-white ps-11 pe-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60" />
              </label>
              {!loading && (
                <p className="text-sm text-ink/50" aria-live="polite">
                  {t('showing', { shown, total, category: active ? labelOf(active) : '' })}
                </p>
              )}
            </div>
          </Reveal>
        )}

        <div className="mt-8">
          {error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-down/25 bg-down/[0.03] p-10 text-center text-ink/60" role="alert">
              <TriangleAlert className="size-6 text-down" />
              {t('error')}
            </div>
          ) : loading ? (
            <Skeleton label={t('loading')} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="grid gap-6">
                {sections.length ? sections.map((s, i) => <SectionTable key={`${s.title}-${i}`} section={s} />) : <p className="rounded-2xl border border-dashed border-brand/20 p-10 text-center text-ink/50">{t('empty')}</p>}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
