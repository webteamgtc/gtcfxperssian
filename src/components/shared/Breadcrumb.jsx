import { ChevronRight } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { cn } from '@/lib/utils';

/**
 * Pill breadcrumb for dark page heroes.
 *   <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Trading', href: '/trading' }, { label: 'Open Live Account' }]} />
 * The last item (no href) is the current page.
 */
export default function Breadcrumb({ items, tone = 'dark', className }) {
  const light = tone === 'light';
  return (
    <nav aria-label="Breadcrumb" className={cn('flex justify-center', className)}>
      <ol
        className={cn(
          'inline-flex flex-wrap items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur',
          light ? 'border-brand/10 bg-white/80 text-ink/55 shadow-sm' : 'border-white/10 bg-white/5 text-white/60'
        )}
      >
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${it.label}-${i}`} className="inline-flex items-center gap-1.5">
              {last || !it.href ? (
                <span aria-current={last ? 'page' : undefined} className={last ? (light ? 'font-semibold text-brand' : 'text-gold-200') : undefined}>
                  {it.label}
                </span>
              ) : (
                <NavLink href={it.href} className={cn('transition-colors', light ? 'hover:text-brand' : 'hover:text-gold-200')}>
                  {it.label}
                </NavLink>
              )}
              {!last && <ChevronRight className="size-3.5 rtl:-scale-x-100" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
