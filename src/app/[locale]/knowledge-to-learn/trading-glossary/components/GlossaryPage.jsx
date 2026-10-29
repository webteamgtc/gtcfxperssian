'use client';
/**
 * /knowledge-to-learn/trading-glossary(/<letter>) — A–Z trading glossary.
 * Rhythm: dark hero (search + letter strip) → white (trending + terms) → navy CTA.
 * `glossary` = { A: [{ term, definition }], … } loaded on the server (src/lib/glossary.js).
 */
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { BookA, Flame, Search, X } from 'lucide-react';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import { ALPHABET } from '@/lib/glossary';
import { cn } from '@/lib/utils';
import { HUB_PATH } from '../../courses';

const TRENDING_LETTERS = ['C', 'F', 'D'];
export const GLOSSARY_PATH = `${HUB_PATH}/trading-glossary`;

/** Wrap matches of `q` in <mark>. */
function Highlight({ text, q }) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-gold/25 px-0.5 text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function TermCard({ term, definition, letter, q }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-brand/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
      <span className="absolute inset-y-4 start-0 w-0.5 rounded-full bg-gradient-to-b from-brand to-gold opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      <div className="flex items-start gap-3">
        {letter && <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand">{letter}</span>}
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">
            <Highlight text={term} q={q} />
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            <Highlight text={definition} q={q} />
          </p>
        </div>
      </div>
    </article>
  );
}

export default function GlossaryPage({ glossary, initialLetter = 'A' }) {
  const t = useTranslations('glossaryPage');
  const tk = useTranslations('knowledgePage.breadcrumb');
  const available = ALPHABET.filter((l) => glossary[l]?.length);
  const [letter, setLetter] = useState(available.includes(initialLetter) ? initialLetter : available[0]);
  const [q, setQ] = useState('');
  const total = available.reduce((n, l) => n + glossary[l].length, 0);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return available.flatMap((l) => glossary[l].filter((x) => `${x.term} ${x.definition}`.toLowerCase().includes(s)).map((x) => ({ ...x, letter: l })));
  }, [q, glossary, available]);

  const trending = TRENDING_LETTERS.map((l) => (glossary[l]?.[0] ? { ...glossary[l][0], letter: l } : null)).filter(Boolean);
  const pick = (l) => {
    setLetter(l);
    setQ('');
    // keep the URL shareable without a navigation
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `${window.location.pathname.replace(/\/trading-glossary(\/[a-z])?$/i, '/trading-glossary')}/${l.toLowerCase()}`);
  };

  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        {/* hero */}
        <section className="is-dark relative overflow-hidden bg-ink pb-14 pt-36 text-white md:pb-20 md:pt-44">
          <HeroBackdrop />
          <div className="container-x relative">
            <Breadcrumb className="lg:justify-start" items={[{ label: tk('home'), href: '/' }, { label: tk('current'), href: HUB_PATH }, { label: t('breadcrumb.current') }]} />
            <div className="mx-auto mt-12 max-w-3xl text-center">
              <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15">
                <BookA className="size-7" />
              </motion.span>
              <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
                <AccentTitle text={t('bannerTitle')} />
              </motion.h1>
              <motion.p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                {t('bannerDescription')}
              </motion.p>
              <motion.label initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="relative mx-auto mt-9 block max-w-xl">
                <span className="sr-only">{t('searchPlaceholder')}</span>
                <Search className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-white/45" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} className="h-14 w-full rounded-full border border-white/15 bg-white/[0.07] ps-14 pe-12 text-[15px] text-white outline-none backdrop-blur transition placeholder:text-white/40 focus:border-gold/60 focus:bg-white/[0.1] focus:ring-4 focus:ring-gold/15" />
                {q && (
                  <button type="button" onClick={() => setQ('')} className="absolute end-4 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label="Clear">
                    <X className="size-4" />
                  </button>
                )}
              </motion.label>
            </div>

            {/* letter strip */}
            {total > 0 && (
              <div className="mt-10">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{t('browseByLetter')}</p>
                <div dir="ltr" role="tablist" className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-1.5">
                  {ALPHABET.map((l) => {
                    const has = available.includes(l);
                    const on = has && !results && l === letter;
                    return (
                      <button key={l} type="button" role="tab" aria-selected={on} disabled={!has} onClick={() => pick(l)} className={cn('relative grid size-10 place-items-center rounded-xl text-sm font-bold transition-colors', on ? 'text-white' : has ? 'bg-white/[0.06] text-white/80 ring-1 ring-white/10 hover:bg-white/15 hover:text-white' : 'cursor-not-allowed text-white/20')}>
                        {on && <motion.span layoutId="gl-letter" className="absolute inset-0 rounded-xl bg-gold shadow-lg shadow-gold/30" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                        <span className="relative">{l}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {total === 0 ? (
          <section className="py-20">
            <p className="container-x text-center text-ink/55">{t('unavailable')}</p>
          </section>
        ) : (
          <>
            {/* trending */}
            {!results && trending.length > 0 && (
              <section className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-16">
                <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
                <div className="container-x relative">
                  <SectionIntro layout="split" title={t('trendingTitle')} />
                  <Stagger className="mt-8 grid gap-5 md:grid-cols-3" stagger={0.1}>
                    {trending.map((x) => (
                      <StaggerItem key={x.term} className="h-full">
                        <button type="button" onClick={() => pick(x.letter)} className="group relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-start text-white shadow-xl shadow-brand/15 transition-transform duration-500 hover:-translate-y-1">
                          <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
                          <span className="relative inline-flex items-center gap-1.5 text-xs font-semibold text-gold-200">
                            <Flame className="size-3.5" /> {x.letter}
                          </span>
                          <h3 className="relative mt-3 text-lg font-semibold">{x.term}</h3>
                          <p className="relative mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-white/65">{x.definition}</p>
                          <span className="relative mt-5 text-sm font-semibold text-gold-200 transition-colors group-hover:text-white">{t('viewLetter', { letter: x.letter })} →</span>
                        </button>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </section>
            )}

            {/* terms */}
            <section className="relative bg-white py-14 md:py-20">
              <div className="container-x">
                <Reveal y={12} className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="heading-section">
                    {results ? (
                      <>
                        “{q.trim()}”
                      </>
                    ) : (
                      <>
                        <span className="heading-accent">{letter}</span> · {t('title')}
                      </>
                    )}
                  </h2>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand">{t('termsCount', { count: results ? results.length : glossary[letter]?.length ?? 0 })}</span>
                </Reveal>
                <AnimatePresence mode="wait">
                  <motion.div key={results ? `q-${q}` : letter} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(results ?? (glossary[letter] || []).map((x) => ({ ...x, letter: null }))).map((x, i) => (
                      <TermCard key={`${x.term}-${i}`} term={x.term} definition={x.definition} letter={x.letter} q={results ? q.trim() : ''} />
                    ))}
                    {results && results.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-brand/20 px-6 py-12 text-center text-ink/50">{t('noResults', { query: q.trim() })}</p>}
                    {!results && !glossary[letter]?.length && <p className="col-span-full py-12 text-center text-ink/50">{t('noTerms')}</p>}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </>
        )}

        <CtaBand id="start" title={t('cta.heading')} description={t('cta.footnote')} primary={{ label: t('cta.primary'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: t('cta.secondary'), href: '/trading/free-demo-account' }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
