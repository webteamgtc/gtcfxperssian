'use client';
/**
 * "Find what you need by category" — tall navy feature card (Account Opening, with a preview of its first
 * questions) beside a 2×3 grid of compact topic cards. Every card opens its FAQ category in Top Questions
 * (matched by name) and shows how many answers it holds.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowDown, ArrowLeftRight, ArrowRight, Briefcase, ChevronRight, CircleHelp, CreditCard, Lock, Monitor, Settings, ShieldCheck } from 'lucide-react';
import RingCard from '@/components/shared/RingCard';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

/** Card → icon + the word that identifies its Strapi FAQ category. */
export const CATEGORY_CARDS = [
  { key: 'accountOpening', Icon: Briefcase, match: 'opening' },
  { key: 'deposits', Icon: CreditCard, match: 'deposit' },
  { key: 'platforms', Icon: Monitor, match: 'platform' },
  { key: 'conditions', Icon: ArrowLeftRight, match: 'conditions' },
  { key: 'management', Icon: Settings, match: 'management' },
  { key: 'security', Icon: ShieldCheck, match: 'security' },
  { key: 'regulation', Icon: Lock, match: 'regulation' }
];

/** "? 17" — number of answers in the category. */
function Count({ n, dark }) {
  if (!n) return null;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums', dark ? 'bg-white/10 text-gold-200 ring-1 ring-white/15' : 'bg-brand-50 text-brand')}>
      <CircleHelp className="size-3.5" />
      {n}
    </span>
  );
}

function FeaturedCard({ card, count, preview, onPick }) {
  const t = useTranslations(`faqsPage.categories.cards.${card.key}`);
  const tags = t.raw('tags') ?? [];
  return (
    <button type="button" onClick={onPick} className="block h-full w-full text-start">
      <RingCard as="div" dark lift={6} innerClassName="p-7 md:p-9">
        <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
        <motion.span className="absolute -end-24 -top-24 size-80 rounded-full bg-gold/25 blur-[100px]" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
        <card.Icon className="pointer-events-none absolute -bottom-10 -end-10 size-56 text-white/[0.04] transition-transform duration-700 group-hover:-rotate-12" strokeWidth={1} aria-hidden />

        <div className="relative flex items-start justify-between gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-gold text-white shadow-lg shadow-gold/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <card.Icon className="size-7" />
          </span>
          <Count n={count} dark />
        </div>
        <h3 className="relative mt-8 text-2xl font-bold md:text-3xl">{t('title')}</h3>
        <p className="relative mt-3 text-pretty text-[15px] leading-relaxed text-white/65">{t('description')}</p>
        <ul className="relative mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/10">
              {tag}
            </li>
          ))}
        </ul>

        {/* first questions of the category (from Strapi) */}
        {preview.length > 0 && (
          <ul className="relative mt-8 flex-1 space-y-2.5">
            {preview.map((q, i) => (
              <motion.li key={q} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm text-white/85 ring-1 ring-white/10 backdrop-blur transition-colors duration-500 group-hover:bg-white/[0.09]" initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: EASE }}>
                <span dir="ltr" className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/20 text-[10px] font-bold text-gold-200">
                  {i + 1}
                </span>
                <span className="line-clamp-1 flex-1">{q}</span>
                <ChevronRight className="size-4 shrink-0 text-white/40 rtl:-scale-x-100" />
              </motion.li>
            ))}
          </ul>
        )}

        <span className="relative mt-8 inline-flex h-12 items-center gap-2.5 self-start rounded-full bg-white ps-5 pe-1.5 text-sm font-semibold text-brand-900 transition-colors group-hover:bg-gold group-hover:text-white">
          {t('title')}
          <span className="grid size-9 place-items-center rounded-full bg-brand text-white transition-transform duration-500 group-hover:translate-y-0.5">
            <ArrowDown className="size-4" />
          </span>
        </span>
      </RingCard>
    </button>
  );
}

function CategoryCard({ card, count, onPick }) {
  const t = useTranslations(`faqsPage.categories.cards.${card.key}`);
  return (
    <button type="button" onClick={onPick} className="block h-full w-full text-start">
      <RingCard as="div" lift={5} innerClassName="p-5 md:p-6">
        <card.Icon className="pointer-events-none absolute -bottom-6 -end-6 size-28 text-brand/[0.04] transition-all duration-700 group-hover:-rotate-12 group-hover:text-gold/10" strokeWidth={1.25} aria-hidden />
        <div className="relative flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-brand-900 group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand/25">
            <card.Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold leading-snug text-ink transition-colors group-hover:text-brand md:text-lg">{t('title')}</span>
            <span className="mt-1.5 block text-sm leading-relaxed text-ink/55">{t('description')}</span>
          </span>
        </div>
        <div className="relative mt-auto flex items-center justify-between gap-3 pt-5">
          <Count n={count} />
          <span className="grid size-9 place-items-center rounded-full text-brand ring-1 ring-brand/15 transition-all duration-500 group-hover:bg-brand group-hover:text-white group-hover:ring-brand">
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </RingCard>
    </button>
  );
}

export default function FaqCategoriesSection({ countFor, previewFor, onPick }) {
  const t = useTranslations('faqsPage.categories');
  const [first, ...rest] = CATEGORY_CARDS;
  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[400px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} layout="split" />
        <div className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: EASE }}>
            <FeaturedCard card={first} count={countFor(first.match)} preview={previewFor(first.match)} onPick={() => onPick(first.match)} />
          </motion.div>
          <Stagger className="grid gap-5 sm:grid-cols-2" stagger={0.07}>
            {rest.map((card) => (
              <StaggerItem key={card.key} className="h-full">
                <CategoryCard card={card} count={countFor(card.match)} onPick={() => onPick(card.match)} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
