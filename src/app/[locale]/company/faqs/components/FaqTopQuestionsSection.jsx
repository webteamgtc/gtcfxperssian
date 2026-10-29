'use client';
/**
 * "Quick answers to common questions" — Strapi FAQs (src/lib/faqs.js) by category: sticky category tabs beside a
 * single-open accordion. With a search query (hero search / popular topics) it lists matches from every category.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Search, X } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const ANSWER =
  'text-[15px] leading-relaxed text-ink/65 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-gold-600 [&_li]:mt-1.5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:ps-5 [&_li::marker]:text-gold';

const plain = (html) => html.replace(/<[^>]+>/g, ' ');

function Item({ item, index, open, onToggle, tag }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-white ring-1 transition-shadow duration-500', open ? 'shadow-xl shadow-brand/10 ring-brand/25' : 'ring-brand/10 hover:ring-brand/20')}>
      {open && <motion.span layoutId="faq-open-bar" className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-gold to-brand" aria-hidden />}
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 px-5 py-4 text-start md:px-6 md:py-5">
        <span dir="ltr" className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums transition-colors', open ? 'bg-brand text-white' : 'bg-brand-50 text-brand')}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1">
          {tag && <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gold-600">{tag}</span>}
          <span className={cn('block font-semibold leading-snug transition-colors md:text-[17px]', open ? 'text-brand' : 'text-ink')}>{item.q}</span>
        </span>
        <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full transition-all duration-300', open ? 'rotate-45 bg-gold text-white' : 'bg-white text-brand ring-1 ring-brand/15')}>
          <Plus className="size-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <div className={cn('px-5 pb-6 ps-[4.25rem] md:px-6 md:ps-[4.5rem]', ANSWER)} dangerouslySetInnerHTML={{ __html: item.a }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryTabs({ groups, active, onPick }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0" role="tablist">
      {groups.map((g) => {
        const on = g.key === active;
        return (
          <button key={g.key} type="button" role="tab" aria-selected={on} onClick={() => onPick(g.key)} className={cn('relative flex shrink-0 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-start text-sm font-semibold transition-colors lg:px-5 lg:py-3.5', on ? 'text-white' : 'bg-white text-ink/65 ring-1 ring-brand/10 hover:text-brand lg:bg-transparent lg:ring-0 lg:hover:bg-white')}>
            {on && <motion.span layoutId="faq-tab" className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 400, damping: 34 }} aria-hidden />}
            <span className="relative whitespace-nowrap lg:whitespace-normal">{g.label}</span>
            <span className={cn('relative rounded-full px-2 py-0.5 text-[11px] tabular-nums', on ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand')}>{g.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function FaqTopQuestionsSection({ groups, active, onPick, query, onClear }) {
  const t = useTranslations('faqsPage.topQuestions');
  const th = useTranslations('faqsPage.hero');
  const [open, setOpen] = useState(0);
  const group = groups.find((g) => g.key === active) ?? groups[0];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return groups.flatMap((g) => g.questions.filter((it) => it.q.toLowerCase().includes(q) || plain(it.a).toLowerCase().includes(q)).map((it) => ({ ...it, group: g.label })));
  }, [groups, query]);

  useEffect(() => setOpen(0), [active, query]);

  const items = results ?? group?.questions ?? [];
  const viewKey = results ? `q:${query}` : `g:${group?.key}`;

  return (
    <section id="questions" className="relative scroll-mt-20 overflow-clip bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} layout="split" />

        {!groups.length ? (
          <p className="mt-12 rounded-2xl bg-white py-16 text-center text-ink/50 ring-1 ring-brand/10">{t('empty')}</p>
        ) : (
          <div className="mt-10 grid items-start gap-8 md:mt-14 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
            <Reveal y={16} className="lg:sticky lg:top-28">
              <CategoryTabs groups={groups} active={results ? null : group?.key} onPick={onPick} />
            </Reveal>

            <div>
              {results && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3.5 ring-1 ring-brand/15">
                  <span className="flex min-w-0 items-center gap-2.5 text-sm text-ink/70">
                    <Search className="size-4 shrink-0 text-gold" />
                    <span className="truncate font-semibold text-ink">“{query}”</span>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand">{results.length}</span>
                  </span>
                  <button type="button" onClick={onClear} aria-label={th('searchAriaLabel')} className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand transition-colors hover:bg-brand hover:text-white">
                    <X className="size-4" />
                  </button>
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={viewKey} className="space-y-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                  {items.length ? (
                    items.map((it, i) => <Item key={`${viewKey}-${i}`} item={it} index={i} tag={results ? it.group : null} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />)
                  ) : (
                    <p className="rounded-2xl bg-white py-14 text-center text-ink/50 ring-1 ring-brand/10">{t('empty')}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
