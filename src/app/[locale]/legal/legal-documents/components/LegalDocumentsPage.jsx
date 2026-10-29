'use client';
/**
 * /legal/legal-documents — PDF agreements per regulated entity + links to the online policy pages.
 * UI copy: messages/<lang>/legalPage.json → `legalPage.hub`; PDF list: ../legalDocumentsData.js
 * Rhythm: dark hero (a document being signed + stamped, cycling through the real files)
 * → gray (dark entity picker + paper-style PDF cards, lifted over the hero) → white (online policies)
 * → navy CTA band → dark footer.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, ArrowUpRight, BadgeCheck, Building2, Check, FileText, Globe2, Info, Landmark } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import CtaBand from '@/components/shared/CtaBand';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { CountUp, Reveal, ScrollProgress, TiltCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { PolicyGrid, POLICIES } from '../../components/RelatedPolicies';
import { LEGAL_DOCUMENT_ENTITIES } from '../legalDocumentsData';

const visibleDocs = (entity) => entity.sections.flatMap((s) => s.items.filter((d) => !d.hidden));
const ENTITY_ICONS = { mauritius: Landmark, vanuatu: Globe2 };
const ALL_DOCS = LEGAL_DOCUMENT_ENTITIES.flatMap((e) => visibleDocs(e).map((d) => ({ ...d, entity: e.key })));

/* ---------------- hero ---------------- */

