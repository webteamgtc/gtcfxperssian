import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import LiveAccountApplicationPage from './components/LiveAccountApplicationPage';

const PATH = '/live-account-application';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'liveAccountApplicationPage.meta' });
  return pageMetadata({ locale, path: PATH, title: t('title'), description: t('description') });
}

export default async function Page({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [{ account }, t] = await Promise.all([searchParams, getTranslations({ locale, namespace: 'liveAccountApplicationPage' })]);
  // ?account=<slug> picks the hero copy; unknown or missing slugs use the standard account
  const requested = account === 'standard' ? 'standard-account' : account;
  const accountKey = requested && t.has(`accounts.${requested}.title`) ? requested : 'standard-account';
  return <LiveAccountApplicationPage accountKey={accountKey} showAccount={accountKey !== 'standard-account'} />;
}
