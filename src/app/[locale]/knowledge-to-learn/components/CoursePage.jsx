'use client';
/**
 * /knowledge-to-learn/<course> — curriculum of a course from Strapi (sections + lesson titles), see src/lib/learn.js.
 * Rhythm: dark hero (title + reading progress) → gray (sticky "up next" panel + module accordion) → navy app band (CTA).
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpen, Check, ChevronDown, PlayCircle } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { LearnShell, LearnHero, LearnAppPromo } from './course/LearnShell';
import { useReadLessons } from './course/progress';
import { HUB_PATH, articleHref, sectionHref } from '../courses';

const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------ hero progress */

function ProgressCard({ done, total }) {
  const t = useTranslations('knowledgePage.course');
  const C = 2 * Math.PI * 30;
  const bars = Math.min(total, 12);
  const filled = total ? Math.round((done / total) * bars) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }} className="mx-auto w-full max-w-sm rounded-[2rem] bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="flex items-center gap-5">
        <div className="relative grid size-20 shrink-0 place-items-center">
          <svg viewBox="0 0 70 70" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            <circle cx="35" cy="35" r="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
            <motion.circle cx="35" cy="35" r="30" fill="none" stroke="#d2a67a" strokeWidth="7" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - (total ? done / total : 0)) }} transition={{ duration: 1.4, ease: EASE, delay: 0.5 }} />
          </svg>
          <span dir="ltr" className="text-lg font-bold tabular-nums">
            {done}/{total}
          </span>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{t('progressLabel')}</div>
          <div className="mt-1 text-lg font-semibold">{t('progressCount', { done, total })}</div>
        </div>
      </div>
      {bars > 0 && (
        <div className="mt-5 flex gap-1.5" aria-hidden>
          {Array.from({ length: bars }, (_, i) => (
            <motion.span key={i} className={cn('h-1.5 flex-1 rounded-full', i < filled ? 'bg-gold' : 'bg-white/15')} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6 + i * 0.06 }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------ sticky panel */

/** Heading, course summary and the navy "up next" card linking to the next unread lesson. */
function PathPanel({ course, sections, next, lessons }) {
  const t = useTranslations('knowledgePage.course');
  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <Reveal y={16} className="text-center lg:text-start">
        <h2 className="heading-section">
          <AccentTitle text={t('pathTitle')} />
        </h2>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm ring-1 ring-brand/10">
          <BookOpen className="size-4 text-gold" />
          {t('pathSummary', { sections: sections.length, lessons })}
        </span>
      </Reveal>

      <Reveal y={20} delay={0.1} className="mt-8">
        <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-7 text-white shadow-2xl shadow-brand/25">
          <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
          <motion.span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
          {next ? (
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-200 ring-1 ring-gold/30">
                <motion.span className="size-1.5 rounded-full bg-gold" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
                {t('upNext')}
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {t('sectionLabel', { n: next.index + 1 })} · {next.section.name}
              </p>
              <p className="mt-2 text-xl font-semibold leading-snug">{next.lesson.title}</p>
              <NavLink href={articleHref(course, next.section.slug, next.lesson.slug)} className="group mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-gold ps-6 pe-2 text-sm font-semibold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
                {t('start')}
                <span className="grid size-8 place-items-center rounded-full bg-white text-gold-700 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                  <ArrowRight className="size-4 rtl:-scale-x-100" />
                </span>
              </NavLink>
            </div>
          ) : (
            <div className="relative flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-gold text-white">
                <Check className="size-6" strokeWidth={3} />
              </span>
              <p className="text-xl font-semibold">{t('completed')}</p>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------ module accordion */

function ModuleBadge({ n, state }) {
  return (
    <span
      className={cn(
        'relative grid size-12 shrink-0 place-items-center rounded-2xl text-base font-bold tabular-nums transition-all duration-500 group-hover:-rotate-6',
        state === 'done' && 'bg-gold text-white shadow-lg shadow-gold/30',
        state === 'next' && 'bg-gradient-to-br from-brand-500 to-brand-900 text-white shadow-lg shadow-brand/30',
        state === 'todo' && 'bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white'
      )}
    >
      {state === 'next' && <motion.span className="absolute inset-0 rounded-2xl ring-2 ring-gold" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden />}
      {state === 'done' ? <Check className="size-5" strokeWidth={3} /> : <span dir="ltr">{pad(n)}</span>}
    </span>
  );
}

function Module({ course, section, index, read, state, open, onToggle }) {
  const t = useTranslations('knowledgePage.course');
  const isRead = (l) => read.includes(`${section.slug}/${l.slug}`);
  const done = section.items.filter(isRead).length;
  const total = section.items.length || section.lessons;
  const first = section.items.find((l) => !isRead(l)) ?? section.items[0];
  const panelId = `module-${section.slug}`;

  return (
    <div className={cn('overflow-hidden rounded-[1.75rem] bg-white ring-1 transition-all duration-500', open ? 'shadow-2xl shadow-brand/10 ring-brand/20' : 'ring-brand/10 hover:shadow-xl hover:shadow-brand/5 hover:ring-brand/20')}>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="group flex w-full items-center gap-4 p-5 text-start md:gap-5 md:p-6">
        <ModuleBadge n={index + 1} state={state} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand/60">{t('sectionLabel', { n: index + 1 })}</span>
            {state === 'next' && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{t('upNext')}</span>}
            {state === 'done' && <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700">{t('completed')}</span>}
          </span>
          <span className="mt-1 block text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand md:text-xl">{section.name}</span>
          <span className="mt-2.5 flex items-center gap-3">
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-brand/10 sm:w-32" aria-hidden>
              <motion.span className="block h-full rounded-full bg-gradient-to-r from-brand to-gold" initial={{ width: 0 }} whileInView={{ width: `${total ? (done / total) * 100 : 0}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} />
            </span>
            <span dir="ltr" className="text-xs font-medium tabular-nums text-ink/45">
              {done}/{total}
            </span>
            <span className="hidden items-center gap-1 text-xs text-ink/45 sm:inline-flex">
              <BookOpen className="size-3.5" /> {t('lessons', { count: total })}
            </span>
          </span>
        </span>
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-full transition-all duration-500', open ? 'rotate-180 bg-brand text-white' : 'bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white')}>
          <ChevronDown className="size-5" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panelId} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            <div className="mx-5 border-t border-brand/10 pb-5 pt-3 md:mx-6 md:pb-6">
              {section.items.length ? (
                <ol className="space-y-1">
                  {section.items.map((l, k) => {
                    const r = isRead(l);
                    const up = l === first && state !== 'done';
                    return (
                      <motion.li key={l.slug} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + k * 0.05, duration: 0.4 }}>
                        <NavLink href={articleHref(course, section.slug, l.slug)} className={cn('group/l flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors', up ? 'bg-brand-50' : 'hover:bg-[#f6f7fb]')}>
                          <span className={cn('grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums', r ? 'bg-up/10 text-up' : up ? 'bg-brand text-white' : 'bg-white text-ink/45 ring-1 ring-brand/10')}>
                            {r ? <Check className="size-4" strokeWidth={3} /> : up ? <PlayCircle className="size-4" /> : <span dir="ltr">{k + 1}</span>}
                          </span>
                          <span className={cn('flex-1 text-sm leading-snug md:text-[15px]', r ? 'text-ink/50' : 'font-medium text-ink group-hover/l:text-brand')}>{l.title}</span>
                          <ArrowRight className="size-4 shrink-0 text-brand opacity-0 transition-all duration-300 group-hover/l:translate-x-0.5 group-hover/l:opacity-100 rtl:-scale-x-100" />
                        </NavLink>
                      </motion.li>
                    );
                  })}
                </ol>
              ) : (
                <p className="py-4 text-sm text-ink/50">{t('noArticles')}</p>
              )}
              {first && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-3">
                  <NavLink href={sectionHref(course, section.slug)} className="text-sm font-semibold text-ink/55 transition-colors hover:text-brand">
                    {t('lessonsTitle').replace(/[[\]]/g, '')}
                  </NavLink>
                  <NavLink href={articleHref(course, section.slug, first.slug)} className="group/s inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                    <PlayCircle className="size-4" /> {t('start')}
                    <ArrowRight className="size-4 transition-transform group-hover/s:translate-x-0.5 rtl:-scale-x-100" />
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Curriculum: sticky panel (heading, summary, "up next" lesson) beside a single-open module accordion.
 * The first unfinished module starts open; read lessons are ticked (browser progress).
 */
function Curriculum({ course, sections, read }) {
  const t = useTranslations('knowledgePage.course');
  const isRead = (s, l) => read.includes(`${s.slug}/${l.slug}`);
  const doneOf = (s) => s.items.filter((l) => isRead(s, l)).length;
  const isDone = (s) => s.items.length > 0 && doneOf(s) >= s.items.length;
  const nextIndex = sections.findIndex((s) => s.items.length > 0 && !isDone(s));
  const next = nextIndex >= 0 ? { index: nextIndex, section: sections[nextIndex], lesson: sections[nextIndex].items.find((l) => !isRead(sections[nextIndex], l)) } : null;
  const lessons = sections.reduce((n, s) => n + (s.items.length || s.lessons), 0);
  const [open, setOpen] = useState(null);
  const current = open ?? Math.max(nextIndex, 0);

  if (!sections.length) return <p className="bg-[#f6f7fb] py-20 text-center text-ink/50">{t('noSections')}</p>;

  return (
    // overflow-clip (not hidden): an overflow-hidden ancestor would become the scroll container and cancel the sticky panel
    <section id="sections" className="relative overflow-clip bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -start-40 top-1/4 size-[420px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="absolute -end-40 bottom-0 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:gap-14">
        <PathPanel course={course} sections={sections} next={next} lessons={lessons} />
        <Stagger className="space-y-3" stagger={0.05}>
          {sections.map((s, i) => (
            <StaggerItem key={s.slug}>
              <Module course={course} section={s} index={i} read={read} state={isDone(s) ? 'done' : i === nextIndex ? 'next' : 'todo'} open={current === i} onToggle={() => setOpen(current === i ? -1 : i)} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ page */

export default function CoursePage({ course, ns, sections }) {
  const t = useTranslations(`${ns}.courseHeader`);
  const tk = useTranslations('knowledgePage.breadcrumb');
  const read = useReadLessons(course);
  const slugs = new Set(sections.map((s) => s.slug));
  const total = sections.reduce((n, s) => n + s.lessons, 0);
  const done = Math.min(total, read.filter((id) => slugs.has(id.split('/')[0])).length);

  return (
    <LearnShell>
      <LearnHero
        crumbs={[{ label: tk('home'), href: '/' }, { label: tk('current'), href: HUB_PATH }, { label: t('title').replace(/[[\]]/g, '') }]}
        back={{ href: HUB_PATH, label: t('psychologyLink') }}
        title={t('title')}
        subtitle={t('subtitle')}
        aside={total > 0 && <ProgressCard done={done} total={total} />}
      />
      <Curriculum course={course} sections={sections} read={read} />
      <LearnAppPromo band />
    </LearnShell>
  );
}
