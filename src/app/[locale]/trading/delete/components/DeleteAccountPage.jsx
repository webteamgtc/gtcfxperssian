'use client';
/**
 * /trading/delete — trading account deletion request.
 * UI copy: messages/<locale>/homepage.json → `deleteAccountPage` (sent to the browser by ./layout.js).
 * Rhythm: dark hero (copy + animated 4-step process card) → warning cards lifted over the hero
 * → gray (sticky live-progress sidebar + form card) → dark footer.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, CircleAlert, FileSignature, Info, Lightbulb, ListChecks, ShieldAlert, Trash2, UserRound, Wallet } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import Toaster from '@/components/shared/Toaster';
import { Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import DeleteForm from './DeleteForm';

// form sections, in order (ids match DeleteForm's <Section id="del-step-n">)
const STEPS = [
  { key: 'personal', Icon: UserRound },
  { key: 'account', Icon: Wallet },
  { key: 'confirmations', Icon: ListChecks },
  { key: 'signature', Icon: FileSignature }
];
const jumpTo = (n) => document.getElementById(`del-step-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Hero visual: the four steps of a request, highlighted one after another on a self-drawing timeline. */
function ProcessCard() {
  const t = useTranslations('deleteAccountPage');
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % (STEPS.length + 1)), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="relative mx-auto w-full max-w-md">
      <motion.span className="absolute -inset-8 -z-10 rounded-[3rem] bg-down/25 blur-3xl" animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-white">
            <span className="relative grid size-10 place-items-center rounded-xl bg-down text-white shadow-lg shadow-down/40">
              <Trash2 className="size-4" />
              <motion.span className="absolute inset-0 rounded-xl ring-2 ring-down" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity }} aria-hidden />
            </span>
            {t('hero.badge')}
          </span>
          <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold tabular-nums text-white/60 ring-1 ring-white/10">
            {Math.min(active, STEPS.length)}/{STEPS.length}
          </span>
        </div>

        <ol className="relative mt-6 space-y-3">
          <span className="absolute bottom-5 start-[1.35rem] top-5 w-px bg-white/10" aria-hidden>
            <motion.span className="block w-full origin-top bg-gradient-to-b from-gold to-down" animate={{ scaleY: Math.min(active, STEPS.length - 1) / (STEPS.length - 1) }} transition={{ duration: 0.6, ease: EASE }} style={{ height: '100%' }} />
          </span>
          {STEPS.map(({ key, Icon }, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <motion.li key={key} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: EASE }} className={cn('relative flex items-center gap-3.5 rounded-2xl px-2 py-2 transition-colors duration-500', current && 'bg-white/[0.07]')}>
                <span className={cn('relative z-10 grid size-11 shrink-0 place-items-center rounded-xl ring-1 transition-all duration-500', done ? 'bg-up text-white ring-up/40' : current ? 'bg-gold text-white shadow-lg shadow-gold/30 ring-gold/50' : 'bg-white/[0.06] text-white/50 ring-white/10')}>
                  {done ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                </span>
                <span className={cn('text-sm font-semibold transition-colors duration-500', done || current ? 'text-white' : 'text-white/45')}>{t(`form.sections.${key}`)}</span>
                {current && <motion.span layoutId="hero-step-dot" className="ms-auto size-2 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(182,135,86,0.7)]" />}
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-gold via-down to-down" animate={{ width: `${(Math.min(active, STEPS.length) / STEPS.length) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  const t = useTranslations('deleteAccountPage');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-40 pt-36 text-white md:pb-48 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.trading'), href: '/trading' }, { label: t('breadcrumb.current') }]} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="text-center lg:text-start">
            <motion.span className="inline-flex items-center gap-2 rounded-full bg-down/15 px-4 py-1.5 text-xs font-bold tracking-wide text-red-200 ring-1 ring-down/30 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <motion.span className="size-1.5 rounded-full bg-red-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
              {t('hero.badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
              {t('hero.titleBefore')} <span className="heading-accent">{t('hero.titleHighlight')}</span>
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('hero.description')}
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}>
              {STEPS.map(({ key, Icon }, i) => (
                <motion.button key={key} type="button" onClick={() => jumpTo(i + 1)} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="group inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-gold hover:text-white hover:ring-gold">
                  <Icon className="size-4 text-gold-200 transition-colors group-hover:text-white" />
                  {t(`form.sections.${key}`)}
                </motion.button>
              ))}
            </motion.div>
          </div>
          <ProcessCard />
        </div>
      </div>
    </section>
  );
}

