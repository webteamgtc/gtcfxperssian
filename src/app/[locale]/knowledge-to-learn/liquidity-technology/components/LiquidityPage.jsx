'use client';
/**
 * /knowledge-to-learn/liquidity-technology — GTC Prime liquidity & technology.
 * Rhythm: dark hero (network visual + stats) → white (why choose: list + orbit stage) → gray (who we serve) → navy (direct access)
 * → white (what we offer: alternating rows with depth / connectivity visuals) → navy CTA.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Building2, Cable, CheckCircle2, Cpu, Gauge, Handshake, Layers, LineChart, Network, Package, ShieldCheck, Users, Wallet, Zap } from 'lucide-react';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import Breadcrumb from '@/components/shared/Breadcrumb';
import CtaBand from '@/components/shared/CtaBand';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import RingCard from '@/components/shared/RingCard';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { HUB_PATH } from '../../courses';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const NS = 'liquidityTechnologyPage';

/* ------------------------------------------------------------ hero */

/** Liquidity network: tier-1 nodes around a hub with pulses travelling along the links. */
function NetworkVisual() {
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * 38, y: 50 + Math.sin(a) * 38 };
  });
  return (
    <div dir="ltr" className="relative mx-auto aspect-square w-full max-w-[440px]" aria-hidden>
      <div className="absolute inset-[15%] rounded-full bg-brand/40 blur-3xl" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="1 2" />
        {nodes.map((n, i) => (
          <g key={i}>
            <line x1="50" y1="50" x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
            <motion.circle r="0.9" fill="#d2a67a" initial={{ cx: n.x, cy: n.y, opacity: 0 }} animate={{ cx: [n.x, 50], cy: [n.y, 50], opacity: [0, 1, 0] }} transition={{ duration: 2.2, delay: i * 0.3, repeat: Infinity, ease: 'easeIn' }} />
          </g>
        ))}
      </svg>
      {nodes.map((n, i) => (
        <motion.span key={i} className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white/10 text-gold-200 ring-1 ring-white/15 backdrop-blur" style={{ left: `${n.x}%`, top: `${n.y}%` }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.07, type: 'spring', stiffness: 220, damping: 16 }}>
          <Building2 className="size-4" />
        </motion.span>
      ))}
      <motion.div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#5b6ed2,#293b93_55%,#141d4d)] shadow-[0_0_80px_rgba(91,110,210,0.6)]" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <Network className="size-10 text-white" />
      </motion.div>
    </div>
  );
}

function Hero() {
  const t = useTranslations(`${NS}.banner`);
  const tb = useTranslations(`${NS}.breadcrumb`);
  const tk = useTranslations('knowledgePage.breadcrumb');
  const stats = t.raw('stats');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tk('home'), href: '/' }, { label: tk('current'), href: HUB_PATH }, { label: tb('current') }]} />
        <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div className="text-center lg:text-start">
            <motion.h1 className="heading-page" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/70 lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('subTitle')}
            </motion.p>
            <motion.div className="mt-9 flex justify-center lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <LiveAccountButton variant="gold">
                {t('liveAccount')}
              </LiveAccountButton>
            </motion.div>
            <Stagger className="mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-8 sm:grid-cols-4" stagger={0.08} delay={0.35}>
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <div dir="ltr" className="text-gradient-gold text-2xl font-bold md:text-3xl rtl:text-end">
                    <StatValue value={s.value} />
                  </div>
                  <div className="mt-1 text-xs text-white/55">{s.label}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <NetworkVisual />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ why choose */

const WHY_ICONS = [Handshake, Wallet, Gauge, Layers, Cpu, Package];
const WHY_MS = 6000; // auto-advance interval