/** Hero visual: a PDF that gets signed and stamped, then swaps to the next real document. */
function SigningDocument() {
  const t = useTranslations('legalPage.hub');
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ALL_DOCS.length), 4800);
    return () => clearInterval(id);
  }, []);
  const doc = ALL_DOCS[i];
  return (
    <motion.div initial={{ opacity: 0, y: 40, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }} className="relative mx-auto w-full max-w-[22rem] max-lg:hidden" aria-hidden>
      <motion.span className="absolute -inset-12 -z-10 rounded-full bg-brand/40 blur-3xl" animate={{ opacity: [0.4, 0.85, 0.4], scale: [1, 1.06, 1] }} transition={{ duration: 7, repeat: Infinity }} />
      {/* sheets behind */}
      <span className="absolute inset-0 translate-x-6 translate-y-5 rotate-[6deg] rounded-[1.75rem] bg-white/10 ring-1 ring-white/15 backdrop-blur" />
      <span className="absolute inset-0 translate-x-3 translate-y-2.5 rotate-[3deg] rounded-[1.75rem] bg-white/20 ring-1 ring-white/20 backdrop-blur" />

      <TiltCard max={7} className="relative rounded-[1.75rem]">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 text-ink shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]">
          {/* scan line */}
          <motion.span className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-brand/[0.07] to-transparent" animate={{ top: ['-20%', '110%'] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }} />
          {/* folded corner */}
          <span className="absolute end-0 top-0 size-10 rounded-es-2xl bg-gradient-to-bl from-brand-100 to-brand-50 shadow-[-4px_4px_10px_rgba(41,59,147,0.12)]" />

          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-red-50 text-[11px] font-black text-down ring-1 ring-down/15">PDF</span>
            <div className="min-w-0 flex-1 pe-8">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700">{t(`content.entities.${doc.entity}.short`)}</span>
              <AnimatePresence mode="wait">
                <motion.span key={i} className="block truncate text-base font-bold" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                  {doc.name}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* text lines typing in */}
          <div key={`lines-${i}`} className="mt-6 space-y-2.5">
            {[100, 92, 97, 70, 88, 94, 58].map((w, j) => (
              <motion.span key={j} className="block h-2 origin-left rounded-full bg-ink/[0.07] rtl:origin-right" style={{ width: `${w}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.1 + j * 0.08, duration: 0.45, ease: EASE }} />
            ))}
          </div>

          {/* signature + stamp */}
          <div className="relative mt-7 flex items-end justify-between border-t border-dashed border-ink/10 pt-4">
            <svg key={`sig-${i}`} viewBox="0 0 160 44" className="h-11 w-36">
              <motion.path d="M4 32c10-18 18-24 22-16s-6 20 2 18 12-22 20-20-4 18 4 16 10-14 16-12 2 10 8 8 14-10 22-10 12 6 22 4 18-8 30-6" fill="none" stroke="#293b93" strokeWidth="2.2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 1.2, ease: 'easeInOut' }} />
            </svg>
            <motion.span key={`stamp-${i}`} className="grid size-16 place-items-center rounded-full border-2 border-gold text-gold" initial={{ scale: 2.2, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ delay: 1.9, type: 'spring', stiffness: 260, damping: 14 }}>
              <span className="grid size-[3.25rem] place-items-center rounded-full border border-dashed border-gold/60">
                <BadgeCheck className="size-6" />
              </span>
            </motion.span>
          </div>
        </div>
      </TiltCard>

      {/* floating chips */}
      <motion.span className="absolute -start-12 bottom-16 inline-flex items-center gap-2 rounded-full bg-ink/85 px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-black/30 ring-1 ring-white/15 backdrop-blur-xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="grid size-5 place-items-center rounded-full bg-up text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
        {t('hero.verified')}
      </motion.span>
      <motion.span className="absolute -end-8 top-24 inline-flex items-center gap-2 rounded-full bg-gold px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-gold/40" animate={{ y: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}>
        <motion.span animate={{ y: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <ArrowDown className="size-3.5" />
        </motion.span>
        {t('content.pdf')}
      </motion.span>
    </motion.div>
  );
}

function Hero() {
  const t = useTranslations('legalPage');
  const stats = [
    { value: LEGAL_DOCUMENT_ENTITIES.length, label: t('hub.hero.entities'), Icon: Building2 },
    { value: ALL_DOCS.length, label: t('hub.hero.documents'), Icon: FileText },
    { value: POLICIES.length, label: t('hub.hero.policies'), Icon: Globe2 }
  ];
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-40 pt-36 text-white md:pb-48 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('hub.current') }]} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-20">
          <div className="text-center lg:text-start">
            <motion.span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-200 ring-1 ring-gold/30 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <motion.span className="size-1.5 rounded-full bg-gold-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
              {t('hub.hero.eyebrow')}
            </motion.span>
            <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('hub.hero.title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('hub.hero.description')}
            </motion.p>
            <motion.dl className="mx-auto mt-9 flex max-w-lg items-stretch divide-x divide-white/10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 backdrop-blur rtl:divide-x-reverse lg:mx-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: EASE }}>
              {stats.map(({ value, label, Icon }) => (
                <div key={label} className="group flex-1 px-4 py-4 text-center sm:px-5 lg:text-start">
                  <dt className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/45 lg:justify-start">
                    <Icon className="size-3.5 text-gold-200 transition-transform duration-300 group-hover:scale-125" />
                    <span className="truncate">{label}</span>
                  </dt>
                  <dd>
                    <CountUp value={value} className="mt-1.5 block text-3xl font-bold tabular-nums text-white" />
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>
          <SigningDocument />
        </div>
      </div>
    </section>
  );
}

/* ---------------- documents ---------------- */

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.2 } }
};

/** A paper-style card: mini PDF sheet on top (lifts on hover), name + download below. */
function DocumentCard({ doc, entityShort, download, open }) {
  return (
    <motion.a variants={cardVariants} href={doc.link} target="_blank" rel="noopener noreferrer" className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-lg shadow-brand/5 ring-1 ring-brand/10 transition-[box-shadow,ring-color,transform] duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/15 hover:ring-brand/25">
      {/* preview */}
      <div className="relative h-28 overflow-hidden sm:h-36 bg-gradient-to-br from-brand-50 via-white to-gold-50">
        <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
        <div className="absolute inset-x-0 -bottom-6 mx-auto w-40 rounded-t-xl bg-white p-3.5 shadow-xl shadow-brand/15 ring-1 ring-brand/10 transition-transform duration-500 ease-out group-hover:-translate-y-3 group-hover:-rotate-2" aria-hidden>
          <span className="absolute end-0 top-0 size-6 rounded-es-lg bg-gradient-to-bl from-brand-100 to-brand-50" />
          <div className="flex items-center gap-2">
            <span className="rounded bg-down px-1.5 py-0.5 text-[9px] font-black leading-none text-white">PDF</span>
            <span className="h-1.5 w-12 rounded-full bg-ink/15" />
          </div>
          <div className="mt-3 space-y-1.5">
            {[100, 86, 94, 64, 90].map((w, j) => (
              <span key={j} className="block h-1 rounded-full bg-ink/[0.08]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        {/* open hint */}
        <span className="absolute end-3 top-3 inline-flex translate-y-1 items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg shadow-brand/30 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {open}
          <ArrowUpRight className="size-3 rtl:-scale-x-100" />
        </span>
      </div>

      {/* body */}
      <div className="relative flex flex-1 items-center gap-3 border-t border-brand/10 p-4">
        <div className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-brand">{doc.name}</span>
          <span className="mt-1 block text-xs text-ink/45">PDF · {entityShort}</span>
        </div>
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand/[0.07] text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white" title={download}>
          <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-10" />
          <ArrowDown className="absolute size-4 -translate-y-10 transition-transform duration-300 group-hover:translate-y-0" />
                  </span>
      </div>
    </motion.a>
  );
}

/** Dark panel with the entity choices (vertical on desktop, side by side on mobile). */
function EntityPicker({ active, setActive }) {
  const t = useTranslations('legalPage.hub.content');
  return (
    <Reveal y={24} amount={0} className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white shadow-2xl shadow-brand/25 md:p-7 lg:sticky lg:top-28">
      <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
      <motion.span className="absolute -end-16 -top-16 size-52 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <div className="relative">
        <h2 className="heading-section !text-[1.75rem] md:!text-[2rem]">
          <AccentTitle text={t('title')} />
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{t('description')}</p>

        <div role="tablist" aria-label={t('tabsLabel')} className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          {LEGAL_DOCUMENT_ENTITIES.map((e) => {
            const on = e.key === active;
            const Icon = ENTITY_ICONS[e.key] ?? Building2;
            return (
              <button key={e.key} type="button" role="tab" aria-selected={on} onClick={() => setActive(e.key)} className={cn('group relative flex min-w-0 items-center gap-3.5 rounded-2xl p-3.5 text-start ring-1 transition-colors duration-300', on ? 'ring-gold/60' : 'ring-white/10 hover:bg-white/[0.05] hover:ring-white/25')}>
                {on && <motion.span layoutId="legal-entity-active" className="absolute inset-0 rounded-2xl bg-white/[0.1]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className={cn('relative grid size-11 shrink-0 place-items-center rounded-xl transition-all duration-500', on ? 'bg-gold text-white shadow-lg shadow-gold/40' : 'bg-white/[0.08] text-white/70 group-hover:-rotate-6')}>
                  <Icon className="size-5" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block font-bold text-white">{t(`entities.${e.key}.short`)}</span>
                  <span className="mt-0.5 block truncate text-xs text-white/50">{t(`entities.${e.key}.label`)}</span>
                </span>
                <span className={cn('relative shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums transition-colors', on ? 'bg-gold text-white' : 'bg-white/10 text-white/60')}>{visibleDocs(e).length}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-white/[0.05] p-3.5 text-xs leading-relaxed text-white/55 ring-1 ring-white/10">
          <Info className="mt-0.5 size-4 shrink-0 text-gold-200" />
          {t('footnote')}
        </p>
      </div>
    </Reveal>
  );
}

function Documents() {
  const t = useTranslations('legalPage.hub.content');
  const [active, setActive] = useState(LEGAL_DOCUMENT_ENTITIES[0]?.key);
  const entity = LEGAL_DOCUMENT_ENTITIES.find((e) => e.key === active) ?? LEGAL_DOCUMENT_ENTITIES[0];
  const docs = visibleDocs(entity);
  return (
    <section className="relative pb-16 md:pb-24">
      <div className="container-x relative -mt-28 grid items-start gap-6 md:-mt-32 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8">
        <EntityPicker active={active} setActive={setActive} />

        <Reveal y={24} delay={0.08} amount={0} className="rounded-[2rem] bg-white p-4 shadow-xl shadow-brand/10 ring-1 ring-brand/10 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4 md:px-2">
            <AnimatePresence mode="wait">
              <motion.h3 key={entity.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="heading-card">
                {t(`entities.${entity.key}.label`)}
              </motion.h3>
            </AnimatePresence>
            <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-700 ring-1 ring-gold/20">{t('count', { count: docs.length })}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={entity.key} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" initial="hidden" animate="show" exit="exit" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
              {docs.map((d) => (
                <DocumentCard key={d.link} doc={d} entityShort={t(`entities.${entity.key}.short`)} download={t('download')} open={t('open')} />
              ))}
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

export default function LegalDocumentsPage() {
  const t = useTranslations('legalPage.hub');
  return (
    <div className="overflow-x-clip bg-[#f6f7fb] text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <Hero />
        <Documents />
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
          <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
          <div className="container-x relative">
            <SectionIntro title={t('web.title')} description={t('web.description')} />
            <PolicyGrid className="mt-10 md:mt-12" />
          </div>
        </section>
        <CtaBand title={t('cta.title')} description={t('cta.description')} primary={{ label: t('cta.primary'), href: '/company/contact-us' }} secondary={{ label: t('cta.secondary'), href: '/legal/restricted-countries' }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
