'use client';
/**
 * "GTCFX & Knowledge Hub" — the latest event story (Strapi `event` category, else the newest blog): a text card
 * overlapping the picture, and a turning "View more" badge to the category (a button on phones).
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, CalendarDays, Sparkles, UserRound } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { NewsCover } from '@/components/shared/news/NewsCard';
import { Reveal } from '@/components/motion';
import { newsCategoryHref } from '@/lib/news-path';
import { cn } from '@/lib/utils';

function Chip({ children, dark }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em]', dark ? 'bg-white/10 text-gold-200 ring-1 ring-white/20' : 'bg-brand text-white shadow-lg shadow-brand/25')}>
      <Sparkles className="size-3.5 text-gold-200" />
      {children}
    </span>
  );
}

function Meta({ a, dark }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium', dark ? 'text-white/60' : 'text-ink/50')}>
      <span className="inline-flex items-center gap-2">
        <CalendarDays className="size-4 text-gold" />
        <time dateTime={a.publishedAt}>{a.dateLabel}</time>
      </span>
      {a.author && (
        <span className="inline-flex items-center gap-2">
          <UserRound className="size-4 text-gold" />
          {a.author}
        </span>
      )}
    </p>
  );
}

function Title({ a, className }) {
  return (
    <h3 className={cn('heading-title text-balance', className)}>
      <NavLink href={a.href} className="after:absolute after:inset-0">
        {a.title}
      </NavLink>
    </h3>
  );
}

function Cta({ label, dark }) {
  return (
    <span className={cn('inline-flex items-center gap-3 text-sm font-semibold', dark ? 'text-gold-200' : 'text-brand')}>
      {label}
      <span className={cn('grid size-10 place-items-center rounded-full text-white transition-all duration-500 group-hover:bg-gold', dark ? 'bg-white/10 ring-1 ring-white/20' : 'bg-brand')}>
        <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
      </span>
    </span>
  );
}

function RoundBadge({ label, href }) {
  const n = Math.max(1, Math.round(26 / (label.length + 3)));
  const text = Array.from({ length: n }, () => `${label} • `).join('');
  return (
    <NavLink href={href} className="group/badge relative grid size-32 place-items-center rounded-full bg-gold text-white shadow-2xl shadow-gold/40 transition-transform duration-500 hover:scale-105" aria-label={label}>
      <motion.svg viewBox="0 0 120 120" dir="ltr" className="absolute inset-0 size-full" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} aria-hidden>
        <defs>
          <path id="kh-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text className="fill-white text-[11px] font-bold uppercase tracking-[0.2em]">
          <textPath href="#kh-circle" textLength="285" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </motion.svg>
      <ArrowUpRight className="size-7 transition-transform duration-500 group-hover/badge:rotate-45 rtl:-scale-x-100" aria-hidden />
    </NavLink>
  );
}

function Layered({ a, t, href }) {
  return (
    <div className="relative mt-12 md:mt-14">
      <Reveal y={28} className="lg:ms-[30%]">
        <div className="group relative aspect-[16/10] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand/20 lg:aspect-[16/9]">
          <NewsCover article={a} showTitle={false} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-950/40 via-transparent to-transparent" aria-hidden />
        </div>
      </Reveal>
      <Reveal y={36} delay={0.15} className="relative z-10 -mt-20 px-3 sm:px-8 lg:absolute lg:start-0 lg:top-1/2 lg:mt-0 lg:w-[46%] lg:-translate-y-1/2 lg:px-0">
        <article className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(41,59,147,0.45)] ring-1 ring-brand/10 md:p-9">
          <span className="absolute inset-y-8 start-0 w-1 rounded-e-full bg-gradient-to-b from-brand to-gold" aria-hidden />
          <Chip>{a.category}</Chip>
          <Title a={a} className="mt-5 transition-colors group-hover:text-brand" />
          <div className="mt-4">
            <Meta a={a} />
          </div>
          {a.excerpt && <p className="mt-4 line-clamp-3 text-pretty text-[15px] leading-relaxed text-ink/60">{a.excerpt}</p>}
          <div className="mt-7">
            <Cta label={t('readMore')} />
          </div>
        </article>
      </Reveal>
      <div className="absolute -top-12 end-4 z-20 hidden md:block lg:-top-14 lg:end-10">
        <RoundBadge label={t('viewMore')} href={href} />
      </div>
    </div>
  );
}

export default function KnowledgeHubSection({ featured }) {
  const t = useTranslations('gtcNewsPage.knowledgeHub');
  if (!featured) return null;
  const href = newsCategoryHref(featured.categorySlug);
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-20">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('subtitle')} layout="split" />
        <Layered a={featured} t={t} href={href} />
        <div className="mt-10 flex justify-center md:hidden">
          <ArrowLink href={href}>{t('viewMore')}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
