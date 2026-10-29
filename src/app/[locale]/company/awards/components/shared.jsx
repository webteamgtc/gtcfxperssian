'use client';
/** Building blocks for /company/awards (copy: companyPage.json → awardsPage). */
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, CreditCard, MapPin, UserPlus, Wallet } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import BandLine from '@/components/shared/BandLine';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/* ------------------------------------------------------------------ data */

export function useAwards() {
  const t = useTranslations('awardsPage');
  const items = t.raw('gallery.items');
  const years = useMemo(() => [...new Set(items.map((a) => a.year))].sort((a, b) => b - a), [items]);
  return { t, items, years };
}

/** City → [longitude, latitude, label side]. Map: public/images/world-dots.svg (x = (lon + 180) / 360 · 126, y = 32 − 0.42 · lat). */
export const CITY_GEO = {
  Dubai: [55.27, 25.2, 'top'],
  'Abu Dhabi': [54.37, 24.45, 'bottom'],
  Doha: [51.53, 25.29, 'start'],
  Muscat: [58.4, 23.6, 'end'],
  Asia: [104, 14, 'start']
};
export const mapPos = (lon, lat) => ({ x: ((lon + 180) / 360) * 100, y: ((32 - lat * 0.42 + 1) / 62) * 100 }); // % of the map box

/** Pins: one per city (Asia awards without a city are grouped as "Asia"). */
export function useCityPins(items) {
  return useMemo(() => {
    const m = new Map();
    for (const a of items) {
      const key = a.city || (a.region === 'Asia' ? 'Asia' : null);
      if (!key || !CITY_GEO[key]) continue;
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return [...m].map(([city, count]) => ({ city, count, lon: CITY_GEO[city][0], lat: CITY_GEO[city][1], side: CITY_GEO[city][2] }));
  }, [items]);
}

/* ------------------------------------------------------------------ pieces */

export function AwardImage({ award, sizes = '300px', className, priority = false }) {
  return (
    <span className={cn('relative block', className)}>
      <Image src={award.image} alt={award.title} fill sizes={sizes} priority={priority} className="object-contain drop-shadow-[0_18px_24px_rgba(13,21,58,0.25)]" draggable={false} />
    </span>
  );
}

export function AwardsBreadcrumb({ className }) {
  const t = useTranslations('awardsPage.breadcrumb');
  return <Breadcrumb className={className} items={[{ label: t('home'), href: '/' }, { label: t('company'), href: '/company' }, { label: t('current') }]} />;
}

export function HeroActions({ className }) {
  const t = useTranslations('awardsPage.hero');
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <LiveAccountButton variant="gold">
        {t('primary')}
      </LiveAccountButton>
      <NavLink href={PORTAL.demo} className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-900 md:h-13 md:text-base">
        {t('secondary')}
      </NavLink>
    </div>
  );
}

export function Stats({ dark = true, className }) {
  const t = useTranslations('awardsPage.hero');
  return (
    <dl className={cn('grid grid-cols-3 gap-4', className)}>
      {t.raw('stats').map((s) => (
        <div key={s.label} className="flex flex-col">
          <dt className={cn('order-2 mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] md:text-xs', dark ? 'text-white/50' : 'text-ink/50')}>{s.label}</dt>
          <dd className={cn('text-3xl font-bold tracking-tight md:text-4xl', dark ? 'text-white' : 'text-brand')}>
            <bdi>{s.value}</bdi>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Award issuers in a row, separated by short gold dashes. */
export function Issuers({ className }) {
  const t = useTranslations('awardsPage');
  const list = t.raw('issuers');
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12', className)} aria-label={t('issuersTitle')}>
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-8 md:gap-12">
          <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.28em] text-white/55 md:text-base">{n}</span>
          {i < list.length - 1 && <span className="h-0.5 w-6 bg-gold/70" aria-hidden />}
        </span>
      ))}
    </div>
  );
}

