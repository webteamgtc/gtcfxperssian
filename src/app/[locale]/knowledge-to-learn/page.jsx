import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import KnowledgePage from './components/KnowledgePage';
import { HUB_PATH } from './courses';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'knowledgePage.meta' });
  return pageMetadata({ locale, path: HUB_PATH, title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <KnowledgePage />;
}
