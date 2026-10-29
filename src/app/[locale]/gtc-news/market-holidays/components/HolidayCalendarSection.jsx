'use client';
/**
 * Holiday hours & notices (gray): month calendar with closure / early-close markers and month totals,
 * beside the upcoming notices grouped by date (tap a highlighted day to filter).
 * Events come from the Strapi holiday schedule uploads (src/lib/marketHolidays.js via page.js).
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, CalendarX, ChevronLeft, ChevronRight, Clock3, X } from 'lucide-react';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const pad = (n) => String(n).padStart(2, '0');
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const ym = (s) => s.slice(0, 7);

function groupByDate(events) {
  const map = new Map();
  for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e]);
  return [...map.entries()];
}

function StatusBadge({ e }) {
  const early = e.status === 'early';
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1', early ? 'bg-gold/10 text-gold-700 ring-gold/25' : 'bg-down/10 text-down ring-down/20')}>
      {early ? <Clock3 className="size-3" /> : <X className="size-3" />}
      {e.label}
    </span>
  );
}

const fmtDate = (date, lang, o) => new Intl.DateTimeFormat(lang, { timeZone: 'UTC', ...o }).format(new Date(`${date}T00:00:00Z`));
const longDate = (date, lang) => fmtDate(date, lang, { weekday: 'short', month: 'short', day: 'numeric' });

function DateGroup({ date, events, lang, i, active, onView, t }) {
  const f = (o) => fmtDate(date, lang, o);
  const early = events.every((e) => e.status === 'early');
  return (
    <motion.li layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }} className="flex gap-4">
      <span className={cn('grid h-16 w-14 shrink-0 place-items-center rounded-2xl text-center leading-none shadow-lg', early ? 'bg-gold text-white shadow-gold/25' : 'bg-brand text-white shadow-brand/25')}>
        <span>
          <span className="block text-xl font-extrabold">{f({ day: '2-digit' })}</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase opacity-80">{f({ month: 'short' })}</span>
        </span>
      </span>
      <div className={cn('min-w-0 flex-1 rounded-2xl p-3 ring-1 transition-colors', active ? 'bg-brand-50/60 ring-brand/25' : 'bg-[#f8f9fc] ring-brand/[0.07]')}>
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-semibold text-ink/50">
            {f({ weekday: 'long' })} · {t('noticeCount', { count: events.length })}
          </span>
          {onView && (
            <button type="button" onClick={() => onView(date)} className="text-xs font-semibold text-brand hover:text-gold-700 hover:underline">
              {t('view')}
            </button>
          )}
        </div>
        <ul className="mt-2 space-y-1.5">
          {events.map((e) => (
            <li key={`${e.market}-${e.label}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-brand/[0.06]">
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-ink">{e.name}</span>
                {e.group !== e.name && <span className="block truncate text-[11px] text-ink/45">{e.group}</span>}
              </span>
              <StatusBadge e={e} />
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}

export default function HolidayCalendarSection({ events = [], today: serverToday }) {
  const t = useTranslations('marketHolidaysPage.holidayCalendar');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en-GB' : locale;
  const months = t.raw('months');
  const dayLabels = t.raw('dayLabels');

  const [today, setToday] = useState(serverToday);
  useEffect(() => setToday(localToday()), []);

  const upcoming = useMemo(() => events.filter((e) => e.date >= today), [events, today]);
  // open on the month of the next holiday, otherwise the current month
  const start = upcoming[0]?.date ?? today;
  const [view, setView] = useState({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1, dir: 0 });
  const [selected, setSelected] = useState(null);

  const byDate = useMemo(() => new Map(groupByDate(events)), [events]);
  const monthKey = `${view.y}-${pad(view.m + 1)}`;
  const monthEvents = useMemo(() => events.filter((e) => ym(e.date) === monthKey), [events, monthKey]);
  const monthGroups = useMemo(() => groupByDate(monthEvents), [monthEvents]);
  const stats = { dates: monthGroups.length, notices: monthEvents.length, earlyClose: monthEvents.filter((e) => e.status === 'early').length };
  // month spotlight: the month's next dates (or all of them when the month is over), max 4
  const spotlight = useMemo(() => {
    const ahead = monthGroups.filter(([d]) => d >= today);
    return (ahead.length ? ahead : monthGroups).slice(0, 4);
  }, [monthGroups, today]);
  const nextUp = upcoming[0] ?? null;

  const list = useMemo(() => groupByDate(selected ? events.filter((e) => e.date === selected) : upcoming), [events, selected, upcoming]);

  const go = (dir) => {
    setSelected(null);
    setView(({ y, m }) => {
      const n = m + dir;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12, dir };
    });
  };
  const toggle = (date) => setSelected((s) => (s === date ? null : date));
  /** Show `date`'s month on the calendar and select it. */
  const jumpTo = (date) => {
    const y = Number(date.slice(0, 4));
    const m = Number(date.slice(5, 7)) - 1;
    setView((v) => (v.y === y && v.m === m ? v : { y, m, dir: y * 12 + m > v.y * 12 + v.m ? 1 : -1 }));
    setSelected(date);
  };

  const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <section id="holiday-hours" className="relative scroll-mt-20 overflow-clip bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <span className="absolute -end-40 top-24 size-[420px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <Reveal y={16} className="mx-auto max-w-2xl text-center">
          <h2 className="heading-section">
            <AccentTitle text={t('heading')} words={3} />
          </h2>
          <p className="mx-auto mt-5 text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('sub')}</p>
        </Reveal>

        <div className="mt-10 grid items-start gap-5 md:mt-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6">
          {/* calendar */}
          <Reveal y={24} className="rounded-[1.75rem] bg-white p-5 shadow-2xl shadow-brand/10 ring-1 ring-brand/10 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => go(-1)} aria-label={t('prevMonthAria')} className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand transition-colors hover:bg-brand hover:text-white">
                <ChevronLeft className="size-5 rtl:-scale-x-100" />
              </button>
              <div className="relative h-7 flex-1 overflow-hidden text-center">
                <AnimatePresence mode="popLayout" initial={false} custom={view.dir}>
                  <motion.span key={monthKey} custom={view.dir} initial={{ x: view.dir * 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: view.dir * -40, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 text-lg font-bold text-ink">
                    {months[view.m]} {view.y}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button type="button" onClick={() => go(1)} aria-label={t('nextMonthAria')} className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand transition-colors hover:bg-brand hover:text-white">
                <ChevronRight className="size-5 rtl:-scale-x-100" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink/40">
              {dayLabels.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={monthKey} initial={{ opacity: 0, x: view.dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: view.dir * -24 }} transition={{ duration: 0.28, ease: EASE }} className="mt-2 grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <span key={`e${i}`} />;
                  const date = `${monthKey}-${pad(day)}`;
                  const evs = byDate.get(date);
                  const isToday = date === today;
                  const isSel = date === selected;
                  const early = evs?.every((e) => e.status === 'early');
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => toggle(date)}
                      aria-pressed={isSel}
                      className={cn(
                        'relative grid aspect-square place-items-center rounded-xl text-sm font-semibold transition-all duration-300 sm:aspect-auto sm:h-12',
                        isSel ? 'bg-brand text-white shadow-lg shadow-brand/30' : evs ? 'bg-brand-50/70 text-ink hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-md' : 'text-ink/60 hover:bg-brand-50/50 hover:text-brand',
                        isToday && !isSel && 'ring-2 ring-gold ring-offset-1'
                      )}
                    >
                      {day}
                      {evs && (
                        <motion.span className={cn('absolute bottom-1.5 size-1.5 rounded-full', isSel ? 'bg-white' : early ? 'bg-gold' : 'bg-down')} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: (i % 7) * 0.15 }} />
                      )}
                      {evs && evs.length > 1 && <span className={cn('absolute end-1 top-1 rounded-full px-1 text-[9px] font-bold leading-4', isSel ? 'bg-white/20 text-white' : 'bg-brand text-white')}>{evs.length}</span>}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink/55">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-md ring-2 ring-gold" />
                {t('legend.today')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-down" />
                {t('closed')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-gold" />
                {t('earlyClose')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-md bg-brand" />
                {t('legend.selected')}
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-50 to-[#f6f0ea] p-4 ring-1 ring-brand/10">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">{t('thisMonth')}</div>
              <div className="mt-0.5 text-sm font-bold text-ink">
                {months[view.m]} {view.y}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['dates', 'notices', 'earlyClose'].map((k) => (
                  <div key={k} className="rounded-xl bg-white px-2 py-3 text-center ring-1 ring-brand/[0.07]">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div key={`${monthKey}-${stats[k]}`} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className={cn('text-2xl font-bold tabular-nums', k === 'earlyClose' ? 'text-gold-700' : 'text-brand')}>
                        {stats[k]}
                      </motion.div>
                    </AnimatePresence>
                    <div className="mt-0.5 text-[11px] text-ink/50">{t(`stats.${k}`)}</div>
                  </div>
                ))}
              </div>

              {/* month spotlight */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={monthKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-3">
                  {spotlight.length ? (
                    <ul className="space-y-2">
                      {spotlight.map(([date, evs]) => (
                        <li key={date}>
                          <button type="button" onClick={() => toggle(date)} className={cn('w-full rounded-xl px-3 py-2.5 text-start ring-1 transition-all duration-300', selected === date ? 'bg-brand text-white shadow-lg shadow-brand/25 ring-brand' : 'bg-white ring-brand/[0.07] hover:-translate-y-0.5 hover:ring-brand/25 hover:shadow-md')}>
                            <span className="flex items-center justify-between gap-2">
                              <span className={cn('text-xs font-bold', selected === date ? 'text-white' : 'text-brand')}>{longDate(date, lang)}</span>
                              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', selected === date ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand')}>{evs.length}</span>
                            </span>
                            <span className={cn('mt-1 line-clamp-1 block text-xs', selected === date ? 'text-white/75' : 'text-ink/55')}>
                              {evs
                                .slice(0, 3)
                                .map((e) => e.name)
                                .join(' · ')}
                              {evs.length > 3 && ` · +${evs.length - 3} ${t('more')}`}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-xl border border-dashed border-brand/15 bg-white/70 px-4 py-5 text-center">
                      <p className="text-sm font-medium text-ink/60">{t('noMonthEvents')}</p>
                      {nextUp && (
                        <button type="button" onClick={() => jumpTo(nextUp.date)} className="mt-2 text-xs font-semibold text-brand hover:text-gold-700 hover:underline">
                          {t('nextUp')}: {longDate(nextUp.date, lang)} — {nextUp.name}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          {/* upcoming list (or the selected date) */}
          <Reveal y={24} delay={0.1} className="flex flex-col rounded-[1.75rem] bg-white p-5 shadow-2xl shadow-brand/10 ring-1 ring-brand/10 md:p-6 lg:max-h-[52rem]">
            <div className="flex items-start justify-between gap-3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={selected ?? 'upcoming'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                  <h3 className="heading-card flex items-center gap-2">
                    {selected ? <CalendarDays className="size-5 text-brand" /> : <CalendarX className="size-5 text-gold-700" />}
                    {selected ? longDate(selected, lang) : t('upcomingHeading')}
                  </h3>
                  <p className="mt-1 text-xs text-ink/50">{selected ? t('selectedDateHint') : t('hint')}</p>
                </motion.div>
              </AnimatePresence>
              {selected ? (
                <button type="button" onClick={() => setSelected(null)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
                  <X className="size-3.5" />
                  {t('showAll')}
                </button>
              ) : (
                <span className="grid h-8 min-w-8 place-items-center rounded-full bg-brand px-2 text-sm font-bold text-white shadow-md shadow-brand/25">{upcoming.length}</span>
              )}
            </div>
            <div className="-me-2 mt-5 min-h-[18rem] flex-1 overflow-y-auto pe-2">
              {list.length === 0 ? (
                <div className="grid h-full min-h-[18rem] place-items-center rounded-2xl bg-[#f8f9fc] p-8 text-center">
                  <div>
                    <motion.span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-brand shadow-lg shadow-brand/10" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                      <CalendarDays className="size-6" />
                    </motion.span>
                    <p className="mt-4 text-sm text-ink/50">{selected ? t('noEventsOnDate') : t('noUpcoming')}</p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {list.map(([date, evs], i) => (
                      <DateGroup key={date} date={date} events={evs} lang={lang} i={i} t={t} active={date === selected} onView={selected ? null : jumpTo} />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
