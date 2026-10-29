'use client';
import { useId } from 'react';
import { motion } from 'motion/react';
import { EASE } from '@/components/motion';

/**
 * Equity-curve area chart from a trader's `trend` (equity balance points). Pure SVG — draws itself in on view.
 * `compact` drops the fill gradient's height for table sparklines.
 */
export default function EquityChart({ data = [], className, color = '#293b93', compact = false }) {
  const gid = useId().replace(/:/g, '');
  const W = 300;
  const H = 100;
  const pts = data.filter(Number.isFinite);
  if (pts.length < 2) {
    return <div className={className}><div className="h-full w-full rounded-lg bg-[repeating-linear-gradient(90deg,rgba(41,59,147,0.06)_0_6px,transparent_6px_12px)]" /></div>;
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H - ((v - min) / (max - min || 1)) * (H - 8) - 4]);
  const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`eq-${gid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={compact ? 0.25 : 0.35} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#eq-${gid})`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} />
      <motion.path d={line} fill="none" stroke={color} strokeWidth={compact ? 1.4 : 1.8} strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} />
    </svg>
  );
}
