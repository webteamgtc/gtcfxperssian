import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getEventsPageData } from '@/lib/events';
import EventsPage from './components/EventsPage';

const PATH = '/company/events-and-exhibitions';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'eventsPage.meta' });
  return pageMetadata({ locale, path: PATH, title: t('title'), description: t('description') });
}

/**
 * Events come from Strapi (`future-events` → hero, `comments` → archive; see src/lib/events.js) and are
 * cached for STRAPI_REVALIDATE seconds; without STRAPI_URL the page renders the sample events in src/data.
 */
export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { upcoming, archive } = await getEventsPageData(locale);
  return <EventsPage upcoming={upcoming} archive={archive} />;
}
