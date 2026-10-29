'use client';
/**
 * /gtc-news/<category> — every post of one Strapi news category, newest first, "Load more" pages through /api/news.
 * Category links (no post counts) switch to the other categories.
 * DRAFTS (temporary, see shared/Draft.jsx):
 *  A · Editorial index — light hero with the category emblem and an ornament, a lead story, then a two-column
 *      index of posts (picture, date, title, summary) separated by fine lines.
 *  B · Dark showcase — dark hero with the two newest posts as glass cards beside the title, then a card grid.
 *  C · Cover + sidebar — the newest post's picture behind the hero with its title, then a sticky category list
 *      beside a two-column card grid.
 */
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, CalendarDays, Loader2, Plus } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import NavLink from '@/components/shared/nav/NavLink';
import NewsCard, { NewsCover, NewsMeta } from '@/components/shared/news/NewsCard';
import { DraftBar, useDraft } from '@/components/shared/Draft';
import { ScrollProgress, Reveal, EASE } from '@/components/motion';
import { NEWS_PATH, newsCategoryHref } from '@/lib/news-path';
import { previewArticles } from '@/data/news.preview';
import { cn } from '@/lib/utils';
import { iconFor } from './newsUi';
import ActivationBand from './ActivationBand';

const PAGE_SIZE = 12;
const LABELS = { a: 'A · Editorial index', b: 'B · Dark showcase', c: 'C · Cover + sidebar' };
const PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const inView = (i = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.5, ease: EASE, delay: (i % 3) * 0.08 } });

function When({ a, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-ink/50', className)}>
      <CalendarDays className="size-3.5" aria-hidden />
      <time dateTime={a.publishedAt}>{a.dateLabel}</time>
    </span>
  );
}

function PostTitle({ a, className, as: H = 'h3' }) {
  return (
    <H className={cn(/heading-/.test(className ?? '') ? '' : 'heading-small', className)}>
      <NavLink href={a.href} className="after:absolute after:inset-0">
        {a.title}
      </NavLink>
    </H>
  );
}

/** Category links: 'underline' (light page), 'pills' (dark hero), 'list' (sidebar). */
function CategoryLinks({ categories, current, style }) {
  if (style === 'list') {
    return (
      <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
        {categories.map((c) => {
          const on = c.slug === current;
          const Icon = iconFor(c.slug);
          return (
            <NavLink
              key={c.slug}
              href={newsCategoryHref(c.slug)}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'group flex shrink-0 items-center gap-3 rounded-2xl p-2 pe-4 text-sm font-semibold transition-colors',
                on ? 'bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-xl shadow-brand/25' : 'bg-white text-ink/70 ring-1 ring-brand/10 hover:text-brand'
              )}
            >
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', on ? 'bg-white/10 text-gold-200' : 'bg-brand-50 text-brand')}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex-1 whitespace-nowrap">{c.name}</span>
              <ArrowRight className={cn('hidden size-4 transition-opacity lg:block rtl:-scale-x-100', on ? 'text-gold-200' : 'opacity-0 group-hover:opacity-100')} aria-hidden />
            </NavLink>
          );
        })}
      </nav>
    );
  }
  const dark = style === 'pills';
  return (
    <nav className={cn('no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0', dark ? 'lg:flex-wrap' : 'gap-7 border-b border-brand/10 lg:justify-center')}>
      {categories.map((c) => {
        const on = c.slug === current;
        return dark ? (
          <NavLink
            key={c.slug}
            href={newsCategoryHref(c.slug)}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold ring-1 transition-colors',
              on ? 'bg-gold text-white ring-gold' : 'bg-white/[0.06] text-white/75 ring-white/15 hover:bg-white/[0.12] hover:text-white'
            )}
          >
            {c.name}
          </NavLink>
        ) : (
          <NavLink
            key={c.slug}
            href={newsCategoryHref(c.slug)}
            aria-current={on ? 'page' : undefined}
            className={cn('relative shrink-0 whitespace-nowrap pb-4 text-[15px] font-semibold transition-colors', on ? 'text-brand' : 'text-ink/50 hover:text-ink')}
          >
            {c.name}
            {on && <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-gradient-to-r from-brand to-gold" />}
          </NavLink>
        );
      })}
    </nav>
  );
}

function LoadMore({ more, loading, onClick, label, tone = 'solid' }) {
  if (!more) return null;
  return (
    <div className="mt-12 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={cn(
          'group inline-flex h-13 items-center gap-2.5 rounded-full ps-7 pe-2 text-base font-semibold transition-colors disabled:opacity-70',
          tone === 'outline' ? 'text-brand ring-2 ring-brand/20 hover:ring-brand' : 'bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-700'
        )}
      >
        {label}
        <span className={cn('grid size-9 place-items-center rounded-full', tone === 'outline' ? 'bg-brand text-white' : 'bg-white text-brand')}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />}
        </span>
      </button>
    </div>
  );
}

