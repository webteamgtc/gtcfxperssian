import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getSection, getSectionArticles } from '@/lib/learn';
import SectionPage from '../../components/course/SectionPage';
import { COURSES, sectionHref } from '../../courses';

// Sections come from Strapi: each renders on its first visit, then is cached.
export const dynamicParams = true;
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

async function load(locale, slug, sectionSlug) {
  const course = COURSES[slug];
  if (!course) return null;
  const section = await getSection(locale, slug, sectionSlug);
  return section ? { course, section } : null;
}

export async function generateMetadata({ params }) {
  const { locale, slug, sectionSlug } = await params;
  const data = await load(locale, slug, sectionSlug);
  if (!data) return {};
  const t = await getTranslations({ locale, namespace: `${data.course.ns}.meta` });
  return pageMetadata({ locale, path: sectionHref(slug, sectionSlug), title: `${data.section.name} | ${t('title')}`, description: t('description') });
}

export default async function Page({ params }) {
  const { locale, slug, sectionSlug } = await params;
  const data = await load(locale, slug, sectionSlug);
  if (!data) notFound();
  setRequestLocale(locale);
  const { course, section } = data;
  const articles = await getSectionArticles(locale, section.slug);
  return <SectionPage course={slug} ns={course.ns} section={section} articles={articles} />;
}
