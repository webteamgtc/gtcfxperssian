'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';
import { SectionIntro } from '@/components/shared/SectionIntro';

const AUTO_MS = 4500;

/** GTCFX Awards: 3D coverflow. Drag, swipe, arrows or click a side card; auto-plays while visible. */
export function Awards() {
  const t = useTranslations('companyPage.awardsSection');
  const items = t.raw('items');
  // the ring needs at least 7 slides so 5 can show at once; repeat the list if there are fewer awards
  const slides = [];
  while (slides.length < Math.max(7, items.length)) slides.push(...items);
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [w, setW] = useState(1200);
  const [rtl, setRtl] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });

  useEffect(() => {
    const on = () => {
      setW(window.innerWidth);
      setRtl(document.documentElement.dir === 'rtl');
    };
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  useEffect(() => {
    if (paused || !inView || n < 2) return;
    const tm = setTimeout(() => setActive((a) => (a + 1) % n), AUTO_MS);
    return () => clearTimeout(tm);
  }, [active, paused, inView, n]);

  const go = (d) => setActive((a) => (a + d + n) % n);
  const wide = w >= 1024; // 5 cards on desktop, 3 on tablets and phones
  const visible = wide ? 2 : 1;
  const card = w < 640 ? 240 : wide ? 290 : 280;
  const near = card * (w < 640 ? 0.56 : wide ? 0.74 : 0.68); // distance to the 1st side card
  const far = card * 0.56; // extra distance to the 2nd side card
  const ratio = w < 640 ? 1.36 : 1.2;
  const xFor = (d) => Math.sign(d) * (near * Math.min(Math.abs(d), 1) + far * Math.max(Math.abs(d) - 1, 0));
  const real = active % items.length; // which award is in front

  // shortest signed distance on the loop
  const offset = (i) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <section id="awards" ref={ref} className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      {/* spotlight + floor */}
      <div className="absolute left-1/2 top-40 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(182,135,86,0.22),transparent_65%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/80 to-transparent" aria-hidden />

      <div className="container-x relative">
        <SectionIntro layout="split" title={t('title')} sub={t('subtitle')} description={t('description')} />

        <div
          className="relative mt-10 h-[420px] select-none md:mt-14 md:h-[460px]"
          style={{ perspective: 1400 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label={t('title')}
        >
          <motion.div
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              const s = info.offset.x * (rtl ? -1 : 1);
              if (s < -60) go(1);
              else if (s > 60) go(-1);
            }}
          >
            {slides.map((a, i) => {
              const d = offset(i);
              const abs = Math.abs(d);
              const hidden = abs > visible;
              return (
                <motion.button
                  key={`${a.title}-${i}`}
                  type="button"
                  onClick={() => (d === 0 ? null : setActive(i))}
                  aria-hidden={d !== 0}
                  tabIndex={d === 0 ? 0 : -1}
                  className="absolute left-1/2 top-1/2 outline-none"
                  style={{ width: card, height: card * ratio, marginLeft: -card / 2, marginTop: (-card * ratio) / 2, zIndex: 10 - abs, transformStyle: 'preserve-3d' }}
                  animate={{
                    x: xFor(Math.max(-visible - 1, Math.min(visible + 1, d))) * (rtl ? -1 : 1),
                    rotateY: Math.max(-2, Math.min(2, d)) * -28 * (rtl ? -1 : 1),
                    z: -Math.min(abs, 3) * 140,
                    scale: 1 - Math.min(abs, 3) * 0.09,
                    opacity: hidden ? 0 : 1 - abs * 0.22
                  }}
                  transition={{ type: 'spring', stiffness: 140, damping: 22, mass: 0.9 }}
                >
                  <div className={cn('relative flex size-full flex-col overflow-hidden rounded-[1.75rem] border bg-white transition-shadow duration-500', d === 0 ? 'border-gold/40 shadow-2xl shadow-brand/20' : 'border-brand/10 shadow-lg')}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(182,135,86,0.16),transparent_62%)]" aria-hidden />
                    <div className="relative flex-1">
                      <motion.div className="absolute inset-[12%_14%_6%]" animate={d === 0 ? { y: [0, -10, 0] } : { y: 0 }} transition={d === 0 ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}>
                        <Image src={a.image} alt={a.title} fill sizes="340px" className="object-contain drop-shadow-xl" draggable={false} />
                      </motion.div>
                    </div>
                    <div className="relative px-5 pb-6 text-center">
                      <span className="mx-auto mb-4 block h-px w-4/5 bg-gradient-to-r from-transparent via-brand/20 to-transparent" aria-hidden />
                      <h3 className="heading-card text-balance text-base md:text-lg">{a.title}</h3>
                    </div>
                    {/* sheen on the front card */}
                    {d === 0 && (
                      <motion.span key={active} className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/60 to-transparent" initial={{ x: '0%' }} animate={{ x: '400%' }} transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.25 }} aria-hidden />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
          {/* floor reflection */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 h-8 w-[60%] -translate-x-1/2 rounded-[50%] bg-ink/10 blur-xl" aria-hidden />
        </div>

        {/* caption + controls */}
        <div className="mt-6 flex flex-col items-center gap-5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-label={t('prev')} className="grid size-12 place-items-center rounded-full border border-brand/15 bg-white text-brand shadow-sm transition-all hover:bg-brand hover:text-white">
              <ChevronLeft className="size-5 rtl:-scale-x-100" />
            </button>
            <div className="flex min-w-[220px] items-center justify-center gap-2 rounded-full border border-brand/10 bg-white px-5 py-3 shadow-sm" aria-live="polite">
              <Trophy className="size-4 shrink-0 text-gold" />
              <AnimatePresence mode="wait">
                <motion.span key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="text-sm font-semibold text-brand-900">
                  {t('recognised')}
                </motion.span>
              </AnimatePresence>
            </div>
            <button type="button" onClick={() => go(1)} aria-label={t('next')} className="grid size-12 place-items-center rounded-full border border-brand/15 bg-white text-brand shadow-sm transition-all hover:bg-brand hover:text-white">
              <ChevronRight className="size-5 rtl:-scale-x-100" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {items.map((a, i) => (
              <button key={a.title} type="button" onClick={() => setActive((cur) => cur - (cur % items.length) + i)} aria-label={a.title} className={cn('h-1.5 rounded-full transition-all duration-500', i === real ? 'w-8 bg-brand' : 'w-1.5 bg-brand/20 hover:bg-brand/40')} />
            ))}
          </div>
        </div>

        <Reveal y={12} className="mt-10 flex justify-center">
          <ArrowLink href="/company/awards">{t('viewMore')}</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
