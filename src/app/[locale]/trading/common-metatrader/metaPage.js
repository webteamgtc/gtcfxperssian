/**
 * Shared metadata helper for the MetaTrader / GTC Go routes, from a message namespace.
 */
import { getTranslations } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';

export async function mtMetadata(locale, ns, path) {
  const t = await getTranslations({ locale, namespace: `${ns}.meta` });
  return pageMetadata({ locale, path, title: t('title'), description: t('description') });
}
