'use client';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Icon chip sitting in a dashed orbit with a gold satellite (rotates with its parent `.group` on hover). */
export default function OrbitChip({ Icon, className, speed = 12, chip = 'from-brand to-brand-800 shadow-brand/30' }) {
  return (
    <div dir="ltr" className={cn('relative size-24', className)} aria-hidden>
      <span className="absolute inset-0 rounded-full border border-dashed border-brand/20" />
      <motion.span className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(182,135,86,0.8)]" />
      </motion.span>
      <span className={cn('absolute inset-5 grid place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110', chip)}>
        <Icon className="size-6" />
      </span>
    </div>
  );
}
