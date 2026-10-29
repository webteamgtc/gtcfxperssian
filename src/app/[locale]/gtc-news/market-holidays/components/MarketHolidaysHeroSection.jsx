'use client';
/**
 * Market holidays hero (dark): badge, title, copy, CTAs and key figures beside four live quote cards
 * (FX · Gold · Index · Crypto) streamed from the GTC quotes feed.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import NavLink from '@/components/shared/nav/NavLink';
import { Button } from '@/components/ui/button';
import { useLiveRows, FlashPrice, Sparkline, UpDown, pct } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { PORTAL } from '@/config/menu';
import { NEWS_PATH } from '@/lib/news-path';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

// `s` = feed symbol, `n` = display name; order matches hero.tickerCategories
const QUOTES = [
  { s: 'EURUSD', n: 'EURUSD', d: 5 },
  { s: 'XAUUSD', n: 'XAUUSD', d: 2 },
  { s: 'US30c', n: 'US30', d: 1 },
  { s: 'BTCUSDT', n: 'BTCUSD', d: 1 }
];
const TONES = ['bg-brand-400/20 text-brand-100 ring-brand-300/30', 'bg-gold/20 text-gold-200 ring-gold/30', 'bg-down/15 text-red-300 ring-down/30', 'bg-up/15 text-green-300 ring-up/30'];

function QuoteCard({ row, category, tone, i }) {
  const up = row.change == null ? row.dir > 0 : row.change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.25 + i * 0.1, duration: 0.7, ease: EASE }}>
      <motion.div animate={{ y: [0, i % 2 ? 6 : -6, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }} className="group relative overflow-hidden rounded-[1.5rem] bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-xl transition-colors hover:bg-white/[0.09] sm:p-5">
        <span className={cn('absolute -end-10 -top-10 size-28 rounded-full blur-2xl transition-opacity duration-500', up ? 'bg-up/20' : 'bg-down/20', 'opacity-60 group-hover:opacity-100')} aria-hidden />
        <div className="relative flex items-center justify-between gap-2">
          <span className="text-sm font-bold tracking-wide text-white">{row.n}</span>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1', tone)}>
            <span className="size-1 rounded-full bg-current" />
            {category}
          </span>
        </div>
        <div dir="ltr" className="relative mt-3 text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
          <FlashPrice value={row.bid} decimals={row.d} dir={row.dir} tick={row.tick} />
        </div>
        <div className="relative mt-2 flex items-end justify-between gap-2">
          <span dir="ltr" className={cn('inline-flex items-center gap-1 text-xs font-semibold tabular-nums', up ? 'text-up' : 'text-down')}>
            <UpDown dir={up ? 1 : -1} />
            {pct(row.change)}
          </span>
          <Sparkline data={row.hist} up={up} width={64} height={22} className="opacity-90" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MarketHolidaysHeroSection() {
  const t = useTranslations('marketHolidaysPage');
  const rows = useLiveRows(QUOTES, 1200);
  const categories = t.raw('hero.tickerCategories');
  const stats = t.raw('hero.stats');
  const values = t.raw('hero.statValues');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.news'), href: NEWS_PATH }, { label: t('breadcrumb.current') }]} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="text-center lg:text-start">
            <motion.span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-200 ring-1 ring-white/10 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <motion.span className="size-1.5 rounded-full bg-up" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
              {t('hero.badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
              {t('hero.headingPrefix')} <span className="heading-accent">{t('hero.headingAccent')}</span> {t('hero.headingSuffix')}
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('hero.sub')}
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <LiveAccountButton look="button" size="lg" variant="gold">
                {t('hero.openCta')}
              </LiveAccountButton>
              <Button size="lg" variant="outlineLight" as={NavLink} href={PORTAL.demo}>
                {t('hero.demoCta')}
              </Button>
            </motion.div>
            <motion.dl className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4 lg:mx-0" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } } }}>
              {stats.map((label, i) => (
                <motion.div key={label} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <dt className="sr-only">{label}</dt>
                  <dd dir="ltr" className="whitespace-nowrap text-2xl font-bold text-white rtl:text-end">
                    {i === 0 ? <span className="heading-accent">{values[i]}</span> : values[i]}
                  </dd>
                  <dd className="mt-1 text-xs text-white/50">{label}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <motion.span className="absolute inset-6 -z-10 rounded-full bg-brand/40 blur-[80px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {rows.map((row, i) => (
                <QuoteCard key={row.s} row={row} category={categories[i]} tone={TONES[i]} i={i} />
              ))}
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45 lg:justify-end">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('hero.live')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