/** The three "before you continue" warnings as cards lifted over the hero. */
function Warnings() {
  const t = useTranslations('deleteAccountPage.beforeYouContinue');
  return (
    <div className="relative">
      <Reveal y={16} className="mb-4 flex items-center justify-center gap-2.5 lg:justify-start">
        <span className="grid size-9 place-items-center rounded-xl bg-down text-white shadow-lg shadow-down/30">
          <ShieldAlert className="size-4" />
        </span>
        <h2 className="text-lg font-bold text-white">{t('title')}</h2>
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-3" stagger={0.1}>
        {['note1', 'note2', 'note3'].map((k, i) => (
          <StaggerItem key={k} className="h-full">
            <div className="group relative h-full overflow-hidden rounded-[1.5rem] bg-white p-5 shadow-xl shadow-brand/10 ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-down/10">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-down via-red-400 to-gold" aria-hidden />
              <div className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-down/10 text-down transition-transform duration-500 group-hover:-rotate-12">
                  <CircleAlert className="size-5" />
                </span>
                <p className="pb-5 text-sm leading-relaxed text-ink/70">{t(k)}</p>
              </div>
              <span className="absolute bottom-3 end-4 text-3xl font-black tabular-nums text-ink/[0.04]" aria-hidden>
                0{i + 1}
              </span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

/** Live progress (from the form) with jump links, then the helpful notes. */
function Sidebar({ progress }) {
  const t = useTranslations('deleteAccountPage');
  const count = STEPS.filter((s) => progress[s.key]).length;
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <aside className="space-y-5 lg:sticky lg:top-28">
      <Reveal y={24} className="is-dark relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white shadow-2xl shadow-brand/20">
        <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
        <motion.span className="absolute -end-12 -top-12 size-40 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
        <div className="relative flex items-center gap-4">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
            <motion.circle cx="32" cy="32" r={R} fill="none" stroke="url(#del-ring)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C - (count / STEPS.length) * C }} transition={{ duration: 0.7, ease: EASE }} />
            <defs>
              <linearGradient id="del-ring" x1="0" x2="1">
                <stop offset="0%" stopColor="#b68756" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {count}/{STEPS.length}
            </div>
            <div className="text-xs text-white/55">{t('formCard.titleAfter')}</div>
          </div>
        </div>
        <ol className="relative mt-5 space-y-1.5">
          {STEPS.map(({ key, Icon }, i) => {
            const done = progress[key];
            return (
              <li key={key}>
                <button type="button" onClick={() => jumpTo(i + 1)} className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors hover:bg-white/[0.07]">
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-500', done ? 'bg-up text-white shadow-md shadow-up/30' : 'bg-white/[0.08] text-white/60')}>{done ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}</span>
                  <span className={cn('flex-1 text-sm font-semibold transition-colors', done ? 'text-white' : 'text-white/60 group-hover:text-white')}>{t(`form.sections.${key}`)}</span>
                  <span className="text-[11px] font-bold tabular-nums text-white/30">0{i + 1}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </Reveal>

      <Reveal y={24} delay={0.1} className="rounded-[1.75rem] bg-white p-6 shadow-xl shadow-brand/5 ring-1 ring-brand/10">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
            <Lightbulb className="size-5" />
          </span>
          <h2 className="heading-card">{t('helpfulNotes.title')}</h2>
        </div>
        <Stagger className="mt-4 space-y-2" stagger={0.08}>
          {['note1', 'note2', 'note3'].map((k) => (
            <StaggerItem key={k} className="flex gap-3 rounded-xl bg-[#f6f7fb] px-3.5 py-3 text-sm leading-relaxed text-ink/65">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" />
              {t(`helpfulNotes.${k}`)}
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>
    </aside>
  );
}

export default function DeleteAccountPage() {
  const t = useTranslations('deleteAccountPage.formCard');
  const [progress, setProgress] = useState({});
  return (
    <div className="overflow-x-clip bg-[#f6f7fb] text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <Hero />
        <section className="relative pb-16 md:pb-24">
          <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
          <span className="absolute -start-40 top-1/3 size-[460px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
          <span className="absolute -end-40 bottom-10 size-[420px] rounded-full bg-down/[0.05] blur-[120px]" aria-hidden />
          <div className="container-x relative -mt-28 md:-mt-32">
            <div className="mx-auto max-w-6xl">
              <Warnings />
              <div className="mt-8 grid items-start gap-6 md:mt-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8">
                <div className="order-2 lg:order-1">
                  <Sidebar progress={progress} />
                </div>
                <Reveal y={40} className="relative order-1 lg:order-2">
                  <span className="absolute -inset-px -z-10 rounded-[1.85rem] bg-gradient-to-br from-down/40 via-brand-300/30 to-brand/50 blur-sm" aria-hidden />
                  <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_40px_100px_-40px_rgba(41,59,147,0.45)] ring-1 ring-brand/10">
                    <div className="relative overflow-hidden bg-gradient-to-r from-brand via-brand-800 to-brand-950 px-6 py-6 text-white md:px-8">
                      <span className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
                      <motion.span className="absolute -end-10 -top-16 size-48 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
                      <h2 className="heading-title is-dark relative">
                        {t('titleBefore')} <span className="heading-accent">{t('titleHighlight')}</span> {t('titleAfter')}
                      </h2>
                      <p className="relative mt-1.5 text-sm text-white/70">{t('description')}</p>
                    </div>
                    <DeleteForm onProgress={setProgress} />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer theme="dark" />
      <Toaster />
    </div>
  );
}
