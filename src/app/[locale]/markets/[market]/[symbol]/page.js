import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { MARKET_PAGES, marketPageBySlug, symbolHref, PREBUILT_SYMBOLS } from '@/config/marketPages';
import { getMarketSymbols } from '@/lib/marketSymbols';
import { getSymbolSpec } from '@/lib/symbolSpec';
import SymbolPage from './components/SymbolPage';

// Menu symbols are built ahead of time; any other symbol of the market renders on its first visit, then is cached.
// (The review-link export switches this to false: static exports can't render on demand.)
export const dynamicParams = true;
export const revalidate = 3600; // re-check the contract details hourly; prices stream live in the browser

// (the market param comes from the sibling page.js, not a layout, so both params are listed here)
export function generateStaticParams() {
  return MARKET_PAGES.flatMap((p) => (PREBUILT_SYMBOLS[p.id] ?? []).map((s) => ({ market: p.slug, symbol: s.toLowerCase() })));
}

async function load(market, symbol) {
  const page = marketPageBySlug(market);
  if (!page) return null;
  const symbols = await getMarketSymbols(page);
  const sym = symbols.find((x) => x.s.toLowerCase() === String(symbol).toLowerCase());
  return sym ? { page, symbols, sym } : null;
}

export async function generateMetadata({ params }) {
  const { locale, market, symbol } = await params;
  const data = await load(market, symbol);
  if (!data) return {};
  const t = await getTranslations({ locale, namespace: 'marketsPage' });
  const v = { symbol: data.sym.s, name: data.sym.n, market: t(`pages.${data.page.id}.name`) };
  return pageMetadata({ locale, path: symbolHref(data.page.slug, data.sym.s), title: t('symbol.meta.title', v), description: t('symbol.meta.description', v) });
}

export default async function Page({ params }) {
  const { locale, market, symbol } = await params;
  const data = await load(market, symbol);
  if (!data) notFound();
  setRequestLocale(locale);
  const { page, symbols, sym } = data;
  const spec = await getSymbolSpec(sym.s);
  return <SymbolPage page={{ slug: page.slug, id: page.id, template: page.template }} symbols={symbols} sym={sym} spec={spec} />;
}
