'use client';
/**
 * Upper part of the trader page: dark hero (identity + headline metrics + Copy), account summary,
 * performance panel (range pills, metrics list, ROI / PnL chart).
 */
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Wallet } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import EquityChart from '../../components/EquityChart';
import { TraderAvatar } from '../../components/TraderCard';
import { MOCK_URL, fmtInt, fmtMoney, fmtNumber, fmtPercent, subscriptionUrl, tone } from '../../components/copyUtils';
import { PerfChart } from './charts';
import { RANGES, filterEntries, rangeSeries } from './traderData';

const num = (v) => (v == null || v === '' ? NaN : Number(v));
export const avatarItem = (d) => ({ avatar: d?.public?.avatarPath || '', countryCode: String(d?.account?.countryCode || '').toLowerCase() });

/* ------------------------------------------------------------ hero */

export function DetailHero({ data }) {
  const t = useTranslations('copyTradingPage.detail.hero');
  const tb = useTranslations('copyTradingPage.detail.breadcrumb');
  const eb = (data?.history?.entries || []).map((e) => Number(e?.eb)).filter(Number.isFinite);
  const metrics = [
    [t('daysTrading'), fmtInt(num(data?.age))],
    [t('winRate'), `${fmtNumber(num(data?.winRate), 1)}%`],
    [t('closedTrades'), fmtInt(num(data?.totalClosedTrades))],
    [t('sharpe'), fmtNumber(num(data?.sharpeRatio))],
    [t('mdd'), `${fmtNumber(num(data?.maxDrawdown))}%`]
  ];
  const meta = [`#${fmtInt(num(data?.rank))}`, data?.account?.country, data?.account?.leverage ? `1:${fmtInt(num(data.account.leverage))}` : null, data?.account?.currency].filter(Boolean);

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-14 pt-36 text-white md:pb-20 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('copyTrading'), href: '/trading/copy-trading' }, { label: data?.accountName || '—' }]} />

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <NavLink href="/trading/copy-trading#top-traders" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-gold-200">
              <ArrowLeft className="size-4 rtl:-scale-x-100" />
              {t('back')}
            </NavLink>
            <motion.div className="mt-5 flex items-center gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
              <TraderAvatar item={avatarItem(data)} size="size-16 md:size-20" ring="ring-white/20" />
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-3xl font-bold tracking-tight md:text-4xl">{data?.accountName}</h1>
                  <span className="shrink-0 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white shadow-lg shadow-gold/30">#{fmtInt(num(data?.rank))}</span>
                </div>
                <p className="mt-1.5 text-sm text-white/55">{data?.account?.leverage ? t('leverage', { leverage: fmtInt(num(data.account.leverage)) }) : meta.join(' · ')}</p>
                <p className="mt-0.5 text-xs text-white/40">{meta.join(' · ')}</p>
              </div>
            </motion.div>

            <Stagger className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-5" stagger={0.06}>
              {metrics.map(([l, v]) => (
                <StaggerItem key={l} className="rounded-2xl bg-white/[0.05] px-3.5 py-3 ring-1 ring-white/10 backdrop-blur">
                  <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-white/45">{l}</div>
                  <div dir="ltr" className="mt-1 text-lg font-bold tabular-nums rtl:text-end">
                    {v}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <a href={subscriptionUrl(data?.accountId)} target="_blank" rel="noopener noreferrer" className="shine group inline-flex h-13 items-center gap-2.5 rounded-full bg-gold px-8 text-base font-bold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
                {t('copy')}
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
              </a>
              <a href={MOCK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                {t('mock')}
              </a>
            </motion.div>
          </div>

          {/* headline card */}
          <motion.div initial={{ opacity: 0, y: 30, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="relative overflow-hidden rounded-[2rem] bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-7">
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" aria-hidden />
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">{t('roiAll')}</div>
                <div dir="ltr" className="text-gradient-gold mt-1 text-4xl font-bold tracking-tight tabular-nums md:text-5xl">
                  {fmtPercent(num(data?.returnAllTime))}
                </div>
              </div>
              <div className="text-end">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">{t('totalPnl')}</div>
                <div dir="ltr" className={cn('mt-1.5 text-lg font-bold tabular-nums', num(data?.totalProfit) >= 0 ? 'text-green-300' : 'text-red-300')}>
                  {fmtMoney(num(data?.totalProfit))} <span className="text-xs text-white/50">{data?.account?.currency}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 h-40">
              <EquityChart data={eb.length > 60 ? eb.filter((_, i) => i % Math.ceil(eb.length / 60) === 0) : eb} color="#d2a67a" className="h-full w-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ account summary */

export function AccountSummary({ data }) {
  const t = useTranslations('copyTradingPage.detail.account');
  const a = data?.account || {};
  const tiles = [
    [t('floatingPnl'), fmtNumber(num(a.floatingPnL)), tone(num(a.floatingPnL))],
    [t('freeMargin'), fmtNumber(num(a.freeMargin))],
    [t('margin'), fmtNumber(num(a.margin))],
    [t('credit'), fmtNumber(num(a.credit))],
    [t('updated'), data?.updatedUtc ? new Date(data.updatedUtc).toLocaleDateString('en-GB') : '-']
  ];
  return (
    <Reveal y={20}>
      <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-brand/10 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <Wallet className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink">{t('title')}</h2>
              <p className="text-sm text-ink/50">
                #{fmtInt(num(data?.rank))} · {a.country || '-'} · {a.leverage ? `1:${fmtInt(num(a.leverage))}` : '-'} · {a.currency || '-'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              [t('balance'), a.balance],
              [t('equity'), a.equity]
            ].map(([l, v]) => (
              <span key={l} className="rounded-xl bg-gradient-to-r from-brand-50 to-white px-4 py-2 text-sm text-ink/60 ring-1 ring-brand/10">
                {l}: <strong dir="ltr" className="font-bold tabular-nums text-ink">{fmtNumber(num(v))}</strong>
              </span>
            ))}
          </div>
        </div>
        <Stagger className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" stagger={0.05}>
          {tiles.map(([l, v, c]) => (
            <StaggerItem key={l} className="rounded-2xl bg-[#f6f7fb] px-4 py-3.5 ring-1 ring-brand/5 transition-colors hover:bg-brand-50">
              <div className="text-xs text-ink/50">{l}</div>
              <div dir="ltr" className={cn('mt-1 font-bold tabular-nums rtl:text-end', c || 'text-ink')}>
                {v}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------ performance */

function Pills({ items, value, onChange, id }) {
  return (
    <div className="flex gap-1 rounded-full bg-[#f1f3f9] p-1" role="tablist">
      {items.map(([k, label]) => {
        const on = k === value;
        return (
          <button key={k} type="button" role="tab" aria-selected={on} onClick={() => onChange(k)} className={cn('relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors', on ? 'text-white' : 'text-ink/55 hover:text-brand')}>
            {on && <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-brand shadow-md shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Performance({ data }) {
  const t = useTranslations('copyTradingPage.detail.performance');
  const [range, setRange] = useState('ALL');
  const [mode, setMode] = useState('roi');
  const cur = data?.account?.currency || '';
  const entries = useMemo(() => filterEntries(data?.history?.entries, range), [data, range]);
  const { roi, pnl, points } = useMemo(() => rangeSeries(entries, mode), [entries, mode]);
  const fmt = (v, short) => (mode === 'roi' ? `${fmtNumber(v, short ? 0 : 2)}%` : short ? fmtNumber(v, 0) : `${fmtMoney(v)} ${cur}`);

  const rows = [
    [t('roi'), roi == null ? '-' : fmtPercent(roi), tone(roi)],
    [t('pnl'), roi == null ? '-' : `${fmtMoney(pnl)} ${cur}`, tone(pnl)],
    [t('copierPnl'), '-'],
    [t('sharpe'), fmtNumber(num(data?.sharpeRatio))],
    [t('mdd'), `${fmtNumber(num(data?.maxDrawdown))}%`],
    [t('winRate'), `${fmtNumber(num(data?.winRate))}%`],
    [t('winPositions'), fmtInt(num(data?.profitDays))],
    [t('totalPositions'), fmtInt(num(data?.totalClosedTrades))]
  ];

  return (
    <Reveal y={20}>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-brand/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">{t('title')}</h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand">{t(`ranges.${range}`)}</span>
          </div>
          <dl className="mt-5 divide-y divide-dashed divide-brand/10">
            {rows.map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-sm text-ink/55">{l}</dt>
                <dd dir="ltr" className={cn('text-sm font-bold tabular-nums', c || 'text-ink')}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-brand/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Pills id="perf-mode" items={[['roi', t('roi')], ['pnl', t('pnl')]]} value={mode} onChange={setMode} />
            <Pills id="perf-range" items={RANGES.map((r) => [r, t(`ranges.${r}`)])} value={range} onChange={setRange} />
          </div>
          {points.length >= 2 ? <PerfChart points={points} format={fmt} className="mt-5 h-72 md:h-80" /> : <div className="mt-5 grid h-72 place-items-center rounded-2xl bg-[#f6f7fb] text-sm text-ink/50 md:h-80">{t('noData')}</div>}
        </div>
      </div>
    </Reveal>
  );
}
