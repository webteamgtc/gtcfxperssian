'use client';
/**
 * GTC News hero (dark): page title, then one tile per kind — the latest event, article, company news and daily market
 * update (Strapi) — and a moving strip of the newest headlines.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { NewsCover } from '@/components/shared/news/NewsCard';
import { Marquee, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { iconFor, latestStories } from './newsUi';

function Heading({ t, className, descClassName }) {
  return (
    <>
      <motion.h1 className={cn('heading-page text-balance', className)} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}>
        <AccentTitle text={t('title')} />
      </motion.h1>
      <motion.p className={cn('mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg', descClassName)} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}>
        {t('description')}
      </motion.p>
    </>
  );
}

function When({ a, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-white/55', className)}>
      <CalendarDays className="size-3.5" aria-hidden />
      <time dateTime={a.publishedAt}>{a.dateLabel}</time>
    </span>
  );
}

function StoryTitle({ a, className, as: H = 'h2' }) {
  return (
    <H className={cn('text-balance', className)}>
      <NavLink href={a.href} className="after:absolute after:inset-0">
        {a.title}
      </NavLink>
    </H>
  );
}

const rise = (i = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: EASE, delay: 0.2 + i * 0.08 } });

function CategoryTiles({ t, crumbs, stories, headlines }) {
  return (
    <>
      <Breadcrumb className="justify-center" items={crumbs} />
      <div className="mx-auto mt-8 max-w-3xl text-center">
        <Heading t={t} descClassName="mx-auto" />
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stories.map((a, i) => {
          const Icon = iconFor(a.categorySlug);
          return (
            <motion.article
              key={a.id}
              {...rise(i)}
              className="group relative isolate flex min-h-56 flex-col sm:min-h-72 overflow-hidden rounded-[1.75rem] bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:ring-gold/40"
            >
              {/* the story's picture fades in behind on hover */}
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" aria-hidden>
                <NewsCover article={a} showTitle={false} />
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/50" />
              </div>
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-700 text-white shadow-lg shadow-gold/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="size-6" aria-hidden />
                </span>
                <ArrowUpRight className="size-5 text-white/40 transition-all duration-500 group-hover:rotate-45 group-hover:text-gold-200 rtl:-scale-x-100" aria-hidden />
              </div>
              <span className="heading-label mt-6 block">{a.category}</span>
              <StoryTitle a={a} as="h2" className="heading-small mt-2 line-clamp-3" />
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <When a={a} />
                <span className="text-xs font-semibold text-gold-200">{t('latest')}</span>
              </div>
            </motion.article>
          );
        })}
      </div>
      {headlines.length > 0 && (
        <div className="mt-10 overflow-hidden rounded-full bg-white/[0.04] py-3 ring-1 ring-white/10" dir="ltr">
          <Marquee duration={50} gap="2.5rem">
            {headlines.map((a) => (
              <NavLink key={a.id} href={a.href} className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sm text-white/70 transition-colors hover:text-white" dir="auto">
                <span className="size-1.5 rounded-full bg-gold" aria-hidden />
                <span className="font-semibold text-gold-200">{a.category}</span>
                {a.title}
              </NavLink>
            ))}
          </Marquee>
        </div>
      )}
    </>
  );
}

export default function NewsHubHero({ sections, featured }) {
  const t = useTranslations('gtcNewsPage.hero');
  const tb = useTranslations('gtcNewsPage.breadcrumb');
  const crumbs = [{ label: tb('home'), href: '/' }, { label: tb('current') }];
  const headlines = sections.flatMap((s) => s.articles.slice(0, 3));
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <CategoryTiles t={t} crumbs={crumbs} stories={latestStories(sections, featured)} headlines={headlines} />
      </div>
    </section>
  );
}
