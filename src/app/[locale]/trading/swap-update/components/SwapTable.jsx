'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import SWAP_RATES from '../data/swapRates.json';

const CATEGORIES = Object.keys(SWAP_RATES);
const FIELD = { long: 'swap long', short: 'swap short' };

/** Bar length on a log scale, so -5,240 and -0.5 can share one column. */
const barWidth = (v, max) => (max > 0 ? Math.max(4, (Math.log10(1 + Math.abs(v)) / Math.log10(1 + max)) * 100) : 0);

function SwapValue({ value, max }) {
  const neg = value < 0;
  return (
    <span className="flex items-center gap-3">
      <span dir="ltr" className={cn('min-w-16 font-semibold tabular-nums', value > 0 ? 'text-up' : neg ? 'text-down' : 'text-ink/50')}>
        {value}
      </span>
      <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-brand/5 md:block" aria-hidden>
        <motion.span className={cn('block h-full rounded-full', neg ? 'bg-down/50' : 'bg-up/60')} initial={{ width: 0 }} animate={{ width: `${barWidth(value, max)}%` }} transition={{ duration: 0.7, ease: EASE }} />
      </span>
    </span>
  );
}

function SortHeader({ label, active, dir, onClick }) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button type="button" onClick={onClick} className={cn('inline-flex items-center gap-1.5 uppercase tracking-[0.12em] transition-colors hover:text-brand', active && 'text-brand')}>
      {label}
      <Icon className="size-3.5" />
    </button>
  );
}

/**
 * Swap table: market tabs (with symbol counts), symbol search, sortable long/short columns,
 * coloured values with log-scale bars, sticky header inside a scrollable panel.
 */
export function SwapTable() {
  const t = useTranslations('swapUpdatePage.table');
  const [tab, setTab] = useState(CATEGORIES[0]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'desc' });

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = SWAP_RATES[tab] ?? [];
    if (s) list = list.filter((r) => r.symbol.toLowerCase().includes(s));
    if (sort.key) {
      const f = FIELD[sort.key];
      list = [...list].sort((a, b) => (sort.dir === 'asc' ? a[f] - b[f] : b[f] - a[f]));
    }
    return list;
  }, [tab, q, sort]);

  const max = useMemo(() => Math.max(...(SWAP_RATES[tab] ?? []).flatMap((r) => [Math.abs(r['swap long']), Math.abs(r['swap short'])]), 0), [tab]);

  const toggleSort = (key) => setSort((s) => (s.key !== key ? { key, dir: 'desc' } : s.dir === 'desc' ? { key, dir: 'asc' } : { key: null, dir: 'desc' }));

  return (
    <section id="swap-table" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-20 size-[460px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-20 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <Reveal className="mt-10 flex justify-center md:mt-12" y={16}>
          <div role="tablist" aria-label={t('eyebrow')} className="no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-brand/10 bg-[#f6f7fb] p-1.5">
            {CATEGORIES.map((c) => {
              const on = c === tab;
              return (
                <button key={c} type="button" role="tab" aria-selected={on} onClick={() => setTab(c)} className={cn('relative inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300', on ? 'text-white' : 'text-ink/70 hover:text-brand')}>
                  {on && <motion.span layoutId="swap-tab" className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="relative">{t.has(`tabs.${c}`) ? t(`tabs.${c}`) : c}</span>
                  <span className={cn('relative rounded-full px-1.5 text-[11px]', on ? 'bg-white/15 text-white' : 'bg-white text-ink/45')}>{SWAP_RATES[c].length}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="mt-8" y={24} delay={0.1}>
          <div className="overflow-hidden rounded-[1.5rem] border border-brand/10 bg-white shadow-xl shadow-brand/5">
            <div className="flex flex-col gap-3 border-b border-brand/10 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <label className="relative block w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')} className="h-11 w-full rounded-xl border border-brand/15 bg-[#f6f7fb] ps-11 pe-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15" />
              </label>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-brand">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand" />
                </span>
                {t('updated')}
              </span>
            </div>

            <div className="max-h-[640px] overflow-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
                  <tr className="border-b border-brand/10 text-[11px] font-bold text-ink/60">
                    <th scope="col" className="px-5 py-3.5 text-start uppercase tracking-[0.12em] md:px-6">
                      {t('columns.symbol')}
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-start uppercase tracking-[0.12em] md:px-6">
                      {t('columns.type')}
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-start md:px-6" aria-sort={sort.key === 'long' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <SortHeader label={t('columns.long')} active={sort.key === 'long'} dir={sort.dir} onClick={() => toggleSort('long')} />
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-start md:px-6" aria-sort={sort.key === 'short' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <SortHeader label={t('columns.short')} active={sort.key === 'short'} dir={sort.dir} onClick={() => toggleSort('short')} />
                    </th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.tbody key={tab} className="divide-y divide-brand/5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                    {rows.length ? (
                      rows.map((r, i) => (
                        <motion.tr key={r.symbol} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 12) * 0.025 }} className="group transition-colors hover:bg-brand-50/60">
                          <th scope="row" className="px-5 py-3.5 text-start md:px-6">
                            <span className="relative inline-flex items-center gap-2.5 font-bold text-brand">
                              <span className="h-4 w-0.5 rounded-full bg-gold opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                              {r.symbol}
                            </span>
                          </th>
                          <td className="px-5 py-3.5 text-brand/60 md:px-6">{r['swap type']}</td>
                          <td className="px-5 py-3.5 md:px-6">
                            <SwapValue value={r['swap long']} max={max} />
                          </td>
                          <td className="px-5 py-3.5 md:px-6">
                            <SwapValue value={r['swap short']} max={max} />
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-ink/50">
                          {t('empty')}
                        </td>
                      </tr>
                    )}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
