import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import ClientMessages from '@/i18n/ClientMessages';
import HomePage from './components/HomePage';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, path: '', title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      {/* the homepage's texts only (see src/i18n/ClientMessages.jsx) */}
      <ClientMessages files={['homepage']}>
        <HomePage />
      </ClientMessages>
    </>
  );
}
