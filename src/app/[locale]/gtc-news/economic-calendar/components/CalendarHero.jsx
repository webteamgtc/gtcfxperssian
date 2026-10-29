'use client';
/**
 * Economic calendar hero (dark): badge, title, copy, CTAs and key stats beside a live calendar card
 * (Yesterday / Today / Tomorrow / This Week, times in GST) fed by src/lib/economicCalendar.js.
 * Without live events the card shows the sample rows from the design.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BellRing, CalendarClock } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import NavLink from '@/components/shared/nav/NavLink';
import { Button } from '@/components/ui/button';
import { CountUp, EASE } from '@/components/motion';
import { PLATFORM_LINKS, LIVE_ACCOUNT_HREF } from '@/config/menu';
import { NEWS_PATH } from '@/lib/news-path';
import { cn } from '@/lib/utils';
import { intlLocale } from '@/i18n/locales';

export const jumpTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const TZ = 'Asia/Dubai'; // card times are shown in GST (UTC+4)
const DAY = 86400000;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

/** Day filters for the four tabs (keys are YYYY-MM-DD in GST; "This Week" = today → Sunday). */
function tabFilters(now) {
  const idx = WEEKDAYS.indexOf(new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(now));
  const [yesterday, today, tomorrow] = [-1, 0, 1].map((d) => dayKey(new Date(now + d * DAY)));
  const sunday = dayKey(new Date(now + (6 - idx) * DAY));
  return [(k) => k === yesterday, (k) => k === today, (k) => k === tomorrow, (k) => k >= today && k <= sunday];
}

/** 4.7 + "%" → "4.7%", 1.221 + "M" → "1.221M", -536.6 + "¥" + "B" → "¥-536.6B" */
function fmtValue(v, unit, scale) {
  if (v === null || v === undefined) return '—';
  const n = Math.abs(v) >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(v);
  if (unit === '%') return `${n}%${scale}`;
  return `${unit && unit !== '%' ? unit : ''}${n}${scale}`;
}

/** Up to 5 events for a tab: the most important first, then shown in time order. */
function pickRows(events, test, timeFmt, withDay) {
  return events
    .filter((e) => test(dayKey(new Date(e.date))))
    .sort((a, b) => b.importance - a.importance || a.date.localeCompare(b.date))
    .slice(0, 5)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      key: e.id,
      time: timeFmt.format(new Date(e.date)),
      day: withDay ? withDay.format(new Date(e.date)) : null,
      currency: e.currency,
      title: e.title,
      high: e.importance > 0,
      actual: fmtValue(e.actual, e.unit, e.scale),
      forecast: fmtValue(e.forecast, e.unit, e.scale),
      previous: fmtValue(e.previous, e.unit, e.scale),
      beat: e.actual === null || e.forecast === null ? 0 : Math.sign(e.actual - e.forecast)
    }));
}

// design sample (event names come from translations)
const SAMPLE = [
  { time: '09:45', currency: 'CNH', actual: '—', forecast: '50.5', previous: '50.4', beat: 0, high: false },
  { time: '11:00', currency: 'EUR', actual: '49.6', forecast: '49.3', previous: '49.3', beat: 1, high: false },
  { time: '14:30', currency: 'USD', actual: '—', forecast: '+185K', previous: '+175K', beat: 0, high: true },
  { time: '14:30', currency: 'USD', actual: '48.9', forecast: '49.8', previous: '49.2', beat: -1, high: true },
  { time: '16:00', currency: 'USD', actual: '—', forecast: '49.8', previous: '0.5%', beat: 0, high: false }
];

const COLS = 'grid-cols-[3rem_minmax(0,1fr)_3.75rem_3.75rem] sm:grid-cols-[3.25rem_minmax(0,1fr)_4rem_4rem_4rem_3.75rem]';

