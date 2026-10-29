import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { getCourseSections, getSectionArticles } from '@/lib/learn';
import CoursePage from '../components/CoursePage';
import { COURSES, courseHref } from '../courses';

export const dynamicParams = false;
export const revalidate = 300; // sections + lesson counts come from Strapi

export function generateStaticParams() {
  return Object.keys(COURSES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const course = COURSES[slug];
  if (!course) return {};
  const t = await getTranslations({ locale, namespace: `${course.ns}.meta` });
  return pageMetadata({ locale, path: courseHref(slug), title: t('title'), description: t('description') });
}

export default async function Page({ params }) {
  const { locale, slug } = await params;
  const course = COURSES[slug];
  if (!course) notFound();
  setRequestLocale(locale);
  const sections = await getCourseSections(locale, slug);
  // lesson titles of every section (curriculum accordion); slim payload: slug + title only
  const lessons = await Promise.all(sections.map((s) => getSectionArticles(locale, s.slug)));
  const curriculum = sections.map((s, i) => ({ ...s, lessons: lessons[i].length || s.lessons, items: lessons[i].map(({ slug, title }) => ({ slug, title })) }));
  return <CoursePage course={slug} ns={course.ns} sections={curriculum} />;
}
