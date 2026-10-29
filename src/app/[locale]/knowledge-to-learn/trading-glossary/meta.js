/** Shared metadata for the glossary routes (structured data: app/[locale]/@schema/routes.js). */
import { getTranslations } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';

const PATH = '/knowledge-to-learn/trading-glossary';

export async function glossaryMetadata(locale, letter) {
  const t = await getTranslations({ locale, namespace: 'glossaryPage.meta' });
  return pageMetadata({ locale, path: letter ? `${PATH}/${letter.toLowerCase()}` : PATH, title: letter ? `${letter} · ${t('title')}` : t('title'), description: t('description') });
}
