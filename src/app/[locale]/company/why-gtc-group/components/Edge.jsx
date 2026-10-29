'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, Handshake, Landmark, Activity } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { EDGE_VISUALS } from './visuals';

const ICONS = { reach: Globe2, conflicts: Handshake, funds: Landmark, risk: Activity };

/** Dot field; each dot is delayed by its distance from the centre so a pulse rolls outwards. */
function DotField({ cols, rows, gap = 22, className }) {
  const dots = Array.from({ length: cols * rows }, (_, k) => {
    const c = k % cols;
    const r = Math.floor(k / cols);
    const dist = Math.hypot(c - (cols - 1) / 2, (r - (rows - 1) / 2) * 1.4);
    return { x: c * gap + gap / 2, y: r * gap + gap / 2, delay: (dist * 0.12).toFixed(2), gold: (c * 7 + r * 3) % 13 === 0 };
  });
  return (
    <svg dir="ltr" viewBox={`0 0 ${cols * gap} ${rows * gap}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} className="dot-wave" cx={d.x} cy={d.y} r="2" fill={d.gold ? '#d2a67a' : '#ffffff'} style={{ animationDelay: `${d.delay}s` }} />
      ))}
    </svg>
  );
}

/** Showcase: pick a point on the left, the navy stage on the right animates it (auto-advances on desktop). */
function Showcase({ items }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    // auto-advance on desktop only — on phones it would move the page while people read
    if (paused || !window.matchMedia('(min-width: 1024px)').matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [paused, items.length]);
  const cur = items[active];
  const Visual = EDGE_VISUALS[cur.id];
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ul className="grid gap-3" role="tablist">
        {items.map((it, i) => {
          const Icon = ICONS[it.id] ?? Globe2;
          const on = i === active;
          return (
            <li key={it.id}>
              <button
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn('group relative w-full overflow-hidden rounded-[1.5rem] border p-5 text-start transition-all duration-500 md:p-6', on ? 'border-brand/20 bg-white shadow-xl shadow-brand/10' : 'border-transparent bg-[#f6f7fb] hover:bg-brand-50')}
              >
                <span className="flex items-center gap-4">
                  <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl transition-colors duration-500', on ? 'bg-brand text-white' : 'bg-white text-brand ring-1 ring-brand/10')}>
                    <Icon className="size-5" />
                  </span>
                  <span className="heading-small">{it.title}</span>
                </span>
                {/* text shows inline on phones, on the stage on desktop */}
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span key="txt" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="block overflow-hidden lg:hidden">
                      <span className="block pt-3 text-[15px] leading-relaxed text-ink/60">{it.text}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
                {on && !paused && (
                  <span className="absolute inset-x-5 bottom-0 hidden h-0.5 overflow-hidden rounded-full bg-brand/10 lg:block" aria-hidden>
                    <motion.span key={active} className="block h-full origin-left bg-gradient-to-r from-gold to-brand rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6, ease: 'linear' }} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="is-dark relative hidden min-h-[440px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-10 shadow-2xl shadow-brand/25 lg:flex lg:flex-col" role="tabpanel">
        <DotField cols={30} rows={20} className="absolute inset-0 size-full opacity-40" />
        <span className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-brand-950 via-brand-950/85 to-transparent" aria-hidden />
        <span className="absolute -end-20 -top-20 size-72 rounded-full bg-gold/25 blur-[100px]" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.div key={cur.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease: EASE }} className="relative flex flex-1 flex-col">
            <div className="mx-auto h-52 w-full max-w-sm">
              <Visual light />
            </div>
            <h3 className="heading-title mt-auto">{cur.title}</h3>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/70">{cur.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Edge() {
  const t = useTranslations('whyGtcGroupPage.edge');
  const items = t.raw('items');
  return (
    <section id="different" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-20 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <div className="mt-12 md:mt-14">
          <Showcase items={items} />
        </div>
      </div>
    </section>
  );
}
