'use client';
/**
 * News article card + pieces (normalised article from src/lib/news.js).
 * variant: 'default' (cover on top) · 'row' (small cover beside the text, for lists)
 */
import { ArrowUpRight, CalendarDays, UserRound } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { cn } from '@/lib/utils';

/** Article cover from Strapi, or a branded navy cover with the title when there is no image. */
export function NewsCover({ article, className, showTitle = true }) {
  if (article.cover?.url) {
    return (
      <img
        src={article.cover.url}
        alt={article.cover.alt || article.title}
        width={article.cover.width ?? undefined}
        height={article.cover.height ?? undefined}
        loading="lazy"
        decoding="async"
        className={cn('size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]', className)}
      />
    );
  }
  return (
    <div className={cn('relative size-full overflow-hidden bg-gradient-to-br from-brand-900 via-brand to-brand-700 text-white transition-transform duration-700 group-hover:scale-[1.05]', className)} aria-hidden>
      <div className="bg-grid-dark absolute inset-0 opacity-50" />
      <span className="absolute -end-10 -top-10 size-48 rounded-full bg-gold/30 blur-3xl" />
      <span className="absolute -bottom-16 start-1/4 size-56 rounded-full bg-[#5b6ed2]/40 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between p-5">
        <span className="text-sm font-black tracking-tight text-white/90">GTCFX</span>
        {showTitle && <p className="line-clamp-3 max-w-[90%] text-balance text-lg font-bold leading-tight">{article.title}</p>}
      </div>
    </div>
  );
}

export function NewsMeta({ article, dark = false, showCategory = true }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs', dark ? 'text-white/55' : 'text-ink/50')}>
      {showCategory && article.category && <span className={cn('rounded-full px-2.5 py-1 font-semibold', dark ? 'bg-white/10 text-gold-200 ring-1 ring-white/15' : 'bg-brand-50 text-brand')}>{article.category}</span>}
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5" aria-hidden />
        <time dateTime={article.publishedAt}>{article.dateLabel}</time>
      </span>
      {article.author && (
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="size-3.5" aria-hidden />
          {article.author}
        </span>
      )}
    </p>
  );
}

export default function NewsCard({ article, variant = 'default', showCategory = true, compact = false, className }) {
  if (variant === 'row') {
    return (
      <article className={cn('group relative flex rounded-2xl p-2.5 transition-colors hover:bg-[#f6f7fb]', compact ? 'gap-3' : 'gap-4', className)}>
        <div className={cn('aspect-[4/3] shrink-0 overflow-hidden rounded-xl', compact ? 'w-20' : 'w-28 md:w-32')}>
          <NewsCover article={article} showTitle={false} />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <NewsMeta article={article} showCategory={showCategory} />
          <h3 className={cn('mt-1.5 font-semibold leading-snug text-ink transition-colors group-hover:text-brand', compact ? 'line-clamp-3 text-sm' : 'line-clamp-2 text-[15px]')}>
            <NavLink href={article.href} className="after:absolute after:inset-0">
              {article.title}
            </NavLink>
          </h3>
        </div>
      </article>
    );
  }
  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/15 hover:ring-brand/20', className)}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <NewsCover article={article} />
        <span className="absolute end-4 top-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-brand opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden>
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <NewsMeta article={article} showCategory={showCategory} />
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          <NavLink href={article.href} className="after:absolute after:inset-0">
            {article.title}
          </NavLink>
        </h3>
        {article.excerpt && <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink/55">{article.excerpt}</p>}
      </div>
    </article>
  );
}
