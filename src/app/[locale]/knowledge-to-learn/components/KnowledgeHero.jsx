'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, GraduationCap, PlayCircle, Sparkles } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, TiltCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

/** Learning-path card: modules filling up one after another, with a progress ring. */
function LearningPath() {
  const t = useTranslations('knowledgePage');
  const modules = t.raw('educationalMaterials.cards').slice(0, 4);
  const fills = [100, 72, 40, 12];
  const C = 2 * Math.PI * 26;

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[460px] py-6" aria-hidden>
      <div className="absolute -inset-6 rounded-[3rem] bg-brand/40 blur-3xl" />
      {[0, 1].map((k) => (
        <motion.span key={k} className="absolute left-1/2 top-1/2 hidden rounded-full border border-white/10 lg:block" style={{ width: 520 + k * 140, height: 520 + k * 140, marginLeft: -(260 + k * 70), marginTop: -(260 + k * 70) }} animate={{ rotate: k ? -360 : 360 }} transition={{ duration: 50 + k * 20, repeat: Infinity, ease: 'linear' }}>
          <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-gold-200 shadow-[0_0_12px_rgba(210,166,122,0.9)]" />
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 40, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}>
        <TiltCard max={6} glare={false} className="rounded-[1.75rem]">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.75)] ring-1 ring-white/20">
            <div className="flex items-center gap-4">
              <div className="relative grid size-16 shrink-0 place-items-center">
                <svg viewBox="0 0 60 60" className="absolute inset-0 size-full -rotate-90">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(41,59,147,0.1)" strokeWidth="6" />
                  <motion.circle cx="30" cy="30" r="26" fill="none" stroke="#b68756" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * 0.44 }} transition={{ duration: 1.8, ease: EASE, delay: 0.8 }} />
                </svg>
                <GraduationCap className="size-6 text-brand" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink/45">{t('educationalMaterials.subtitle')}</div>
                <div className="mt-0.5 text-lg font-bold">{t('hero.platforms')}</div>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5">
              {modules.map((m, i) => {
                const done = fills[i] === 100;
                return (
                  <motion.li key={m.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.12, duration: 0.5, ease: EASE }} className="rounded-2xl bg-[#f6f7fb] p-3 ring-1 ring-brand/5">
                    <div className="flex items-center gap-3">
                      <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', done ? 'bg-up/10 text-up' : 'bg-brand-50 text-brand')}>{done ? <CheckCircle2 className="size-4" /> : <PlayCircle className="size-4" />}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.title}</span>
                      <span className="text-xs font-bold tabular-nums text-ink/45">{fills[i]}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand/10">
                      <motion.div className={cn('h-full rounded-full', done ? 'bg-up' : 'bg-gradient-to-r from-brand to-gold')} initial={{ width: 0 }} animate={{ width: `${fills[i]}%` }} transition={{ duration: 1.2, ease: EASE, delay: 1 + i * 0.12 }} />
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </TiltCard>
      </motion.div>

      <motion.div className="absolute -start-4 top-10 z-10 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-semibold text-ink shadow-xl shadow-brand/25 ring-1 ring-brand/10 sm:flex md:-start-12" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -7, 0] }} transition={{ opacity: { delay: 1.3 }, scale: { delay: 1.3, type: 'spring' }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}>
        <span className="grid size-7 place-items-center rounded-lg bg-gold/15 text-gold-700">
          <BookOpen className="size-4" />
        </span>
        1000+
      </motion.div>
      <motion.div className="absolute -end-4 bottom-16 z-10 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-semibold text-ink shadow-xl shadow-brand/25 ring-1 ring-brand/10 sm:flex md:-end-10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, 7, 0] }} transition={{ opacity: { delay: 1.5 }, scale: { delay: 1.5, type: 'spring' }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}>
        <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand">
          <Sparkles className="size-4" />
        </span>
        30+
      </motion.div>
    </div>
  );
}

export function KnowledgeHero() {
  const t = useTranslations('knowledgePage');
  const stats = t.raw('hero.stats');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.current') }]} />
        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="size-1.5 rounded-full bg-gold" />
              {t('hero.platforms')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('hero.title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('hero.description')}
            </motion.p>
            <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.08} delay={0.3}>
              {stats.map((s) => (
                <StaggerItem key={s.label} className="rounded-2xl bg-white/[0.05] px-4 py-4 ring-1 ring-white/10 backdrop-blur">
                  <div dir="ltr" className="text-gradient-gold text-2xl font-bold tracking-tight md:text-3xl rtl:text-end">
                    <StatValue value={s.value} />
                  </div>
                  <div className="mt-1 text-xs text-white/55">{s.label}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <LearningPath />
        </div>
      </div>
    </section>
  );
}
