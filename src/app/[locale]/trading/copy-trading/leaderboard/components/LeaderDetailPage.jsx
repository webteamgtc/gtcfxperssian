'use client';
/**
 * /trading/copy-trading/leaderboard/[slug] — strategy-provider profile (slug = profileId).
 * Rhythm: dark hero → gray body (account summary, performance, overview stats, activity tabs).
 */
import { useTranslations } from 'next-intl';
import { SearchX } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import ArrowLink from '@/components/shared/ArrowLink';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { ScrollProgress } from '@/components/motion';
import { AccountSummary, DetailHero, Performance } from './DetailTop';
import { ActivityTabs, StatsPanel } from './DetailTabs';
import { useTraderPart } from './traderData';

function HeroSkeleton() {
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="size-20 animate-pulse rounded-xl bg-white/10" />
            <div className="h-9 w-56 animate-pulse rounded-lg bg-white/10" />
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} className="h-16 animate-pulse rounded-2xl bg-white/[0.06]" />
            ))}
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-[2rem] bg-white/[0.06]" />
      </div>
    </section>
  );
}

function NotFound() {
  const t = useTranslations('copyTradingPage.detail.error');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-24 pt-40 text-white md:pt-48">
      <HeroBackdrop />
      <div className="container-x relative mx-auto max-w-xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15">
          <SearchX className="size-8" />
        </span>
        <h1 className="heading-section mt-6">{t('title')}</h1>
        <p className="mt-4 text-white/65">{t('text')}</p>
        <ArrowLink href="/trading/copy-trading#top-traders" variant="gold" className="mt-8">
          {t('back')}
        </ArrowLink>
      </div>
    </section>
  );
}

export default function LeaderDetailPage({ slug }) {
  const { data, loading, error } = useTraderPart('profile', slug, { enabled: /^\d+$/.test(String(slug)) });
  const invalid = !/^\d+$/.test(String(slug));

  return (
    <div className="overflow-x-clip bg-[#f6f7fb] text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        {invalid || (!loading && (error || !data)) ? (
          <NotFound />
        ) : loading ? (
          <HeroSkeleton />
        ) : (
          <>
            <DetailHero data={data} />
            <div className="container-x space-y-6 py-12 md:space-y-8 md:py-16">
              <AccountSummary data={data} />
              <Performance data={data} />
              <StatsPanel data={data} />
              <ActivityTabs accountId={data.accountId} />
            </div>
          </>
        )}
      </main>
      <Footer theme="dark" />
    </div>
  );
}
