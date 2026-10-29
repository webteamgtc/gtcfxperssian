'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowRight, Users } from 'lucide-react';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

/** "+38.4%" → 38.4, "-6.1%" → -6.1 */
const pct = (s) => parseFloat(String(s).replace(/[^\d.-]/g, '')) || 0;
/** "$1.2M" → 1.2e6, "$680M" → 6.8e8, "$2.1B" → 2.1e9 */
const money = (s) => {
  const m = String(s).match(/([\d.,]+)\s*([KMB])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return n * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] ?? 1);
};

/** Filter index → sort. 0 keeps the original order. */
const SORTS = [null, (a, b) => pct(b.return) - pct(a.return), (a, b) => Math.abs(pct(a.drawdown)) - Math.abs(pct(b.drawdown)), (a, b) => money(b.aum) - money(a.aum)];

/** Small upward curve whose steepness follows the return. */
function ReturnCurve({ value, color }) {
  const r = Math.min(60, Math.max(5, value));
  const d = `M0 34 C 30 ${34 - r * 0.15}, 60 ${30 - r * 0.3}, 120 ${32 - r * 0.5}`;
  return (
    <svg viewBox="0 0 120 36" className="h-9 w-full" preserveAspectRatio="none" aria-hidden>
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} />
    </svg>
  );
}

function ManagerCard({ m, labels, rank }) {
  const ret = pct(m.return);
  return (
    <motion.article layout transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} whileHover={{ y: -6 }} className={cn('group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15', m.featured ? 'ring-2 ring-brand' : 'ring-brand/10')}>
      <span className="absolute -end-12 -top-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40" style={{ background: m.color }} aria-hidden />

      <div className="relative flex items-center gap-3 border-b border-brand/10 pb-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" style={{ background: m.color, boxShadow: `0 8px 20px -8px ${m.color}` }}>
          {m.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{m.name}</span>
          <span className="block truncate text-xs text-ink/50">{m.strategy}</span>
        </span>
        <span className="grid size-7 place-items-center rounded-full bg-brand-50 text-[11px] font-bold tabular-nums text-brand ring-1 ring-brand/10">#{rank}</span>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <div className="text-2xl font-bold tabular-nums text-up">{m.return}</div>
          <div className="text-xs text-ink/50">{labels.return}</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums text-down">{m.drawdown}</div>
          <div className="text-xs text-ink/50">{labels.drawdown}</div>
        </div>
        <div className="col-span-2 -my-1">
          <ReturnCurve value={ret} color={m.color} />
        </div>
        <div>
          <div className="text-lg font-bold text-ink">{m.aum}</div>
          <div className="text-xs text-ink/50">{labels.aum}</div>
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 text-lg font-bold tabular-nums text-ink">
            <Users className="size-4 text-ink/35" />
            {Number(m.investors).toLocaleString('en-US')}
          </div>
          <div className="text-xs text-ink/50">{labels.investors}</div>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-brand/10 pt-4 text-xs text-ink/60">
        <span>
          {labels.fee} <strong className="text-ink">{m.fee}</strong>
        </span>
        <span>
          {labels.min} <strong className="text-ink">{m.min}</strong>
        </span>
      </div>

      <NavLink href={LIVE_ACCOUNT_HREF} className={cn('relative mt-4 flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-semibold transition-colors duration-300', m.featured ? 'bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-700' : 'bg-[#f1f3f9] text-brand hover:bg-brand hover:text-white')}>
        {labels.copy}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100" />
      </NavLink>
    </motion.article>
  );
}

/** Filter pills reorder the manager cards with a spring layout animation. */
export function Leaderboard() {
  const t = useTranslations('pammPage.leaderboard');
  const filters = t.raw('filters');
  const labels = t.raw('labels');
  const managers = t.raw('managers');
  const [filter, setFilter] = useState(0);

  const list = useMemo(() => {
    const withKey = managers.map((m, i) => ({ ...m, _key: `${m.initials}-${i}` }));
    const sort = SORTS[filter];
    return sort ? [...withKey].sort(sort) : withKey;
  }, [managers, filter]);

  return (
    <section id="leaderboard" className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <Reveal className="mt-8 flex justify-center" y={16}>
          <div role="tablist" aria-label={t('eyebrow')} className="no-scrollbar inline-flex max-w-full gap-1.5 overflow-x-auto rounded-full border border-brand/10 bg-white p-1.5 shadow-sm">
            {filters.map((f, i) => {
              const on = filter === i;
              return (
                <button key={f} type="button" role="tab" aria-selected={on} onClick={() => setFilter(i)} className={cn('relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300', on ? 'text-white' : 'text-ink/70 hover:text-brand')}>
                  {on && <motion.span layoutId="pamm-filter" className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="relative">{f}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal y={30} amount={0.1}>
          <LayoutGroup>
          <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <AnimatePresence initial={false}>
              {list.map((m, i) => (
                <ManagerCard key={m._key} m={m} labels={labels} rank={i + 1} />
              ))}
            </AnimatePresence>
          </motion.div>
          </LayoutGroup>
        </Reveal>
      </div>
    </section>
  );
}
