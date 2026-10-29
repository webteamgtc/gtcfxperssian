// Review-link build only: scripts/preview-export.sh copies this to src/app/[locale]/gtc-news/sample-article/page.jsx
// for the export and removes it afterwards, so the article layout can be reviewed without Strapi. Never deployed.
import { setRequestLocale } from 'next-intl/server';
import NewsArticlePage from '../components/NewsArticlePage';
import { PREVIEW_ARTICLE, previewArticles } from '@/data/news.preview';

export const metadata = { robots: { index: false } };

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NewsArticlePage article={PREVIEW_ARTICLE} related={previewArticles('blogs', 6).slice(1)} />;
}
