'use client';
/**
 * "GTCFX & Market Trends" — every Strapi news category at once (no tabs), each with its newest posts and a
 * "View all" link to the category page. No post counts. A row per category: one large story and two smaller
 * (compact rows on phones).
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { NewsCover } from '@/components/shared/news/NewsCard';
import { Reveal, EASE } from '@/components/motion';
import { newsCategoryHref } from '@/lib/news-path';
import { cn } from '@/lib/utils';
import { iconFor } from './newsUi';

const inView = (i = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.55, ease: EASE, delay: i * 0.06 } });

function Go({ className }) {
  return <ArrowRight className={cn('size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1', className)} aria-hidden />;
}

function TitleLink({ article, className, as: H = 'h4' }) {
  return (
    <H className={cn(/heading-/.test(className ?? '') ? '' : 'heading-small', className)}>
      <NavLink href={article.href} className="after:absolute after:inset-0">
        {article.title}
      </NavLink>
    </H>
  );
}

function When({ a, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-ink/50', className)}>
      <CalendarDays className="size-3.5" aria-hidden />
      <time dateTime={a.publishedAt}>{a.dateLabel}</time>
    </span>
  );
}

function ViewAll({ slug, label, className }) {
  return (
    <NavLink href={newsCategoryHref(slug)} className={cn('group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-gold-700', className)}>
      {label}
      <span className="grid size-8 place-items-center rounded-full bg-brand text-white transition-colors group-hover:bg-gold">
        <Go className="size-3.5" />
      </span>
    </NavLink>
  );
}

function SectionHead({ s, viewAll, className }) {
  const Icon = iconFor(s.slug);
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-gold-200 shadow-lg shadow-brand/25">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="heading-title flex-1">{s.name}</h3>
      <ViewAll slug={s.slug} label={viewAll} />
    </div>
  );
}

function Rows({ sections, t }) {
  return (
    <div className="space-y-12 md:space-y-14">
      {sections.map((s) => {
        const [lead, ...rest] = s.articles;
        return (
          <section key={s.slug} aria-label={s.name}>
            <Reveal y={14}>
              <SectionHead s={s} viewAll={t('viewAll')} className="border-b border-brand/10 pb-5" />
            </Reveal>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
              <motion.article
                {...inView(0)}
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/10 transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15 md:col-span-2 lg:col-span-1"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <NewsCover article={lead} showTitle={false} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <When a={lead} />
                  <TitleLink article={lead} className="heading-card mt-3 line-clamp-2 transition-colors group-hover:text-brand" />
                  {lead.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/55">{lead.excerpt}</p>}
                </div>
              </motion.article>
              {rest.slice(0, 2).map((a, i) => (
                <motion.article
                  key={a.id}
                  {...inView(i + 1)}
                  className="group relative grid grid-cols-[7rem_1fr] overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/15 md:flex md:flex-col md:rounded-[1.75rem]"
                >
                  <div className="relative overflow-hidden md:aspect-[16/10]">
                    <div className="absolute inset-0">
                      <NewsCover article={a} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <When a={a} />
                    <TitleLink article={a} className="mt-2 line-clamp-3 transition-colors group-hover:text-brand" />
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand">
                      {t('readMore')} <Go />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function TrendsSection({ sections }) {
  const t = useTranslations('gtcNewsPage.trends');
  if (!sections.length) return null;
  return (
    <section id="trends" className="relative overflow-hidden bg-[#f6f7fb] py-16 md:py-20">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} />
        <div className="mt-10 md:mt-12">
          <Rows sections={sections} t={t} />
        </div>
      </div>
    </section>
  );
}
