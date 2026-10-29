'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ShieldCheck, BriefcaseBusiness, Network, Quote } from 'lucide-react';
import { SectionIntro, AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { COMMITMENT_VISUALS } from './visuals';

const ICONS = { transparency: Eye, security: ShieldCheck, professionalism: BriefcaseBusiness, connectivity: Network };

/** Pillars: horizontal accordion, one pillar open at a time (auto-advances on desktop). */
function Pillars({ items }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    // auto-advance on desktop only — on phones it would move the page while people read
    if (paused || !window.matchMedia('(min-width: 1024px)').matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  return (
    <div className="flex flex-col gap-3 lg:h-[420px] lg:flex-row" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {items.map((it, i) => {
        const Icon = ICONS[it.id] ?? ShieldCheck;
        const Visual = COMMITMENT_VISUALS[it.id];
        const open = i === active;
        return (
          <motion.div
            key={it.id}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActive(i))}
            layout
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            aria-expanded={open}
            transition={{ layout: { duration: 0.6, ease: EASE } }}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-[2rem] text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold duration-500 lg:h-full',
              open ? 'is-dark bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 text-white shadow-2xl shadow-brand/25 lg:flex-[4]' : 'border border-brand/10 bg-[#f6f7fb] text-ink hover:bg-brand-50 lg:flex-1'
            )}
          >
            {open && <span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-[80px]" aria-hidden />}
            <div className={cn('relative flex h-full flex-col p-6 md:p-7', open && 'lg:p-9')}>
              <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl transition-all duration-500', open ? 'bg-white/10 text-gold-200 ring-1 ring-white/15' : 'bg-white text-brand ring-1 ring-brand/10')}>
                <Icon className="size-5" />
              </span>
              <h3 className={cn('mt-5', open ? 'heading-title' : 'heading-small lg:mt-auto')}>{it.title}</h3>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div key="body" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: EASE }} className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">{it.text}</p>
                    <div className="mx-auto size-32 md:size-44 lg:size-52">
                      <Visual light />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {open && !paused && (
                <span className="absolute inset-x-6 bottom-4 hidden h-0.5 overflow-hidden rounded-full bg-white/10 md:inset-x-9 lg:block" aria-hidden>
                  <motion.span key={active} className="block h-full origin-left bg-gold rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6, ease: 'linear' }} />
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Mission statement, then the four commitments. */
export function Commitments() {
  const t = useTranslations('whyGtcGroupPage');
  const items = t.raw('commitments.items');
  return (
    <section id="commitments" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-10 size-[420px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        {/* mission */}
        <Reveal y={20} className="relative mx-auto max-w-4xl text-center">
          <Quote className="mx-auto size-10 text-gold/60 rtl:-scale-x-100" aria-hidden />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">{t('mission.label')}</p>
          <blockquote className="heading-section mt-5">
            “<AccentTitle text={t('mission.quote')} />”
          </blockquote>
        </Reveal>

        <div className="mx-auto my-12 h-px max-w-xs bg-gradient-to-r from-transparent via-brand/25 to-transparent md:my-16" aria-hidden />

        <SectionIntro title={t('commitments.title')} description={t('commitments.description')} />
        <div className="mt-12 md:mt-14">
          <Pillars items={items} />
        </div>
      </div>
    </section>
  );
}
