'use client';
/** Template B "All markets at a glance" Copy: marketsPage.detail.overview (shared); the current market is highlighted. */
import { useTranslations } from 'next-intl';
import { ArrowRight, Clock, Globe, Flame, ChartColumn, Gem, Wheat, Landmark, Star } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import { useMarket } from './shared';

const ROW_ICON = { forex: Globe, energy: Flame, indices: ChartColumn, metals: Gem, futures: Wheat, shares: Landmark };

function Note() {
  const t = useTranslations('marketsPage.detail.overview');
  return (
    <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-ink/55">
      {t('note')}{' '}
      <NavLink href={t('noteHref')} className="font-semibold text-brand underline decoration-gold decoration-2 underline-offset-4 hover:text-brand-700">
        {t('noteLink')}
      </NavLink>
    </p>
  );
}

const Section = ({ children }) => (
  <section className="relative bg-[#f6f7fb] py-14 text-ink md:py-24">
    <div className="container-x">{children}</div>
  </section>
);

/** Cards — one card per market with its four numbers; cards lift on hover, the current market glows. */
export function OverviewCards() {
  const t = useTranslations('marketsPage.detail.overview');
  const { page } = useMarket();
  const h = t.raw('headers');
  const rows = t.raw('rows');
  return (
    <Section>
      <SectionIntro title={t('title')} description={t('description')} />
      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-5" stagger={0.08}>
        {rows.map((r) => {
          const I = ROW_ICON[r.id] ?? Globe;
          const here = r.id === page.id;
          return (
            <StaggerItem key={r.id}>
              <NavLink href={r.href} className={cn('group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 ring-1 transition-all duration-300 hover:-translate-y-1.5', here ? 'bg-gradient-to-b from-brand to-brand-900 text-white ring-brand shadow-[0_30px_70px_-30px_rgba(41,59,147,0.8)]' : 'bg-white ring-brand/10 hover:shadow-[0_24px_60px_-30px_rgba(41,59,147,0.5)]')}>
                {r.popular && (
                  <span className={cn('absolute end-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold', here ? 'bg-gold text-white' : 'bg-gold/15 text-gold-700')}>
                    <Star className="size-3" /> {t('popular')}
                  </span>
                )}
                <span className={cn('grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:rotate-6', here ? 'bg-white/15 text-gold-200' : 'bg-brand-50 text-brand')}>
                  <I className="size-5" />
                </span>
                <h3 className={cn('heading-card mt-5', here && 'is-dark')}>{r.name}</h3>
                <dl className={cn('mt-4 divide-y text-sm', here ? 'divide-white/10' : 'divide-brand/[0.07]')}>
                  {['instruments', 'spread', 'leverage'].map((k) => (
                    <div key={k} className="flex items-baseline justify-between gap-3 py-2.5">
                      <dt className={cn('whitespace-nowrap', here ? 'text-white/60' : 'text-ink/50')}>{h[k]}</dt>
                      <dd className="whitespace-nowrap text-end font-semibold tabular-nums" dir="ltr">{r[k]}</dd>
                    </div>
                  ))}
                </dl>
                {/* hours + arrow pinned to the bottom so every card ends on the same line */}
                <div className={cn('mt-auto flex items-center justify-between gap-3 border-t pt-4 text-xs', here ? 'border-white/15 text-white/70' : 'border-brand/10 text-ink/55')}>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" aria-hidden />
                    <span className="sr-only">{h.hours}: </span>
                    <span className="truncate">{r.hours}</span>
                  </span>
                  <ArrowRight className={cn('size-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1', here ? 'text-gold-200' : 'text-brand')} />
                </div>
              </NavLink>
            </StaggerItem>
          );
        })}
      </Stagger>
      <Note />
    </Section>
  );
}

