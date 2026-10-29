import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { MARKET_PAGES, marketPageBySlug } from '@/config/marketPages';
import { getMarketSymbols } from '@/lib/marketSymbols';
import MarketPage from './components/MarketPage';

export const dynamicParams = false;
export const revalidate = 3600; // re-check the symbol list hourly

export function generateStaticParams() {
  return MARKET_PAGES.map((p) => ({ market: p.slug }));
}

export async function generateMetadata({ params }) {
  const { locale, market } = await params;
  const page = marketPageBySlug(market);
  if (!page) return {};
  const t = await getTranslations({ locale, namespace: `marketsPage.pages.${page.id}.meta` });
  return pageMetadata({ locale, path: `/markets/${page.slug}`, title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale, market } = await params;
  const page = marketPageBySlug(market);
  if (!page) notFound();
  setRequestLocale(locale);
  const symbols = await getMarketSymbols(page);
  return <MarketPage page={{ slug: page.slug, id: page.id, template: page.template }} symbols={symbols} />;
}
