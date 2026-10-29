'use client';
/**
 * /gtc-news/<category>/<slug> — one news article from Strapi.
 * Dark hero (category, title, author, date, reading time) beside a framed cover → body (GTC lesson blocks + quick
 * guide, or cleaned HTML `.learn-article`) in a centered column → related carousel
 * → navy swap-free band.
 */
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { CalendarDays, Clock } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import NewsCarousel from '@/components/shared/news/NewsCarousel';
import { Block, HeroPills, MobileQuickGuide, ShareRow, useActiveId } from '@/components/shared/lesson/LessonParts';
import { Reveal, ScrollProgress, TiltCard, EASE } from '@/components/motion';
import { NEWS_PATH, newsCategoryHref } from '@/lib/news-path';
import { cn } from '@/lib/utils';
import { iconFor } from './newsUi';
import ActivationBand from './ActivationBand';

/** ~200 words a minute, from the article HTML. */
function readMinutes(html) {
  const words = String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return words ? Math.max(1, Math.round(words / 200)) : 0;
}

function MetaLine({ article, minutes, t, dark, center }) {
  const muted = dark ? 'text-white/60' : 'text-ink/55';
  return (
    <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-sm', muted, center && 'justify-center')}>
      {article.author && (
        <span className="inline-flex items-center gap-2.5">
          <span className={cn('grid size-9 place-items-center rounded-full text-sm font-bold', dark ? 'bg-gold text-white' : 'bg-brand text-white')} aria-hidden>
            {article.author.trim().charAt(0).toUpperCase()}
          </span>
          <span className={cn('font-semibold', dark ? 'text-white' : 'text-ink')}>{t('article.by', { author: article.author })}</span>
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-4 text-gold" aria-hidden />
        <time dateTime={article.publishedAt}>{article.dateLabel}</time>
      </span>
      {minutes > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-gold" aria-hidden />
          {t('article.readTime', { minutes })}
        </span>
      )}
    </div>
  );
}

function CategoryChip({ article, href, dark }) {
  const Icon = iconFor(article.categorySlug);
  return (
    <NavLink
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors',
        dark ? 'bg-white/10 text-gold-200 ring-1 ring-white/20 hover:bg-white/15' : 'text-gold-700 ring-1 ring-gold/40 hover:bg-gold/10'
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {article.category}
    </NavLink>
  );
}

/** Article body: lesson blocks or the cleaned Strapi HTML. */
function Body({ article, className }) {
  const lesson = article.lesson;
  let n = 0;
  return lesson ? (
    <div className={cn('space-y-14 md:space-y-16', className)}>
      {lesson.blocks.map((b, k) => (
        <Block key={`${b.type}-${b.id || k}`} block={b} index={b.type === 'section' || b.type === 'faq' ? ++n : n} />
      ))}
    </div>
  ) : (
    // amount={0}: long designed posts are taller than the viewport, so a % threshold would keep them hidden
    <Reveal y={16} amount={0} className={className}>
      <div className="learn-article news-article-body" dangerouslySetInnerHTML={{ __html: article.html }} />
    </Reveal>
  );
}

/** Strapi titles are plain text: only accent words the editor put in [brackets]. */
const ArticleTitle = ({ text }) => (/\[[^\]]+\]/.test(text) ? <AccentTitle text={text} /> : text);

const hasCover = (a) => a.cover?.url && !/<img\b/i.test(a.html ?? '');

function CoverFrame({ cover, title }) {
  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-white/[0.06] shadow-2xl shadow-black/40 ring-1 ring-white/10">
      <img
        src={cover.url}
        alt={cover.alt || title}
        width={cover.width ?? undefined}
        height={cover.height ?? undefined}
        decoding="async"
        className="max-h-[min(26rem,52vh)] w-full object-contain object-center"
      />
    </div>
  );
}

function Split({ article, related, t, crumbs, catHref, minutes, title, toc, active, bodyRef }) {
  return (
    <>
      <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
        <HeroBackdrop />
        <div className="container-x relative flex justify-center">
          <div className="w-full max-w-5xl text-center">
            <Breadcrumb className="justify-center" items={crumbs} />
            <div className="mt-10 flex flex-col items-center">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <CategoryChip article={article} href={catHref} dark />
              </motion.div>
              <motion.h1 className="heading-page mt-6 max-w-4xl text-balance" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
                <ArticleTitle text={title} />
              </motion.h1>
              {(article.excerpt || article.lesson?.hero?.description) && (
                <p className="mx-auto mt-5 max-w-2xl line-clamp-3 text-pretty text-base leading-relaxed text-white/65 md:text-lg">
                  {article.excerpt || article.lesson?.hero?.description}
                </p>
              )}
              {article.lesson?.hero && (
                <div className="mt-5 w-full [&_ul]:mt-0 [&_ul]:justify-center [&_ul]:lg:justify-center">
                  <HeroPills pills={article.lesson.hero.pills} />
                </div>
              )}
              <div className="mt-8 w-full max-w-xl border-t border-white/10 pt-6">
                <MetaLine article={article} minutes={minutes} t={t} dark center />
              </div>
              {hasCover(article) && (
                <motion.div className="mt-10 w-full max-w-2xl p-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}>
                  <TiltCard max={4} glare={false} className="relative">
                    <span className="pointer-events-none absolute -inset-3 rounded-[2.25rem] border border-gold/40" aria-hidden />
                    <span className="pointer-events-none absolute -end-5 -top-5 size-24 rounded-full bg-gold/40 blur-2xl" aria-hidden />
                    <CoverFrame cover={article.cover} title={article.title} />
                  </TiltCard>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white py-12 md:py-16">
        <div className="container-x flex justify-center">
          <div ref={bodyRef} className="w-full min-w-0 max-w-5xl">
            {toc && <MobileQuickGuide toc={toc} active={active} />}
            <Body article={article} />
            <ShareRow title={article.title} ns="gtcNewsPage.article" />
          </div>
        </div>
      </section>

      <NewsCarousel
        articles={related}
        title={t('article.related', { category: article.category || t('breadcrumb.current') })}
        description=""
        viewAllHref={catHref}
        viewAllLabel={t('article.allNews')}
        prevLabel={t('article.prev')}
        nextLabel={t('article.next')}
      />
    </>
  );
}

export default function NewsArticlePage({ article, related }) {
  const t = useTranslations('gtcNewsPage');
  const toc = article.lesson?.toc;
  const bodyRef = useRef(null);
  const active = useActiveId(toc?.items.map((it) => it.id) ?? []);
  const catHref = newsCategoryHref(article.categorySlug);
  const crumbs = [{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.current'), href: NEWS_PATH }, ...(article.category ? [{ label: article.category, href: catHref }] : []), { label: article.title }];

  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <Split
          article={article}
          related={related}
          t={t}
          crumbs={crumbs}
          catHref={catHref}
          minutes={readMinutes(article.html)}
          title={article.lesson?.hero?.title || article.title}
          toc={toc}
          active={active}
          bodyRef={bodyRef}
        />
        <ActivationBand />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
