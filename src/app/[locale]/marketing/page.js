import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAT5_LOCALES } from '@/config/regions';
import MarketingPage from './components/MarketingPage';

/**
 * UAE CAT 5 website, Home: GTC Financial Consultancy L.L.C. (CMA Category 5), in English (en-ae) and Farsi (fa).
 * Pages: this one, about/, faq/, contact/. With NEXT_PUBLIC_UAE_CAT5_SITE=on, UAE visitors see them at
 * /en-ae, /en-ae/about-us, /en-ae/faqs, /en-ae/contact-us (and /fa/…) — src/proxy.js rewrites those addresses here.
 * Hidden from search engines. Copy: messages/<lang>/marketingPage.json
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketingPage.meta' });
  return { title: t('title'), description: t('description'), robots: { index: false, follow: false } };
}

export default async function Page({ params }) {
  const { locale } = await params;
  if (!CAT5_LOCALES.includes(locale)) notFound();
  setRequestLocale(locale);
  return <MarketingPage />;
}
