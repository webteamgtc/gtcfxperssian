'use client';
/** Live quotes for the market (both templates). Every row links to the symbol's own page. */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Search, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { useLiveRows, FlashPrice, Sparkline, fmt, pct, SymbolBadge } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { useMarket, usePageT, spreadOf, rangePos, changeTone, useSymbolHref, LiveDot } from './shared';

const LIST_PAGE = 10;
const TABLE_PAGE = 10;

function spreadNum(r) {
  if (r?.bid == null || r?.ask == null) return null;
  const diff = r.ask - r.bid;
  return r.d === 5 || r.d === 3 ? diff * 10 ** (r.d - 1) : diff;
}

/** Live rows + search + "show all" state for the watchlist layout. */
function useQuoteList(page) {
  const { symbols } = useMarket();
  const rows = useLiveRows(symbols, 1000);
  const [q, setQ] = useState('');
  const [all, setAll] = useState(false);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => r.s.toLowerCase().includes(s) || r.n.toLowerCase().includes(s)) : rows;
  }, [rows, q]);
  return { rows, q, setQ, all, setAll, filtered, page, shown: all || q ? filtered : filtered.slice(0, page) };
}

/** Paginated, sortable table state for template A (Forex, Indices, Shares). */
function useQuoteTable() {
  const { symbols } = useMarket();
  const rows = useLiveRows(symbols, 1000);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ key: 's', dir: 1 });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let arr = rows;
    if (filter === 'up') arr = arr.filter((r) => r.change != null && r.change >= 0);
    if (filter === 'down') arr = arr.filter((r) => r.change != null && r.change < 0);
    const s = q.trim().toLowerCase();
    return s ? arr.filter((r) => r.s.toLowerCase().includes(s) || r.n.toLowerCase().includes(s)) : arr;
  }, [rows, q, filter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const mul = sort.dir;
    arr.sort((a, b) => {
      if (sort.key === 's') return mul * a.s.localeCompare(b.s);
      if (sort.key === 'change') return mul * ((a.change ?? -1e9) - (b.change ?? -1e9));
      if (sort.key === 'spread') return mul * ((spreadNum(a) ?? 1e9) - (spreadNum(b) ?? 1e9));
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  useEffect(() => {
    setPage(0);
  }, [q, filter, sort.key, sort.dir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / TABLE_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * TABLE_PAGE;
  const shown = sorted.slice(start, start + TABLE_PAGE);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: (prev.dir * -1) } : { key, dir: key === 's' ? 1 : -1 }
    );
  };

  return {
    rows,
    q,
    setQ,
    filter,
    setFilter,
    filtered: sorted,
    shown,
    page: safePage,
    setPage,
    pageCount,
    start,
    sort,
    toggleSort,
    total: sorted.length
  };
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
        active ? 'bg-brand text-white shadow-md shadow-brand/25' : 'bg-white/80 text-ink/60 ring-1 ring-brand/10 hover:bg-white hover:text-brand'
      )}
    >
      {children}
    </button>
  );
}

function SearchBox({ q, setQ, className }) {
  const t = useTranslations('marketsPage.detail.labels');
  return (
    <label className={cn('relative flex items-center', className)}>
      <span className="sr-only">{t('search')}</span>
      <Search className="pointer-events-none absolute start-4 size-4 text-ink/40" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="h-12 w-full rounded-full border border-brand/15 bg-white ps-11 pe-4 text-sm text-ink shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </label>
  );
}

function MoreButton({ list }) {
  const t = useTranslations('marketsPage.detail.labels');
  if (list.q || list.filtered.length <= list.page) return null;
  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={() => list.setAll((a) => !a)}
        className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
      >
        {list.all ? t('showLess') : t('showMore', { count: list.filtered.length })}
        <ChevronDown className={cn('size-4 transition-transform', list.all && 'rotate-180')} />
      </button>
    </div>
  );
}

function Empty({ q }) {
  const t = useTranslations('marketsPage.detail.labels');
  return <p className="py-12 text-center text-sm text-ink/50">{t('noResults', { query: q })}</p>;
}

function Intro({ list, center = true, toolbar }) {
  const t = usePageT();
  return (
    <div className={cn('flex flex-col gap-6', !center && 'lg:flex-row lg:items-end lg:justify-between')}>
      <SectionIntro
        layout={center ? 'center' : 'split'}
        title={t('quotes.title')}
        description={t('quotes.description')}
        className={center ? '' : 'flex-1'}
      />
      {toolbar ?? (list.rows.length > 0 && <SearchBox q={list.q} setQ={list.setQ} className={center ? 'mx-auto w-full max-w-md' : 'w-full lg:max-w-xs'} />)}
    </div>
  );
}

