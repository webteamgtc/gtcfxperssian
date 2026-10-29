'use client';
/**
 * /gtc-news/earnings-calendar — earnings & dividends calendar.
 * Calendar rows come from the newest Strapi `earnings` upload (.xlsx, read by src/lib/earnings.js).
 * Rhythm: dark hero (live card) → gray (key figures, adjustment ranking, formula tabs) → white (TradingView screener)
 * → gray (margin guide timeline) → white (FAQs + support) → navy CTA.
 */
import { useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarClock, Gauge, Headset, Layers, ListChecks, Scale, Search, ShieldAlert, Wallet, X } from 'lucide-react';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { CountUp, Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import EarningsHero, { isEmptyValue } from './EarningsHero';

const num = (v) => {
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

/* ------------------------------------------------------------ calendar: key figures */

function KeyFigures({ calendar }) {
  const t = useTranslations('earningsCalendarPage');
  const { columns, rows, date } = calendar;
  const last = columns.length - 1;
  const adjusted = rows.filter((r) => !isEmptyValue(r[last])).length;
  const items = [
    { Icon: CalendarClock, label: t('calendar.datePrefix').replace(/:\s*$/, ''), value: <span dir="ltr">{date || '—'}</span>, sub: t('hero.timezone') },
    { Icon: ListChecks, label: columns[0], value: <CountUp value={rows.length} /> },
    { Icon: Scale, label: columns[last], value: <CountUp value={adjusted} />, gold: true }
  ];
  return (
    <Stagger className="mt-10 grid gap-4 sm:grid-cols-3" stagger={0.1}>
      {items.map(({ Icon, label, value, sub, gold }) => (
        <StaggerItem key={label} className="group relative overflow-hidden rounded-[1.5rem] bg-white p-5 ring-1 ring-brand/10 transition-shadow duration-500 hover:shadow-xl hover:shadow-brand/10">
          <span className={cn('absolute inset-x-0 top-0 h-1', gold ? 'bg-gradient-to-r from-gold to-gold-200' : 'bg-gradient-to-r from-brand to-brand-300')} aria-hidden />
          <div className="flex items-center gap-4">
            <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6', gold ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-brand-50 text-brand')}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</div>
              <div className={cn('mt-1 text-2xl font-bold tabular-nums', gold ? 'text-gold-700' : 'text-ink')}>
                {value}
                {sub && <span className="ms-2 text-sm font-semibold text-ink/40">{sub}</span>}
              </div>
            </div>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/* ------------------------------------------------------------ calendar: adjustment ranking */

function AdjustmentList({ calendar }) {
  const t = useTranslations('earningsCalendarPage.calendar');
  const [q, setQ] = useState('');
  const { columns, rows } = calendar;
  const last = columns.length - 1;
  const hasSymbol = columns.length > 2;

  // adjusted instruments first (largest first), then the rest in file order
  const ranked = useMemo(() => {
    const withV = rows.filter((r) => num(r[last]) != null).sort((a, b) => num(b[last]) - num(a[last]));
    return [...withV, ...rows.filter((r) => num(r[last]) == null)];
  }, [rows, last]);
  const max = Math.max(...ranked.map((r) => Math.abs(num(r[last]) ?? 0)), 0) || 1;
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ranked.filter((r) => r.some((c) => String(c).toLowerCase().includes(s))) : ranked;
  }, [ranked, q]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-brand/5 ring-1 ring-brand/10">
      <div className="flex flex-wrap items-center gap-3 border-b border-brand/10 bg-[#fbfbfe] p-3">
        <label className="flex h-11 min-w-[200px] flex-1 items-center gap-2.5 rounded-full bg-white px-4 ring-1 ring-brand/10 transition-shadow focus-within:shadow-lg focus-within:shadow-brand/10 focus-within:ring-brand/30">
          <Search className="size-4 shrink-0 text-brand/50" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-label={columns.join(' / ')} placeholder={columns.slice(0, 2).join(' / ')} className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden" />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="×" className="grid size-6 place-items-center rounded-full bg-brand-50 text-brand hover:bg-brand hover:text-white">
              <X className="size-3.5" />
            </button>
          )}
        </label>
        <span dir="ltr" className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold tabular-nums text-brand">
          {shown.length}/{rows.length}
        </span>
      </div>

      {/* column header */}
      <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,0.6fr)_minmax(0,1.2fr)] gap-4 bg-brand-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 sm:grid">
        <span>{columns[0]}</span>
        {hasSymbol && <span>{columns[1]}</span>}
        <span className="text-end">{columns[last]}</span>
      </div>

      <ol className="max-h-[560px] divide-y divide-brand/[0.06] overflow-y-auto">
        <AnimatePresence initial={false}>
          {shown.map((r, i) => {
            const v = num(r[last]);
            const empty = v == null;
            return (
              <motion.li key={`${r[0]}-${r[1]}`} layout initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, ease: EASE, delay: Math.min(i, 10) * 0.04 }} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-brand-50/60 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.6fr)_minmax(0,1.2fr)]">
                <span className="flex min-w-0 items-center gap-3">
                  <span dir="ltr" className={cn('grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums', empty ? 'bg-[#f6f7fb] text-ink/35' : 'bg-gold/15 text-gold-700')}>
                    {i + 1}
                  </span>
                  <span className={cn('truncate font-semibold', empty ? 'text-ink/55' : 'text-ink')}>{r[0]}</span>
                </span>
                {hasSymbol && (
                  <span className="order-3 col-span-2 sm:order-none sm:col-span-1">
                    <span dir="ltr" className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand">
                      {r[1]}
                    </span>
                  </span>
                )}
                <span className="flex items-center justify-end gap-3">
                  {!empty && (
                    <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-brand/[0.06] sm:block" aria-hidden>
                      <motion.span className="block h-full rounded-full bg-gradient-to-r from-gold-300 to-gold" initial={{ width: 0 }} whileInView={{ width: `${Math.max(6, (Math.abs(v) / max) * 100)}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE, delay: 0.2 + Math.min(i, 10) * 0.05 }} />
                    </span>
                  )}
                  <span dir="ltr" className={cn('min-w-[4rem] text-end font-bold tabular-nums', empty ? 'text-ink/25' : 'text-gold-700')}>
                    {empty ? '—' : r[last]}
                  </span>
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      {!shown.length && <p className="py-12 text-center text-sm text-ink/50">{t('noData')}</p>}
    </div>
  );
}

/* ------------------------------------------------------------ calendar: formula tabs */

/** "Result = A × B × C" → result + factor chips. */
function FormulaChips({ formula, up }) {
  const [lhs, rhs = ''] = formula.split('=');
  const factors = rhs.split('×').map((f) => f.trim()).filter(Boolean);
  return (
    <div className="mt-5">
      <motion.span className={cn('inline-flex rounded-xl px-3.5 py-2 text-sm font-bold', up ? 'bg-up/15 text-up ring-1 ring-up/30' : 'bg-down/15 text-red-300 ring-1 ring-down/30')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {lhs.trim()}
      </motion.span>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-lg font-bold text-gold-200">=</span>
        {factors.map((f, i) => (
          <motion.span key={f} className="contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.07 }}>
            {i > 0 && <span className="text-sm font-bold text-white/40">×</span>}
            <motion.span className="rounded-lg bg-white/[0.08] px-2.5 py-1.5 text-[13px] font-medium text-white/85 ring-1 ring-white/10" initial={{ scale: 0.85 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 300, damping: 18 }}>
              {f}
            </motion.span>
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function FormulaCard() {
  const t = useTranslations('earningsCalendarPage.calendar.calc');
  const [tab, setTab] = useState('long');
  const tabs = [
    { key: 'long', Icon: ArrowUpRight, title: t('longTitle'), formula: t('longFormula') },
    { key: 'short', Icon: ArrowDownRight, title: t('shortTitle'), formula: t('shortFormula') }
  ];
  const cur = tabs.find((x) => x.key === tab);
  return (
    <div className="is-dark relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white shadow-2xl shadow-brand/25 md:p-7">
      <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
      <motion.span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-gold text-white shadow-lg shadow-gold/30">
            <Scale className="size-5" />
          </span>
          <h3 className="text-xl font-bold">{t('title')}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{t('intro')}</p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.06] p-1 ring-1 ring-white/10" role="tablist">
          {tabs.map(({ key, Icon, title }) => {
            const on = key === tab;
            const up = key === 'long';
            return (
              <button key={key} type="button" role="tab" aria-selected={on} onClick={() => setTab(key)} className={cn('relative flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors', on ? 'text-brand-900' : 'text-white/65 hover:text-white')}>
                {on && <motion.span layoutId="formula-tab" className="absolute inset-0 rounded-xl bg-white shadow-lg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} aria-hidden />}
                <Icon className={cn('relative size-4 shrink-0', on && (up ? 'text-up' : 'text-down'))} />
                <span className="relative line-clamp-1 text-start">{title.split('—')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
            <p className="mt-5 text-sm font-semibold text-white">{cur.title}</p>
            <FormulaChips formula={cur.formula} up={tab === 'long'} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CalendarSection({ calendar }) {
  const t = useTranslations('earningsCalendarPage.calendar');
  return (
    <section id="calendar" className="relative scroll-mt-20 overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('intro')} layout="split" />
        {calendar?.rows.length ? (
          <>
            <KeyFigures calendar={calendar} />
            <Reveal y={12} className="mt-6">
              <p className="max-w-2xl text-sm text-ink/55">{t('description')}</p>
            </Reveal>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <Reveal y={24}>
                <AdjustmentList calendar={calendar} />
              </Reveal>
              <Reveal y={24} delay={0.1} className="lg:sticky lg:top-28">
                <FormulaCard />
              </Reveal>
            </div>
          </>
        ) : (
          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <p className="rounded-[1.75rem] bg-white py-20 text-center text-ink/50 ring-1 ring-brand/10">{t('noData')}</p>
            <FormulaCard />
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ screener */

const TV_LOCALE = { ar: 'ar_AE', zh: 'zh_CN', 'zh-TW': 'zh_TW', es: 'es', fr: 'fr', pt: 'br', ru: 'ru', tr: 'tr', vi: 'vi_VN', id: 'id', it: 'it', th: 'th_TH', ms: 'ms_MY' };

function ScreenerSection() {
  const t = useTranslations('earningsCalendarPage.screener');
  const locale = useLocale();
  const src = useMemo(() => {
    const config = { width: '100%', height: 620, defaultColumn: 'overview', defaultScreen: 'earnings_this_month', market: 'america', showToolbar: true, colorTheme: 'light', isTransparent: false, enableScrolling: true };
    return `https://www.tradingview-widget.com/embed-widget/screener/?locale=${TV_LOCALE[locale] ?? 'en'}#${encodeURIComponent(JSON.stringify(config))}`;
  }, [locale]);
  return (
    <section id="screener" className="relative scroll-mt-20 overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[460px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} layout="split" />
        <Reveal y={36} className="mt-10 md:mt-12">
          <div className="relative">
            <div className="absolute -inset-x-6 -bottom-6 top-10 rounded-[2.5rem] bg-gradient-to-br from-brand/15 via-transparent to-gold/15 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-2 shadow-2xl shadow-brand/25 md:p-3">
              <div className="flex items-center gap-2 px-3 pb-3 pt-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-down/80" />
                <span className="size-2.5 rounded-full bg-gold" />
                <span className="size-2.5 rounded-full bg-up/80" />
                <span className="ms-3 hidden h-6 flex-1 items-center rounded-full bg-white/[0.07] px-3 text-[11px] text-white/45 ring-1 ring-white/10 sm:flex">tradingview.com · screener</span>
                <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-up/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-up ring-1 ring-up/30">
                  <motion.span className="size-1.5 rounded-full bg-up" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  <BarChart3 className="size-3" />
                </span>
              </div>
              <iframe title={t('title').replace(/[[\]]/g, '')} src={src} loading="lazy" className="block h-[620px] w-full rounded-[1.5rem] bg-white" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ margin guide (timeline) */

const GUIDE_ICONS = [ShieldAlert, Layers, BarChart3, Gauge, Wallet, Scale];

function GuideStep({ it, i }) {
  const Icon = GUIDE_ICONS[i % GUIDE_ICONS.length];
  return (
    <motion.li className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-6" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: EASE }}>
      <span className="relative z-10 grid size-12 place-items-center rounded-2xl bg-white text-brand shadow-lg shadow-brand/15 ring-1 ring-brand/15 md:size-14">
        <Icon className="size-5" />
        <span dir="ltr" className="absolute -end-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-gold text-[10px] font-bold text-white ring-2 ring-[#f6f7fb]">
          {i + 1}
        </span>
      </span>
      <div className="group rounded-[1.5rem] bg-white p-5 ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:ring-brand/20 md:p-6">
        <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-brand">{it.title}</h3>
        {it.text.map((p) => (
          <p key={p} className="mt-2 text-sm leading-relaxed text-ink/60">
            {p}
          </p>
        ))}
        {it.list.length > 0 && (
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {it.list.map((li) => (
              <li key={li} className="flex gap-2.5 rounded-lg bg-[#f6f7fb] px-3 py-2 text-[13px] text-ink/75">
                <span className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                <span dir="auto">{li}</span>
              </li>
            ))}
          </ul>
        )}
        {it.note.map((p) => (
          <p key={p} className="mt-3 border-s-2 border-gold ps-3 text-[13px] italic leading-relaxed text-ink/60">
            {p}
          </p>
        ))}
      </div>
    </motion.li>
  );
}

/** One step dash: fills while the reader is in step `i` of `n` (driven by the timeline's scroll progress). */
function StepDash({ progress, i, n }) {
  const scaleX = useTransform(progress, (v) => Math.min(1, Math.max(0, v * n - i)));
  return (
    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand/10">
      <motion.span className="block h-full origin-left rounded-full bg-gradient-to-r from-brand to-gold rtl:origin-right" style={{ scaleX }} />
    </span>
  );
}

function GuideSection() {
  const t = useTranslations('earningsCalendarPage.guide');
  const items = t.raw('items');
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="margin-guide" className="relative scroll-mt-20 overflow-clip bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-14">
        <Reveal y={16} className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('description')}</p>
          <div className="mt-8 hidden items-center gap-3 lg:flex" aria-hidden>
            {items.map((it, i) => (
              <StepDash key={it.title} progress={fill} i={i} n={items.length} />
            ))}
          </div>
        </Reveal>

        <div ref={listRef} className="relative">
          <span className="absolute bottom-6 start-6 top-6 w-0.5 rounded-full bg-brand/10 md:start-7" aria-hidden>
            <motion.span className="block h-full w-full origin-top rounded-full bg-gradient-to-b from-gold via-brand to-brand" style={{ scaleY: fill }} />
          </span>
          <ol className="space-y-5">
            {items.map((it, i) => (
              <GuideStep key={it.title} it={it} i={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ faq */

function FaqSection() {
  const t = useTranslations('earningsCalendarPage.faq');
  const tg = useTranslations('earningsCalendarPage.guide.support');
  return (
    <section id="faqs" className="relative scroll-mt-20 overflow-clip bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('title')} />
            </h2>
            <p className="mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('description')}</p>
          </Reveal>
          <Reveal y={20} delay={0.1} className="mt-8">
            <div className="is-dark relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white shadow-2xl shadow-brand/20">
              <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
              <motion.span className="absolute -end-12 -top-12 size-40 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-gold text-white shadow-lg shadow-gold/30">
                <Headset className="size-5" />
              </span>
              <h3 className="relative mt-4 text-lg font-bold">{tg('title')}</h3>
              {tg.raw('text').map((p) => (
                <p key={p} className="relative mt-2 text-sm leading-relaxed text-white/65">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
        <FaqAccordion items={t.raw('items')} numbered />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ page */

export default function EarningsPage({ calendar }) {
  const tc = useTranslations('whyGtcGroupPage.cta');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <EarningsHero calendar={calendar} />
        <CalendarSection calendar={calendar} />
        <ScreenerSection />
        <GuideSection />
        <FaqSection />
        <CtaBand id="start" title={tc('title')} description={tc('text')} primary={{ label: tc('live'), href: LIVE_ACCOUNT_HREF }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
