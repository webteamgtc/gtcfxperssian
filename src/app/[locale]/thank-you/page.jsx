import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import ThankYouPage from './components/ThankYouPage';

const PATH = '/thank-you';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'thankYouPage.meta' });
  return { ...pageMetadata({ locale, path: PATH, title: t('title'), description: t('description') }), robots: { index: false, follow: false } };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // ThankYouPage reads ?message=true (show the "check your email" notice), which needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <ThankYouPage />
    </Suspense>
  );
}
