import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getNewsCategories, getNewsPage, NEWS_PATH } from '@/lib/news';
import GtcNewsPage from './components/GtcNewsPage';
import { PREVIEW_CATEGORIES, PREVIEW_FEATURED, previewArticles } from '@/data/news.preview';

export const revalidate = 300; // posts come from Strapi

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'gtcNewsPage.meta' });
  return pageMetadata({ locale, path: NEWS_PATH, title: t('title'), description: t('description') });
}

const PER_SECTION = 4;

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const all = await getNewsCategories(locale);
  const categories = all.filter((c) => c.slug !== 'event'); // events have their own section (knowledge hub)
  // newest posts of every category: the hero shows the latest of each, Market Trends a block per category
  const [sections, events] = await Promise.all([
    Promise.all(categories.map(async (c) => ({ slug: c.slug, name: c.name, articles: (await getNewsPage(locale, { category: c.slug, pageSize: PER_SECTION })).articles }))),
    getNewsPage(locale, { category: 'event', pageSize: 1 })
  ]);
  // knowledge hub: latest event, else the newest blog
  const featured = events.articles[0] ?? sections.find((s) => s.slug === 'blogs')?.articles[0] ?? null;

  // review-link build / local dev without CMS access: stand-in posts so the layout can be reviewed
  if ((process.env.STATIC_EXPORT === '1' || process.env.NODE_ENV === 'development') && !categories.length) {
    return <GtcNewsPage sections={PREVIEW_CATEGORIES.map((c) => ({ ...c, articles: previewArticles(c.slug, PER_SECTION) }))} featured={PREVIEW_FEATURED} />;
  }

  return <GtcNewsPage sections={sections.filter((s) => s.articles.length)} featured={featured} />;
}
