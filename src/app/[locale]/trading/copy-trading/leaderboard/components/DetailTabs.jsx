'use client';
/**
 * Lower part of the trader page: Overview stats (Key / Risk / Daily / Trading / Account) and the activity tabs
 * (monthly returns, trading markets + summary, position history with paging).
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, BarChart3, ChevronLeft, ChevronRight, History, PieChart } from 'lucide-react';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { fmtInt, fmtNumber } from '../../components/copyUtils';
import { Donut, MonthlyBars, donutColor } from './charts';
import { useTraderPart } from './traderData';

const POSITIONS_PAGE = 25;
const num = (v) => (v == null || v === '' ? NaN : Number(v));
const pct = (v, d = 2) => (Number.isFinite(num(v)) ? `${fmtNumber(num(v), d)}%` : '-');
const money = (v) => (Number.isFinite(num(v)) ? `$${fmtNumber(num(v))}` : '-');

/* ------------------------------------------------------------ stats */

const STAT_GROUPS = {
  key: (d) => [['winRate', pct(d.winRate, 1)], ['closedTrades', fmtInt(num(d.totalClosedTrades))], ['profitDays', fmtInt(num(d.profitDays))], ['lossDays', fmtInt(num(d.lossDays))], ['returnAll', pct(d.returnAllTime)], ['returnQuarter', pct(d.returnQuarter)], ['returnMonth', pct(d.returnMonth)], ['returnWeek', pct(d.returnWeek)], ['returnDay', pct(d.returnDay)]],
  risk: (d) => [['maxDrawdown', pct(d.maxDrawdown)], ['downsideDeviation', fmtNumber(num(d.downsideDeviation))], ['dailyVolatility', pct(d.dailyReturnVolatility)], ['returnVolatility', pct(d.returnVolatility)], ['recoveryFactor', fmtNumber(num(d.recoveryFactor))], ['absoluteGain', pct(d.absoluteGain)]],
  daily: (d) => [['maxDailyProfit', pct(d.maxDailyProfit)], ['maxDailyLoss', pct(d.maxDailyLoss)], ['avgDailyProfit', pct(d.averageDailyProfit)], ['avgDailyLoss', pct(d.averageDailyLoss)], ['geoWeekly', pct(d.geometricAverageReturnWeekly)], ['geoMonthly', pct(d.geometricAverageReturnMonthly)]],
  trading: (d) => [['winRate', pct(d.winRate, 1)], ['closedTrades', fmtInt(num(d.totalClosedTrades))], ['volumeMonth', fmtNumber(num(d.volumeMonth))], ['profitDays', fmtInt(num(d.profitDays))], ['lossDays', fmtInt(num(d.lossDays))], ['returnCalendarMonth', pct(d.returnCalendarMonth)]],
  account: (d) => [['balance', fmtNumber(num(d.account?.balance))], ['equity', fmtNumber(num(d.account?.equity))], ['floatingPnl', fmtNumber(num(d.account?.floatingPnL))], ['margin', fmtNumber(num(d.account?.margin))], ['freeMargin', fmtNumber(num(d.account?.freeMargin))], ['credit', fmtNumber(num(d.account?.credit))]]
};

/** Signed values get a green / red tint. */
const valueTone = (v) => (/^-\d/.test(v) ? 'text-down' : /^\d/.test(v) && v.endsWith('%') && parseFloat(v) > 0 ? 'text-up' : 'text-ink');

