'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Landmark, FileBadge, Hash, Building2, CalendarRange, MapPin, Copy, Check, RotateCcw, ArrowUpRight, BadgeCheck } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const ROW_ICONS = { authority: Landmark, type: FileBadge, licence: Hash, company: Building2, validity: CalendarRange, address: MapPin };
const rowValue = (e, id) => e.rows.find((r) => r.id === id)?.value;
// "Financial Services Commission (FSC)" → "FSC"
const acronym = (s = '') => s.match(/\(([^)]+)\)\s*$/)?.[1] ?? s;

/* ---------- shared bits ---------- */
function CopyButton({ value, t, dark }) {
  const [done, setDone] = useState(false);
  const copy = (ev) => {
    ev.stopPropagation();
    navigator.clipboard?.writeText(value).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors', dark ? 'bg-white/10 text-white/80 hover:bg-white/20' : 'bg-brand-50 text-brand hover:bg-brand hover:text-white')}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? t('copied') : t('copy')}
    </button>
  );
}
function CodeBadge({ code, size = 'md' }) {
  return (
    <span dir="ltr" className={cn('grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-950 font-extrabold tracking-wide text-gold-200 shadow-lg shadow-brand/20', size === 'lg' ? 'size-16 text-xl' : 'size-12 text-base')}>
      {code}
    </span>
  );
}
function Rows({ e, labels, skip = [], dark }) {
  return (
    <dl className={cn('grid divide-y', dark ? 'divide-white/10' : 'divide-brand/[0.08]')}>
      {e.rows
        .filter((r) => !skip.includes(r.id))
        .map((r) => {
          const Icon = ROW_ICONS[r.id] ?? Hash;
          return (
            <div key={r.id} className="flex gap-3.5 py-3">
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', dark ? 'bg-white/10 text-gold-200' : 'bg-[#f3f5fb] text-brand ring-1 ring-brand/10')}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <dt className={cn('text-[11px]', dark ? 'text-white/45' : 'text-ink/45')}>{labels[r.id]}</dt>
                <dd className={cn('mt-0.5 break-words text-sm font-semibold leading-snug', dark ? 'text-white/90' : 'text-ink/85')}>
                  <bdi>{r.value}</bdi>
                </dd>
              </div>
            </div>
          );
        })}
    </dl>
  );
}

/* ---------- Licence cards: premium "licence" cards that flip to show every detail ---------- */
function FlipCard({ e, labels, t }) {
  const [flipped, setFlipped] = useState(false);
  const licence = rowValue(e, 'licence');
  return (
    <div className="h-full [perspective:1400px]">
      <motion.div className="grid h-full [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.8, ease: EASE }}>
        {/* front */}
        <div
          role="button"
          onClick={() => setFlipped(true)}
          onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), setFlipped(true))}
          aria-hidden={flipped}
          tabIndex={flipped ? -1 : 0}
          className="is-dark group relative flex min-h-[340px] cursor-pointer flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 p-7 text-start text-white shadow-xl shadow-brand/25 [backface-visibility:hidden] [grid-area:1/1]"
        >
          {/* watermark code */}
          <span dir="ltr" className="pointer-events-none absolute -bottom-8 -end-4 text-[9rem] font-black leading-none tracking-tighter text-white/[0.06]" aria-hidden>
            {e.code}
          </span>
          {/* holographic sheen */}
          <span className="pointer-events-none absolute inset-y-0 -start-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-[300%] rtl:group-hover:-translate-x-[300%]" aria-hidden />
          <span className="absolute -end-16 -top-16 size-48 rounded-full bg-gold/25 blur-[70px]" aria-hidden />
          <div className="relative flex items-center justify-between">
            <span dir="ltr" className="grid size-12 place-items-center rounded-2xl bg-white/10 text-base font-extrabold text-gold-200 ring-1 ring-white/20">
              {e.code}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-up/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              <BadgeCheck className="size-3.5" />
              {e.tier ?? t('status')}
            </span>
          </div>
          <h3 className="heading-card relative mt-7">
            <bdi>{e.name}</bdi>
          </h3>
          <p className="relative mt-1 text-sm text-white/55">{e.place}</p>
          <div className="relative mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
            <div className="flex gap-3">
              <Landmark className="mt-0.5 size-4 shrink-0 text-gold-200" />
              <div className="min-w-0">
                <div className="text-[11px] text-white/45">{labels.authority}</div>
                <div className="text-sm font-semibold leading-snug text-white/90">{rowValue(e, 'authority')}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <FileBadge className="mt-0.5 size-4 shrink-0 text-gold-200" />
              <div className="min-w-0">
                <div className="text-[11px] text-white/45">{labels.type}</div>
                <div className="text-sm font-semibold leading-snug text-white/90">{rowValue(e, 'type')}</div>
              </div>
            </div>
          </div>
          <div className="relative mt-auto pt-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">{labels.licence}</div>
            <div dir="ltr" className="mt-1 font-mono text-lg font-bold tracking-wide text-gold-200 rtl:text-end">
              {licence}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <span dir="ltr" className="text-sm font-bold text-white/85">
                {acronym(rowValue(e, 'authority'))}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 transition-colors group-hover:text-white">
                {t('hint')}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
              </span>
            </div>
          </div>
        </div>
        {/* back */}
        <div aria-hidden={!flipped} className="relative flex flex-col overflow-hidden rounded-[2rem] border border-brand/10 bg-white p-6 text-ink shadow-xl shadow-brand/10 [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <CodeBadge code={e.code} />
              <div className="min-w-0">
                <div className="heading-small truncate">
                  <bdi>{e.name}</bdi>
                </div>
                <div className="text-xs text-ink/50">{e.place}</div>
              </div>
            </div>
            <button type="button" onClick={() => setFlipped(false)} tabIndex={flipped ? 0 : -1} aria-label={t('back')} className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand transition-colors hover:bg-brand hover:text-white">
              <RotateCcw className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex-1">
            <Rows e={e} labels={labels} />
          </div>
          {licence && (
            <div className="mt-2 flex justify-end">
              <CopyButton value={licence} t={t} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
function LicenceCards({ items, labels, t }) {
  const SPAN = ['lg:col-span-2', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-3'];
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6" stagger={0.08}>
      {items.map((e, i) => (
        <StaggerItem key={e.id} className={cn('h-full', SPAN[i], i === 4 && 'sm:col-span-2 lg:col-span-3')}>
          <FlipCard e={e} labels={labels} t={t} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** White section: the five licensed entities. */
export function Entities() {
  const t = useTranslations('globalPresencePage.entities');
  const items = t.raw('items');
  const labels = t.raw('labels');
  return (
    <section id="entities" className="relative scroll-mt-24 overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-16 size-[440px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="absolute -end-40 bottom-10 size-[380px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <div className="mt-12 md:mt-14">
          <LicenceCards items={items} labels={labels} t={t} />
        </div>
        <Reveal y={12} className="mt-10 flex justify-center">
          <ArrowLink href="/company/regulations">{t('cta')}</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
