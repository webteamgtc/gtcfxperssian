import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getNewsArticle, getNewsPage } from '@/lib/news';
import NewsArticlePage from '../../components/NewsArticlePage';

// Articles come from Strapi: each renders on its first visit, then is cached.
export const dynamicParams = true;
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { locale, category, slug } = await params;
  const a = await getNewsArticle(locale, category, slug);
  if (!a) return {};
  return pageMetadata({ locale, path: a.href, title: a.metaTitle || a.title, description: a.metaDescription || a.excerpt });
}

export default async function Page({ params }) {
  const { locale, category, slug } = await params;
  const article = await getNewsArticle(locale, category, slug);
  if (!article) notFound();
  setRequestLocale(locale);
  const { articles } = await getNewsPage(locale, { category, pageSize: 9 });
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 8);
  return <NewsArticlePage article={article} related={related} />;
}
