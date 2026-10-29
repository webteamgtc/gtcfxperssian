'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Store, CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { EventImage } from './EventImage';
import { intlLocale } from '@/i18n/locales';

/** Main photo + thumbnails strip. Falls back to the cover / branded poster when there is no gallery. */
function Gallery({ event, t }) {
  const photos = event.gallery?.length ? event.gallery : [null];
  const [i, setI] = useState(0);
  const go = (d) => setI((x) => (x + d + photos.length) % photos.length);
  const current = photos[i] ? { ...event, cover: photos[i] } : event;
  return (
    <div className="min-w-0">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-brand-950 shadow-xl shadow-brand/15">
        <AnimatePresence mode="wait">
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <EventImage event={current} sizes="large" />
          </motion.div>
        </AnimatePresence>
        {photos.length > 1 && (
          <div className="absolute bottom-3 end-3 flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label={t('prev')} className="grid size-10 place-items-center rounded-full bg-white/90 text-brand shadow-lg backdrop-blur transition-colors hover:bg-white">
              <ChevronLeft className="size-5 rtl:-scale-x-100" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t('next')} className="grid size-10 place-items-center rounded-full bg-white/90 text-brand shadow-lg backdrop-blur transition-colors hover:bg-white">
              <ChevronRight className="size-5 rtl:-scale-x-100" />
            </button>
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {photos.map((p, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={t('photo', { n: k + 1 })} className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition-all md:h-[4.5rem] md:w-28', k === i ? 'ring-brand' : 'opacity-70 ring-transparent hover:opacity-100')}>
              <EventImage event={{ ...event, cover: p }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Day + month badge on the timeline rail. */
function DateBadge({ date, locale, active }) {
  const d = new Date(`${date}T00:00:00Z`);
  locale = intlLocale(locale);
  const day = new Intl.DateTimeFormat(locale, { day: '2-digit', timeZone: 'UTC' }).format(d);
  const mon = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(d);
  return (
    <span className={cn('relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl text-center ring-4 ring-white transition-colors duration-500', active ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-brand-50 text-brand')}>
      <span className="leading-none">
        <span className="block text-lg font-extrabold">{day}</span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide opacity-75">{mon}</span>
      </span>
    </span>
  );
}

/** White section: past events by year, as a timeline of expandable rows. */
export function Archive({ archive, first = false }) {
  const t = useTranslations('eventsPage.archive');
  const locale = useLocale();
  const [year, setYear] = useState(archive[0]?.year);
  const [open, setOpen] = useState(archive[0]?.events[0]?.id ?? null);
  const events = archive.find((y) => y.year === year)?.events ?? [];

  const pickYear = (y) => {
    setYear(y);
    setOpen(archive.find((a) => a.year === y)?.events[0]?.id ?? null);
  };

  return (
    <section id="archive" className="relative scroll-mt-24 overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-20 size-[460px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro instant={first} title={t('title')} description={t('description')} />

        {archive.length > 0 && (
          <div className="mt-10 flex justify-center">
            <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-brand/10 bg-[#f3f5fb] p-1" role="tablist">
              {archive.map(({ year: y, events: list }) => (
                <button key={y} type="button" role="tab" aria-selected={y === year} onClick={() => pickYear(y)} className={cn('relative shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors', y === year ? 'text-white' : 'text-ink/60 hover:text-brand')}>
                  {y === year && <motion.span layoutId="year-pill" className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="relative">
                    {y} <span className={cn('ms-1 text-[11px]', y === year ? 'text-white/60' : 'text-ink/35')}>{list.length}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative mx-auto mt-10 max-w-6xl md:mt-12">
          {/* timeline rail */}
          <span className="absolute bottom-6 start-7 top-6 hidden w-px bg-gradient-to-b from-brand/30 via-brand/15 to-transparent md:block" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.ul key={year} className="grid gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }}>
              {events.length === 0 && <li className="rounded-2xl bg-[#f6f7fb] p-8 text-center text-sm text-ink/50">{t('empty')}</li>}
              {events.map((e) => {
                const on = open === e.id;
                return (
                  <li key={e.id} className="md:flex md:gap-5">
                    <div className="hidden pt-5 md:block">
                      <DateBadge date={e.startDate} locale={locale} active={on} />
                    </div>
                    <div className={cn('min-w-0 flex-1 overflow-hidden rounded-[1.75rem] border transition-all duration-500', on ? 'border-brand/20 bg-white shadow-2xl shadow-brand/10' : 'border-brand/10 bg-[#f8f9fc] hover:border-brand/20 hover:bg-white')}>
                      <button type="button" onClick={() => setOpen(on ? null : e.id)} aria-expanded={on} className="grid w-full items-center gap-4 p-4 text-start sm:grid-cols-[8rem_1fr] md:p-5 lg:grid-cols-[8rem_1fr_14rem_auto]">
                        <span className="block aspect-[4/3] overflow-hidden rounded-xl">
                          <EventImage event={e} />
                        </span>
                        <span className="min-w-0">
                          <span className="heading-card block">{e.title}</span>
                          <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-ink/60">{e.summary}</span>
                          <span className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-ink/55">
                            {e.booth && (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
                                <Store className="size-3.5" />
                                {t('booth', { booth: e.booth })}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="size-3.5" />
                              {e.dateLabel}
                            </span>
                          </span>
                        </span>
                        <span className="hidden items-start gap-2 border-s border-brand/10 ps-5 text-sm font-medium leading-snug text-brand lg:flex">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-gold-700" />
                          {e.place}
                        </span>
                        <span className={cn('hidden size-10 place-items-center rounded-full transition-all duration-500 lg:grid', on ? 'rotate-180 bg-brand text-white' : 'bg-brand-50 text-brand')}>
                          <ChevronDown className="size-4" />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                            <div className="grid gap-8 border-t border-brand/10 p-4 md:p-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
                              <Gallery event={e} t={t} />
                              <div className="min-w-0">
                                <h3 className="heading-title">{e.title}</h3>
                                <p className="mt-2 flex items-start gap-2 text-sm text-ink/55 lg:hidden">
                                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold-700" />
                                  {e.place}
                                </p>
                                <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink/65">
                                  {(e.body.length ? e.body : [e.summary]).map((p, k) => (
                                    <p key={k}>{p}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
