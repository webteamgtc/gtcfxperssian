'use client';
/**
 * Pieces for articles written in the GTC lesson template (parsed by src/lib/learnArticle.js):
 * hero kicker + pills, quick guide (TOC) with scroll-spy, section / summary / FAQ / risk blocks, share row.
 * Used by knowledge-to-learn lessons and GTC News articles.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Bookmark, Check, CheckCircle2, ChevronDown, Clock, Link2, TriangleAlert, UserRound } from 'lucide-react';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { SOCIALS } from '@/components/shared/icons';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const PILL_ICONS = [Clock, UserRound, BookOpen];
const digits = (s, fallback) => (String(s ?? '').match(/\d+/)?.[0] ?? String(fallback)).padStart(2, '0');


export function HeroKicker({ hero }) {
  if (!hero?.badge && !hero?.eyebrow) return null;
  return (
    <motion.div className="mt-6 flex flex-col items-center gap-3 lg:items-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
      {hero.badge && (
        <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-200 ring-1 ring-gold/30">
          <BookOpen className="size-3.5" /> {hero.badge}
        </span>
      )}
      {hero.eyebrow && <span className="text-base font-medium italic text-white/60">{hero.eyebrow}</span>}
    </motion.div>
  );
}

export function HeroPills({ pills, lessonLabel }) {
  const items = [...(pills ?? []).map((label, i) => ({ label, Icon: PILL_ICONS[i] ?? BookOpen })), lessonLabel && { label: lessonLabel, Icon: CheckCircle2, gold: true }].filter(Boolean);
  if (!items.length) return null;
  return (
    <motion.ul className="mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}>
      {items.map(({ label, Icon, gold }) => (
        <motion.li
          key={label}
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 backdrop-blur', gold ? 'bg-gold/15 text-gold-200 ring-gold/30' : 'bg-white/[0.06] text-white/75 ring-white/10')}
        >
          <Icon className="size-4" /> {label}
        </motion.li>
      ))}
    </motion.ul>
  );
}

/* ------------------------------------------------------------ quick guide (TOC) */

