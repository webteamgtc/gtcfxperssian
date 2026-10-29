'use client';
/**
 * /legal/restricted-countries — jurisdictions GTC Global Ltd / GTC Global Trade Capital do not serve.
 * UI copy + country lists: messages/<lang>/legalPage.json → `legalPage.restricted`.
 * Rhythm: dark hero (copy + "check your country" search) → gray (three category cards, lifted over the hero,
 * matches from the search highlighted) → note → navy CTA band → dark footer.
 */
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Ban, CheckCircle2, Info, Search, ShieldAlert, X } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import CtaBand from '@/components/shared/CtaBand';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { CountUp, Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'prohibited', Icon: Ban, tile: 'bg-down text-white shadow-lg shadow-down/30', bar: 'from-down via-red-400 to-down', chip: 'bg-down/[0.07] text-down ring-down/15', hit: 'bg-down text-white ring-down', badge: 'bg-down/10 text-down' },
  { key: 'highRisk', Icon: AlertTriangle, tile: 'bg-gold text-white shadow-lg shadow-gold/30', bar: 'from-gold-300 via-gold to-gold-700', chip: 'bg-gold-50 text-gold-700 ring-gold/20', hit: 'bg-gold text-white ring-gold', badge: 'bg-gold/15 text-gold-700' },
  { key: 'serviceRestriction', Icon: ShieldAlert, tile: 'bg-brand text-white shadow-lg shadow-brand/30', bar: 'from-brand-400 via-brand to-brand-800', chip: 'bg-brand-50 text-brand ring-brand/15', hit: 'bg-brand text-white ring-brand', badge: 'bg-brand/10 text-brand' }
];

