'use client';
/** Shared bits for the symbol pages (/markets/<market>/<symbol>). */
import { createContext, useContext, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Breadcrumb from '@/components/shared/Breadcrumb';
import NavLink from '@/components/shared/nav/NavLink';
import { fmt } from '@/components/shared/ticker';
import { symbolHref } from '@/config/marketPages';
import { cn } from '@/lib/utils';
import { spreadOf } from '../../components/shared';

/** { page, symbols, sym: { s, n, d }, spec, row (live quote) } */
export const SymbolCtx = createContext(null);
export const useSymbol = () => useContext(SymbolCtx);

/** marketsPage.symbol */
export const useSymT = () => useTranslations('marketsPage.symbol');

/** Values shown for this symbol, formatted. Unknown values are "—". */
export function useFigures() {
  const { sym, spec, row, page } = useSymbol();
  const t = useSymT();
  const locale = useLocale();
  const d = spec.digits ?? sym.d;
  const fx = d === 5 || d === 3;
  const change = row.change;
  const changeAbs = row.bid != null && change != null ? row.bid - row.bid / (1 + change / 100) : null;
  const base = spec.baseCurrency ?? (page.id === 'forex' ? sym.s.slice(0, 3) : '');
  const weekday = spec.tripleSwapDay != null ? new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(Date.UTC(2024, 0, 7 + spec.tripleSwapDay)) : null;
  const dash = '—';
  return {
    d,
    spread: row.bid != null ? `${spreadOf({ ...row, d })} ${fx ? t('pips') : t('points')}` : dash,
    changeAbs,
    swapLong: spec.swapLong,
    swapShort: spec.swapShort,
    specs: [
      ['contractSize', spec.contractSize != null ? `${spec.contractSize.toLocaleString('en-US')}${base ? ` ${base}` : ''}` : dash],
      ['minLot', spec.minLot != null ? String(spec.minLot) : dash],
      ['tickSize', spec.tickSize != null ? spec.tickSize.toFixed(Math.max(0, d)) : dash],
      ['valuePerPip', spec.valuePerPip != null ? `${spec.valuePerPip.toFixed(2)}${spec.profitCurrency ? ` ${spec.profitCurrency}` : ''}` : dash],
      ['leverage', spec.leverage != null ? `1:${spec.leverage.toLocaleString('en-US')}` : dash],
      ['marginRate', spec.marginRate != null ? `${(spec.marginRate * 100).toFixed(2)}%` : dash],
      ['tripleSwap', weekday ?? dash],
      ['hours', t(`hours.${page.id}`)]
    ]
  };
}

/** Swap value with sign and colour. */
export function Swap({ value, className }) {
  if (value == null) return <span className={className}>—</span>;
  return (
    <span dir="ltr" className={cn('tabular-nums', value >= 0 ? 'text-up' : 'text-down', className)}>
      {value > 0 ? '+' : ''}
      {fmt(value, 2)}
    </span>
  );
}

/** Home › Markets › <Market> › <SYMBOL> */
export function SymbolCrumb({ tone = 'light', className }) {
  const { page, sym } = useSymbol();
  const t = useTranslations('marketsPage');
  return (
    <Breadcrumb
      tone={tone}
      className={className}
      items={[
        { label: t('breadcrumb.home'), href: '/' },
        { label: t('detail.markets'), href: '/markets' },
        { label: t(`pages.${page.id}.name`), href: `/markets/${page.slug}` },
        { label: sym.s }
      ]}
    />
  );
}

/** Other symbols of the same market — internal links for visitors and search engines. */
export function RelatedSymbols({ className, dark = false, limit = 12 }) {
  const { page, symbols, sym } = useSymbol();
  const t = useSymT();
  const tp = useTranslations(`marketsPage.pages.${page.id}`);
  const list = useMemo(() => symbols.filter((x) => x.s !== sym.s).slice(0, limit), [symbols, sym.s, limit]);
  if (!list.length) return null;
  return (
    <nav aria-label={t('related', { market: tp('name') })} className={className}>
      <p className={cn('text-sm font-semibold', dark ? 'text-white/70' : 'text-ink/60')}>{t('related', { market: tp('name') })}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {list.map((x) => (
          <li key={x.s}>
            <NavLink href={symbolHref(page.slug, x.s)} prefetch={false} title={x.n} className={cn('inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors', dark ? 'bg-white/[0.06] text-white/80 ring-1 ring-white/10 hover:bg-white hover:text-brand-900' : 'bg-white text-brand ring-1 ring-brand/10 hover:bg-brand hover:text-white')}>
              {x.s}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** "About EURUSD" paragraph + the market's three chips */
export function useAbout() {
  const { page, sym } = useSymbol();
  const t = useSymT();
  const tp = useTranslations(`marketsPage.pages.${page.id}`);
  return { title: t('about.title', { symbol: sym.s }), text: t('about.text', { symbol: sym.s, name: sym.n, market: tp('name') }), chips: t.raw(`about.chips.${page.id}`) };
}
