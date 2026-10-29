'use client';
/** Shared bits for the market pages (both templates). */
import { createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { Cpu, Zap, TrendingUp, Repeat, Globe, Landmark, Wheat, ShieldCheck, MessagesSquare, MonitorSmartphone, Layers, Server, ChartLine } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { symbolHref } from '@/config/marketPages';

/** { page: { slug, id, template }, symbols: [{ s, n, d }] } for the current market page */
export const MarketCtx = createContext(null);
export const useMarket = () => useContext(MarketCtx);

/** Page copy: marketsPage.pages.<id> */
export function usePageT() {
  const { page } = useMarket();
  return useTranslations(`marketsPage.pages.${page.id}`);
}

export const ICONS = { cpu: Cpu, zap: Zap, chart: ChartLine, pairs: Repeat, globe: Globe, building: Landmark, wheat: Wheat, trend: TrendingUp, shield: ShieldCheck, chat: MessagesSquare, devices: MonitorSmartphone, layers: Layers, server: Server };
export const Icon = ({ name, className }) => {
  const I = ICONS[name] ?? Zap;
  return <I className={className} aria-hidden />;
};

export const LiveDot = ({ className }) => (
  <span className={`relative flex size-2 ${className ?? ''}`} aria-hidden>
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
    <span className="relative inline-flex size-2 rounded-full bg-up" />
  </span>
);

/** Spread in pips for 5/3-decimal FX quotes, otherwise in price points. */
export function spreadOf(r) {
  if (r?.bid == null || r?.ask == null) return '—';
  const diff = r.ask - r.bid;
  return r.d === 5 || r.d === 3 ? (diff * 10 ** (r.d - 1)).toFixed(1) : diff.toFixed(r.d);
}

/** 0–100 position of the bid inside today's low–high, or null */
export const rangePos = (r) => (r?.low != null && r?.high != null && r.high > r.low && r.bid != null ? Math.min(100, Math.max(0, ((r.bid - r.low) / (r.high - r.low)) * 100)) : null);

export const changeTone = (v, dark = false) => (v == null ? (dark ? 'text-white/40' : 'text-ink/40') : v >= 0 ? (dark ? 'text-green-300' : 'text-up') : dark ? 'text-red-300' : 'text-down');

export function useSymbolHref() {
  const { page } = useMarket();
  return (s) => symbolHref(page.slug, s);
}

export function MarketCrumb({ className, tone }) {
  const t = useTranslations('marketsPage');
  const tp = usePageT();
  return <Breadcrumb className={className} tone={tone} items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('detail.markets'), href: '/markets' }, { label: tp('name') }]} />;
}
