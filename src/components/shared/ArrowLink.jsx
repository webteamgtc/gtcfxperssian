'use client';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavLink from './nav/NavLink';

/**
 * Pill button with a round arrow badge ("View More", "Open Live Account").
 * variant: 'primary' (navy) | 'gold' | 'light' (white on dark)
 */
const STYLES = {
  primary: 'bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-700',
  gold: 'bg-gold text-white shadow-lg shadow-gold/30 hover:bg-gold-600',
  light: 'bg-white text-brand-900 shadow-lg shadow-black/20 hover:bg-gold-50'
};
const BADGE = { primary: 'bg-white text-brand', gold: 'bg-white text-gold-700', light: 'bg-brand text-white' };

export default function ArrowLink({ href, children, variant = 'primary', className, ...rest }) {
  return (
    <NavLink
      href={href}
      className={cn(
        'group shine inline-flex h-13 items-center gap-4 rounded-full ps-7 pe-1.5 text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
        STYLES[variant],
        className
      )}
      {...rest}
    >
      {children}
      <span className={cn('grid size-10 place-items-center rounded-full transition-transform duration-500 group-hover:-rotate-45 rtl:group-hover:rotate-45', BADGE[variant])}>
        <ArrowRight className="size-4 rtl:-scale-x-100" />
      </span>
    </NavLink>
  );
}
