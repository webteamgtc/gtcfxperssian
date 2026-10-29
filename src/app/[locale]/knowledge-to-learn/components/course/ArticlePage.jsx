'use client';
/**
 * /knowledge-to-learn/<course>/<section>/<article> — one lesson.
 * The Strapi lesson template is parsed server side (src/lib/learnArticle.js) and rendered here in the theme:
 *   dark hero (badge, eyebrow, title, pills + lesson list card)
 *   → white: numbered sections / summary / FAQ / risk warning, sticky "quick guide" with scroll-spy + reading progress
 *   → share, previous / next lesson → navy app promo → navy CTA.
 * Opening a lesson marks it as read (course progress). Bodies that don't follow the template render as cleaned HTML.
 */
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { Block, HeroKicker, HeroPills, MobileQuickGuide, QuickGuide, ShareRow, useActiveId } from '@/components/shared/lesson/LessonParts';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { LearnShell, LearnHero, LearnAppPromo, LearnCta } from './LearnShell';
import { useMarkRead, useReadLessons } from './progress';
import { HUB_PATH, articleHref, courseHref, sectionHref } from '../../courses';

/* ------------------------------------------------------------ hero */

/** Hero aside: the lessons of this section (current highlighted, read ones ticked). */
function LessonsCard({ course, section, articles, current, read }) {
  const t = useTranslations('knowledgePage.course');
  if (articles.length < 2) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }} className="mx-auto w-full max-w-md rounded-[2rem] bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-2">
        <NavLink href={sectionHref(course, section.slug)} className="text-sm font-semibold text-white transition-colors hover:text-gold-200">
          {section.name}
        </NavLink>
        <span className="shrink-0 text-xs text-white/50">{t('lessons', { count: articles.length })}</span>
      </div>
      <ol className="mt-4 space-y-1">
        {articles.map((a, i) => {
          const on = a.slug === current;
          const done = read.includes(`${section.slug}/${a.slug}`);
          return (
            <li key={a.slug}>
              <NavLink
                href={articleHref(course, section.slug, a.slug)}
                aria-current={on ? 'page' : undefined}
                className={cn('flex items-start gap-3 rounded-xl px-3 py-2.5 text-start text-sm leading-snug transition-colors', on ? 'bg-white text-brand-900' : 'text-white/65 hover:bg-white/[0.07] hover:text-white')}
              >
                {done && !on ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-200" />
                ) : (
                  <span dir="ltr" className={cn('mt-0.5 w-4 shrink-0 text-xs font-bold tabular-nums', on ? 'text-gold' : 'text-white/35')}>
                    {i + 1}
                  </span>
                )}
                <span className="line-clamp-2">{a.title}</span>
              </NavLink>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}

/* ------------------------------------------------------------ prev / next */

function PrevNext({ course, section, prev, next }) {
  const t = useTranslations('knowledgePage.course');
  const card = 'group flex flex-1 flex-col gap-1 rounded-2xl p-5 ring-1 ring-brand/10 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10 hover:ring-brand/25';
  return (
    <nav className="mt-6 flex flex-col gap-4 sm:flex-row">
      {prev ? (
        <NavLink href={articleHref(course, section.slug, prev.slug)} className={card}>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" /> {t('previous')}
          </span>
          <span className="font-semibold text-ink group-hover:text-brand">{prev.title}</span>
        </NavLink>
      ) : (
        <NavLink href={sectionHref(course, section.slug)} className={card}>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" /> {t('backToSection')}
          </span>
          <span className="font-semibold text-ink group-hover:text-brand">{section.name}</span>
        </NavLink>
      )}
      {next && (
        <NavLink href={articleHref(course, section.slug, next.slug)} className={cn(card, 'bg-brand text-end ring-brand hover:ring-brand')}>
          <span className="inline-flex items-center justify-end gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            {t('next')} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
          </span>
          <span className="font-semibold text-white">{next.title}</span>
        </NavLink>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------ page */

export default function ArticlePage({ course, ns, section, article, articles }) {
  const t = useTranslations('knowledgePage.course');
  const tc = useTranslations(`${ns}.courseHeader`);
  const tk = useTranslations('knowledgePage.breadcrumb');
  useMarkRead(course, section.slug, article.slug);
  const read = useReadLessons(course);
  const courseTitle = tc('title').replace(/[[\]]/g, '');
  const i = articles.findIndex((a) => a.slug === article.slug);
  const lesson = article.lesson;
  const hero = lesson?.hero;
  const toc = lesson?.toc;

  const bodyRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: bodyRef, offset: ['start 30%', 'end 70%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const active = useActiveId(toc?.items.map((it) => it.id) ?? []);
  let n = 0;

  return (
    <LearnShell>
      <LearnHero
        crumbs={[
          { label: tk('home'), href: '/' },
          { label: tk('current'), href: HUB_PATH },
          { label: courseTitle, href: courseHref(course) },
          { label: section.name, href: sectionHref(course, section.slug) },
          { label: article.title }
        ]}
        back={{ href: sectionHref(course, section.slug), label: t('backToSection') }}
        kicker={<HeroKicker hero={hero} />}
        title={hero?.title || article.title}
        subtitle={hero?.description || article.excerpt}
        aside={<LessonsCard course={course} section={section} articles={articles} current={article.slug} read={read} />}
      >
        <HeroPills pills={hero?.pills} lessonLabel={i >= 0 ? t('lessonOf', { n: i + 1, total: articles.length }) : null} />
      </LearnHero>

      <section className="relative bg-white py-14 md:py-20">
        <div className={cn('container-x grid gap-12 lg:gap-16', toc && 'lg:grid-cols-[minmax(0,1fr)_300px]')}>
          <div ref={bodyRef} className={cn('min-w-0', !toc && 'mx-auto w-full max-w-3xl')}>
            {toc && <MobileQuickGuide toc={toc} active={active} />}
            {article.image && (
              <img src={article.image.url} alt={article.image.alt || article.title} className="mb-12 aspect-[16/9] w-full rounded-[1.75rem] object-cover ring-1 ring-brand/10" />
            )}
            {lesson ? (
              <div className="space-y-14 md:space-y-16">
                {lesson.blocks.map((b, k) => (
                  <Block key={`${b.type}-${b.id || k}`} block={b} index={b.type === 'section' || b.type === 'faq' ? ++n : n} />
                ))}
              </div>
            ) : (
              // amount={0}: long articles are taller than the viewport, so a % threshold would keep them hidden
              <Reveal y={16} amount={0}>
                <div className="learn-article" dangerouslySetInnerHTML={{ __html: article.html }} />
              </Reveal>
            )}
            <ShareRow title={article.title} />
            <PrevNext course={course} section={section} prev={articles[i - 1]} next={i >= 0 ? articles[i + 1] : null} />
          </div>

          {toc && (
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <QuickGuide toc={toc} active={active} progress={progress} />
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* <LearnAppPromo /> */}
      <LearnCta />
    </LearnShell>
  );
}
