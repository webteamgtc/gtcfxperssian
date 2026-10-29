import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getEarningsCalendar } from '@/lib/earnings';
import { NEWS_PATH } from '@/lib/news-path';
import EarningsPage from './components/EarningsPage';

const PATH = `${NEWS_PATH}/earnings-calendar`;

export const revalidate = 300; // a new calendar file is uploaded to Strapi each trading day

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'earningsCalendarPage.meta' });
  return pageMetadata({ locale, path: PATH, title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const calendar = await getEarningsCalendar(locale);
  return <EarningsPage calendar={calendar} />;
}
