'use client';
import { ZA, VU, KM, AU, MU, KH } from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';

const FLAGS = { ZA, VU, KM, AU, MU, KH };

/** Small 3:2 country flag (SVG, no image request). */
export function Flag({ code, className, title }) {
  const F = FLAGS[code];
  if (!F) return <span className={cn('inline-block rounded-[3px] bg-white/20', className)} aria-hidden />;
  return <F title={title} className={cn('inline-block shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10', className)} />;
}
