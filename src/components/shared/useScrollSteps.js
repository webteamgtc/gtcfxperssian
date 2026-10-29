'use client';
/**
 * Steps that follow the page scroll — without pinning or adding extra height.
 * Desktop (≥1024px): as the section moves up through the screen, the active item
 * goes from the first to the last. Clicking an item takes over until the section
 * leaves the screen. Phones / reduced motion: auto-advance while visible, pause on hover.
 *
 *   const s = useScrollSteps(count, { autoMs: 6500 });
 *   <section ref={s.outerRef}> … s.index, s.dir, s.progress, s.goTo(k), {...s.hover} … </section>
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useMotionValueEvent, useScroll, animate } from 'motion/react';

export function useScrollSteps(count, { autoMs = 7000, start = 0 } = {}) {
  const outerRef = useRef(null);
  const [linked, setLinked] = useState(false);
  const [manual, setManual] = useState(false);
  const [index, setIndex] = useState(start);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const inView = useInView(outerRef, { amount: 0.25 });
  const progress = useMotionValue(0); // 0..1 within the current item (drives the progress line)

  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    const on = () => setLinked(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);

  // hand control back to the scroll once the section has left the screen
  useEffect(() => {
    if (!inView) setManual(false);
  }, [inView]);

  const set = useCallback((k) => {
    setIndex((cur) => {
      if (k !== cur) setDir(k > cur ? 1 : -1);
      return k;
    });
  }, []);

  // linked: the section's journey from 70% to 30% of the screen height maps to the items
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start 0.7', 'end 0.3'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!linked || manual) return;
    const pos = Math.min(0.9999, Math.max(0, v)) * count;
    const k = Math.floor(pos);
    progress.set(pos - k);
    set(k);
  });

  // auto-advance (phones, or after a click on desktop)
  const auto = !linked || manual;
  useEffect(() => {
    if (!auto || paused || !inView || count < 2) return;
    progress.set(0);
    const a = animate(progress, 1, { duration: autoMs / 1000, ease: 'linear' });
    const tm = setTimeout(() => set((index + 1) % count), autoMs);
    return () => {
      a.stop();
      clearTimeout(tm);
    };
  }, [auto, paused, inView, index, count, autoMs, set, progress]);

  const goTo = useCallback(
    (k) => {
      setManual(true);
      set((k + count) % count);
    },
    [count, set]
  );

  const hover = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) };

  return { outerRef, linked, index, dir, progress, goTo, hover };
}
