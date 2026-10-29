'use client';
/** Template B "Why trade … with GTCFX?" Copy: pages.<id>.why (cards ×5 with pills + 2 stats). */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import StatValue from '@/components/shared/StatValue';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { usePageT, Icon } from './shared';

const Stat = ({ value }) => (/^\d+[+%]?$/.test(String(value)) ? <StatValue value={value} /> : value);

function StatsStrip({ stats, className }) {
  return (
    <Reveal y={16} className={className}>
      <dl className="grid divide-y divide-brand/10 overflow-hidden rounded-3xl bg-white ring-1 ring-brand/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center px-6 py-8 text-center">
            <dt className="order-2 mt-1 text-sm text-ink/55">{s.label}</dt>
            <dd className="heading-accent text-4xl font-bold tracking-tight" dir="ltr">
              <Stat value={s.value} />
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

/** Spotlight tabs — the five benefits as tabs with a progress bar that auto-advances; one large panel at a time. */
export function WhyTabsB() {
  const t = usePageT();
  const cards = t.raw('why.cards');
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setI((x) => (x + 1) % cards.length), 4200);
    return () => clearTimeout(id);
  }, [i, paused, cards.length]);
  const c = cards[i];
  return (
    <section className="relative bg-white py-14 text-ink md:py-24">
      <div className="container-x">
        <SectionIntro title={t('why.title')} description={t('why.description')} />
        <div className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-[340px_1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div role="tablist" aria-label={t('why.title').replace(/[[\]]/g, '')} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {cards.map((x, k) => (
              <button key={x.title} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)} className={cn('relative flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-start transition-colors lg:w-full', k === i ? 'bg-brand text-white shadow-lg shadow-brand/25' : 'bg-[#f6f7fb] text-ink hover:bg-brand-50')}>
                <Icon name={x.icon} className="size-5 shrink-0" />
                <span className="whitespace-nowrap text-[15px] font-semibold">{x.title}</span>
                {k === i && !paused && <motion.span key={`p${i}`} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gold rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 4.2, ease: 'linear' }} />}
              </button>
            ))}
          </div>
          <div className="is-dark relative min-h-[320px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand to-brand-700 p-8 text-white md:p-12">
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <span className="absolute -bottom-24 -end-24 size-80 rounded-full bg-gold/25 blur-3xl" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div key={c.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE }} className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="grid size-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    <Icon name={c.icon} className="size-7 text-gold-200" />
                  </span>
                  <h3 className="heading-title mt-6">{c.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-white/70">{c.text}</p>
                </div>
                <p className="heading-accent text-5xl font-bold tracking-tight md:text-6xl" dir="ltr">{c.pill}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <StatsStrip stats={t.raw('why.stats')} className="mt-8" />
      </div>
    </section>
  );
}
