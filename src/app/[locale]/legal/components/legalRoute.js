/**
 * Server side of every /legal/<slug> policy page: metadata, breadcrumb JSON-LD and the S3 document.
 * Each page.jsx is just:
 *   const route = legalRoute('privacy-policy');
 *   export const generateMetadata = route.generateMetadata;
 *   export default route.Page;
 */
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getLegalDocument } from '@/lib/legalDocuments';
import LegalDocumentPage from './LegalDocumentPage';

export function legalRoute(slug) {
  const path = `/legal/${slug}`;

  async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: `legalPage.docs.${slug}` });
    return pageMetadata({ locale, path, title: t('title'), description: t('description') });
  }

  async function Page({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const [t, doc] = await Promise.all([getTranslations({ locale, namespace: 'legalPage' }), getLegalDocument(slug, locale)]);
    return <LegalDocumentPage slug={slug} doc={doc} />;
  }

  return { generateMetadata, Page };
}
