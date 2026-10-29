'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock3, ShieldCheck, TrendingUp, TriangleAlert, UserRound } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import EquityChart from './EquityChart';
import NavLink from '@/components/shared/nav/NavLink';
import { SpotlightCard, TraderAvatar, profileHref, trendUp } from './TraderCard';
import { fmtInt, fmtMoney, fmtNumber, fmtPercent, isExcluded, subscriptionUrl, tone, useRatings } from './copyUtils';

const PAGE_SIZE = 12;
const SPOTLIGHT_MS = 5000;
const FEATURE_ICONS = [TrendingUp, ShieldCheck, Clock3, UserRound];
const SORTS = [
  { key: 'rank', orderby: 'rank asc' },
  { key: 'pnl', orderby: 'totalProfit desc' },
  { key: 'roi', orderby: 'maxProfit desc' },
  { key: 'sharpe', orderby: 'sharpeRatio desc' }
];

/* ------------------------------------------------------------ spotlight */

/**
 * Featured traders (ROI ≥ 50%, excluded countries removed): the selected one in a navy spotlight card,
 * the rest in a selectable list with an auto-advance progress bar. Hover pauses the rotation.
 */
function Spotlight({ labels }) {
  const { items, loading } = useRatings({ top: 30 });
  const featured = useMemo(() => items.filter((i) => Number(i.roi) >= 50 && !isExcluded(i)).slice(0, 6), [items]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || featured.length < 2) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % featured.length), SPOTLIGHT_MS);
    return () => clearTimeout(id);
  }, [active, paused, featured.length]);

  if (loading) {
    return (
      <div className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="h-[520px] animate-pulse rounded-[2rem] bg-brand-100/60" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} className="h-[88px] animate-pulse rounded-2xl bg-white ring-1 ring-brand/10" />
          ))}
        </div>
      </div>
    );
  }
  if (!featured.length) return null;
  const current = featured[Math.min(active, featured.length - 1)];

  return (
    <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-[1.35fr_1fr] lg:gap-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative min-h-[520px]">
        <AnimatePresence mode="wait">
          <motion.div key={current.profileId ?? active} className="h-full" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.98 }} transition={{ duration: 0.45, ease: EASE }}>
            <SpotlightCard item={current} labels={labels} />
          </motion.div>
        </AnimatePresence>
      </div>

      <Stagger as="ul" className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0" stagger={0.07}>
        {featured.map((item, i) => {
          const on = i === active;
          const up = trendUp(item.trend);
          return (
            <StaggerItem as="li" key={item.profileId ?? i} className="min-w-[260px] lg:min-w-0">
              <button type="button" onClick={() => setActive(i)} aria-pressed={on} className={cn('group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-3.5 text-start transition-all duration-500', on ? 'bg-white shadow-xl shadow-brand/15 ring-2 ring-brand' : 'bg-white/70 ring-1 ring-brand/10 hover:bg-white hover:shadow-md')}>
                <TraderAvatar item={item} size="size-11" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{item.name}</span>
                  <span className="block truncate text-xs text-ink/50">
                    #{fmtInt(item.rank)} · {item.country || '-'}
                  </span>
                </span>
                <EquityChart data={item.trend} compact color={up ? '#16a34a' : '#dc2626'} className="hidden h-8 w-16 sm:block" />
                <span dir="ltr" className={cn('shrink-0 rounded-lg px-2 py-1 text-xs font-bold tabular-nums', item.roi >= 0 ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>
                  {fmtPercent(item.roi)}
                </span>
                {on && !paused && featured.length > 1 && (
                  <motion.span key={`p-${active}`} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-brand to-gold rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: SPOTLIGHT_MS / 1000, ease: 'linear' }} />
                )}
              </button>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}

/* ------------------------------------------------------------ features row */

function Features({ items }) {
  return (
    <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
      {items.map((f, i) => {
        const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
        return (
          <StaggerItem key={f.title}>
            <div className="group relative flex h-full items-start gap-3.5 overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
              <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-md shadow-brand/25 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold text-ink">{f.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink/55">{f.text}</span>
              </span>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

/* ------------------------------------------------------------ leaderboard */

function RankBadge({ rank }) {
  const medal = rank === 1 ? 'from-gold-200 to-gold-700 text-white' : rank === 2 ? 'from-zinc-100 to-zinc-400 text-ink' : rank === 3 ? 'from-amber-200 to-amber-700 text-white' : null;
  return medal ? <span className={cn('grid size-8 place-items-center rounded-full bg-gradient-to-br text-xs font-bold shadow-md', medal)}>{rank}</span> : <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-xs font-bold tabular-nums text-brand ring-1 ring-brand/10">{fmtInt(rank)}</span>;
}

function CopyButton({ item, label, full = false }) {
  return (
    <a href={subscriptionUrl(item.accountId)} target="_blank" rel="noopener noreferrer" className={cn('group/btn inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-brand/20 px-4 text-xs font-semibold text-brand transition-all duration-300 hover:border-brand hover:bg-brand hover:text-white hover:shadow-lg hover:shadow-brand/25', full && 'w-full')}>
      {label}
      <ArrowUpRight className="size-3.5 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 rtl:-scale-x-100" />
    </a>
  );
}

/** Page numbers around the current page: 1 … 4 5 [6] 7 8 … 84 */
function pageList(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

function Leaderboard({ t }) {
  const [sort, setSort] = useState(SORTS[0]);
  const [skip, setSkip] = useState(0);
  const { items, count, loading, error } = useRatings({ top: PAGE_SIZE, skip, orderby: sort.orderby });
  const cols = t.raw('table');
  const sortLabels = t.raw('sort');
  const total = count || 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const goPage = (p) => setSkip((Math.min(pages, Math.max(1, p)) - 1) * PAGE_SIZE);
  const bodyKey = `${sort.key}-${skip}-${loading}`;

  return (
    <Reveal className="mt-14" y={24}>
      {/* toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">{sortLabels.label}</span>
          <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-brand/10">
            {SORTS.map((s) => {
              const on = s.key === sort.key;
              return (
                <button key={s.key} type="button" role="tab" aria-selected={on} onClick={() => { setSort(s); setSkip(0); }} className={cn('relative shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors', on ? 'text-white' : 'text-ink/60 hover:text-brand')}>
                  {on && <motion.span layoutId="ct-sort" className="absolute inset-0 rounded-full bg-brand shadow-md shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="relative">{sortLabels[s.key]}</span>
                </button>
              );
            })}
          </div>
        </div>
        {total > 0 && (
          <span dir="ltr" className="text-sm tabular-nums text-ink/50">
            {fmtInt(skip + 1)}–{fmtInt(Math.min(skip + PAGE_SIZE, total))} {t('pagination.of')} {fmtInt(total)}
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-brand/5 ring-1 ring-brand/10">
        {/* desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-800 via-brand-900 to-brand-950 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                {['rank', 'trader', 'pnl', 'roi', 'trend', 'aum', 'sharpe'].map((k) => (
                  <th key={k} scope="col" className="px-5 py-4 text-start">
                    {cols[k]}
                  </th>
                ))}
                <th scope="col" className="px-5 py-4">
                  <span className="sr-only">{cols.copy}</span>
                </th>
              </tr>
            </thead>
            <AnimatePresence mode="wait" initial={false}>
              <motion.tbody key={bodyKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {loading ? (
                  Array.from({ length: 8 }, (_, k) => (
                    <tr key={k} className="border-b border-brand/5">
                      <td colSpan={8} className="px-5 py-3.5">
                        <span className="block h-9 animate-pulse rounded-lg bg-brand-50/70" style={{ animationDelay: `${k * 80}ms` }} />
                      </td>
                    </tr>
                  ))
                ) : error || !items.length ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-ink/55">
                      {error && <TriangleAlert className="mx-auto mb-2 size-5 text-down" />}
                      {error ? cols.error : cols.empty}
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => {
                    const top3 = item.rank <= 3;
                    const up = trendUp(item.trend);
                    return (
                      <motion.tr key={item.profileId ?? i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.035, duration: 0.35, ease: EASE }} className={cn('group relative border-b border-brand/5 transition-colors last:border-0 hover:bg-brand-50/60', top3 && 'bg-gold/[0.04]')}>
                        <td className="relative px-5 py-3">
                          <span className={cn('absolute inset-y-2 start-0 w-1 rounded-e-full transition-colors', top3 ? 'bg-gold' : 'bg-transparent group-hover:bg-brand')} aria-hidden />
                          <RankBadge rank={item.rank} />
                        </td>
                        <td className="px-5 py-3">
                          <span className="flex min-w-[200px] items-center gap-3">
                            <TraderAvatar item={item} size="size-10" />
                            <span className="min-w-0">
                              {profileHref(item) ? <NavLink href={profileHref(item)} className="block truncate font-semibold text-ink transition-colors hover:underline group-hover:text-brand">{item.name}</NavLink> : <span className="block truncate font-semibold text-ink">{item.name}</span>}
                              <span className="block text-xs text-ink/50">{item.country || '-'}</span>
                            </span>
                          </span>
                        </td>
                        <td dir="ltr" className={cn('px-5 py-3 font-semibold tabular-nums rtl:text-end', tone(item.pnl))}>
                          {fmtMoney(item.pnl)}
                        </td>
                        <td className="px-5 py-3">
                          <span dir="ltr" className={cn('inline-flex rounded-lg px-2 py-1 text-xs font-bold tabular-nums', item.roi >= 0 ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>
                            {fmtPercent(item.roi)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <EquityChart data={item.trend} compact color={up ? '#16a34a' : '#dc2626'} className="h-10 w-28" />
                        </td>
                        <td dir="ltr" className="px-5 py-3 tabular-nums text-ink/65 rtl:text-end">
                          {fmtNumber(item.aum)}
                        </td>
                        <td dir="ltr" className="px-5 py-3 tabular-nums text-ink/65 rtl:text-end">
                          {fmtNumber(item.sharpe)}
                        </td>
                        <td className="px-5 py-3 text-end">
                          <CopyButton item={item} label={cols.copy} />
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        {/* mobile cards */}
        <div className="divide-y divide-brand/5 md:hidden">
          {loading ? (
            Array.from({ length: 4 }, (_, k) => <div key={k} className="m-4 h-28 animate-pulse rounded-2xl bg-brand-50/70" />)
          ) : error || !items.length ? (
            <p className="px-6 py-14 text-center text-ink/55">{error ? cols.error : cols.empty}</p>
          ) : (
            items.map((item, i) => (
              <motion.div key={item.profileId ?? i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-4">
                <div className="flex items-center gap-3">
                  <RankBadge rank={item.rank} />
                  <TraderAvatar item={item} size="size-10" />
                  <span className="min-w-0 flex-1">
                    {profileHref(item) ? <NavLink href={profileHref(item)} className="block truncate font-semibold text-ink hover:text-brand">{item.name}</NavLink> : <span className="block truncate font-semibold text-ink">{item.name}</span>}
                    <span className="block text-xs text-ink/50">{item.country || '-'}</span>
                  </span>
                  <EquityChart data={item.trend} compact color={trendUp(item.trend) ? '#16a34a' : '#dc2626'} className="h-9 w-20" />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    [cols.pnl, fmtMoney(item.pnl), tone(item.pnl)],
                    [cols.roi, fmtPercent(item.roi), tone(item.roi)],
                    [cols.aum, fmtNumber(item.aum), 'text-ink'],
                    [cols.sharpe, fmtNumber(item.sharpe), 'text-ink']
                  ].map(([l, v, c]) => (
                    <div key={l} className="min-w-0 rounded-xl bg-[#f6f7fb] px-1.5 py-2">
                      <div className="truncate text-[9px] font-semibold uppercase tracking-wider text-ink/45">{l}</div>
                      <div dir="ltr" className={cn('mt-0.5 truncate text-xs font-bold tabular-nums', c)}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <CopyButton item={item} label={cols.copy} full />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* pagination */}
      {total > PAGE_SIZE && (
        <nav className="mt-6 flex items-center justify-center gap-1.5" aria-label="Pagination">
          <button type="button" disabled={page === 1 || loading} onClick={() => goPage(page - 1)} aria-label={t('pagination.previous')} className="grid size-10 place-items-center rounded-xl bg-white text-brand ring-1 ring-brand/15 transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-brand">
            <ChevronLeft className="size-4 rtl:-scale-x-100" />
          </button>
          {pageList(page, pages).map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="px-1 text-ink/35">
                …
              </span>
            ) : (
              <button key={p} type="button" disabled={loading} onClick={() => goPage(p)} aria-current={p === page ? 'page' : undefined} className={cn('relative grid h-10 min-w-10 place-items-center rounded-xl px-2 text-sm font-semibold tabular-nums transition-colors', p === page ? 'text-white' : 'bg-white text-ink/70 ring-1 ring-brand/10 hover:text-brand hover:ring-brand/30')}>
                {p === page && <motion.span layoutId="ct-page" className="absolute inset-0 rounded-xl bg-brand shadow-md shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">{p}</span>
              </button>
            )
          )}
          <button type="button" disabled={page === pages || loading} onClick={() => goPage(page + 1)} aria-label={t('pagination.next')} className="grid size-10 place-items-center rounded-xl bg-white text-brand ring-1 ring-brand/15 transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-brand">
            <ChevronRight className="size-4 rtl:-scale-x-100" />
          </button>
        </nav>
      )}
    </Reveal>
  );
}

/** "Top Performing Traders": spotlight + list, feature row, sortable paginated leaderboard (live gtccopy ratings). */
export function TopTraders() {
  const t = useTranslations('copyTradingPage.rating');
  return (
    <section id="top-traders" className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <Spotlight labels={t.raw('card')} />
        <Features items={t.raw('features')} />
        <Leaderboard t={t} />
      </div>
    </section>
  );
}
