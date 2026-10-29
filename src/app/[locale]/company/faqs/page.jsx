import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getFaqGroups } from '@/lib/faqs';
import FaqsPage from './components/FaqsPage';

const PATH = '/company/faqs';

export const revalidate = 300; // FAQs come from Strapi

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faqsPage.meta' });
  return pageMetadata({ locale, path: PATH, title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const groups = await getFaqGroups(locale);
  return <FaqsPage groups={groups} />;
}
