import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getArticle, getSection, getSectionArticles } from '@/lib/learn';
import ArticlePage from '../../../components/course/ArticlePage';
import { COURSES, articleHref } from '../../../courses';

// Articles come from Strapi: each renders on its first visit, then is cached.
export const dynamicParams = true;
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

async function load(locale, slug, sectionSlug, articleSlug) {
  const course = COURSES[slug];
  if (!course) return null;
  const [section, article] = await Promise.all([getSection(locale, slug, sectionSlug), getArticle(locale, sectionSlug, articleSlug)]);
  return section && article ? { course, section, article } : null;
}

export async function generateMetadata({ params }) {
  const { locale, slug, sectionSlug, articleSlug } = await params;
  const data = await load(locale, slug, sectionSlug, articleSlug);
  if (!data) return {};
  const { article } = data;
  return pageMetadata({
    locale,
    path: articleHref(slug, sectionSlug, article.slug),
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt
  });
}

export default async function Page({ params }) {
  const { locale, slug, sectionSlug, articleSlug } = await params;
  const data = await load(locale, slug, sectionSlug, articleSlug);
  if (!data) notFound();
  setRequestLocale(locale);
  const { course, section, article } = data;
  const articles = await getSectionArticles(locale, section.slug);
  return <ArticlePage course={slug} ns={course.ns} section={section} article={article} articles={articles} />;
}
