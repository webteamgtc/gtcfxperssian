'use client';
/**
 * /legal/<slug> — one policy document (privacy policy, terms, cookie policy…).
 * Document text: S3 JSON via src/lib/legalDocuments.js (passed in as `doc`); UI copy: messages/<lang>/legalPage.json.
 * Rhythm: dark hero (title + animated contents sheet) → about / key-notice cards lifted over the hero
 * → gray (sticky scroll-spy contents + numbered section cards) → other policies → navy CTA band → dark footer.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { AlertTriangle, ArrowRight, ArrowUp, BadgeCheck, Check, ChevronDown, Clock, FileText, Info, Layers, ListOrdered, ShieldCheck, Sparkles } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import CtaBand from '@/components/shared/CtaBand';
import NavLink from '@/components/shared/nav/NavLink';
import { usePathname } from '@/i18n/navigation';
import { Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { RichText, tidyTitle } from './RichText';
import { RelatedPolicies } from './RelatedPolicies';

const ACTIVATION_OFFSET = 140; // px from the top of the viewport at which a section becomes "current"

/** Colours per section tone (`type` in most documents, `tone` in the swap-free one). */
const TONES = {
  info: { Icon: ShieldCheck, tile: 'bg-brand-50 text-brand', bar: 'from-brand via-brand-400 to-gold', bullet: 'bg-brand/10 text-brand', box: 'border-brand/15 bg-brand-50/70', boxIcon: 'text-brand' },
  highlight: { Icon: BadgeCheck, tile: 'bg-brand text-white shadow-lg shadow-brand/25', bar: 'from-brand-400 via-brand to-brand-800', bullet: 'bg-brand/10 text-brand', box: 'border-brand/20 bg-brand-50', boxIcon: 'text-brand' },
  warning: { Icon: AlertTriangle, tile: 'bg-down/10 text-down', bar: 'from-down via-red-400 to-gold', bullet: 'bg-down/10 text-down', box: 'border-down/20 bg-red-50', boxIcon: 'text-down' },
  gold: { Icon: Sparkles, tile: 'bg-gold-50 text-gold-700', bar: 'from-gold-300 via-gold to-gold-700', bullet: 'bg-gold/15 text-gold-700', box: 'border-gold/30 bg-gold-50', boxIcon: 'text-gold-700' }
};
const toneOf = (s) => TONES[s.type || s.tone] || TONES.info;

const jumpTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Rough reading time of the whole document. */
function readingMinutes(doc) {
  const words = JSON.stringify(doc?.content ?? '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Current section id (scroll-spy) + how far through the document the reader is (0–1). */
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0] ?? null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!ids.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVATION_OFFSET) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
      const first = document.getElementById(ids[0]);
      const last = document.getElementById(ids.at(-1));
      if (first && last) {
        const start = first.getBoundingClientRect().top + window.scrollY - ACTIVATION_OFFSET;
        const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        setProgress(Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start))));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);
  return { active, progress };
}

/* ---------------- hero ---------------- */

