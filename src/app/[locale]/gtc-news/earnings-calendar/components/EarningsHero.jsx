'use client';
/**
 * Earnings & dividends hero (dark): badge, title, copy, section chips (scroll to calendar / screener / guide / FAQs)
 * beside a live card with the first adjustments of today's calendar upload.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { CalendarClock, ChartColumn, CircleHelp, Scale } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import { NEWS_PATH } from '@/lib/news-path';
import { cn } from '@/lib/utils';

export const SECTIONS = [
  { key: 'calendar', id: 'calendar', Icon: CalendarClock },
  { key: 'screener', id: 'screener', Icon: ChartColumn },
  { key: 'marginGuide', id: 'margin-guide', Icon: Scale },
  { key: 'faqs', id: 'faqs', Icon: CircleHelp }
];

export const jumpTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
export const isEmptyValue = (v) => !String(v ?? '').trim() || /^[/\-–—]$/.test(String(v).trim());

function LiveCard({ calendar }) {
  const t = useTranslations('earningsCalendarPage.hero');
  const rows = calendar?.rows ?? [];
  const valueCol = (calendar?.columns.length ?? 1) - 1;
  const items = [...rows.filter((r) => !isEmptyValue(r[valueCol])), ...rows.filter((r) => isEmptyValue(r[valueCol]))].slice(0, 5);
  if (!items.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }} className="mx-auto w-full max-w-md rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-sm font-semibold text-white">{t('highlightTitle')}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-up/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-up ring-1 ring-up/30">
          <motion.span className="size-1.5 rounded-full bg-up" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          {t('highlightStatus')}
        </span>
      </div>
      <p className="mt-1 px-1 text-xs text-white/45" dir="ltr">
        {calendar.date} · {t('timezone')}
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((r, i) => {
          const empty = isEmptyValue(r[valueCol]);
          return (
            <motion.li key={`${r[0]}-${i}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 ring-1 ring-white/10" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08, duration: 0.5, ease: EASE }}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{r[0]}</span>
                {r.length > 2 && (
                  <span dir="ltr" className="block text-xs text-white/45">
                    {r[1]}
                  </span>
                )}
              </span>
              <span dir="ltr" className={cn('rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums', empty ? 'text-white/35' : 'bg-gold/15 text-gold-200 ring-1 ring-gold/30')}>
                {empty ? '—' : r[valueCol]}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export default function EarningsHero({ calendar }) {
  const t = useTranslations('earningsCalendarPage');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.news'), href: NEWS_PATH }, { label: t('breadcrumb.current') }]} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="text-center lg:text-start">
            <motion.span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-200 ring-1 ring-white/10 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <CalendarClock className="size-3.5" />
              {t('hero.badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('hero.title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('hero.description')}
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}>
              {SECTIONS.map(({ key, id, Icon }) => (
                <motion.button key={key} type="button" onClick={() => jumpTo(id)} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="group inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-gold hover:text-white hover:ring-gold">
                  <Icon className="size-4 text-gold-200 transition-colors group-hover:text-white" />
                  {t(`hero.categories.${key}`)}
                </motion.button>
              ))}
            </motion.div>
          </div>
          <LiveCard calendar={calendar} />
        </div>
      </div>
    </section>
  );
}