/** Navy stage: the active reason's icon in the centre, all six orbiting (click to select). */
function WhyStage({ items, active, onPick }) {
  const it = items[active];
  const Icon = WHY_ICONS[active % WHY_ICONS.length];
  return (
    <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white shadow-2xl shadow-brand/25 md:p-10">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-20 -top-20 size-72 rounded-full bg-gold/25 blur-[90px]" animate={{ opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />

      <div dir="ltr" className="relative mx-auto aspect-square w-[78%] max-w-[300px]">
        <motion.div className="absolute inset-0 rounded-full border border-dashed border-white/15" animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} aria-hidden />
        <div className="absolute inset-[22%] rounded-full border border-white/10" aria-hidden />
        {items.map((x, i) => {
          const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
          const NodeIcon = WHY_ICONS[i % WHY_ICONS.length];
          const on = i === active;
          return (
            <button
              key={x.title}
              type="button"
              onClick={() => onPick(i)}
              aria-label={x.title}
              aria-pressed={on}
              className={cn('absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl ring-1 backdrop-blur transition-all duration-500', on ? 'scale-110 bg-gold text-white shadow-lg shadow-gold/40 ring-gold' : 'bg-white/10 text-gold-200 ring-white/15 hover:bg-white/20')}
              style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}
            >
              <NodeIcon className="size-5" />
            </button>
          );
        })}
        <div className="absolute inset-[26%] grid place-items-center">
          <motion.span className="absolute inset-0 rounded-full bg-gold/20" animate={{ scale: [1, 1.25], opacity: [0.5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }} aria-hidden />
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#5b6ed2,#293b93_55%,#141d4d)] shadow-[0_0_70px_rgba(91,110,210,0.55)]" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.span key={active} className="relative" initial={{ scale: 0.4, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.4, rotate: 30, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
              <Icon className="size-11 text-white md:size-12" strokeWidth={1.5} />
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active} className="relative mt-10 text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE }}>
          <span dir="ltr" className="text-xs font-bold tracking-[0.24em] text-gold-200">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <h3 className="mt-3 text-2xl font-bold md:text-3xl">{it.title}</h3>
          <p className="mx-auto mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-white/65">{it.desc}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Six reasons: selectable list (auto-advances, pauses on hover) beside the navy orbit stage. */
function WhyChoose() {
  const t = useTranslations(`${NS}.whyChoose`);
  const items = t.raw('items');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const id = setTimeout(() => setActive((a) => (a + 1) % items.length), WHY_MS);
    return () => clearTimeout(id);
  }, [active, paused, items.length]);

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[400px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} />
        <div className="mt-12 grid items-center gap-10 md:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <Stagger as="ol" className="space-y-2.5" stagger={0.06}>
            {items.map((it, i) => {
              const Icon = WHY_ICONS[i % WHY_ICONS.length];
              const on = i === active;
              return (
                <StaggerItem as="li" key={it.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-expanded={on}
                    className={cn('group relative w-full overflow-hidden rounded-2xl p-4 text-start transition-all duration-500 md:p-5', on ? 'bg-white shadow-xl shadow-brand/10 ring-1 ring-brand/15' : 'ring-1 ring-transparent hover:bg-[#f6f7fb]')}
                  >
                    <span className="flex items-center gap-4">
                      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl transition-all duration-500', on ? 'bg-gradient-to-br from-brand-500 to-brand-900 text-white shadow-lg shadow-brand/25' : 'bg-brand-50 text-brand group-hover:-rotate-6')}>
                        <Icon className="size-5" />
                      </span>
                      <span className={cn('flex-1 text-base font-semibold transition-colors md:text-lg', on ? 'text-ink' : 'text-ink/70 group-hover:text-ink')}>{it.title}</span>
                      <span dir="ltr" className={cn('text-xs font-bold tabular-nums transition-colors', on ? 'text-gold' : 'text-brand/25')}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </span>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span className="block overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                          <span className="block ps-15 pt-2 text-[15px] leading-relaxed text-ink/60">{it.desc}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {on && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand/10" aria-hidden>
                        <motion.span key={`${active}-${paused}`} className="block h-full origin-left bg-gradient-to-r from-brand to-gold rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0 : 1 }} transition={{ duration: paused ? 0 : WHY_MS / 1000, ease: 'linear' }} />
                      </span>
                    )}
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
          <Reveal y={24}>
            <WhyStage items={items} active={active} onPick={setActive} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ who we serve */

const SERVE_ICONS = [Building2, LineChart, Users];

function WhoServe() {
  const t = useTranslations(`${NS}.whoServe`);
  const items = t.raw('items');
  return (
    <section className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('heading')} description={t('desc')} />
        <Stagger className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-3" stagger={0.12}>
          {items.map((it, i) => {
            const Icon = SERVE_ICONS[i % SERVE_ICONS.length];
            const featured = i === 1;
            return (
              <StaggerItem key={it.title} className={cn('h-full', featured && 'lg:-translate-y-3')}>
                <RingCard dark={featured} innerClassName="relative p-7 md:p-8">
                  {featured && <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />}
                  <span className={cn('relative grid size-12 place-items-center rounded-2xl ring-1', featured ? 'bg-white/10 text-gold-200 ring-white/15' : 'bg-brand-50 text-brand ring-brand/10')}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className={cn('heading-card relative mt-6', featured && 'text-white')}>{it.title}</h3>
                  <p className={cn('relative mt-3 text-[15px] leading-relaxed', featured ? 'text-white/70' : 'text-ink/60')}>{it.desc}</p>
                </RingCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ direct access */

function DirectAccess() {
  const t = useTranslations(`${NS}.directAccess`);
  const points = t.raw('points');
  return (
    <section className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-200">{t('lpLabel')}</p>
          <h2 className="heading-section mt-4">
            <AccentTitle text={t('heading')} accentClassName="text-gradient-gold" />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/70 md:text-base">{t('desc')}</p>
          <p className="mt-6 text-sm font-semibold text-white/80">{t('lpLabel1')}</p>
          <NavLink href="/company/contact-us" className="shine mt-6 inline-flex h-13 items-center gap-2 rounded-full bg-gold px-7 text-base font-bold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
            <Cable className="size-4" /> {t('button')}
          </NavLink>
        </Reveal>
        <Stagger className="grid gap-3 sm:grid-cols-2" stagger={0.08}>
          {points.map((p, i) => (
            <StaggerItem key={p}>
              <div className="group flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 backdrop-blur transition-colors duration-500 hover:border-gold/40 hover:bg-white/[0.09]">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-200 transition-transform duration-500 group-hover:scale-110">{i % 2 ? <Zap className="size-4" /> : <CheckCircle2 className="size-4" />}</span>
                <span className="text-[15px] font-medium">{p}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ what we offer */

const OFFER_ICONS = [Layers, Cable, ShieldCheck];

/** Decorative market-depth ladder: bid / ask bars breathing around a gold spread line (no figures). */
function DepthVisual() {
  const rows = [0.92, 0.74, 0.58, 0.46, 0.34];
  return (
    <div dir="ltr" className="relative grid h-full grid-cols-2 gap-x-3 px-8 py-16 md:px-12" aria-hidden>
      {['bid', 'ask'].map((side) => (
        <div key={side} className={cn('flex flex-col justify-center gap-3', side === 'bid' ? 'items-end' : 'items-start')}>
          {rows.map((w, i) => (
            <motion.span
              key={i}
              className={cn('h-5 rounded-md md:h-6', side === 'bid' ? 'origin-right bg-gradient-to-l from-up/80 to-up/10' : 'origin-left bg-gradient-to-r from-down/80 to-down/10')}
              style={{ width: `${w * 100}%` }}
              animate={{ scaleX: [1, 0.7 + ((i * 7) % 5) * 0.06, 1] }}
              transition={{ duration: 2.6 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: side === 'ask' ? 0.4 : 0 }}
            />
          ))}
        </div>
      ))}
      <motion.span className="absolute inset-y-10 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-gold to-transparent" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
    </div>
  );
}

/** Decorative connectivity map: client hub → GTC Prime hub → market venues, pulses travelling along the links. */
function ConnectVisual() {
  const client = { x: 16, y: 50 };
  const hub = { x: 50, y: 50 };
  const venues = [
    { x: 84, y: 20 },
    { x: 88, y: 50 },
    { x: 84, y: 80 }
  ];
  const links = [[client, hub], ...venues.map((v) => [hub, v])];
  return (
    <div dir="ltr" className="relative h-full" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {links.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {links.map(([a, b], i) => (
        <motion.span
          key={`pulse-${i}`}
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(210,166,122,0.9)]"
          animate={{ left: [`${a.x}%`, `${b.x}%`], top: [`${a.y}%`, `${b.y}%`], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
        />
      ))}
      <span className="absolute grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-white text-brand shadow-xl" style={{ left: `${client.x}%`, top: `${client.y}%` }}>
        <Users className="size-6" />
      </span>
      <motion.span className="absolute grid size-18 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#5b6ed2,#293b93_55%,#141d4d)] text-white shadow-[0_0_50px_rgba(91,110,210,0.6)]" style={{ left: `${hub.x}%`, top: `${hub.y}%` }} animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <Network className="size-8" />
      </motion.span>
      {venues.map((v, i) => (
        <span key={`venue-${i}`} className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white/10 text-gold-200 ring-1 ring-white/15 backdrop-blur" style={{ left: `${v.x}%`, top: `${v.y}%` }}>
          <Building2 className="size-5" />
        </span>
      ))}
    </div>
  );
}

const OFFER_VISUALS = [DepthVisual, ConnectVisual];

/** Offers as alternating rows: navy animated visual beside large number, title and copy. */
function WhatWeOffer() {
  const t = useTranslations(`${NS}.offer`);
  const items = t.raw('items');
  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="absolute -end-40 bottom-10 size-[420px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('heading')} />
        <div className="mt-12 space-y-14 md:mt-16 md:space-y-20">
          {items.map((it, i) => {
            const Icon = OFFER_ICONS[i % OFFER_ICONS.length];
            const Visual = OFFER_VISUALS[i];
            const flip = i % 2 === 1;
            return (
              <div key={it.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal y={24} className={cn(flip && 'lg:order-2')}>
                  <div className="is-dark relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink shadow-2xl shadow-brand/25 ring-1 ring-brand/20">
                    <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
                    <motion.span className={cn('absolute -top-20 size-72 rounded-full bg-gold/20 blur-[90px]', flip ? '-start-20' : '-end-20')} animate={{ opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
                    {Visual ? (
                      <Visual />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <Icon className="size-20 text-white/80" strokeWidth={1.25} />
                      </div>
                    )}
                    <span className="absolute start-5 top-5 grid size-12 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15 backdrop-blur">
                      <Icon className="size-5" />
                    </span>
                  </div>
                </Reveal>
                <Reveal y={20} delay={0.1} className={cn('relative text-center lg:text-start', flip && 'lg:order-1')}>
                  <span className="relative inline-flex items-center gap-3">
                    <span className="h-px w-10 bg-gradient-to-r from-gold to-transparent rtl:bg-gradient-to-l" aria-hidden />
                    <span dir="ltr" className="text-xs font-bold tracking-[0.24em] text-gold-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <h3 className="relative mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">{it.title}</h3>
                  <p className="relative mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink/60 md:text-lg lg:mx-0">{it.desc}</p>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ page */

export default function LiquidityPage() {
  const tc = useTranslations('whyGtcGroupPage.cta');
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <Hero />
        <WhyChoose />
        <WhoServe />
        <DirectAccess />
        <WhatWeOffer />
        <CtaBand id="start" title={tc('title')} description={tc('text')} primary={{ label: tc('live'), href: LIVE_ACCOUNT_HREF }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
