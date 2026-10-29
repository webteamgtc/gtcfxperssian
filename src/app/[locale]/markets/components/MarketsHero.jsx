'use client';
import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Droplet } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import { MARKETS_TAPE } from '@/config/markets';
import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useLiveRows, FlashPrice, pct } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/** Glossy market "coins" floating in an arc; the centre one is the biggest. depth = parallax strength. */
const ORBS = [
  { g: <Droplet className="size-6 md:size-7" strokeWidth={2.4} />, size: 'size-14 md:size-16', depth: 18, y: 26, cls: 'max-sm:hidden' },
  { g: '₿', size: 'size-12 md:size-20', depth: 26, y: 12 },
  { g: '€', size: 'size-16 md:size-24', depth: 34, y: 2 },
  { g: '$', size: 'size-24 md:size-36', depth: 44, y: 0, main: true },
  { g: '£', size: 'size-16 md:size-24', depth: 34, y: 2 },
  { g: 'Au', size: 'size-12 md:size-20', depth: 26, y: 12, gold: true },
  { g: '¥', size: 'size-14 md:size-16', depth: 18, y: 26, cls: 'max-sm:hidden' }
];

function Orb({ orb, i, mx, my }) {
  const x = useTransform(mx, (v) => v * orb.depth);
  const y = useTransform(my, (v) => v * orb.depth * 0.6);
  return (
    <motion.div style={{ x, y, marginTop: orb.y }} className={cn('relative shrink-0', orb.cls)} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + Math.abs(i - 3) * 0.08, type: 'spring', stiffness: 120, damping: 14 }}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }} className={cn('relative grid place-items-center rounded-full font-black', orb.size, orb.main ? 'text-4xl md:text-6xl' : 'text-base md:text-2xl')}>
        {/* sphere */}
        <span
          className={cn(
            'absolute inset-0 rounded-full shadow-[inset_-8px_-12px_24px_rgba(0,0,0,0.35),inset_6px_8px_18px_rgba(255,255,255,0.35),0_24px_50px_-18px_rgba(0,0,0,0.7)]',
            orb.gold ? 'bg-[radial-gradient(circle_at_32%_28%,#f6e3c8,#d2a67a_38%,#9a6f43_78%)]' : orb.main ? 'bg-[radial-gradient(circle_at_32%_28%,#ffffff,#dfe3f3_42%,#9aa3c9_85%)]' : 'bg-[radial-gradient(circle_at_32%_28%,#f4f6ff,#c9cfe8_45%,#7f88b6_90%)]'
          )}
        />
        {/* specular highlight */}
        <span className="absolute left-[18%] top-[12%] h-[28%] w-[38%] rotate-[-25deg] rounded-full bg-white/70 blur-[6px]" />
        <span className={cn('relative drop-shadow-[0_2px_0_rgba(255,255,255,0.6)]', orb.gold ? 'text-[#5b3d1c]' : 'text-brand-900')}>{orb.g}</span>
      </motion.div>
      {orb.main && <span className="absolute -bottom-8 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-[100%] bg-black/40 blur-xl" />}
    </motion.div>
  );
}

/** Live price strip at the bottom of the hero (prices only from the live feed; "—" until they arrive). */
function LiveTape() {
  const t = useTranslations('marketsPage.hero');
  const rows = useLiveRows(MARKETS_TAPE, 1200);
  const item = (r, k) => (
    <li key={`${r.s}-${k}`} className="flex shrink-0 items-center gap-2.5 text-sm">
      <span className="font-semibold text-white/85">{r.n}</span>
      <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="font-bold text-white" />
      <span className={cn('text-xs font-semibold tabular-nums', r.change == null ? 'text-white/40' : r.change >= 0 ? 'text-green-300' : 'text-red-300')}>{pct(r.change)}</span>
      <span className="ms-4 size-1 rounded-full bg-white/20" aria-hidden />
    </li>
  );
  return (
    <div className="relative mt-16 border-y border-white/10 bg-white/[0.03] backdrop-blur md:mt-20">
      <div className="container-x flex items-center gap-4 py-3.5">
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-gold-200">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-up" />
          </span>
          {t('tapeLabel')}
        </span>
        <div dir="ltr" className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="flex w-max animate-marquee gap-6 [--marquee-duration:55s] [--marquee-gap:1.5rem] hover:[animation-play-state:paused] motion-reduce:animate-none">
            <ul className="flex gap-6">{rows.map((r) => item(r, 'a'))}</ul>
            <ul className="flex gap-6" aria-hidden>
              {rows.map((r) => item(r, 'b'))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketsHero() {
  const t = useTranslations('marketsPage.hero');
  const tb = useTranslations('marketsPage.breadcrumb');
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section className="is-dark relative overflow-hidden bg-ink pt-36 text-white md:pt-44" onPointerMove={onMove} onPointerLeave={() => (rawX.set(0), rawY.set(0))}>
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb items={[{ label: tb('home'), href: '/' }, { label: tb('current') }]} />

        <div dir="ltr" className="mt-12 flex items-start justify-center gap-2 md:mt-14 md:gap-4" aria-hidden>
          {ORBS.map((o, i) => (
            <Orb key={i} orb={o} i={i} mx={mx} my={my} />
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center md:mt-14">
          <motion.h1 className="heading-page" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
            <AccentTitle text={t('title')} />
          </motion.h1>
          <motion.p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
            {t('text')}
          </motion.p>
          <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <LiveAccountButton variant="gold">
              {t('ctaLive')}
            </LiveAccountButton>
            <NavLink href={PORTAL.demo} className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
              {t('ctaDemo')}
            </NavLink>
          </motion.div>
        </div>
      </div>
      <LiveTape />
    </section>
  );
}
