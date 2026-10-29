import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getNewsCategories, getNewsPage } from '@/lib/news';
import { newsCategoryHref } from '@/lib/news-path';
import CategoryPage from '../components/CategoryPage';

export const revalidate = 300; // posts come from Strapi

async function load(locale, slug) {
  const categories = await getNewsCategories(locale);
  const category = categories.find((c) => c.slug === slug);
  return category ? { categories, category } : null;
}

export async function generateMetadata({ params }) {
  const { locale, category } = await params;
  const data = await load(locale, category);
  if (!data) return {};
  const t = await getTranslations({ locale, namespace: 'gtcNewsPage.meta' });
  return pageMetadata({ locale, path: newsCategoryHref(category), title: `${data.category.name} | ${t('title')}`, description: t('description') });
}

export default async function Page({ params }) {
  const { locale, category: slug } = await params;
  const data = await load(locale, slug);
  if (!data) notFound();
  setRequestLocale(locale);
  const { articles, total } = await getNewsPage(locale, { category: slug, pageSize: 12 });
  return <CategoryPage category={data.category} categories={data.categories} initial={articles} total={total} />;
}
