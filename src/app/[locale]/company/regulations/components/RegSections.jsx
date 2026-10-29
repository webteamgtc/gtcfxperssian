'use client';
/**
 * Regulations page sections (final picks, Round 30):
 * hero = seal · map = globe · protection = shield · network = diagram · CTA = timeline.
 * The entity cards live in RegEntities.jsx.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, CalendarCheck, ShieldCheck, Vault, ShieldMinus, UserCheck, LockKeyhole, TriangleAlert, CircleAlert, BadgeCheck, Info, UserPlus, ScanFace, CandlestickChart, Clock, ChevronDown } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { SectionIntro, AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, Marquee, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { Flag } from './Flag';
import { RegGlobe } from './RegGlobe';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const GEO = { southAfrica: [18.4, -33.9], comoros: [44.4, -12.2], mauritius: [57.5, -20.2], cambodia: [104.9, 11.6], australia: [151.2, -33.9], vanuatu: [168.3, -17.7] };

function useEnt() {
  const te = useTranslations('regulationsPage.entities');
  return { te, items: te.raw('items'), labels: te.raw('labels') };
}

function HeroShell({ children }) {
  const tb = useTranslations('regulationsPage.breadcrumb');
  return (
    <section className="is-dark relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />
        {children}
      </div>
    </section>
  );
}

function HeroActions({ t, center }) {
  return (
    <div className={cn('mt-7 flex flex-wrap items-center gap-3', center ? 'justify-center' : 'justify-center lg:justify-start')}>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-sm font-medium text-white/80">
        <CalendarCheck className="size-4 text-gold-200" />
        {t('review')}
      </span>
      <a href="#entities" className="group inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
        {t('cta')}
        <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
      </a>
    </div>
  );
}

/* ====================== HERO · Seal: regulators orbit a shield, flags marquee ====================== */
export function RegHero() {
  const t = useTranslations('regulationsPage.hero');
  const { items } = useEnt();
  const stats = t.raw('stats');
  return (
    <HeroShell>
      <div className="mt-10 text-center">
        <div className="relative mx-auto size-56 md:size-64" aria-hidden>
          <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
            <svg viewBox="0 0 200 200" className="absolute inset-0 size-full">
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(210,166,122,0.4)" strokeDasharray="2 5" />
              <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,0.12)" />
            </svg>
            {items.map((e, i) => {
              const a = (i / items.length) * Math.PI * 2;
              return (
                <motion.span key={e.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + Math.cos(a) * 46}%`, top: `${50 + Math.sin(a) * 46}%` }} animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
                  <span className="flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/15 backdrop-blur">
                    <Flag code={e.code} className="h-3 w-[18px]" />
                    {e.short}
                  </span>
                </motion.span>
              );
            })}
          </motion.div>
          <div className="absolute inset-[26%] grid place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold to-gold-700 shadow-[0_0_60px_rgba(182,135,86,0.5)]">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/30 [animation-duration:3s]" />
            <ShieldCheck className="relative size-12 text-white" />
          </div>
        </div>
        <motion.h1 className="heading-page mx-auto mt-10 max-w-3xl" initial={{ y: 18 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <AccentTitle text={t('title')} />
        </motion.h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg">{t('description')}</p>
        <HeroActions t={t} center />
        <Stagger className="mx-auto mt-10 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rtl:divide-x-reverse" stagger={0.1} delay={0.3}>
          {stats.map((s) => (
            <StaggerItem key={s.label} className="px-3">
              <div className="heading-accent text-2xl font-bold md:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-white/55 md:text-sm">{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
      <div className="mt-12 border-y border-white/10 py-4">
        <Marquee duration={36} gap="1rem">
          {items.map((e) => (
            <a key={e.id} href={`#entity-${e.id}`} className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 transition-colors hover:border-gold/40">
              <Flag code={e.code} className="h-5 w-[30px]" />
              <span className="text-start">
                <span className="block text-sm font-bold text-white">
                  {e.country} · {e.short}
                </span>
                <span dir="ltr" className="block font-mono text-[11px] text-white/50">
                  {e.number}
                </span>
              </span>
            </a>
          ))}
        </Marquee>
      </div>
    </HeroShell>
  );
}