/** Hero visual: a document sheet whose contents lines light up one after another; each line jumps to its section. */
function ContentsSheet({ sections, badge }) {
  const t = useTranslations('legalPage.document');
  const shown = sections.slice(0, 6);
  const [lit, setLit] = useState(0);
  useEffect(() => {
    if (shown.length < 2) return;
    const id = setInterval(() => setLit((i) => (i + 1) % shown.length), 1500);
    return () => clearInterval(id);
  }, [shown.length]);
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="relative mx-auto w-full max-w-md max-lg:hidden">
      <motion.span className="absolute -inset-10 -z-10 rounded-[3rem] bg-brand/30 blur-3xl" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      {/* pages stacked behind */}
      <span className="absolute inset-x-6 -bottom-3 top-4 rotate-[4deg] rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10" aria-hidden />
      <span className="absolute inset-x-3 -bottom-1.5 top-2 rotate-[2deg] rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10" aria-hidden />

      <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur-xl">
        <motion.span className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" animate={{ left: ['-40%', '140%'] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }} aria-hidden />
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-2.5 text-sm font-semibold text-white">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-gold text-white shadow-lg shadow-gold/40">
              <FileText className="size-4" />
              <motion.span className="absolute inset-0 rounded-xl ring-2 ring-gold" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity }} aria-hidden />
            </span>
            <span className="truncate">{badge || t('contents')}</span>
          </span>
          <span className="shrink-0 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold tabular-nums text-white/60 ring-1 ring-white/10">{t('sections', { count: sections.length })}</span>
        </div>

        <ol className="mt-6 space-y-1.5">
          {shown.map((s, i) => (
            <motion.li key={s.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: EASE }}>
              <button type="button" onClick={() => jumpTo(s.id)} className={cn('flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors duration-500 hover:bg-white/[0.08]', i === lit && 'bg-white/[0.07]')}>
                <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold tabular-nums ring-1 transition-all duration-500', i === lit ? 'bg-gold text-white ring-gold/50 shadow-md shadow-gold/30' : 'bg-white/[0.06] text-white/55 ring-white/10')}>{s.number || i + 1}</span>
                <span className={cn('truncate text-sm font-medium transition-colors duration-500', i === lit ? 'text-white' : 'text-white/55')}>{tidyTitle(s.title)}</span>
              </button>
            </motion.li>
          ))}
        </ol>
        {sections.length > shown.length && <p className="mt-3 ps-2.5 text-xs font-semibold text-white/35">+ {sections.length - shown.length}</p>}

        {/* seal */}
        <motion.span className="absolute -bottom-6 -end-6 grid size-24 place-items-center rounded-full border border-dashed border-gold/40 text-gold-200/60" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} aria-hidden>
          <ShieldCheck className="size-7" />
        </motion.span>
      </div>
    </motion.div>
  );
}

function Hero({ slug, doc, minutes }) {
  const t = useTranslations('legalPage');
  const top = doc?.topSection ?? {};
  const sections = doc?.content ?? [];
  const pathname = usePathname();
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-40 pt-36 text-white md:pb-48 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        {/* only on the /legal/… pages (not where the document is reused, e.g. the CAT 5 site's privacy policy) */}
        {pathname.includes('/legal') && <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.legal'), href: '/legal/legal-documents' }, { label: t(`docs.${slug}.name`) }]} />}
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <div className="text-center lg:text-start">
            {top.badge && (
              <motion.span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-200 ring-1 ring-gold/30 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <motion.span className="size-1.5 rounded-full bg-gold-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                {top.badge}
              </motion.span>
            )}
            <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
              <span className="heading-accent">{tidyTitle(top.title) || t(`docs.${slug}.name`)}</span>
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {top.description || doc?.bannerDesc || t(`docs.${slug}.summary`)}
            </motion.p>
            {sections.length > 0 && (
              <motion.div className="mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}>
                {[
                  { Icon: Layers, label: t('document.sections', { count: sections.length }) },
                  { Icon: Clock, label: t('document.readTime', { minutes }) }
                ].map(({ Icon, label }) => (
                  <motion.span key={label} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 ring-1 ring-white/15">
                    <Icon className="size-4 text-gold-200" />
                    {label}
                  </motion.span>
                ))}
                <motion.button type="button" onClick={() => jumpTo(sections[0].id)} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="group inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
                  <ListOrdered className="size-4" />
                  {t('document.contents')}
                  <ArrowRight className="size-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
                </motion.button>
              </motion.div>
            )}
          </div>
          {sections.length > 0 && <ContentsSheet sections={sections} badge={top.badge} />}
        </div>
      </div>
    </section>
  );
}

/* ---------------- about + key notices (lifted over the hero) ---------------- */

