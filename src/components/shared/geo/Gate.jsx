'use client';
/** Shared dialog shell for the region popups (GeoGate.jsx, UsNotice.jsx). */
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useScrollLock } from './geoClient';

export const EASE = [0.22, 1, 0.36, 1];

/** Full-screen blocking dialog: dimmed, blurred page behind; focus kept inside; Esc does nothing (a choice is required). */
/** `bare`: no default padding / background, so the caller styles the card itself. */
export function Gate({ labelledBy, wide = false, bare = false, className, children }) {
  const ref = useRef(null);
  useScrollLock(true);
  useEffect(() => {
    const el = ref.current;
    el?.querySelector('button')?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key !== 'Tab' || !el) return;
      const f = [...el.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
      if (!f.length) return;
      const [a, b] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === a) (e.preventDefault(), b.focus());
      else if (!e.shiftKey && document.activeElement === b) (e.preventDefault(), a.focus());
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <motion.div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#070b24]/75 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.45, ease: EASE }}
        className={cn(
          'relative w-full text-ink',
          'my-8 rounded-[2rem] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]',
          !bare && 'bg-white',
          !bare && (wide ? 'max-w-3xl p-6 sm:p-10' : 'max-w-md p-7 text-center sm:p-10'),
          className
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export const IconTile = ({ tone = 'navy', children }) => (
  <span className={cn('mx-auto grid size-16 place-items-center rounded-2xl text-white ring-8', tone === 'red' ? 'bg-gradient-to-br from-red-600 to-red-800 ring-red-50' : 'bg-gradient-to-br from-brand to-brand-900 ring-brand-50')}>{children}</span>
);