/* ====================== MAP · Globe ====================== */
export function RegMap() {
  const t = useTranslations('regulationsPage.map');
  const { items } = useEnt();
  const pins = useMemo(() => items.filter((e) => GEO[e.id]).map((e) => ({ lon: GEO[e.id][0], lat: GEO[e.id][1], label: `${e.city} · ${e.short}` })), [items]);
  return (
    <section id="map" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="text-center lg:text-start">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('title')} />
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink/60 md:text-base lg:mx-0">{t('description')}</p>
          </Reveal>
          <Stagger className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3" stagger={0.06}>
            {items.map((e) => (
              <StaggerItem key={e.id}>
                <span className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold shadow-sm ring-1 ring-brand/10">
                  <Flag code={e.code} className="h-3.5 w-[21px]" />
                  {e.city}
                  <span className="ms-auto text-[10px] text-brand">{e.short}</span>
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <Reveal y={24}>
          <div className="rounded-[2rem] bg-gradient-to-br from-brand-800 to-ink p-4 shadow-2xl shadow-brand/20">
            <RegGlobe pins={pins} start={85} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ====================== PROTECTION · Shield layers ====================== */
const P_ICONS = { segregated: Vault, negative: ShieldMinus, aml: UserCheck, encryption: LockKeyhole };
export function Protection() {
  const t = useTranslations('regulationsPage.protection');
  const items = t.raw('items');
  const [on, setOn] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setOn((x) => (x + 1) % items.length), 3500);
    return () => clearInterval(id);
  }, [items.length]);
  const Card = ({ it, k }) => {
    const Icon = P_ICONS[it.id] ?? Vault;
    return (
      <button type="button" onMouseEnter={() => setOn(k)} onClick={() => setOn(k)} className={cn('w-full rounded-[1.5rem] border p-5 text-start transition-all duration-500', on === k ? 'border-gold/40 bg-white/[0.08] shadow-xl shadow-black/30' : 'border-white/10 bg-white/[0.03] hover:border-white/20')}>
        <span className="flex items-center gap-3">
          <span className={cn('grid size-10 place-items-center rounded-xl transition-colors', on === k ? 'bg-gold text-white' : 'bg-white/10 text-gold-200')}>
            <Icon className="size-[18px]" />
          </span>
          <span className="heading-small">{it.title}</span>
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-white/60">{it.text}</span>
      </button>
    );
  };
  return (
    <section id="protection" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />
        <div className="is-dark mt-12 grid items-center gap-6 md:mt-14 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
          <div className="grid gap-4">
            {items.slice(0, 2).map((it, k) => (
              <Card key={it.id} it={it} k={k} />
            ))}
          </div>
          <div className="relative mx-auto grid size-64 place-items-center max-lg:order-first md:size-72" aria-hidden>
            {items.map((it, k) => (
              <motion.span key={it.id} className="absolute rounded-full border-2" style={{ inset: `${k * 12}%` }} animate={{ borderColor: on === k ? 'rgba(210,166,122,0.9)' : 'rgba(255,255,255,0.12)', scale: on === k ? 1.03 : 1, boxShadow: on === k ? '0 0 40px rgba(182,135,86,0.35)' : '0 0 0 rgba(0,0,0,0)' }} transition={{ duration: 0.5 }} />
            ))}
            <span className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-700 shadow-2xl shadow-gold/40">
              <ShieldCheck className="size-9 text-white" />
            </span>
          </div>
          <div className="grid gap-4">
            {items.slice(2).map((it, k) => (
              <Card key={it.id} it={it} k={k + 2} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================== NETWORK · Separate entities diagram + notices accordion ====================== */
const N_STYLE = { restricted: [TriangleAlert, 'text-amber-500'], risk: [CircleAlert, 'text-brand'], audit: [BadgeCheck, 'text-emerald-500'] };
export function Network() {
  const t = useTranslations('regulationsPage.network');
  const { items: ents } = useEnt();
  const notes = t.raw('items');
  const [open, setOpen] = useState(notes[0]?.id);
  return (
    <section id="network" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="container-x grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Reveal y={16}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-6 text-white md:p-10">
            <h2 className="heading-section">
              <AccentTitle text={t('title')} />
            </h2>
            {/* separate boxes, never merged: each entity its own licence */}
            <div dir="ltr" className="relative mt-8 grid grid-cols-3 gap-3" aria-hidden>
              {ents.map((e, k) => (
                <motion.div key={e.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: k * 0.08 }} className="rounded-xl border border-dashed border-white/25 bg-white/[0.05] p-3 text-center">
                  <Flag code={e.code} className="mx-auto h-4 w-6" />
                  <div className="mt-1.5 text-[11px] font-bold">{e.short}</div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 space-y-3 text-[15px] leading-relaxed text-white/75">
              {t.raw('paragraphs').map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </div>
        </Reveal>
        <div>
          <ul className="grid gap-3">
            {notes.map((n) => {
              const [Icon, color] = N_STYLE[n.id] ?? N_STYLE.risk;
              const on = open === n.id;
              return (
                <li key={n.id} className={cn('overflow-hidden rounded-[1.5rem] border transition-all', on ? 'border-brand/20 shadow-xl shadow-brand/10' : 'border-brand/10')}>
                  <button type="button" onClick={() => setOpen(on ? null : n.id)} aria-expanded={on} className="flex w-full items-center gap-4 p-5 text-start">
                    <Icon className={cn('size-6 shrink-0', color)} />
                    <span className="heading-card flex-1">{n.title}</span>
                    <ChevronDown className={cn('size-5 text-ink/40 transition-transform', on && 'rotate-180')} />
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-5 ps-15 text-[15px] leading-relaxed text-ink/65">
                        {n.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex gap-3 rounded-2xl bg-[#f6f7fb] p-5 text-sm leading-relaxed text-ink/60">
            <Info className="mt-0.5 size-5 shrink-0 text-brand" />
            <p>{t('note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================== CTA · Split: steps as a vertical timeline, actions on the side ====================== */
const S_ICONS = { register: UserPlus, verify: ScanFace, trade: CandlestickChart };
export function RegCta() {
  const t = useTranslations('regulationsPage.cta');
  const steps = t.raw('steps');
  return (
    <section id="get-started" className="relative bg-white py-14 text-white md:py-20">
      <div className="container-x">
        <Reveal y={24}>
          <div className="is-dark relative grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 shadow-2xl shadow-brand/25 lg:grid-cols-[1fr_1.1fr]">
            <BandLine />
            <div className="relative flex flex-col justify-center p-8 md:p-12">
              <span className="absolute -start-20 -top-20 size-72 rounded-full bg-gold/25 blur-[90px]" aria-hidden />
              <h2 className="heading-section relative">
                <AccentTitle text={t('title')} />
              </h2>
              <div className="relative mt-8 flex flex-wrap gap-3">
                <LiveAccountButton variant="gold">
                  {t('live')}
                </LiveAccountButton>
                <NavLink href={PORTAL.demo} className="inline-flex h-13 items-center rounded-full border border-white/25 px-6 font-semibold text-white hover:bg-white hover:text-brand-900">
                  {t('demo')}
                </NavLink>
              </div>
              <ul dir="ltr" className="relative mt-8 grid grid-cols-2 gap-2 text-[11px] font-semibold text-white/55">
                {t.raw('licences').map((l) => (
                  <li key={l} className="rounded-lg bg-white/[0.06] px-3 py-2">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <ol className="relative border-white/10 bg-white/[0.04] p-8 md:p-12 lg:border-s">
              <span className="absolute bottom-16 start-[3.6rem] top-16 w-px bg-white/15 md:start-[4.6rem]" aria-hidden>
                <motion.span className="block w-px origin-top bg-gold" initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: EASE }} />
              </span>
              {steps.map((s, i) => {
                const Icon = S_ICONS[s.id] ?? UserPlus;
                return (
                  <motion.li key={s.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.2, duration: 0.6, ease: EASE }} className="relative flex gap-5 pb-8 last:pb-0">
                    <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-lg">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-200">{s.tag}</span>
                      <h3 className="heading-card mt-1">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">{s.text}</p>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white/50">
                        <Clock className="size-3.5" />
                        {s.meta}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
