'use client';
import { motion } from 'motion/react';
import { ArrowUpRight, Star } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { cn } from '@/lib/utils';
import EquityChart from './EquityChart';
import { DEFAULT_AVATAR, MOCK_URL, fmtInt, fmtMoney, fmtNumber, fmtPercent, subscriptionUrl } from './copyUtils';

/** Avatar with the country flag pinned to the corner. */
export function TraderAvatar({ item, size = 'size-12', ring = 'ring-brand/10' }) {
  return (
    <span className="relative shrink-0">
      <img src={item.avatar || DEFAULT_AVATAR} alt="" className={cn('rounded-xl bg-white object-cover ring-1', size, ring)} loading="lazy" />
      {/^[a-z]{2}$/.test(item.countryCode) && <img src={`https://flagcdn.com/w40/${item.countryCode}.png`} alt="" className="absolute -end-1 -top-1 size-4 rounded-full object-cover ring-2 ring-white" loading="lazy" />}
    </span>
  );
}

/** "#142 · Nigeria · 500 · USC" */
export function traderMeta(item) {
  return [`#${fmtInt(item.rank)}`, item.country, item.leverage ? fmtInt(item.leverage) : null, item.currency].filter(Boolean);
}

/** Detail page of a strategy provider. */
export const profileHref = (item) => (item?.profileId != null ? `/trading/copy-trading/leaderboard/${item.profileId}` : null);

/** Is the equity curve ending above where it started? */
export const trendUp = (t = []) => t.length < 2 || t[t.length - 1] >= t[0];

/**
 * Navy spotlight card for the selected featured trader: identity, big gold equity curve,
 * PNL / ROI headline, AUM / MDD / Sharpe glass tiles, Mock + Copy.
 */
export function SpotlightCard({ item, labels }) {
  const meta = traderMeta(item);
  return (
    <div className="is-dark relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white shadow-2xl shadow-brand/30 md:p-8">
      <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
      <motion.span className="absolute -end-20 -top-20 size-72 rounded-full bg-gold/20 blur-[90px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />

      {/* identity */}
      <div className="relative flex items-center gap-4">
        <TraderAvatar item={item} size="size-14" ring="ring-white/20" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xl font-bold">{profileHref(item) ? <NavLink href={profileHref(item)} className="decoration-gold-200 underline-offset-4 transition-colors hover:text-gold-200 hover:underline">{item.name}</NavLink> : item.name}</h3>
            <Star className="size-4 shrink-0 fill-gold-200 text-gold-200" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-white/55">
            {meta.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {i > 0 && <span className="size-1 rounded-full bg-white/25" />}
                {m}
              </span>
            ))}
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white shadow-lg shadow-gold/30 sm:inline-flex">#{fmtInt(item.rank)}</span>
      </div>

      {/* headline numbers */}
      <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">{labels.pnl}</div>
          <div dir="ltr" className="text-gradient-gold mt-1 text-4xl font-bold tracking-tight tabular-nums md:text-5xl">
            {fmtMoney(item.pnl)}
          </div>
        </div>
        <div className="text-end">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">{labels.roi}</div>
          <div dir="ltr" className={cn('mt-1.5 inline-flex rounded-full px-3 py-1 text-lg font-bold tabular-nums', item.roi >= 0 ? 'bg-up/20 text-green-300' : 'bg-down/20 text-red-300')}>
            {fmtPercent(item.roi)}
          </div>
        </div>
      </div>

      {/* curve */}
      <div className="relative mt-5 h-36 md:h-44">
        <EquityChart data={item.trend} color="#d2a67a" className="h-full w-full" />
      </div>

      {/* stats */}
      <div className="relative mt-5 grid grid-cols-3 gap-2.5">
        {[
          [labels.aum, fmtNumber(item.aum)],
          [labels.mdd, Number.isFinite(item.mdd) ? `${fmtNumber(item.mdd)}%` : '-'],
          [labels.sharpe, fmtNumber(item.sharpe)]
        ].map(([l, v]) => (
          <div key={l} className="min-w-0 rounded-2xl bg-white/[0.06] px-3 py-3 ring-1 ring-white/10 backdrop-blur">
            <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-white/45">{l}</div>
            <div dir="ltr" className="mt-1 text-base font-bold tabular-nums">
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* actions */}
      <div className="relative mt-6 grid grid-cols-1 gap-3">
        {/* <a href={MOCK_URL} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white hover:text-brand-900">
          {labels.mock}
        </a> */}
        <a href={profileHref(item)} target="_blank" rel="noopener noreferrer" className="shine group/copy flex h-12 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-bold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
         View Details
          <ArrowUpRight className="size-4 transition-transform group-hover/copy:-translate-y-0.5 group-hover/copy:translate-x-0.5 rtl:-scale-x-100" />
        </a>
      </div>
    </div>
  );
}
