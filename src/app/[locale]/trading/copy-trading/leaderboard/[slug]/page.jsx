import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import LeaderDetailPage from '../components/LeaderDetailPage';

const NS = 'copyTradingPage.detail';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: `${NS}.meta` });
  return pageMetadata({ locale, path: `/trading/copy-trading/leaderboard/${slug}`, title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <LeaderDetailPage slug={slug} />;
}