function NoSymbols() {
  const t = useTranslations('marketsPage.detail.labels');
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-brand/20 bg-[#f8f9fd] px-6 py-14 text-center md:mt-12">
      <p className="text-sm font-medium text-ink/55">{t('noSymbols')}</p>
    </div>
  );
}

function SortTh({ label, active, dir, onClick, className }) {
  return (
    <th scope="col" className={className}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors',
          active ? 'text-gold-100' : 'text-white/75 hover:text-white'
        )}
      >
        {label}
        <ArrowUpDown className={cn('size-3.5 opacity-70', active && dir < 0 && 'rotate-180')} aria-hidden />
      </button>
    </th>
  );
}

/** Template A — live quotes in a premium table (Forex, Indices, Shares). */
export function QuotesCards() {
  const t = useTranslations('marketsPage.detail.labels');
  const href = useSymbolHref();
  const router = useRouter();
  const table = useQuoteTable();

  const toolbar =
    table.rows.length > 0 ? (
      <div className="flex w-full flex-col gap-4 lg:max-w-2xl lg:items-end">
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-up/20 bg-up/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-up">
            <LiveDot /> {t('live')}
          </span>
          <span className="rounded-full bg-brand/5 px-3 py-1.5 text-[11px] font-semibold text-brand/70">{t('perPage', { count: TABLE_PAGE })}</span>
          <span className="text-xs font-medium text-ink/45">{t('instruments', { count: table.total })}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={table.filter === 'all'} onClick={() => table.setFilter('all')}>
            {t('all')}
          </FilterChip>
          <FilterChip active={table.filter === 'up'} onClick={() => table.setFilter('up')}>
            <TrendingUp className="me-1 inline size-3.5" aria-hidden />
            {t('gainers')}
          </FilterChip>
          <FilterChip active={table.filter === 'down'} onClick={() => table.setFilter('down')}>
            <TrendingDown className="me-1 inline size-3.5" aria-hidden />
            {t('losers')}
          </FilterChip>
        </div>
        <SearchBox q={table.q} setQ={table.setQ} className="min-w-0 w-full" />
      </div>
    ) : null;

  const from = table.total === 0 ? 0 : table.start + 1;
  const to = Math.min(table.start + TABLE_PAGE, table.total);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef1fa] via-white to-white py-14 text-ink md:py-24">
      <div className="pointer-events-none absolute -end-32 top-0 size-[420px] rounded-full bg-brand/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -start-24 bottom-0 size-80 rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <div className="container-x relative">
        <Intro list={table} center={false} toolbar={toolbar} />
        {table.rows.length === 0 && <NoSymbols />}
        {table.rows.length > 0 && table.shown.length === 0 && <Empty q={table.q} />}
        {table.shown.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-[0_28px_80px_-40px_rgba(41,59,147,0.45)] md:mt-12">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand/10 bg-gradient-to-r from-[#f8f9fd] to-white px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold text-ink/55">
                {t('pageRange', { from, to, total: table.total })}
              </p>
              {table.pageCount > 1 && (
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand/60">
                  {t('pageOf', { page: table.page + 1, total: table.pageCount })}
                </p>
              )}
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[680px] border-collapse text-start">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-700 shadow-sm">
                    <SortTh
                      label={t('symbol')}
                      active={table.sort.key === 's'}
                      dir={table.sort.dir}
                      onClick={() => table.toggleSort('s')}
                      className="px-4 py-4 text-start sm:px-5"
                    />
                    <th scope="col" className="hidden px-3 py-4 text-[11px] font-bold uppercase tracking-wider text-white/75 md:table-cell">
                      {t('name')}
                    </th>
                    <th scope="col" className="px-3 py-4 text-end text-[11px] font-bold uppercase tracking-wider text-white/75">
                      {t('sell')}
                    </th>
                    <th scope="col" className="px-3 py-4 text-end text-[11px] font-bold uppercase tracking-wider text-white/75">
                      {t('buy')}
                    </th>
                    <SortTh
                      label={t('spread')}
                      active={table.sort.key === 'spread'}
                      dir={table.sort.dir}
                      onClick={() => table.toggleSort('spread')}
                      className="hidden px-3 py-4 text-end sm:table-cell"
                    />
                    <SortTh
                      label={t('change')}
                      active={table.sort.key === 'change'}
                      dir={table.sort.dir}
                      onClick={() => table.toggleSort('change')}
                      className="px-3 py-4 text-end"
                    />
                    <th scope="col" className="hidden px-3 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white/75 lg:table-cell">
                      {t('trend')}
                    </th>
                    <th scope="col" className="px-4 py-4 text-end text-[11px] font-bold uppercase tracking-wider text-white/75 sm:px-5">
                      <span className="sr-only">{t('action')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {table.shown.map((r, i) => (
                      <motion.tr
                        key={r.s}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.02, ease: EASE }}
                        onClick={() => router.push(href(r.s))}
                        onKeyDown={(e) => e.key === 'Enter' && router.push(href(r.s))}
                        tabIndex={0}
                        role="link"
                        className={cn(
                          'group cursor-pointer border-b border-brand/[0.06] transition-all last:border-b-0',
                          'hover:bg-gradient-to-r hover:from-brand/[0.04] hover:to-gold/[0.06]',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand',
                          i % 2 === 1 && 'bg-[#fafbff]/80'
                        )}
                      >
                        <td className="relative px-4 py-3 sm:px-5">
                          <span className="absolute inset-y-0 start-0 w-0.5 scale-y-0 bg-gold transition-transform group-hover:scale-y-100" aria-hidden />
                          <div className="flex items-center gap-3">
                            <span className="hidden w-5 shrink-0 text-[10px] font-bold tabular-nums text-ink/25 sm:block">
                              {String(table.start + i + 1).padStart(2, '0')}
                            </span>
                            <SymbolBadge symbol={r.s} className="size-9 text-[10px] shadow-sm ring-1 ring-brand/10 transition group-hover:ring-brand/25" />
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-brand" dir="ltr">
                                {r.s}
                              </span>
                              <span className="block truncate text-xs text-ink/45 md:hidden">{r.n}</span>
                            </span>
                          </div>
                        </td>
                        <td className="hidden max-w-[200px] truncate px-3 py-3 text-sm text-ink/55 md:table-cell">{r.n}</td>
                        <td className="px-2 py-3 text-end sm:px-3" dir="ltr">
                          <span className="inline-block min-w-[5.5rem] rounded-lg bg-down/[0.08] px-2.5 py-1.5">
                            <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-sm font-bold text-ink" />
                          </span>
                        </td>
                        <td className="px-2 py-3 text-end sm:px-3" dir="ltr">
                          <span className="inline-block min-w-[5.5rem] rounded-lg bg-up/[0.08] px-2.5 py-1.5">
                            <FlashPrice value={r.ask} decimals={r.d} dir={r.dir} tick={r.tick} className="text-sm font-bold text-ink" />
                          </span>
                        </td>
                        <td className="hidden px-3 py-3 text-end sm:table-cell" dir="ltr">
                          <span className="inline-flex rounded-md bg-brand/5 px-2 py-1 text-xs font-semibold tabular-nums text-brand/80">
                            {spreadOf(r)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-end" dir="ltr">
                          <span
                            className={cn(
                              'inline-flex min-w-[4.25rem] items-center justify-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
                              r.change == null ? 'bg-ink/5 text-ink/40' : r.change >= 0 ? 'bg-up/12 text-up' : 'bg-down/12 text-down'
                            )}
                          >
                            {r.change != null && r.change >= 0 && <TrendingUp className="size-3 opacity-80" aria-hidden />}
                            {r.change != null && r.change < 0 && <TrendingDown className="size-3 opacity-80" aria-hidden />}
                            {pct(r.change)}
                          </span>
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <div className="mx-auto w-[92px] rounded-lg bg-brand/[0.04] px-2 py-1">
                            <Sparkline data={r.hist} up={(r.change ?? 0) >= 0} width={76} height={28} className="mx-auto text-brand/90" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-end sm:px-5">
                          <span className="inline-flex size-8 items-center justify-center rounded-full border border-brand/10 bg-white text-brand transition group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {table.pageCount > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-brand/10 bg-[#f8f9fd] px-4 py-4 sm:flex-row sm:px-5">
                <p className="text-xs font-medium text-ink/50">{t('pageOf', { page: table.page + 1, total: table.pageCount })}</p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={table.page <= 0}
                    onClick={() => table.setPage((p) => Math.max(0, p - 1))}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-brand/15 bg-white text-brand transition enabled:hover:bg-brand enabled:hover:text-white disabled:opacity-40"
                    aria-label={t('prevPage')}
                  >
                    <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden />
                  </button>
                  {Array.from({ length: table.pageCount }, (_, n) => n)
                    .filter((n) => n === 0 || n === table.pageCount - 1 || Math.abs(n - table.page) <= 1)
                    .reduce((acc, n, idx, arr) => {
                      if (idx > 0 && n - arr[idx - 1] > 1) acc.push('gap');
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, idx) =>
                      n === 'gap' ? (
                        <span key={`gap-${idx}`} className="px-1 text-ink/30">
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => table.setPage(n)}
                          className={cn(
                            'min-w-9 rounded-full px-3 py-1.5 text-xs font-bold tabular-nums transition',
                            n === table.page ? 'bg-brand text-white shadow-md shadow-brand/20' : 'bg-white text-ink/55 ring-1 ring-brand/10 hover:text-brand'
                          )}
                        >
                          {n + 1}
                        </button>
                      )
                    )}
                  <button
                    type="button"
                    disabled={table.page >= table.pageCount - 1}
                    onClick={() => table.setPage((p) => Math.min(table.pageCount - 1, p + 1))}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-brand/15 bg-white text-brand transition enabled:hover:bg-brand enabled:hover:text-white disabled:opacity-40"
                    aria-label={t('nextPage')}
                  >
                    <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Watchlist — a compact live list on the start side, the selected instrument in detail on the other. */
export function QuotesWatchlist() {
  const t = useTranslations('marketsPage.detail.labels');
  const href = useSymbolHref();
  const list = useQuoteList(LIST_PAGE);
  const [sel, setSel] = useState(0);
  const r = list.shown[sel] ?? list.shown[0] ?? list.rows[0];
  const pos = rangePos(r);
  return (
    <section className="relative bg-white py-14 text-ink md:py-24">
      <div className="container-x">
        <Intro list={list} center={false} />
        {list.rows.length === 0 ? (
          <NoSymbols />
        ) : (
          <div className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-[1fr_1.1fr]">
            <div className="overflow-hidden rounded-3xl border border-brand/10">
              {list.shown.length === 0 && <Empty q={list.q} />}
              <ul className="max-h-[560px] overflow-y-auto">
                {list.shown.map((x, k) => (
                  <li key={x.s}>
                    <button
                      type="button"
                      onClick={() => setSel(k)}
                      onMouseEnter={() => setSel(k)}
                      className={cn(
                        'relative flex w-full items-center justify-between gap-4 border-b border-brand/10 px-5 py-3.5 text-start transition-colors',
                        k === sel ? 'bg-brand text-white' : 'hover:bg-[#f8f9fd]'
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold" dir="ltr">
                          {x.s}
                        </span>
                        <span className={cn('block truncate text-xs', k === sel ? 'text-white/60' : 'text-ink/50')}>{x.n}</span>
                      </span>
                      <span className="flex items-center gap-4" dir="ltr">
                        <FlashPrice value={x.bid} decimals={x.d} dir={x.dir} tick={x.tick} className="text-sm font-semibold" />
                        <span className={cn('w-16 text-end text-xs font-semibold tabular-nums', changeTone(x.change, k === sel))}>{pct(x.change)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {r && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand to-brand-700 p-6 text-white md:p-8 lg:sticky lg:top-24 lg:self-start">
                <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
                <span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-3xl" aria-hidden />
                <AnimatePresence mode="wait">
                  <motion.div key={r.s} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="relative">
                    <div className="flex items-center justify-between" dir="ltr">
                      <div>
                        <p className="text-3xl font-black">{r.s}</p>
                        <p className="text-sm text-white/60">{r.n}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-[11px] font-bold text-gold-200">
                        <LiveDot /> {t('live')}
                      </span>
                    </div>
                    <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="mt-6 block text-5xl font-bold tracking-tight" />
                    <p className={cn('mt-1 text-sm font-semibold tabular-nums', changeTone(r.change, true))} dir="ltr">
                      {pct(r.change)}
                    </p>
                    <Sparkline data={r.hist} up={(r.change ?? 0) >= 0} width={420} height={70} className="mt-6 w-full" />
                    <dl dir="ltr" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        [t('sell'), fmt(r.bid, r.d)],
                        [t('buy'), fmt(r.ask, r.d)],
                        [t('spread'), spreadOf(r)],
                        [t('dayHigh'), fmt(r.high, r.d)]
                      ].map(([l, v]) => (
                        <div key={l} className="rounded-xl bg-white/10 px-3 py-2.5">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/50">{l}</dt>
                          <dd className="mt-0.5 text-sm font-bold tabular-nums">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div dir="ltr" className="relative mt-6 h-2 rounded-full bg-white/15">
                      {pos != null && <motion.span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold" animate={{ left: `${pos}%` }} />}
                    </div>
                    <NavLink href={href(r.s)} prefetch={false} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-gold-50">
                      {t('viewDetails')} <ArrowRight className="size-4 rtl:-scale-x-100" />
                    </NavLink>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
        <MoreButton list={list} />
      </div>
    </section>
  );
}
