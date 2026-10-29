'use client';
import { cn } from '@/lib/utils';

// stable hue per event so each poster looks different
const hash = (s = '') => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const PALETTES = [
  ['#293b93', '#0a0e26', '#b68756'],
  ['#1f2c73', '#3a1f5c', '#d2a67a'],
  ['#14306b', '#0b1a3a', '#5565bd'],
  ['#2b2f7a', '#101536', '#e0b88f'],
  ['#203a8a', '#06142e', '#9fb0ff']
];

/**
 * Event cover from Strapi, or — when there is no image yet — a branded poster
 * (gradient, event name, city) so cards never look empty.
 */
export function EventImage({ event, className, sizes = 'small', priority = false, bare = false }) {
  if (event?.cover?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={event.cover.url}
        alt={event.cover.alt || event.shortTitle || event.title}
        width={event.cover.width ?? undefined}
        height={event.cover.height ?? undefined}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('size-full object-cover', className)}
      />
    );
  }
  const [a, b, c] = PALETTES[hash(event?.id) % PALETTES.length];
  const big = sizes === 'large';
  return (
    <div className={cn('relative size-full overflow-hidden', className)} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} role="img" aria-label={event?.shortTitle || event?.title}>
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="330" cy="40" r="120" fill={c} opacity="0.18" />
        <circle cx="330" cy="40" r="70" fill="none" stroke={c} strokeOpacity="0.35" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-40 + i * 50} y1="240" x2={60 + i * 50} y2="0" stroke="#fff" strokeOpacity="0.05" strokeWidth="18" />
        ))}
        <path d="M0 200 L40 200 L40 170 L70 170 L70 150 L90 150 L90 185 L130 185 L130 130 L150 120 L170 130 L170 190 L210 190 L210 160 L240 160 L240 200 L280 200 L280 140 L300 140 L300 200 L340 200 L340 175 L400 175 L400 240 L0 240 Z" fill="#000" opacity="0.28" />
      </svg>
      {!bare && (
      <div className={cn('absolute inset-0 flex flex-col justify-end text-start', big ? 'p-6 md:p-8' : 'p-3.5')}>
        <span className={cn('font-semibold uppercase tracking-[0.18em]', big ? 'text-xs' : 'text-[9px]')} style={{ color: c }}>
          {event?.city}
        </span>
        <span className={cn('mt-1 line-clamp-2 font-extrabold leading-tight text-white', big ? 'text-2xl md:text-3xl' : 'text-sm')}>{event?.shortTitle || event?.title}</span>
      </div>
      )}
    </div>
  );
}
