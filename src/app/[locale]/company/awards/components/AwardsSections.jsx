'use client';
/** /company/awards sections: hero (trophy on a lit stage), awards gallery (year filter + bento grid), award cities map. */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { HeroIn, Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';
import { AwardsBreadcrumb, AwardImage, AwardCard, AwardsMap, HeroActions, Intro, Issuers, MoreButton, Stats, YearFilter, useAwards, useYearFilter } from './shared';

const EASE = [0.22, 1, 0.36, 1];

function Stage({ items, label }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const tm = setInterval(() => setI((x) => (x + 1) % items.length), 3200);
    return () => clearInterval(tm);
  }, [items.length]);
  const a = items[i];
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md" aria-live="polite">
      {/* light cone + floor */}
      <span className="absolute inset-x-[18%] top-0 h-3/4 bg-[linear-gradient(180deg,rgba(241,227,211,0.22),transparent)] [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]" aria-hidden />
      <span className="absolute bottom-[14%] left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(182,135,86,0.45),transparent_70%)] blur-md" aria-hidden />
      <span className="absolute bottom-[16%] left-1/2 h-6 w-1/2 -translate-x-1/2 rounded-[50%] border border-gold/40" aria-hidden />
      <motion.span className="absolute inset-[8%] rounded-full border border-dashed border-white/10" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} aria-hidden />
      <AnimatePresence mode="wait">
        <motion.div key={i} className="absolute inset-x-[22%] bottom-[19%] top-[12%]" initial={{ opacity: 0, y: 24, rotateY: -40 }} animate={{ opacity: 1, y: 0, rotateY: 0 }} exit={{ opacity: 0, y: -16, rotateY: 40 }} transition={{ duration: 0.7, ease: EASE }} style={{ perspective: 800 }}>
          <motion.div className="size-full" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <AwardImage award={a} sizes="320px" className="size-full" priority={i === 0} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-200">{label}</p>
        <AnimatePresence mode="wait">
          <motion.p key={i} className="mt-2 text-lg font-bold text-white" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            {a.title} <span className="font-semibold text-white/50">· {a.year}</span>
          </motion.p>
        </AnimatePresence>
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((_, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={items[k].title} className={cn('h-1.5 rounded-full transition-all', k === i ? 'w-6 bg-gold' : 'w-1.5 bg-white/25 hover:bg-white/50')} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AwardsHero() {
  const { t, items } = useAwards();
  return (
    <section className="is-dark relative overflow-hidden pb-12 pt-36 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <AwardsBreadcrumb className="lg:justify-start" />
        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="text-center lg:text-start">
            <HeroIn y={18}>
              <h1 className="heading-page">
                <AccentTitle text={t('hero.title')} />
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0">{t('hero.text')}</p>
            </HeroIn>
            <Stats className="mx-auto mt-10 max-w-lg border-y border-white/10 py-6 text-start lg:mx-0" />
            <HeroActions className="mt-9 justify-center lg:justify-start" />
          </div>
          <Stage items={items} label={t('hero.featured')} />
        </div>
        <div className="mt-14 border-t border-white/10 pt-8">
          <Issuers />
        </div>
      </div>
    </section>
  );
}

export function AwardsGallery() {
  const { items, years } = useAwards();
  const { year, setYear, list } = useYearFilter(items);
  const [open, setOpen] = useState(false);
  const first = year === 'all' ? 7 : 6; // the wide first card takes two places, so 7 fill three rows
  const shown = open ? list : list.slice(0, first);
  return (
    <section className="relative bg-[#f6f8fc] py-16 md:py-24">
      <div className="container-x">
        <Intro ns="gallery" />
        <YearFilter years={years} value={year} onChange={(y) => (setYear(y), setOpen(false))} className="mt-8" />
        <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((a, i) => (
              <motion.div key={`${a.title}-${a.year}-${a.by}`} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, ease: EASE }} className={cn(i === 0 && year === 'all' && 'sm:col-span-2')}>
                <AwardCard award={a} wide={i === 0 && year === 'all'} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length > first && <MoreButton open={open} onClick={() => setOpen((o) => !o)} />}
      </div>
    </section>
  );
}

export function AwardsMapBand() {
  const { t, items } = useAwards();
  return (
    <section className="is-dark relative overflow-hidden bg-ink py-16 text-white md:py-24">
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('map.title')} />
          </h2>
          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-white/60">{t('map.text')}</p>
          <Stats className="mt-8 max-w-md" />
        </Reveal>
        <AwardsMap items={items} zoom={2.6} className="aspect-[16/10] rounded-[2rem] border border-white/10 bg-white/[0.03]" />
      </div>
    </section>
  );
}
