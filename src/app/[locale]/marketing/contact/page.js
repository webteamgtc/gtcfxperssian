import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAT5_LOCALES } from '@/config/regions';
import { ContactPage } from '../components/Cat5Pages';

/** UAE CAT 5 website page (see ../page.js and src/proxy.js for how UAE visitors reach it). Hidden from search engines. */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketingPage.contactPage.meta' });
  return { title: t('title'), description: t('description'), robots: { index: false, follow: false } };
}

export default async function Page({ params }) {
  const { locale } = await params;
  if (!CAT5_LOCALES.includes(locale)) notFound();
  setRequestLocale(locale);
  return <ContactPage />;
}