const norm = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Hero card: type a country, see straight away which list (if any) it is on. */
function CountryCheck({ query, setQuery, matches }) {
  const t = useTranslations('legalPage.restricted');
  const q = query.trim();
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="relative mx-auto w-full max-w-md">
      <motion.span className="absolute -inset-8 -z-10 rounded-[3rem] bg-down/20 blur-3xl" animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur-xl">
        <label htmlFor="country-check" className="flex items-center gap-2.5 text-sm font-semibold text-white">
          <span className="relative grid size-10 place-items-center rounded-xl bg-gold text-white shadow-lg shadow-gold/40">
            <Search className="size-4" />
            <motion.span className="absolute inset-0 rounded-xl ring-2 ring-gold" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity }} aria-hidden />
          </span>
          {t('search.title')}
        </label>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            id="country-check"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            autoComplete="off"
            className="h-13 w-full rounded-2xl bg-white/[0.08] pe-11 ps-11 text-[15px] text-white ring-1 ring-white/15 outline-none transition placeholder:text-white/35 focus:bg-white/[0.12] focus:ring-gold/60 [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => setQuery('')} aria-label={t('search.clear')} className="absolute end-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white">
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-4 min-h-[7.5rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            {!q ? (
              <motion.div key="lists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {CATEGORIES.map(({ key, Icon }) => (
                  <div key={key} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                    <Icon className="size-4 text-gold-200" />
                    <span className="flex-1 text-sm text-white/70">{t(`categories.${key}.title`)}</span>
                    <span className="text-xs font-bold tabular-nums text-white/40">{matches.totals[key]}</span>
                  </div>
                ))}
              </motion.div>
            ) : matches.list.length ? (
              <motion.ul key="hits" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="no-scrollbar max-h-40 space-y-2 overflow-y-auto">
                {matches.list.map(({ country, cat }) => (
                  <li key={`${cat.key}-${country}`} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-ink">
                    <cat.Icon className={cn('size-4 shrink-0', cat.badge.split(' ')[1])} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{country}</span>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold', cat.badge)}>{t(`categories.${cat.key}.status`)}</span>
                  </li>
                ))}
              </motion.ul>
            ) : (
              <motion.div key="none" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 rounded-xl bg-up/15 p-4 ring-1 ring-up/30">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-300" />
                <div>
                  <p className="text-sm font-semibold text-white">{t('search.noMatch', { query: q })}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{t('search.noMatchHint')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCard({ cat, countries, hits }) {
  const t = useTranslations('legalPage.restricted');
  const searching = hits !== null;
  return (
    <StaggerItem className="h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-xl shadow-brand/10 ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-7">
        <span className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', cat.bar)} aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <span className={cn('grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6', cat.tile)}>
            <cat.Icon className="size-5" />
          </span>
          <div className="text-end">
            <CountUp value={countries.length} className="block text-3xl font-black tabular-nums text-ink" />
            <span className="text-xs text-ink/45">{t('count', { count: countries.length })}</span>
          </div>
        </div>
        <h2 className="heading-card mt-5">{t(`categories.${cat.key}.title`)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{t(`categories.${cat.key}.description`)}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {countries.map((c, i) => {
            const hit = hits?.has(c);
            return (
              <motion.li
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.025, duration: 0.35 }}
                className={cn('rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 transition-all duration-300', hit ? cn(cat.hit, 'scale-105 shadow-md') : cat.chip, searching && !hit && 'opacity-35')}
              >
                {c}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </StaggerItem>
  );
}

export default function RestrictedCountriesPage() {
  const t = useTranslations('legalPage');
  const lists = t.raw('restricted.countries');
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = norm(query);
    const totals = Object.fromEntries(CATEGORIES.map((c) => [c.key, (lists[c.key] ?? []).length]));
    if (!q) return { list: [], hits: null, totals };
    const list = CATEGORIES.flatMap((cat) => (lists[cat.key] ?? []).filter((c) => norm(c).includes(q)).map((country) => ({ country, cat })));
    return { list, hits: new Set(list.map((m) => m.country)), totals };
  }, [query, lists]);

  return (
    <div className="overflow-x-clip bg-[#f6f7fb] text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <section className="is-dark relative overflow-hidden bg-ink pb-40 pt-36 text-white md:pb-48 md:pt-44">
          <HeroBackdrop />
          <div className="container-x relative">
            <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.legal'), href: '/legal/legal-documents' }, { label: t('restricted.current') }]} />
            <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
              <div className="text-center lg:text-start">
                <motion.span className="inline-flex items-center gap-2 rounded-full bg-down/15 px-4 py-1.5 text-xs font-bold tracking-wide text-red-200 ring-1 ring-down/30 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <motion.span className="size-1.5 rounded-full bg-red-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  {t('restricted.hero.badge')}
                </motion.span>
                <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
                  <AccentTitle text={t('restricted.hero.title')} />
                </motion.h1>
                <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                  {t('restricted.hero.description')}
                </motion.p>
              </div>
              <CountryCheck query={query} setQuery={setQuery} matches={matches} />
            </div>
          </div>
        </section>

        <section className="relative pb-16 md:pb-24">
          <div className="container-x relative -mt-28 md:-mt-32">
            <Stagger className="grid items-start gap-5 lg:grid-cols-3" stagger={0.1} amount={0}>
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.key} cat={cat} countries={lists[cat.key] ?? []} hits={matches.hits} />
              ))}
            </Stagger>
            <Reveal y={16} className="mt-8 flex items-start gap-3 rounded-[1.5rem] bg-gold-50 p-5 ring-1 ring-gold/25 md:p-6">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold text-white">
                <Info className="size-4" />
              </span>
              <p className="text-sm leading-relaxed text-ink/70">
                <strong className="me-1 text-gold-700">{t('restricted.noteLabel')}</strong>
                {t('restricted.noteText')}
              </p>
            </Reveal>
          </div>
        </section>

        <CtaBand title={t('restricted.cta.title')} description={t('restricted.cta.description')} primary={{ label: t('restricted.cta.primary'), href: '/company/contact-us' }} secondary={{ label: t('restricted.cta.secondary'), href: '/legal/legal-documents' }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
