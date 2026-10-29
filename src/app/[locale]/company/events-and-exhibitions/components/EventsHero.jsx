'use client';
/**
 * Events hero — "event pass": the selected upcoming event as a holographic ticket,
 * mini passes to switch event, and the registration form for that event.
 */
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { TiltCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { EventImage } from './EventImage';
import CommonLeadForm from '@/components/shared/CommonLeadForm';
import { intlLocale } from '@/i18n/locales';

/* ---------------- shared helpers ---------------- */
const dl = (locale) => intlLocale(locale);
const fmt = (date, locale, opts) => new Intl.DateTimeFormat(dl(locale), { timeZone: 'UTC', ...opts }).format(new Date(`${date}T00:00:00Z`));

function useCountdown(start, end) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Date.parse(`${start}T00:00:00Z`);
  const e = Date.parse(`${end || start}T23:59:59Z`);
  const live = now !== null && now >= s && now <= e;
  const left = now === null ? null : Math.max(0, s - now);
  const v = (ms, mod) => (left === null ? null : Math.floor(left / ms) % mod);
  return { ready: now !== null, live, days: left === null ? null : Math.floor(left / 86400000), hours: v(3600000, 24), minutes: v(60000, 60), seconds: v(1000, 60) };
}
const pad = (n) => (n === null ? '--' : String(n).padStart(2, '0'));