/** Id of the section currently in the reading zone. */
export function useActiveId(ids) {
  const key = ids.join('|');
  const [active, setActive] = useState(ids[0] ?? null);
  useEffect(() => {
    const els = key.split('|').map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}

function jump(e, id) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
}

function TocList({ items, active, onPick }) {
  return (
    <ol className="space-y-1">
      {items.map((it, i) => {
        const on = it.id === active;
        return (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              onClick={(e) => {
                jump(e, it.id);
                onPick?.();
              }}
              className={cn('relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm leading-snug transition-colors', on ? 'text-brand' : 'text-ink/60 hover:bg-white hover:text-ink')}
            >
              {on && <motion.span layoutId="toc-active" className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-brand/15" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span dir="ltr" className={cn('relative grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold tabular-nums transition-colors', on ? 'bg-brand text-white' : 'bg-brand-50 text-brand')}>
                {digits(it.num, i + 1)}
              </span>
              <span className={cn('relative', on && 'font-semibold')}>{it.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function QuickGuide({ toc, active, progress }) {
  return (
    <div className="rounded-[1.75rem] bg-[#f6f7fb] p-4 ring-1 ring-brand/10">
      <div className="px-3 pt-2">
        {toc.label && <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-600">{toc.label}</span>}
        {toc.title && <p className="mt-1 font-semibold text-ink">{toc.title}</p>}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-brand/10" aria-hidden>
          <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-brand to-gold rtl:origin-right" style={{ scaleX: progress }} />
        </div>
      </div>
      <div className="mt-3 max-h-[calc(100vh-15rem)] overflow-y-auto pe-1">
        <TocList items={toc.items} active={active} />
      </div>
    </div>
  );
}

export function MobileQuickGuide({ toc, active }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-10 overflow-hidden rounded-[1.5rem] bg-[#f6f7fb] ring-1 ring-brand/10 lg:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start">
        <span>
          {toc.label && <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-gold-600">{toc.label}</span>}
          <span className="font-semibold text-ink">{toc.title}</span>
        </span>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white transition-transform duration-300', open && 'rotate-180')}>
          <ChevronDown className="size-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            <div className="px-2 pb-3">
              <TocList items={toc.items} active={active} onPick={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------ body blocks */

function SectionEyebrow({ num, index }) {
  return (
    <div className="flex items-center gap-3">
      <span dir="ltr" className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-800 text-sm font-bold text-white shadow-lg shadow-brand/20">
        {digits(num, index)}
      </span>
      {num && <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{num}</span>}
      <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent rtl:bg-gradient-to-l" aria-hidden />
    </div>
  );
}

export function Block({ block, index }) {
  switch (block.type) {
    case 'intro':
      return (
        <Reveal y={16}>
          <div className="learn-article learn-lead" dangerouslySetInnerHTML={{ __html: block.html }} />
        </Reveal>
      );
    case 'section':
      return (
        <section id={block.id || undefined} className="scroll-mt-28">
          <Reveal y={24}>
            <SectionEyebrow num={block.num} index={index} />
            <h2 className="mt-5 text-balance text-2xl font-bold leading-tight tracking-tight text-ink md:text-[1.75rem]">{block.title}</h2>
            <div className="learn-article mt-5" dangerouslySetInnerHTML={{ __html: block.html }} />
          </Reveal>
        </section>
      );
    case 'summary':
      return (
        <section id={block.id || undefined} className="scroll-mt-28">
          <Reveal y={24}>
            <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-50 via-white to-gold-50 p-7 ring-1 ring-brand/15 md:p-9">
              <span className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-gold to-brand" aria-hidden />
              <motion.span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/15 blur-3xl" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
              <div className="relative flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-gold text-white shadow-lg shadow-gold/30">
                  <Bookmark className="size-5" />
                </span>
                <h2 className="text-xl font-bold text-ink md:text-2xl">{block.title}</h2>
              </div>
              <div className="learn-article relative mt-5" dangerouslySetInnerHTML={{ __html: block.html }} />
            </div>
          </Reveal>
        </section>
      );
    case 'faq':
      return (
        <section id={block.id || undefined} className="scroll-mt-28">
          <Reveal y={24}>
            <SectionEyebrow num={block.num} index={index} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink md:text-[1.75rem]">{block.title}</h2>
          </Reveal>
          {block.items.length > 0 && <FaqAccordion items={block.items} numbered className="mt-8" />}
        </section>
      );
    case 'risk':
      return (
        <Reveal y={24}>
          <div className="is-dark relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-900 to-ink p-7 text-white md:p-9">
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <div className="relative flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-down/15 text-red-300 ring-1 ring-down/30">
                <TriangleAlert className="size-5" />
              </span>
              <h2 className="text-lg font-bold text-red-300">{block.title}</h2>
            </div>
            <div className="relative mt-5 space-y-3 text-sm leading-relaxed">
              {block.paragraphs.map((p, i) => (
                <p key={i} className={i === block.paragraphs.length - 1 && i > 0 ? 'text-white/55' : 'text-white/80'}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------ share + prev / next */

export const SHARE = {
  LinkedIn: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  Facebook: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  X: (u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
  Telegram: (u, t) => `https://t.me/share/url?url=${u}&text=${t}`
};

export function ShareRow({ title, ns = 'knowledgePage.course' }) {
  const t = useTranslations(ns);
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.href.split('#')[0]), []);
  const u = encodeURIComponent(url);
  const txt = encodeURIComponent(title);
  const btn = 'grid size-11 place-items-center rounded-full bg-brand-50 text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] p-5 ring-1 ring-brand/10 sm:flex-row">
      <span className="text-sm font-semibold text-ink">{t('share')}</span>
      <div className="flex flex-wrap items-center gap-2">
        {SOCIALS.filter((s) => SHARE[s.name]).map((s) => (
          <a key={s.name} href={url ? SHARE[s.name](u, txt) : undefined} target="_blank" rel="noopener noreferrer" aria-label={s.name} className={btn}>
            {s.icon('size-4')}
          </a>
        ))}
        <button type="button" onClick={copy} aria-label={copied ? t('copied') : t('copyLink')} title={copied ? t('copied') : t('copyLink')} className={cn(btn, copied && 'bg-up text-white hover:bg-up')}>
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
