'use client';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Card with a thin brand border that turns into a gold→navy gradient ring on hover and lifts.
 * `dark` gives the featured navy variant. Children render inside the inner panel (`innerClassName`).
 * Use inside a `.group` aware layout — the card itself is the `group`.
 */
export default function RingCard({ children, dark = false, lift = 8, className, innerClassName, as = 'article', ...rest }) {
  const Comp = motion[as] ?? motion.article;
  return (
    <Comp
      whileHover={{ y: -lift }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('group relative h-full rounded-[2rem] p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl', dark ? 'bg-brand hover:shadow-brand/30' : 'bg-brand/10 hover:shadow-brand/15', className)}
      {...rest}
    >
      {!dark && <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />}
      <div className={cn('relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1.5px)]', dark ? 'is-dark bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white' : 'bg-white', innerClassName)}>{children}</div>
    </Comp>
  );
}
