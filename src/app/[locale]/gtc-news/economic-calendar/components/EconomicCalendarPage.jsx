'use client';
/**
 * /gtc-news/economic-calendar
 * UI copy: messages/<locale>/gtcNewsPage.json → `economicCalendarPage`; hero card events: src/lib/economicCalendar.js (via page.js)
 * Rhythm: dark hero (live calendar card) → gray (TradingView calendar + resource cards) → white (FAQs) → navy CTA → dark footer.
 */
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, CalendarClock, CalendarX, Clock3 } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import FaqAccordion from '@/components/shared/FaqAccordion';
import NavLink from '@/components/shared/nav/NavLink';
import RingCard from '@/components/shared/RingCard';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { EASE, Reveal, ScrollProgress, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import { TRADINGVIEW_LOCALE } from '@/config/markets';
import { PORTAL, LIVE_ACCOUNT_HREF } from '@/config/menu';
import { NEWS_PATH } from '@/lib/news-path';
import { TradingViewWidget } from '@/app/[locale]/markets/components/EconomicCalendar';
import CalendarHero, { jumpTo } from './CalendarHero';

/* ------------------------------------------------------------ calendar + resources */

/* Small looping illustrations for the resource cards (decorative; play while in view). */

const inViewLoop = { initial: 'idle', whileInView: 'run', viewport: { once: false, amount: 0.4 } };

/** Month grid: event days light up one after another, today pulses. */
function CalendarVisual({ dark }) {
  const events = { 3: 'high', 8: 'mid', 11: 'high', 16: 'mid', 19: 'high', 24: 'mid' };
  return (
    <motion.div {...inViewLoop} className="grid w-full max-w-[13rem] grid-cols-7 gap-1.5">
      {Array.from({ length: 28 }, (_, i) => {
        const kind = events[i];
        const today = i === 11;
        return (
          <motion.span
            key={i}
            variants={{ idle: { opacity: 0, scale: 0.6 }, run: { opacity: 1, scale: 1, transition: { delay: i * 0.025, duration: 0.35 } } }}
            className={cn('relative grid aspect-square place-items-center rounded-md', today ? 'bg-gold shadow-lg shadow-gold/40' : kind ? (dark ? 'bg-white/15' : 'bg-brand/15') : dark ? 'bg-white/[0.06]' : 'bg-brand/[0.06]')}
          >
            {kind && !today && (
              <motion.span
                className={cn('size-1.5 rounded-full', kind === 'high' ? 'bg-down' : 'bg-gold')}
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, delay: i * 0.12, repeat: Infinity }}
              />
            )}
            {today && <motion.span className="absolute inset-0 rounded-md ring-2 ring-gold" animate={{ scale: [1, 1.35], opacity: [0.8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

/** Four session tracks with a "now" line sweeping across them. */
function HoursVisual({ dark }) {
  const sessions = [
    [4, 46],
    [14, 58],
    [36, 82],
    [52, 96]
  ];
  return (
    <motion.div {...inViewLoop} className="relative w-full max-w-[14rem] space-y-2.5">
      {sessions.map(([from, to], i) => (
        <div key={i} className={cn('relative h-2.5 rounded-full', dark ? 'bg-white/10' : 'bg-brand/[0.08]')}>
          <motion.span
            className={cn('absolute inset-y-0 rounded-full', i % 2 ? 'bg-gradient-to-r from-gold to-gold-200' : dark ? 'bg-gradient-to-r from-white/70 to-white/40' : 'bg-gradient-to-r from-brand to-brand-300')}
            style={{ left: `${from}%`, width: `${to - from}%`, originX: 0 }}
            variants={{ idle: { scaleX: 0 }, run: { scaleX: 1, transition: { delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE } } }}
          />
        </div>
      ))}
      <motion.span className="absolute -inset-y-2 w-px bg-up shadow-[0_0_10px_2px_rgba(22,163,74,0.5)]" animate={{ left: ['0%', '100%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} aria-hidden>
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-up" />
      </motion.span>
    </motion.div>
  );
}

/** Stacked calendar pages; the front page gets a "closed" cross drawn on it. */
function HolidaysVisual({ dark }) {
  const page = dark ? 'bg-white/10 ring-white/15' : 'bg-white ring-brand/10 shadow-lg shadow-brand/10';
  return (
    <motion.div {...inViewLoop} className="relative h-28 w-32">
      {[2, 1].map((n) => (
        <span key={n} className={cn('absolute inset-0 rounded-2xl ring-1', page)} style={{ transform: `translate(${n * 10}px, ${n * -8}px) rotate(${n * 4}deg)`, opacity: 1 - n * 0.3 }} />
      ))}
      <motion.div className={cn('absolute inset-0 overflow-hidden rounded-2xl ring-1', page)} animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="block h-6 bg-gradient-to-r from-brand to-brand-400" />
        <svg viewBox="0 0 100 70" className="absolute inset-x-0 bottom-0 h-[calc(100%-1.5rem)] w-full" aria-hidden>
          <motion.path d="M34 18 L66 50 M66 18 L34 50" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" fill="none" variants={{ idle: { pathLength: 0 }, run: { pathLength: 1, transition: { delay: 0.3, duration: 0.8, ease: EASE } } }} />
        </svg>
      </motion.div>
    </motion.div>
  );
}

const RESOURCES = {
  calendar: { Icon: CalendarClock, Visual: CalendarVisual, action: () => jumpTo('calendar-widget') },
  hours: { Icon: Clock3, Visual: HoursVisual, href: `${NEWS_PATH}/market-holidays#trading-hours`, dark: true },
  holidays: { Icon: CalendarX, Visual: HolidaysVisual, href: `${NEWS_PATH}/market-holidays#holiday-hours` }
};

function ResourceCard({ card, index }) {
  const { Icon, Visual, href, action, dark } = RESOURCES[card.id] ?? RESOURCES.calendar;
  // the link is stretched over the whole card, so the entire card is clickable
  const linkClass = cn('inline-flex items-center gap-3 text-sm font-semibold transition-colors after:absolute after:inset-0 after:content-[""] focus-visible:outline-none', dark ? 'text-gold-200' : 'text-brand group-hover:text-gold-700');
  const link = (
    <>
      {card.link}
      <span className={cn('grid size-9 place-items-center rounded-full transition-all duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1', dark ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white')}>
        <ArrowRight className="size-4 rtl:-scale-x-100" />
      </span>
    </>
  );
  return (
    <RingCard dark={dark} as="div" className="focus-within:ring-2 focus-within:ring-gold">
      <div className={cn('relative grid h-44 place-items-center overflow-hidden', dark ? 'bg-white/[0.04]' : 'bg-gradient-to-br from-brand-50 via-white to-[#f6f0ea]')}>
        <div className={cn('absolute inset-0 opacity-60', dark ? 'bg-grid-dark' : 'bg-grid-light')} aria-hidden />
        <motion.span className={cn('absolute -end-10 -top-10 size-40 rounded-full blur-3xl', dark ? 'bg-gold/30' : 'bg-brand/15')} animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, delay: index }} aria-hidden />
        <div dir="ltr" className="relative flex w-full justify-center px-8 transition-transform duration-700 group-hover:scale-105">
          <Visual dark={dark} />
        </div>
        <span className={cn('absolute start-5 top-5 text-xs font-bold tabular-nums tracking-[0.2em]', dark ? 'text-white/40' : 'text-brand/40')}>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-12', dark ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-brand text-white shadow-lg shadow-brand/25')}>
            <Icon className="size-5" />
          </span>
          <h3 className="heading-card">{card.title}</h3>
        </div>
        <p className={cn('mt-4 text-sm leading-relaxed', dark ? 'text-white/65' : 'text-ink/60')}>{card.text}</p>
        <div className="mt-auto pt-6">
          <div className={cn('border-t pt-5', dark ? 'border-white/10' : 'border-brand/10')}>
            {href ? (
              <NavLink href={href} className={linkClass}>
                {link}
              </NavLink>
            ) : (
              <button type="button" onClick={action} className={cn(linkClass, 'text-start')}>
                {link}
              </button>
            )}
          </div>
        </div>
      </div>
    </RingCard>
  );
}

function CalendarSection() {
  const t = useTranslations('economicCalendarPage.calendar');
  const locale = TRADINGVIEW_LOCALE[useLocale()] ?? 'en';
  return (
    <section id="calendar" className="relative scroll-mt-20 overflow-clip bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <span className="absolute -end-40 top-24 size-[420px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro layout="split" title={t('title')} description={t('description')} />
        <Reveal y={24} delay={0.1}>
          <div id="calendar-widget" className="mt-10 scroll-mt-24 overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-brand/10 ring-1 ring-brand/10 md:mt-14">
            <div className="flex items-center gap-2 border-b border-brand/10 px-5 py-3.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ms-3 inline-flex items-center gap-2 text-xs font-semibold text-ink/60">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-up" />
                </span>
                {t('cards.0.title')}
              </span>
            </div>
            <TradingViewWidget locale={locale} theme="light" loadingLabel={t('loading')} />
            <p className="border-t border-brand/10 px-5 py-3 text-end text-[11px] text-ink/40">
              <a href="https://www.tradingview.com/" target="_blank" rel="noopener nofollow" className="hover:text-brand">
                {t('provider')}
              </a>
            </p>
          </div>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3 lg:gap-6" stagger={0.12}>
          {t.raw('cards').map((card, i) => (
            <StaggerItem key={card.id} className="h-full">
              <ResourceCard card={card} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ faq */

function FaqSection() {
  const t = useTranslations('economicCalendarPage.faq');
  const items = t.raw('items').map((it) => ({ q: it.question, a: it.answer }));
  return (
    <section id="faqs" className="relative scroll-mt-20 overflow-clip bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-14">
        <Reveal y={16} className="lg:sticky lg:top-28 lg:self-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand ring-1 ring-brand/10">
            <motion.span className="size-1.5 rounded-full bg-gold" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            {t('badge')}
          </span>
          <h2 className="heading-section mt-5">
            <AccentTitle text={t('heading')} words={2} />
          </h2>
        </Reveal>
        <FaqAccordion items={items} numbered />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ page */

export default function EconomicCalendarPage({ events = [], generatedAt }) {
  const tc = useTranslations('economicCalendarPage.cta');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <CalendarHero events={events} generatedAt={generatedAt} />
        <CalendarSection />
        <FaqSection />
        <CtaBand id="start" title={`${tc('headingLine1')} [${tc('headingLine2')}]`} description={tc('sub')} primary={{ label: tc('openCta'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: tc('demoCta'), href: PORTAL.demo }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