function Shell({ children, tb, ev }) {
  return (
    <section className="is-dark relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <HeroBackdrop />
      <AnimatePresence mode="wait">
        {ev?.cover?.url && (
          <motion.div key={ev.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} aria-hidden>
            <EventImage event={ev} sizes="large" priority className="opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/50" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />
        {children}
      </div>
    </section>
  );
}

/** "Meet our team" card for the selected event, with the shared lead form (WhatsApp-verified, Salesforce lead). */
function FormColumn({ ev }) {
  const t = useTranslations('eventsPage.form');
  if (!ev?.registrationOpen) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: EASE }} className="lg:sticky lg:top-28">
      {/* no overflow-hidden on the card itself, so the country list can open past its edge */}
      <div className="rounded-[1.75rem] border border-white/10 bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.6)]">
        <div className="relative overflow-hidden rounded-t-[1.75rem] bg-gradient-to-r from-brand via-brand-800 to-brand-950 px-5 py-4 text-white md:px-7">
          <span className="absolute -end-10 -top-10 size-32 rounded-full bg-gold/30 blur-2xl" aria-hidden />
          <h2 className="heading-card is-dark relative">{t('title')}</h2>
          <AnimatePresence mode="wait">
            <motion.p key={ev.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mt-1 text-xs text-white/75 md:text-sm">
              {t('subtitle', { event: ev.shortTitle || ev.title || '' })}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="p-5 md:p-6">
          {/* key: a new event starts with a fresh form */}
          <CommonLeadForm key={ev.id} defaultCampaign={ev.slug || ev.id} />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- the ticket ---------------- */
function Ticket({ ev, t, locale }) {
  const c = useCountdown(ev.startDate, ev.endDate);
  const d1 = fmt(ev.startDate, locale, { day: '2-digit' });
  const d2 = ev.endDate !== ev.startDate ? fmt(ev.endDate, locale, { day: '2-digit' }) : null;
  const mon = fmt(ev.startDate, locale, { month: 'short', year: 'numeric' });
  return (
    <TiltCard max={6} className="rounded-[1.75rem]">
      <div dir="ltr" className="relative flex overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-500 via-brand-800 to-brand-950 shadow-2xl shadow-black/40 ring-1 ring-white/15">
        {/* holo sweep */}
        <motion.span className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" animate={{ left: ['-40%', '140%'] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }} aria-hidden />
        <span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-[80px]" aria-hidden />
        {/* stub: date */}
        <div className="relative flex w-28 shrink-0 flex-col items-center justify-center bg-white/[0.06] px-3 py-6 text-center sm:w-36">
          <span className="text-4xl font-black leading-none text-white sm:text-5xl">{d1}</span>
          {d2 && <span className="mt-1 text-xl font-bold leading-none text-white/55 sm:text-2xl">–{d2}</span>}
          <span className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-200">{mon}</span>
        </div>
        {/* perforation */}
        <div className="relative w-0 border-s-2 border-dashed border-white/20">
          <span className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 rounded-full bg-ink" />
          <span className="absolute -bottom-3 left-1/2 size-6 -translate-x-1/2 rounded-full bg-ink" />
        </div>
        {/* body */}
        <div className="relative min-w-0 flex-1 p-5 text-start sm:p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{ev.country || ev.city}</div>
              <div className="mt-1 break-words text-xl font-extrabold leading-tight text-white sm:text-3xl">{ev.city}</div>
              {ev.venue && <div className="mt-0.5 truncate text-sm text-white/55">{ev.venue}</div>}
            </div>
            {ev.role && <span className="shrink-0 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-gold/30 max-sm:hidden">{ev.role}</span>}
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{ev.booth ? t('booth', { booth: ev.booth }) : ev.shortTitle}</div>
              <div dir="ltr" className="mt-1 font-mono text-lg font-bold text-gold-200">
                {c.live ? t('countdown.live') : `${pad(c.days)}d ${pad(c.hours)}h ${pad(c.minutes)}m ${pad(c.seconds)}s`}
              </div>
            </div>
            {/* barcode */}
            <div className="flex h-10 items-end gap-[3px]" aria-hidden>
              {Array.from({ length: 22 }, (_, i) => (
                <span key={i} className="w-[2px] bg-white/60" style={{ height: `${40 + ((i * 37) % 60)}%`, width: i % 4 === 0 ? 3 : 2 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

export function EventsHero({ events, index, setIndex }) {
  const t = useTranslations('eventsPage.hero');
  const tb = useTranslations('eventsPage.breadcrumb');
  const locale = useLocale();
  const ev = events[index];
  if (!ev)
    return (
      <Shell tb={tb}>
        <div className="mt-8 max-w-2xl text-center lg:text-start">
          <h1 className="heading-page">{tb('current')}</h1>
          <p className="mt-6 text-white/65">{t('empty')}</p>
        </div>
      </Shell>
    );
  return (
    <Shell tb={tb} ev={ev}>
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={ev.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease: EASE }} className="text-center lg:text-start">
              <h1 className="heading-page">{ev.title}</h1>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0">{ev.summary}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 [perspective:1200px]">
            <AnimatePresence mode="wait">
              <motion.div key={ev.id} initial={{ rotateX: -70, opacity: 0, y: 30 }} animate={{ rotateX: 0, opacity: 1, y: 0 }} exit={{ rotateX: 60, opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: EASE }} style={{ transformOrigin: 'top center' }}>
                <Ticket ev={ev} t={t} locale={locale} />
              </motion.div>
            </AnimatePresence>
          </div>
          {/* other passes */}
          {events.length > 1 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="heading-small">{t('more')}</span>
                <a href="#archive" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gold-200 hover:text-white">
                  {t('viewAll')}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
                </a>
              </div>
              <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                {events.map((e, i) => (
                  <button key={e.id} type="button" onClick={() => setIndex(i)} aria-pressed={i === index} className={cn('flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-start transition-all duration-300', i === index ? 'border-gold/60 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25')}>
                    <span className={cn('grid size-11 place-items-center rounded-xl text-center leading-none', i === index ? 'bg-gold text-white' : 'bg-white/10 text-white/80')}>
                      <span>
                        <span className="block text-base font-extrabold">{fmt(e.startDate, locale, { day: '2-digit' })}</span>
                        <span className="block text-[9px] font-semibold uppercase">{fmt(e.startDate, locale, { month: 'short' })}</span>
                      </span>
                    </span>
                    <span className="max-w-[11rem]">
                      <span className="block truncate text-sm font-bold text-white">{e.shortTitle}</span>
                      <span className="block truncate text-xs text-white/50">{e.city}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <FormColumn ev={ev} />
      </div>
    </Shell>
  );
}
