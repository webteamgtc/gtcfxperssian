'use client';
/**
 * News row: large cards in a snap-scrolling row with previous / next buttons and a "view all" link.
 * Defaults to the markets-page copy (marketsPage.news); pass title / description / labels to reuse it elsewhere.
 * Articles: normalised shape from src/lib/news.js.
 */
import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { NEWS_PATH } from '@/lib/news-path';
import { getDir } from '@/i18n/locales';
import { cn } from '@/lib/utils';
import NewsCard from './NewsCard';

export default function NewsCarousel({ articles = [], title, description, viewAllHref = NEWS_PATH, viewAllLabel, prevLabel, nextLabel, className, id }) {
  const t = useTranslations('marketsPage.news');
  const row = useRef(null);
  const rtl = getDir(useLocale()) === 'rtl';
  const go = (dir) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  if (!articles.length) return null;
  return (
    <section id={id} className={cn('relative overflow-hidden bg-[#f6f7fb] py-14 text-ink md:py-24', className)}>
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionIntro layout="split" title={title ?? t('title')} description={description ?? t('description')} className="flex-1" />
          <div className="flex gap-2">
            {[
              [-1, ChevronLeft, prevLabel ?? t('prev')],
              [1, ChevronRight, nextLabel ?? t('next')]
            ].map(([d, I, label]) => (
              <button key={d} type="button" onClick={() => go(d)} aria-label={label} className="grid size-12 place-items-center rounded-full border border-brand/15 bg-white text-brand transition-colors hover:bg-brand hover:text-white">
                <I className="size-5 rtl:-scale-x-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        ref={row}
        className="no-scrollbar relative mt-10 snap-x snap-mandatory overflow-x-auto scroll-smooth px-5 pb-4 scroll-px-5 md:mt-14 md:px-8 md:scroll-px-8 xl:px-[calc((100vw_-_1280px)/2_+_2rem)] xl:scroll-px-[calc((100vw_-_1280px)/2_+_2rem)]"
      >
        <Stagger className="flex w-max gap-6" stagger={0.07}>
          {articles.map((a) => (
            <StaggerItem key={a.id} className="w-[82vw] shrink-0 snap-start sm:w-[400px]">
              <NewsCard article={a} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
      <Reveal y={12} className="relative mt-10 flex justify-center">
        <ArrowLink href={viewAllHref}>{viewAllLabel ?? t('viewAll')}</ArrowLink>
      </Reveal>
    </section>
  );
}
