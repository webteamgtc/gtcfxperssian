import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getMarketHolidays } from '@/lib/marketHolidays';
import { NEWS_PATH } from '@/lib/news-path';
import MarketHolidaysPage from './components/MarketHolidaysPage';

const PATH = `${NEWS_PATH}/market-holidays`;

export const revalidate = 300; // a new holiday schedule is uploaded to Strapi each month

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketHolidaysPage.meta' });
  return pageMetadata({ locale, path: PATH, title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const holidays = await getMarketHolidays(locale);
  return <MarketHolidaysPage holidays={holidays} today={new Date().toISOString().slice(0, 10)} />;
}
