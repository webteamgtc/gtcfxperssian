'use client';
/**
 * /knowledge-to-learn/<course>/<section> — lessons (Strapi blogs) of one section.
 * Rhythm: dark hero → white (lesson cards) → navy app promo → navy CTA.
 */
import { useTranslations } from 'next-intl';
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import { LearnShell, LearnHero, LearnAppPromo, LearnCta } from './LearnShell';
import { useReadLessons } from './progress';
import { HUB_PATH, articleHref, courseHref } from '../../courses';

const THUMBS = ['from-brand-600 to-brand-900', 'from-gold-300 to-gold-700', 'from-sky-500 to-brand-700', 'from-emerald-500 to-brand-800', 'from-violet-500 to-brand-900'];

function LessonCard({ href, article, index, done }) {
  const t = useTranslations('knowledgePage.course');
  return (
    <NavLink href={href} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/15">
      <div className={cn('relative grid aspect-[16/9] place-items-center overflow-hidden bg-gradient-to-br', THUMBS[index % THUMBS.length])}>
        {article.image ? (
          <img src={article.image.url} alt={article.image.alt || article.title} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <>
            <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
            <span className="relative grid size-14 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-transform duration-500 group-hover:scale-110">
              <PlayCircle className="size-7" />
            </span>
          </>
        )}
        <span dir="ltr" className="absolute start-4 top-4 rounded-full bg-ink/40 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20 backdrop-blur">
          {String(index + 1).padStart(2, '0')}
        </span>
        {done && (
          <span className="absolute end-4 top-4 grid size-7 place-items-center rounded-full bg-up text-white shadow-lg">
            <CheckCircle2 className="size-4" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-semibold leading-snug text-ink transition-colors group-hover:text-brand">{article.title}</h3>
        {article.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/60">{article.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand">
          {t('readMore')}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </NavLink>
  );
}

export default function SectionPage({ course, ns, section, articles }) {
  const t = useTranslations('knowledgePage.course');
  const tc = useTranslations(`${ns}.courseHeader`);
  const tk = useTranslations('knowledgePage.breadcrumb');
  const read = useReadLessons(course);
  const courseTitle = tc('title').replace(/[[\]]/g, '');

  return (
    <LearnShell>
      <LearnHero
        crumbs={[{ label: tk('home'), href: '/' }, { label: tk('current'), href: HUB_PATH }, { label: courseTitle, href: courseHref(course) }, { label: section.name }]}
        back={{ href: courseHref(course), label: t('backToCourse') }}
        title={section.name}
        subtitle={courseTitle}
      >
        <p className="mt-6 text-sm font-semibold text-gold-200">{t('lessons', { count: articles.length })}</p>
      </LearnHero>

      <section id="lessons" className="relative overflow-hidden bg-white py-14 md:py-20">
        <div className="container-x">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('lessonsTitle')} />
            </h2>
          </Reveal>
          {articles.length ? (
            <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {articles.map((a, i) => (
                <StaggerItem key={a.slug} className="h-full">
                  <LessonCard href={articleHref(course, section.slug, a.slug)} article={a} index={i} done={read.includes(`${section.slug}/${a.slug}`)} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="mt-10 text-center text-ink/50">{t('noArticles')}</p>
          )}
        </div>
      </section>

      <LearnAppPromo />
      <LearnCta />
    </LearnShell>
  );
}