function Empty({ t }) {
  return <p className="rounded-[1.75rem] bg-[#f6f7fb] py-16 text-center text-ink/50">{t('trends.emptyState')}</p>;
}

/* ------------------------------------------------------------ A · Editorial index */

function Editorial({ category, categories, articles, t, crumbs, loadMore }) {
  const [lead, ...rest] = articles;
  const Icon = iconFor(category.slug);
  return (
    <>
      <section className="relative overflow-hidden bg-white pb-10 pt-36 md:pt-44">
        <div className="bg-grid-light mask-radial absolute inset-0 opacity-50" aria-hidden />
        <div className="container-x relative">
          <Breadcrumb tone="light" className="justify-center" items={crumbs} />
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <motion.span
              className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-gold-200 shadow-xl shadow-brand/30 ring-4 ring-gold/20"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              aria-hidden
            >
              <Icon className="size-7" />
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
              {category.name}
            </motion.h1>
            <div className="mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/60 rtl:bg-gradient-to-l" />
              <span className="size-2 rotate-45 bg-gold" />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/60 rtl:bg-gradient-to-r" />
            </div>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink/60">{t('category.description', { category: category.name })}</p>
          </div>
          <div className="mt-12">
            <CategoryLinks categories={categories} current={category.slug} style="underline" />
          </div>
        </div>
      </section>

      <section className="relative bg-white pb-16 md:pb-20">
        <div className="container-x">
          {lead ? (
            <>
              <Reveal y={24}>
                <article className="group relative grid items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
                  <div className="aspect-[16/10] overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(41,59,147,0.45)]">
                    <NewsCover article={lead} showTitle={false} />
                  </div>
                  <div>
                    <span className="heading-label">{t('hero.latest')}</span>
                    <PostTitle a={lead} as="h2" className="heading-card mt-3 text-balance text-xl md:text-[1.35rem] transition-colors group-hover:text-brand" />
                    <div className="mt-4">
                      <NewsMeta article={lead} showCategory={false} />
                    </div>
                    {lead.excerpt && <p className="mt-4 line-clamp-4 text-pretty text-[15px] leading-relaxed text-ink/60">{lead.excerpt}</p>}
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                      {t('trends.readMore')}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden />
                    </span>
                  </div>
                </article>
              </Reveal>
              {rest.length > 0 && (
                <div className="mt-14 grid border-t border-brand/10 md:grid-cols-2 md:gap-x-12">
                  {rest.map((a, i) => (
                    <motion.article key={a.id} {...inView(i)} className="group relative flex gap-5 border-b border-brand/10 py-6">
                      <div className="aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-2xl md:w-36">
                        <NewsCover article={a} showTitle={false} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <When a={a} />
                        <PostTitle a={a} className="mt-2 line-clamp-2 font-semibold transition-colors group-hover:text-brand" />
                        {a.excerpt && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/55">{a.excerpt}</p>}
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
              <LoadMore {...loadMore} label={t('category.loadMore')} tone="outline" />
            </>
          ) : (
            <Empty t={t} />
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ B · Dark showcase */

function Showcase({ category, categories, articles, t, crumbs, loadMore }) {
  const top = articles.slice(0, 2);
  const rest = articles.slice(2);
  return (
    <>
      <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
        <HeroBackdrop />
        <div className="container-x relative">
          <Breadcrumb className="lg:justify-start" items={crumbs} />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div className="text-center lg:text-start">
              <NavLink href={NEWS_PATH} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-gold-200">
                <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" aria-hidden />
                {t('category.backToNews')}
              </NavLink>
              <motion.h1 className="heading-page mt-5" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
                {category.name}
              </motion.h1>
              <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0">{t('category.description', { category: category.name })}</p>
              <div className="mt-8">
                <CategoryLinks categories={categories} current={category.slug} style="pills" />
              </div>
            </div>
            <div className="grid gap-4">
              {top.map((a, i) => (
                <motion.article
                  key={a.id}
                  className="group relative grid grid-cols-[38%_1fr] gap-5 overflow-hidden rounded-[1.75rem] bg-white/[0.06] p-3 ring-1 ring-white/10 backdrop-blur-xl transition-colors hover:bg-white/[0.1] hover:ring-gold/30"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.12 }}
                >
                  <div className="relative min-h-36 overflow-hidden rounded-[1.3rem]">
                    <div className="absolute inset-0">
                      <NewsCover article={a} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center py-2 pe-3">
                    {i === 0 && <span className="heading-label">{t('hero.latest')}</span>}
                    <When a={a} className="mt-1.5 text-white/55" />
                    <PostTitle a={a} className="mt-2 line-clamp-3 font-semibold" />
                    <ArrowUpRight className="mt-3 size-5 text-gold-200 transition-transform group-hover:rotate-45 rtl:-scale-x-100" aria-hidden />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f6f7fb] py-16 md:py-20">
        <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative">
          {!articles.length ? (
            <Empty t={t} />
          ) : (
            <>
              {/* each card animates itself so cards added by "Load more" appear too */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a, i) => (
                  <motion.div key={a.id} className="h-full" {...inView(i)}>
                    <NewsCard article={a} showCategory={false} />
                  </motion.div>
                ))}
              </div>
              <LoadMore {...loadMore} label={t('category.loadMore')} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ C · Cover + sidebar */

function CoverSidebar({ category, categories, articles, t, crumbs, loadMore }) {
  const [lead, ...rest] = articles;
  return (
    <>
      <section className="is-dark relative flex min-h-[70vh] items-end overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20">
        <div className="absolute inset-0" aria-hidden>
          {lead && <NewsCover article={lead} showTitle={false} />}
          <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
        </div>
        <div className="container-x relative w-full">
          <Breadcrumb className="lg:justify-start" items={crumbs} />
          <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="text-center lg:text-start">
              <motion.h1 className="heading-page" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
                {category.name}
              </motion.h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0">{t('category.description', { category: category.name })}</p>
            </div>
            {lead && (
              <motion.article
                className="group relative mx-auto w-full max-w-md rounded-[1.75rem] bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-xl transition-colors hover:bg-white/15 lg:mx-0"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-900">
                  <span className="size-1.5 animate-pulse rounded-full bg-down" aria-hidden />
                  {t('hero.latest')}
                </span>
                <PostTitle a={lead} as="h2" className="heading-card mt-4 line-clamp-3" />
                <When a={lead} className="mt-3 text-white/60" />
                <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-gold-200">
                  {t('trends.readMore')}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden />
                </span>
              </motion.article>
            )}
          </div>
        </div>
      </section>

      <section className="relative bg-white py-16 md:py-20">
        <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-28">
            <CategoryLinks categories={categories} current={category.slug} style="list" />
          </div>
          <div className="min-w-0">
            {!articles.length ? (
              <Empty t={t} />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {rest.map((a, i) => (
                    <motion.div key={a.id} className="h-full" {...inView(i)}>
                      <NewsCard article={a} showCategory={false} />
                    </motion.div>
                  ))}
                </div>
                <LoadMore {...loadMore} label={t('category.loadMore')} />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function CategoryPage({ category, categories, initial, total }) {
  const t = useTranslations('gtcNewsPage');
  const locale = useLocale();
  const draft = useDraft('category', ['a', 'b', 'c']);
  const [articles, setArticles] = useState(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const more = articles.length < total;

  const loadMore = async () => {
    setLoading(true);
    try {
      let next = [];
      if (PREVIEW) next = previewArticles('market-daily-updates', 6).map((a) => ({ ...a, id: `more-${a.id}`, category: category.name, categorySlug: category.slug }));
      else {
        const res = await fetch(`/api/news?${new URLSearchParams({ locale, category: category.slug, page: String(page + 1), pageSize: String(PAGE_SIZE) })}`);
        next = (await res.json()).articles ?? [];
      }
      const seen = new Set(articles.map((a) => a.id));
      setArticles([...articles, ...next.filter((a) => !seen.has(a.id))]);
      setPage(page + 1);
    } catch {
      // keep what is shown; the button stays so the visitor can try again
    } finally {
      setLoading(false);
    }
  };

  const crumbs = [{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.current'), href: NEWS_PATH }, { label: category.name }];
  const props = { category, categories, articles, t, crumbs, loadMore: { more, loading, onClick: loadMore } };
  const v = draft.value;
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme={v === 'a' ? 'light' : v === 'c' ? 'overlay' : 'dark'} />
      {draft.show && (
        <div className="fixed bottom-4 end-4 z-[70]">
          <DraftBar draft={draft} labels={LABELS} className="mb-0" />
        </div>
      )}
      <main>
        {v === 'a' && <Editorial {...props} />}
        {v === 'b' && <Showcase {...props} />}
        {v === 'c' && <CoverSidebar {...props} />}
        <ActivationBand />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