function CalendarCard({ events, generatedAt }) {
  const t = useTranslations('economicCalendarPage.hero');
  const locale = useLocale();
  const [tab, setTab] = useState(1);
  // server timestamp first (matches the HTML), then the visitor's clock
  const [now, setNow] = useState(generatedAt);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const live = events.length > 0;
  const tabs = t.raw('card.tabs');
  const sampleNames = t.raw('events');

  const rowsByTab = useMemo(() => {
    if (!live) return null;
    const lang = intlLocale(locale);
    const timeFmt = new Intl.DateTimeFormat(lang, { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const dayFmt = new Intl.DateTimeFormat(lang, { timeZone: TZ, weekday: 'short' });
    return tabFilters(now).map((test, i) => pickRows(events, test, timeFmt, i === 3 ? dayFmt : null));
  }, [events, live, now, locale]);

  const rows = live ? rowsByTab[tab] : SAMPLE.map((r, i) => ({ ...r, key: `sample-${i}`, title: sampleNames[i] }));

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }} className="relative mx-auto w-full max-w-xl">
      <motion.span className="absolute -inset-6 -z-10 rounded-[3rem] bg-gold/20 blur-3xl" animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <div className="overflow-hidden rounded-[2rem] bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarClock className="size-4 text-gold-200" />
            {t('card.title')}
          </span>
          <span className="flex items-center gap-2">
            {live && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-up/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-up ring-1 ring-up/30">
                <motion.span className="size-1.5 rounded-full bg-up" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                {t('card.live')}
              </span>
            )}
            <span dir="ltr" className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/70 ring-1 ring-white/10">
              {t('card.timezone')}
            </span>
          </span>
        </div>

        <div className="mx-5 mt-4 grid grid-cols-4 gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10" role="tablist">
          {tabs.map((label, i) => (
            <button key={label} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={cn('relative whitespace-nowrap rounded-full px-1.5 py-2 text-[11px] font-semibold transition-colors sm:px-2 sm:text-xs', tab === i ? 'text-white' : 'text-white/55 hover:text-white')}>
              {tab === i && <motion.span layoutId="ec-tab" className="absolute inset-0 rounded-full bg-gold shadow-lg shadow-gold/30" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className={cn('mt-4 grid gap-2 border-b border-white/10 px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40', COLS)}>
          <span>{t('card.columns.time')}</span>
          <span>{t('card.columns.event')}</span>
          <span className="text-end">{t('card.columns.actual')}</span>
          <span className="text-end">{t('card.columns.forecast')}</span>
          <span className="hidden text-end sm:block">{t('card.columns.prior')}</span>
          <span className="hidden sm:block" />
        </div>

        <div className="min-h-[19rem] px-2 py-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
              {rows.length === 0 && <li className="grid h-[18rem] place-items-center px-6 text-center text-sm text-white/45">{t('card.empty')}</li>}
              {rows.map((r, i) => (
                <motion.li key={r.key} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.06, duration: 0.45, ease: EASE }} className={cn('grid items-center gap-2 rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.05]', COLS)}>
                  <span dir="ltr" className="text-xs font-semibold tabular-nums text-white/70 rtl:text-end">
                    {r.day && <span className="block text-[10px] font-medium text-white/40">{r.day}</span>}
                    {r.time}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cn('size-2 shrink-0 rounded-full', r.high ? 'bg-down shadow-[0_0_8px_2px_rgba(220,38,38,0.45)]' : 'bg-gold')} aria-hidden />
                    <span className="shrink-0 text-xs font-bold text-white">{r.currency}</span>
                    <span className="truncate text-xs text-white/65" title={r.title}>
                      {r.title}
                    </span>
                  </span>
                  <span dir="ltr" className={cn('text-end text-xs font-bold tabular-nums', r.beat > 0 ? 'text-up' : r.beat < 0 ? 'text-down' : 'text-white/45')}>
                    {r.actual}
                  </span>
                  <span dir="ltr" className="text-end text-xs tabular-nums text-white/65">
                    {r.forecast}
                  </span>
                  <span dir="ltr" className="hidden text-end text-xs tabular-nums text-white/45 sm:block">
                    {r.previous}
                  </span>
                  <NavLink href={LIVE_ACCOUNT_HREF} className="hidden justify-center rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-gold-200 ring-1 ring-white/10 transition-colors hover:bg-gold hover:text-white hover:ring-gold sm:inline-flex">
                    {t('card.tradeCta')}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ value, label }) {
  const m = String(value).match(/^([\d,]+)(\+?)$/);
  return (
    <div>
      <div className="whitespace-nowrap text-2xl font-bold tabular-nums text-white md:text-3xl">{m ? <CountUp value={Number(m[1].replace(/,/g, ''))} suffix={m[2]} /> : <span className="heading-accent">{value}</span>}</div>
      <div className="mt-1 text-xs text-white/50 md:text-sm">{label}</div>
    </div>
  );
}

export default function CalendarHero({ events, generatedAt }) {
  const t = useTranslations('economicCalendarPage');
  const values = t.raw('hero.statValues');
  const labels = t.raw('hero.stats');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.news'), href: NEWS_PATH }, { label: t('breadcrumb.current') }]} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
          <div className="text-center lg:text-start">
            <motion.span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-200 ring-1 ring-white/10 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="size-1.5 rounded-full bg-gold" />
              {t('hero.badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              {t('hero.headingPrefix')} <span className="heading-accent">{t('hero.headingAccent1')}</span>
              <br className="hidden sm:block" /> <span className="heading-accent">{t('hero.headingAccent2')}</span> {t('hero.headingSuffix')}
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('hero.sub')}
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <Button size="lg" variant="gold" onClick={() => jumpTo('calendar')}>
                {t('hero.viewCalendarCta')} <ArrowRight className="rtl:-scale-x-100" />
              </Button>
              <Button size="lg" variant="outlineLight" as={NavLink} href={PLATFORM_LINKS.gtcgo}>
                <BellRing /> {t('hero.alertsCta')}
              </Button>
            </motion.div>
            <motion.div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6 lg:mx-0" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.45 } } }}>
              {values.map((v, i) => (
                <motion.div key={labels[i]} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <Stat value={v} label={labels[i]} />
                </motion.div>
              ))}
            </motion.div>
          </div>
          <CalendarCard events={events} generatedAt={generatedAt} />
        </div>
      </div>
    </section>
  );
}
