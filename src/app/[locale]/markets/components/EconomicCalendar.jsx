'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, CalendarClock, CalendarHeart, Clock3 } from 'lucide-react';
import { TRADINGVIEW_LOCALE } from '@/config/markets';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';
import { intlLocale } from '@/i18n/locales';

/** TradingView economic calendar embed (no API key; renders into an iframe). */
const TV_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
const tvConfig = (locale, theme) => ({ colorTheme: theme, isTransparent: true, width: '100%', height: '100%', locale, importanceFilter: '0,1', countryFilter: 'us,eu,gb,jp,cn,au,ca,ch,de,nz' });

/**
 * Loads the TradingView widget only when the panel scrolls near the viewport (keeps the page fast:
 * no third-party script on first paint). Fixed height, so nothing shifts when it appears.
 */
export function TradingViewWidget({ locale, loadingLabel, theme = 'dark' }) {
  const light = theme === 'light';
  const box = useRef(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    const el = box.current;
    if (!el || !near) return;
    el.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';
    const s = document.createElement('script');
    s.src = TV_SRC;
    s.async = true;
    s.type = 'text/javascript';
    s.innerHTML = JSON.stringify(tvConfig(locale, theme));
    el.appendChild(s);
    const mo = new MutationObserver(() => {
      const f = el.querySelector('iframe');
      if (f) f.addEventListener('load', () => setReady(true), { once: true });
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      el.innerHTML = '';
    };
  }, [locale, near, theme]);

  return (
    <div className="relative h-[520px] md:h-[600px]">
      {!ready && (
        <div className="absolute inset-0 flex flex-col gap-3 p-5" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={cn('h-11 animate-pulse rounded-xl', light ? 'bg-ink/[0.05]' : 'bg-white/[0.06]')} style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      )}
      {!ready && <p className={cn('absolute inset-x-0 bottom-5 text-center text-xs', light ? 'text-ink/40' : 'text-white/40')}>{loadingLabel}</p>}
      <div ref={box} className={cn('tradingview-widget-container size-full transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  );
}

const CARD_ICONS = { calendar: CalendarClock, hours: Clock3, holidays: CalendarHeart };

const LiveDot = () => (
  <span className="relative flex size-2">
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
    <span className="relative inline-flex size-2 rounded-full bg-up" />
  </span>
);

function CalendarShell({ children, title, description }) {
  return (
    <section className="is-dark relative overflow-hidden bg-ink py-14 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-50" aria-hidden />
      <span className="absolute -end-40 top-20 size-[420px] rounded-full bg-brand/30 blur-[120px]" aria-hidden />
      <BandLine />
      <div className="container-x relative">
        <SectionIntro dark layout="split" title={title} description={description} />
        {children}
      </div>
    </section>
  );
}

const SESSIONS = [
  { id: 'sydney', tz: 'Australia/Sydney', open: 7, close: 16 },
  { id: 'tokyo', tz: 'Asia/Tokyo', open: 9, close: 18 },
  { id: 'london', tz: 'Europe/London', open: 8, close: 17 },
  { id: 'newYork', tz: 'America/New_York', open: 8, close: 17 }
];

/** Local wall-clock parts for a time zone. */
function zoned(now, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', minute: 'numeric', weekday: 'short', hourCycle: 'h23' }).formatToParts(now).map((x) => [x.type, x.value]));
  return { h: Number(p.hour), m: Number(p.minute), wd: p.weekday };
}

function SessionClock({ s, now }) {
  const t = useTranslations('marketsPage.calendar.sessions');
  const locale = useLocale();
  if (!now) return <div className="h-[148px] animate-pulse rounded-3xl bg-white/[0.05]" />;
  const { h, m, wd } = zoned(now, s.tz);
  const mins = h * 60 + m;
  const weekend = wd === 'Sat' || wd === 'Sun';
  const open = !weekend && mins >= s.open * 60 && mins < s.close * 60;
  // minutes until the next open/close (weekend → Monday's open; Friday after close → Monday)
  let left;
  if (open) left = s.close * 60 - mins;
  else {
    const days = wd === 'Sat' ? 2 : wd === 'Sun' ? 1 : mins < s.open * 60 ? 0 : wd === 'Fri' ? 3 : 1;
    left = days * 1440 + s.open * 60 - mins;
  }
  const d = Math.floor(left / 1440);
  const time = `${d ? `${d}d ` : ''}${Math.floor((left % 1440) / 60)}h ${String(left % 60).padStart(2, '0')}m`;
  const progress = open ? ((mins - s.open * 60) / ((s.close - s.open) * 60)) * 100 : 0;
  const clock = new Intl.DateTimeFormat(intlLocale(locale), { timeZone: s.tz, hour: '2-digit', minute: '2-digit' }).format(now);
  return (
    <div className={cn('rounded-3xl border p-5 transition-colors', open ? 'border-up/40 bg-up/[0.06]' : 'border-white/10 bg-white/[0.04]')}>
      <div className="flex items-center justify-between">
        <span className="heading-small">{t(`cities.${s.id}`)}</span>
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold', open ? 'bg-up/15 text-green-300' : 'bg-white/10 text-white/55')}>
          {open && <LiveDot />}
          {open ? t('open') : t('closed')}
        </span>
      </div>
      <p dir="ltr" className="mt-3 text-3xl font-bold tabular-nums tracking-tight rtl:text-end">
        {clock}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-up to-green-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2.5 text-xs text-white/50">{open ? t('closesIn', { time }) : t('opensIn', { time })}</p>
    </div>
  );
}

/** Economic Calendar: live clocks for the four forex sessions (open/closed, time left), then the economic calendar and link cards. */
export function EconomicCalendar() {
  const t = useTranslations('marketsPage');
  const locale = TRADINGVIEW_LOCALE[useLocale()] ?? 'en';
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  const cards = t.raw('calendar.cards');
  return (
    <CalendarShell title={t('calendar.title')} description={t('calendar.description')}>
      <div className="mt-10 md:mt-14">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="heading-card">{t('calendar.sessions.title')}</h3>
          <p className="text-xs text-white/45">{t('calendar.sessions.note')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SESSIONS.map((s) => (
            <SessionClock key={s.id} s={s} now={now} />
          ))}
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur">
        <TradingViewWidget locale={locale} loadingLabel={t('calendar.loading')} />
        <p className="border-t border-white/10 px-5 py-3 text-end text-[11px] text-white/40">
          <a href="https://www.tradingview.com/" target="_blank" rel="noopener nofollow" className="hover:text-white/70">
            {t('calendar.provider')}
          </a>
        </p>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = CARD_ICONS[c.id] ?? CalendarClock;
          return (
            <NavLink key={c.id} href={c.href} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors hover:border-gold/40">
              <Icon className="size-5 shrink-0 text-gold-200" />
              <span className="flex-1 text-sm font-semibold">{c.link}</span>
              <ArrowRight className="size-4 text-white/50 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
            </NavLink>
          );
        })}
      </div>
    </CalendarShell>
  );
}