function Overview({ top }) {
  const t = useTranslations('legalPage.document');
  const about = top?.aboutThisPolicy;
  const notices = top?.keyNotice?.items ?? [];
  if (!about?.items?.length && !notices.length) return null;
  const hasAbout = about?.items?.length > 0;
  const noticeItem = {
    hidden: { opacity: 0, x: 18 },
    show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } }
  };
  return (
    <Reveal y={28} amount={0} className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand/10 ring-1 ring-brand/10">
      <span className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand via-brand-400 to-gold" aria-hidden />
      <div className={cn('grid', hasAbout && notices.length > 0 && 'lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]')}>
        {/* about */}
        {hasAbout && (
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-50/80 via-white to-white p-6 md:p-10">
            <span className="pointer-events-none absolute -bottom-10 -end-4 select-none font-serif text-[12rem] leading-none text-brand/[0.05]" aria-hidden>
              &rdquo;
            </span>
            <div className="relative flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-brand/25">
                <Info className="size-5" />
              </span>
              <h2 className="heading-card">{about.title || t('about')}</h2>
            </div>
            <div className="relative mt-6 space-y-4 border-s-2 border-gold/40 ps-5 text-[15px] leading-[1.8] text-ink/70">
              {about.items.map((item, i) => (
                <RichText key={i} text={item} />
              ))}
            </div>
          </div>
        )}

        {/* key notices */}
        {notices.length > 0 && (
          <div className={cn('p-6 md:p-10', hasAbout && 'border-t border-brand/10 lg:border-s lg:border-t-0')}>
            <div className="flex items-center gap-3">
              <span className="relative grid size-11 place-items-center rounded-xl bg-gold text-white shadow-lg shadow-gold/30">
                <BadgeCheck className="size-5" />
                <motion.span className="absolute inset-0 rounded-xl ring-2 ring-gold" animate={{ scale: [1, 1.3], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden />
              </span>
              <h2 className="heading-card flex-1">{top.keyNotice.badge || t('keyNotices')}</h2>
              <span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-bold tabular-nums text-gold-700 ring-1 ring-gold/20">{notices.length}</span>
            </div>
            <Stagger as="ol" className="mt-5 divide-y divide-brand/[0.07]" stagger={0.08} amount={0}>
              {notices.map((item, i) => (
                <StaggerItem as="li" key={i} variants={noticeItem} className="group -mx-3 flex items-start gap-4 rounded-2xl px-3 py-4 transition-colors duration-300 hover:bg-gold-50/60">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold-50 text-xs font-bold tabular-nums text-gold-700 ring-1 ring-gold/20 transition-all duration-300 group-hover:bg-gold group-hover:text-white group-hover:ring-gold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <RichText text={item} className="min-w-0 flex-1 pt-1 text-[15px] leading-relaxed text-ink/75" />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* ---------------- contents sidebar ---------------- */

function Contents({ sections, label, active, progress }) {
  const t = useTranslations('legalPage.document');
  const [open, setOpen] = useState(false); // mobile only; always open on desktop
  const refs = useRef({});
  const index = Math.max(0, sections.findIndex((s) => s.id === active));

  // keep the current entry visible inside the scrollable list
  useEffect(() => {
    const el = refs.current[active];
    const list = el?.parentElement?.parentElement;
    if (!el || !list || list.scrollHeight <= list.clientHeight) return;
    const top = el.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top > list.scrollTop + list.clientHeight - el.offsetHeight) list.scrollTo({ top: top - list.clientHeight / 3, behavior: 'smooth' });
  }, [active]);

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <Reveal y={24} amount={0} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-brand/5 ring-1 ring-brand/10 lg:max-h-[calc(100vh-8rem)]">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-5 text-start lg:pointer-events-none">
          <span className="relative grid size-11 shrink-0 place-items-center">
            <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-brand/10" />
              <circle cx="22" cy="22" r="19" fill="none" stroke="url(#legal-ring)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 19} strokeDashoffset={(1 - progress) * 2 * Math.PI * 19} className="transition-[stroke-dashoffset] duration-300" />
              <defs>
                <linearGradient id="legal-ring" x1="0" x2="1">
                  <stop offset="0%" stopColor="#293b93" />
                  <stop offset="100%" stopColor="#b68756" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[10px] font-bold tabular-nums text-brand">{Math.round(progress * 100)}%</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="heading-label block">{label || t('contents')}</span>
            <span className="mt-0.5 block truncate text-xs text-ink/50">{t('section', { current: index + 1, total: sections.length })}</span>
          </span>
          <ChevronDown className={cn('size-5 shrink-0 text-ink/40 transition-transform duration-300 lg:hidden', open && 'rotate-180')} />
        </button>

        <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out lg:flex lg:min-h-0 lg:flex-1 lg:flex-col', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
          <div className="min-h-0 overflow-hidden lg:flex lg:flex-1 lg:flex-col">
            <ol className="no-scrollbar space-y-1 overflow-y-auto border-t border-brand/10 px-3 py-3 max-lg:max-h-[50vh] lg:min-h-0 lg:flex-1">
              {sections.map((s) => {
                const on = s.id === active;
                return (
                  <li key={s.id} ref={(n) => (refs.current[s.id] = n)} className="relative">
                    {on && <motion.span layoutId="legal-contents-active" className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand/15" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <a
                      href={`#${s.id}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        jumpTo(s.id);
                        history.replaceState(null, '', `#${s.id}`);
                        setOpen(false);
                      }}
                      className="group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors"
                    >
                      <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold tabular-nums transition-colors duration-300', on ? 'bg-brand text-white' : 'bg-brand/[0.06] text-brand group-hover:bg-brand/10')}>{s.number}</span>
                      <span className={cn('line-clamp-2 font-medium leading-snug transition-colors', on ? 'text-brand' : 'text-ink/65 group-hover:text-brand')}>{tidyTitle(s.title)}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
            <div className="border-t border-brand/10 p-3">
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand/[0.04] px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
                <ArrowUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
                {t('backToTop')}
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-brand/[0.06] lg:hidden">
          <div className="h-full bg-gradient-to-r from-brand to-gold transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      </Reveal>
    </aside>
  );
}

/* ---------------- section card ---------------- */

function Callout({ tone, Icon = Info, title, children }) {
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4', tone.box)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', tone.boxIcon)} />
      <div className="min-w-0 text-sm leading-relaxed text-ink/75">
        {title && <p className="mb-1.5 font-bold text-ink">{title}</p>}
        {children}
      </div>
    </div>
  );
}

function SectionCard({ section, active }) {
  const t = useTranslations('legalPage.document');
  const tone = toneOf(section);
  const items = Array.isArray(section.content) ? section.content : [];
  const groups = Array.isArray(section.groups) ? section.groups : [];
  const notes = Array.isArray(section.notes) ? section.notes : [];
  const plain = groups.length > 0; // intro paragraphs above group cards are not bullet points
  return (
    <Reveal as="section" id={section.id} y={24} amount={0} className={cn('group/card relative scroll-mt-28 overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-xl shadow-brand/5 ring-1 transition-[box-shadow,ring-color] duration-500 md:p-8', active ? 'shadow-brand/10 ring-brand/25' : 'ring-brand/10')}>
      <span className={cn('absolute inset-x-0 top-0 h-1 origin-left bg-gradient-to-r transition-transform duration-700 rtl:origin-right', tone.bar, active ? 'scale-x-100' : 'scale-x-0 group-hover/card:scale-x-100')} aria-hidden />
      <span className="pointer-events-none absolute -end-2 -top-5 select-none text-[7rem] font-black leading-none tabular-nums text-ink/[0.035]" aria-hidden>
        {section.number}
      </span>

      <div className="relative flex items-start gap-4">
        <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover/card:-rotate-6', tone.tile)}>
          <tone.Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold tabular-nums tracking-wider text-white">{section.number}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-brand/20 to-transparent rtl:bg-gradient-to-l" />
          </div>
          <h2 className="heading-card mt-2 text-balance">{tidyTitle(section.title)}</h2>
        </div>
      </div>

      {section.highlight && (
        <div className="relative mt-6">
          <Callout tone={tone}>
            <RichText text={section.highlight} />
          </Callout>
        </div>
      )}

      {items.length > 0 && (
        <ul className="relative mt-6 space-y-3.5">
          {items.map((item, i) =>
            plain ? (
              <li key={i} className="text-[15px] leading-relaxed text-ink/70">
                <RichText text={item} />
              </li>
            ) : (
              <li key={i} className="flex items-start gap-3">
                <span className={cn('mt-1 grid size-5 shrink-0 place-items-center rounded-full', tone.bullet)}>
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <RichText text={item} className="min-w-0 flex-1 text-[15px] leading-relaxed text-ink/70" />
              </li>
            )
          )}
        </ul>
      )}

      {groups.length > 0 && (
        <div className="relative mt-6 grid gap-4 md:grid-cols-2">
          {groups.map((g, gi) => (
            <div key={`${g.title}-${gi}`} className="overflow-hidden rounded-2xl bg-brand-50/50 ring-1 ring-brand/10">
              <h3 className="border-b border-brand/10 bg-brand-50 px-5 py-3.5 text-sm font-bold text-brand">{g.title}</h3>
              <div className="space-y-2 px-5 py-4 text-sm leading-relaxed text-ink/70">
                {(g.lines ?? []).map((line, i) => (
                  <RichText key={i} text={line} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {section.callout && (
        <div className="relative mt-6">
          <Callout tone={TONES.gold} Icon={Sparkles}>
            <RichText text={section.callout} />
          </Callout>
        </div>
      )}

      {notes.length > 0 && (
        <div className="relative mt-6">
          <Callout tone={TONES.warning} Icon={AlertTriangle} title={t('notes')}>
            <ul className="list-disc space-y-1.5 ps-4 marker:text-down/60">
              {notes.map((n, i) => (
                <li key={i}>
                  <RichText text={n} />
                </li>
              ))}
            </ul>
          </Callout>
        </div>
      )}
    </Reveal>
  );
}

/* ---------------- page ---------------- */

function Unavailable() {
  const t = useTranslations('legalPage.document');
  return (
    <Reveal y={24} amount={0} className="mx-auto max-w-2xl rounded-[1.75rem] bg-white p-8 text-center shadow-xl shadow-brand/10 ring-1 ring-brand/10">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold-50 text-gold-700">
        <FileText className="size-6" />
      </span>
      <h2 className="heading-card mt-5">{t('unavailable.title')}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{t('unavailable.text')}</p>
      <NavLink href="/legal/legal-documents" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
        {t('allDocuments')}
        <ArrowRight className="size-4 rtl:-scale-x-100" />
      </NavLink>
    </Reveal>
  );
}

export default function LegalDocumentPage({ slug, doc }) {
  const t = useTranslations('legalPage.document');
  const sections = useMemo(() => doc?.content ?? [], [doc]);
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const { active, progress } = useScrollSpy(ids);
  const minutes = useMemo(() => readingMinutes(doc), [doc]);
  const footer = doc?.footer;
  const [contact] = footer?.buttons ?? [];

  return (
    <div className="overflow-x-clip bg-[#f6f7fb] text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <Hero slug={slug} doc={doc} minutes={minutes} />

        <section className="relative pb-16 md:pb-24">
          <div className="container-x relative -mt-28 md:-mt-32">
            {!doc ? (
              <Unavailable />
            ) : (
              <>
                <Overview top={doc.topSection} />
                <div className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
                  <Contents sections={sections} label={doc.sidebarLabels?.contentsLabel} active={active} progress={progress} />
                  <div className="space-y-5 md:space-y-6">
                    {sections.map((s) => (
                      <SectionCard key={s.id} section={s} active={s.id === active} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <RelatedPolicies current={slug} />

        {footer?.title && (
          <CtaBand
            title={footer.title}
            description={footer.description}
            primary={{ label: contact?.label || t('contactSupport'), href: contact?.href?.startsWith('/') ? contact.href : '/company/contact-us' }}
            secondary={{ label: t('allDocuments'), href: '/legal/legal-documents' }}
          />
        )}
      </main>
      <Footer theme="dark" />
    </div>
  );
}
