'use client';
import { useMemo } from 'react';
import { motion } from 'motion/react';

/** soft price line drawn across the band (decorative) */
export default function BandLine() {
  const d = useMemo(() => {
    let s = 5;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    let y = 70;
    return Array.from({ length: 40 }, (_, i) => {
      y = Math.max(18, Math.min(92, y - 1.2 + (rnd() - 0.5) * 12));
      return `${i ? 'L' : 'M'}${i * 30} ${y.toFixed(1)}`;
    }).join(' ');
  }, []);
  return (
    <svg dir="ltr" viewBox="0 0 1170 110" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 w-full opacity-70" aria-hidden>
      <defs>
        <linearGradient id="band-line" x1="0" x2="1">
          <stop offset="0" stopColor="#f1e3d3" stopOpacity="0" />
          <stop offset="0.6" stopColor="#d2a67a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#f1e3d3" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <motion.path d={d} fill="none" stroke="url(#band-line)" strokeWidth="1.6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: 'easeInOut' }} />
    </svg>
  );
}