/** Year chips: "All awards" + one per year. */
export function YearFilter({ years, value, onChange, className }) {
  const { t } = useAwards();
  const opts = [['all', t('gallery.all')], ...years.map((y) => [y, y])];
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)} role="tablist">
      {opts.map(([k, label]) => {
        const on = value === k;
        return (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(k)}
            className={cn(
              'relative h-10 rounded-full px-5 text-sm font-semibold transition-colors',
              on ? 'text-white' : 'bg-white text-ink/70 ring-1 ring-brand/10 hover:text-brand'
            )}
          >
            {on && <motion.span layoutId="year-pill" className="absolute inset-0 rounded-full bg-brand shadow-md shadow-brand/30" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function useYearFilter(items) {
  const [year, setYear] = useState('all');
  const list = year === 'all' ? items : items.filter((a) => a.year === year);
  return { year, setYear, list };
}

/** Award card: image on top (or beside it with `wide`), year, title, issuer, city. */
export function AwardCard({ award, wide = false, className }) {
  return (
    <article
      className={cn(
        'group relative flex h-full overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white text-start transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_30px_60px_-30px_rgba(41,59,147,0.45)]',
        wide ? 'flex-col sm:flex-row sm:items-center' : 'flex-col',
        className
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand via-gold to-brand transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
      <span className={cn('relative grid place-items-center bg-[radial-gradient(circle_at_50%_55%,rgba(182,135,86,0.16),transparent_65%)]', wide ? 'h-64 sm:h-full sm:min-h-72 sm:w-1/2' : 'h-56')}>
        <AwardImage award={award} className={cn('transition-transform duration-700 group-hover:-translate-y-1.5 group-hover:scale-105', wide ? 'h-52 w-40 sm:h-60 sm:w-48' : 'h-40 w-32')} />
      </span>
      <span className={cn('flex flex-1 flex-col', wide ? 'p-6 sm:p-8' : 'p-6 pt-2')}>
        <span className="flex items-center gap-2 text-sm font-bold text-gold-700">
          <span className="h-px w-5 bg-gold" aria-hidden /> {award.year}
        </span>
        <span className={cn('mt-2 block font-bold tracking-tight text-ink', wide ? 'text-2xl' : 'text-lg')}>{award.title}</span>
        <span className="mt-2 block text-sm leading-relaxed text-ink/60">
          {award.by}
        </span>
        {award.city && (
          <span className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand">
            <MapPin className="size-3.5" /> {award.city}
          </span>
        )}
      </span>
    </article>
  );
}

/** "View more" toggle when a list is cut short. */
export function MoreButton({ open, onClick }) {
  const { t } = useAwards();
  return (
    <div className="mt-10 flex justify-center">
      <button type="button" onClick={onClick} className="group inline-flex h-12 items-center gap-2 rounded-full border border-brand/15 bg-white px-6 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white">
        {open ? t('gallery.viewLess') : t('gallery.viewMore')}
        <ArrowRight className={cn('size-4 transition-transform', open ? '-rotate-90' : 'rotate-90')} />
      </button>
    </div>
  );
}

/**
 * Dotted world map with a pin per award city. `zoom` > 1 crops to the Gulf / Asia region so nearby cities separate.
 * "City · N awards" chips show from tablet width up (phones show the pins only).
 */
export function AwardsMap({ items, zoom = 1, className }) {
  const { t } = useAwards();
  const pins = useCityPins(items);
  const c = mapPos(70, 20); // view centre when zoomed
  const place = (p) => ({ left: `${50 + (p.x - c.x) * zoom}%`, top: `${50 + (p.y - c.y) * zoom}%` });
  return (
    <div className={cn('relative overflow-hidden', className)} dir="ltr">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
      <img
        src="/images/world-dots.svg"
        alt=""
        className="absolute max-w-none opacity-40 invert-[.15]"
        style={zoom === 1 ? { inset: 0, width: '100%', height: '100%' } : { width: `${zoom * 100}%`, height: `${zoom * 100}%`, left: `${50 - c.x * zoom}%`, top: `${50 - c.y * zoom}%` }}
        loading="lazy"
      />
      {pins.map((p, i) => {
        const pos = place(mapPos(p.lon, p.lat));
        const side = { end: 'start-4 -top-3', start: 'end-4 -top-3', bottom: 'start-1/2 top-4 -translate-x-1/2', top: 'start-1/2 bottom-4 -translate-x-1/2' }[p.side];
        return (
          <motion.span key={p.city} className="absolute" style={pos} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 260, damping: 18 }}>
            <span className="absolute -ms-1.5 -mt-1.5 size-3 rounded-full bg-gold shadow-[0_0_14px_rgba(182,135,86,0.9)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold/60" />
            </span>
            <span className={cn('absolute hidden whitespace-nowrap rounded-full border border-white/15 bg-brand-950/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur sm:block', side)}>
              {p.city} <span className="text-gold-200">· {t('map.awards', { count: p.count })}</span>
            </span>
          </motion.span>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ CTA */

/** Navy band: title, three steps to open an account, live + demo buttons. */
export function AwardsCta() {
  const t = useTranslations('awardsPage.cta');
  const steps = t.raw('steps');
  const icons = [UserPlus, CreditCard, Wallet];
  return (
    <section className="relative bg-white py-14 md:py-20">
      <div className="container-x">
        <Reveal y={24}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-6 text-white shadow-2xl shadow-brand/25 md:p-12">
            <span className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
            <motion.span className="absolute -end-24 -top-24 size-80 rounded-full bg-gold/25 blur-[100px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <BandLine />
            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="heading-section">
                <AccentTitle text={t('title')} />
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-white/65">{t('text')}</p>
            </div>
            <Stagger className="relative mt-10 grid gap-4 md:grid-cols-3" stagger={0.1}>
              {steps.map((s, i) => {
                const I = icons[i];
                return (
                  <StaggerItem key={s.title} className="relative rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-6 backdrop-blur">
                    <span className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-xl bg-gold/15 text-gold-200 ring-1 ring-gold/30">
                        <I className="size-5" />
                      </span>
                      <span className="text-sm font-semibold text-white/40">/ 0{i + 1}</span>
                    </span>
                    <h3 className="heading-card mt-5">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{s.text}</p>
                  </StaggerItem>
                );
              })}
            </Stagger>
            <p className="relative mx-auto mt-8 max-w-2xl text-center text-sm text-white/55">{t('note')}</p>
            <div className="relative mt-6 flex flex-wrap justify-center gap-3">
              <LiveAccountButton variant="gold">
                {t('primary')}
              </LiveAccountButton>
              <NavLink href={PORTAL.demo} className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-900 md:h-13 md:text-base">
                {t('secondary')}
              </NavLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Centred section intro using the page copy. */
export const Intro = ({ ns, dark, className }) => {
  const t = useTranslations(`awardsPage.${ns}`);
  return <SectionIntro title={t('title')} description={t('text')} dark={dark} className={className} />;
};