function Pills({ id, items, value, onChange }) {
  return (
    <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-[#f1f3f9] p-1">
      {items.map(([k, label]) => {
        const on = k === value;
        return (
          <button key={k} type="button" role="tab" aria-selected={on} onClick={() => onChange(k)} className={cn('relative shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors', on ? 'text-white' : 'text-ink/55 hover:text-brand')}>
            {on && <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-brand shadow-md shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StatsPanel({ data }) {
  const t = useTranslations('copyTradingPage.detail.stats');
  const [group, setGroup] = useState('key');
  const tabs = Object.keys(STAT_GROUPS).map((k) => [k, t(`tabs.${k}`)]);
  const stats = STAT_GROUPS[group](data);

  return (
    <Reveal y={20}>
      <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-brand/10 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">{t('title')}</h2>
            <p className="text-sm text-ink/50">{t('updated', { date: data?.updatedUtc ? new Date(data.updatedUtc).toLocaleString('en-GB') : '-' })}</p>
          </div>
          <Pills id="stats-group" items={tabs} value={group} onChange={setGroup} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={group} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }} className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {stats.map(([k, v], i) => (
              <motion.div key={k} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="group relative overflow-hidden rounded-2xl bg-[#f6f7fb] px-4 py-4 ring-1 ring-brand/5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-brand/10">
                <span className="absolute inset-y-3 start-0 w-0.5 rounded-full bg-brand opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                <div className="text-xs text-ink/50">{t(`labels.${k}`)}</div>
                <div dir="ltr" className={cn('mt-1 text-lg font-bold tabular-nums rtl:text-end', valueTone(v))}>
                  {v}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------ activity: returns */

function Returns({ accountId }) {
  const t = useTranslations('copyTradingPage.detail.activity.returns');
  const { data, loading } = useTraderPart('monthly', accountId);
  const months = Array.isArray(data) ? data.slice(-12) : [];
  return (
    <div>
      <Head title={t('title')} subtitle={t('subtitle')} />
      {loading ? <Skeleton className="h-72" /> : months.length ? <MonthlyBars months={months} className="mt-6 h-72" /> : <Empty text={t('empty')} />}
    </div>
  );
}

/* ------------------------------------------------------------ activity: markets */

function Markets({ accountId }) {
  const t = useTranslations('copyTradingPage.detail.activity.markets');
  const inst = useTraderPart('instruments', accountId);
  const report = useTraderPart('trading', accountId);
  const dist = (inst.data?.distribution || []).slice().sort((a, b) => num(b.countShare) - num(a.countShare));
  const totalTrades = dist.reduce((a, d) => a + (num(d.count) || 0), 0);
  const s = report.data?.summary;
  const summary = s
    ? [
        ['bestTrade', money(s.best?.profit), 'up'],
        ['worstTrade', money(s.worst?.profit), 'down'],
        ['largestTrade', fmtNumber(num(s.largest?.volume))],
        ['tradesWon', fmtInt(num(s.won?.count))],
        ['tradesLost', fmtInt(num(s.lost?.count))],
        ['totalProfit', money(s.total?.profit)],
        ['avgTradeSize', fmtNumber(num(s.total?.averageTradeSize))],
        ['avgProfitWin', money(s.won?.averageProfitPerTrade)],
        ['avgLossLost', money(s.lost?.averageProfitPerTrade)],
        ['avgPnlTrade', money(s.total?.averageProfitPerTrade)],
        ['avgPnlLot', money(s.total?.averageProfitPerLot)]
      ]
    : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <Head title={t('title')} subtitle={t('subtitle')} />
        {inst.loading ? (
          <Skeleton className="h-64" />
        ) : dist.length ? (
          <div className="mt-6 grid items-center gap-6 sm:grid-cols-[180px_1fr]">
            <Donut
              shares={dist.map((d) => num(d.countShare) || 0)}
              className="mx-auto size-44"
              center={
                <span>
                  <span className="block text-2xl font-bold text-ink">{fmtInt(totalTrades)}</span>
                  <span className="text-xs text-ink/50">{t('trades')}</span>
                </span>
              }
            />
            <ul className="space-y-3">
              {dist.slice(0, 6).map((d, i) => {
                const won = num(d.profit?.count) || 0;
                const lost = num(d.loss?.count) || 0;
                const winPct = won + lost ? (won / (won + lost)) * 100 : 0;
                return (
                  <li key={d.symbol}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-semibold text-ink">
                        <span className="size-2.5 rounded-full" style={{ background: donutColor(i) }} />
                        {d.symbol}
                      </span>
                      <span className="tabular-nums text-ink/55">
                        {fmtNumber(num(d.countShare))}% · {fmtInt(num(d.count))}
                      </span>
                    </div>
                    <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-down/20" title={`${t('won')} ${won} / ${t('lost')} ${lost}`}>
                      <motion.span className="h-full rounded-full bg-up" initial={{ width: 0 }} whileInView={{ width: `${winPct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <Empty text={t('empty')} />
        )}
      </div>

      <div>
        <Head title={t('summaryTitle')} />
        {report.loading ? (
          <Skeleton className="h-64" />
        ) : summary.length ? (
          <dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {summary.map(([k, v, c], i) => (
              <motion.div key={k} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} className={cn('rounded-xl px-3.5 py-3 ring-1', c === 'up' ? 'bg-up/[0.05] ring-up/15' : c === 'down' ? 'bg-down/[0.05] ring-down/15' : 'bg-[#f6f7fb] ring-brand/5')}>
                <dt className="flex items-center gap-1 text-xs text-ink/50">
                  {c === 'up' && <ArrowUpRight className="size-3.5 text-up" />}
                  {c === 'down' && <ArrowDownRight className="size-3.5 text-down" />}
                  {t(`stats.${k}`)}
                </dt>
                <dd dir="ltr" className={cn('mt-1 font-bold tabular-nums rtl:text-end', c === 'up' ? 'text-up' : c === 'down' ? 'text-down' : 'text-ink')}>
                  {v}
                </dd>
              </motion.div>
            ))}
          </dl>
        ) : (
          <Empty text={t('empty')} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ activity: history */

const dt = (v) => (v ? String(v).replace('T', ' ').slice(0, 19) : '-');

function Positions({ accountId }) {
  const t = useTranslations('copyTradingPage.detail.activity.history');
  const [skip, setSkip] = useState(0);
  const { data, loading } = useTraderPart('positions', accountId, { skip });
  const items = data?.items || [];
  const total = num(data?.count) || 0;
  const cols = t.raw('columns');

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Head title={t('title')} subtitle={t('subtitle')} />
        {total > 0 && (
          <div className="flex items-center gap-2">
            <button type="button" disabled={skip === 0 || loading} onClick={() => setSkip((s) => Math.max(0, s - POSITIONS_PAGE))} aria-label={t('previous')} className="grid size-10 place-items-center rounded-xl bg-white text-brand ring-1 ring-brand/15 transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-brand">
              <ChevronLeft className="size-4 rtl:-scale-x-100" />
            </button>
            <span dir="ltr" className="min-w-28 text-center text-sm tabular-nums text-ink/60">
              {t('range', { from: fmtInt(skip + 1), to: fmtInt(Math.min(skip + POSITIONS_PAGE, total)), total: fmtInt(total) })}
            </span>
            <button type="button" disabled={skip + POSITIONS_PAGE >= total || loading} onClick={() => setSkip((s) => s + POSITIONS_PAGE)} aria-label={t('next')} className="grid size-10 place-items-center rounded-xl bg-white text-brand ring-1 ring-brand/15 transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-brand">
              <ChevronRight className="size-4 rtl:-scale-x-100" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-brand/10">
        <div className="max-h-[680px] overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-brand-800 via-brand-900 to-brand-950 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65">
                {['symbol', 'volume', 'openTime', 'closeTime', 'prices', 'profit'].map((k) => (
                  <th key={k} scope="col" className="px-4 py-3.5 text-start">
                    {cols[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <AnimatePresence mode="wait" initial={false}>
              <motion.tbody key={`${skip}-${loading}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {loading ? (
                  Array.from({ length: 8 }, (_, k) => (
                    <tr key={k}>
                      <td colSpan={6} className="px-4 py-2.5">
                        <span className="block h-9 animate-pulse rounded-lg bg-brand-50/70" />
                      </td>
                    </tr>
                  ))
                ) : items.length ? (
                  items.map((p, i) => {
                    const profit = num(p.profit);
                    const buy = String(p.direction).toLowerCase() === 'buy';
                    return (
                      <motion.tr key={`${p.openTime}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 15) * 0.02 }} className="border-b border-brand/5 transition-colors odd:bg-white even:bg-[#fafbfe] hover:bg-brand-50/60">
                        <td className="px-4 py-3 font-semibold text-ink">{p.symbol || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="block font-semibold tabular-nums text-ink">{p.volume ?? '-'}</span>
                          <span className={cn('mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase', buy ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>{p.direction || '-'}</span>
                        </td>
                        <td dir="ltr" className="whitespace-nowrap px-4 py-3 tabular-nums text-ink/60 rtl:text-end">
                          {dt(p.openTime)}
                        </td>
                        <td dir="ltr" className="whitespace-nowrap px-4 py-3 tabular-nums text-ink/60 rtl:text-end">
                          {dt(p.closeTime)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink/55">
                          <span className="block">
                            {t('open')} <strong dir="ltr" className="font-semibold tabular-nums text-ink">{p.openPrice ?? '-'}</strong>
                          </span>
                          <span className="block">
                            {t('close')} <strong dir="ltr" className="font-semibold tabular-nums text-ink">{p.closePrice ?? '-'}</strong>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span dir="ltr" className={cn('block font-bold tabular-nums', profit >= 0 ? 'text-up' : 'text-down')}>
                            {Number.isFinite(profit) ? `${profit >= 0 ? '+' : '−'}$${fmtNumber(Math.abs(profit))}` : '-'}
                          </span>
                          <span className="text-xs text-ink/45">
                            {p.profitPoints ?? '-'} {t('pts')}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-ink/50">
                      {t('empty')}
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ shared bits */

function Head({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-ink md:text-xl">{title}</h3>
      {subtitle && <p className="text-sm text-ink/50">{subtitle}</p>}
    </div>
  );
}
const Skeleton = ({ className }) => <div className={cn('mt-6 animate-pulse rounded-2xl bg-brand-50/70', className)} />;
const Empty = ({ text }) => <p className="mt-6 rounded-2xl border border-dashed border-brand/20 px-6 py-14 text-center text-sm text-ink/50">{text}</p>;

const ACTIVITY = [
  { id: 'returns', Icon: BarChart3, View: Returns },
  { id: 'markets', Icon: PieChart, View: Markets },
  { id: 'history', Icon: History, View: Positions }
];

/** Underlined tabs with icons; the panel content lazy-loads its data on first open. */
export function ActivityTabs({ accountId }) {
  const t = useTranslations('copyTradingPage.detail.activity.tabs');
  const [tab, setTab] = useState('returns');
  const { View } = ACTIVITY.find((a) => a.id === tab);

  return (
    <Reveal y={20}>
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-brand/10" role="tablist">
        {ACTIVITY.map(({ id, Icon }) => {
          const on = id === tab;
          return (
            <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setTab(id)} className={cn('relative flex shrink-0 items-center gap-2 px-4 pb-3.5 pt-2 text-sm font-semibold transition-colors', on ? 'text-brand' : 'text-ink/50 hover:text-ink')}>
              <Icon className="size-4" />
              {t(id)}
              {on && <motion.span layoutId="activity-underline" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-brand to-gold" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            </button>
          );
        })}
      </div>
      <div className="mt-5 rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-brand/10 md:p-7">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
            <View accountId={accountId} />
          </motion.div>
        </AnimatePresence>
      </div>
    </Reveal>
  );
}
