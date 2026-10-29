'use client';
/**
 * Body sections shared by the MetaTrader pages (MT4, MT5, iPhone/iPad, Android).
 * Every section reads its text from `ns` (e.g. 'mt4Page'), so the same components serve each page.
 */
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import RingCard from '@/components/shared/RingCard';
import FaqAccordion from '@/components/shared/FaqAccordion';
import NumberedSteps from '@/components/shared/NumberedSteps';
import CtaBand from '@/components/shared/CtaBand';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { useScrollSteps } from '@/components/shared/useScrollSteps';
import { cn } from '@/lib/utils';
import { MT_LINKS, CONTACT_HREF } from './links';
import { AndroidIcon, AppleIcon, WindowsIcon } from './brandIcons';
import { ChartPanel, EaPanel, MarketWatch, OrderTicket, PositionsPanel } from './mtVisuals';

/* ------------------------------------------------------------ capabilities */

/** "01 — Advanced Charting" → { num: '01', name: 'Advanced Charting' } */
function splitTag(tag) {
  const m = String(tag).match(/^(\d+)\s*[—-]\s*(.+)$/);
  return m ? { num: m[1], name: m[2] } : { num: '', name: tag };
}

/**
 * Capabilities showcase: five feature tabs on the start side (they follow the scroll on desktop,
 * auto-advance on phones — same behaviour as the company Legal section) and the selected feature's
 * text, points and live terminal panel on the end side.
 */
export function Capabilities({ ns, version }) {
  const t = useTranslations(`${ns}.capabilities`);
  const items = t.raw('items');
  const visuals = [ChartPanel, EaPanel, version === 'mt5' ? () => <OrderTicket types={['Buy Limit', 'Sell Limit', 'Buy Stop', 'Sell Stop', 'Buy Stop Limit', 'Sell Stop Limit']} /> : () => <OrderTicket />, PositionsPanel, MarketWatch];
  const s = useScrollSteps(items.length, { autoMs: 6500 });
  const item = items[s.index];
  const Visual = visuals[s.index % visuals.length];
  const { num, name } = splitTag(item.tag);

  return (
    <section id="capabilities" ref={s.outerRef} className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 top-1/2 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-[300px_1fr] lg:gap-6" {...s.hover}>
          {/* tabs */}
          <div role="tablist" aria-label={t('tabsLabel')} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {items.map((it, k) => {
              const on = k === s.index;
              const tg = splitTag(it.tag);
              return (
                <button
                  key={it.tag}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="mt-cap-panel"
                  onClick={() => s.goTo(k)}
                  className={cn('group relative flex min-w-[220px] shrink-0 items-center gap-3.5 overflow-hidden rounded-2xl border px-4 py-4 text-start transition-colors duration-500 lg:min-w-0', on ? 'border-transparent text-white' : 'border-brand/10 bg-white hover:border-brand/25 hover:bg-brand-50/40')}
                >
                  {on && <motion.span layoutId="mt-cap-tab" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 shadow-xl shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                  <span className={cn('relative grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold tabular-nums transition-colors duration-500', on ? 'bg-white/10 text-gold-200 ring-1 ring-white/20' : 'bg-brand-50 text-brand ring-1 ring-brand/10')}>{tg.num}</span>
                  <span className={cn('relative text-[15px] font-semibold', on ? 'text-white' : 'text-ink')}>{tg.name}</span>
                  {on && (
                    <span className="absolute inset-x-4 bottom-1.5 h-0.5 overflow-hidden rounded-full bg-white/15">
                      <motion.span className="block h-full origin-left bg-gold rtl:origin-right" style={{ scaleX: s.progress }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* panel */}
          <div id="mt-cap-panel" role="tabpanel" className="relative overflow-hidden rounded-[2rem] border border-brand/10 bg-gradient-to-br from-white to-[#f4f6fb] shadow-xl shadow-brand/5">
            <div className="bg-grid-light pointer-events-none absolute inset-0 opacity-50" aria-hidden />
            <AnimatePresence mode="popLayout" initial={false} custom={s.dir}>
              <motion.div
                key={item.tag}
                custom={s.dir}
                variants={{ enter: (d) => ({ y: d * 24, opacity: 0 }), center: { y: 0, opacity: 1 }, exit: (d) => ({ y: d * -24, opacity: 0 }) }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: EASE }}
                className="relative grid items-center gap-8 p-6 md:p-8 xl:grid-cols-[1fr_1.05fr] xl:gap-10 xl:p-10"
              >
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/10">
                    <span className="text-gold-700">{num}</span> {name}
                  </span>
                  <h3 className="heading-title mt-4">{item.title}</h3>
                  <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink/60">{item.text}</p>
                  <ul className="mt-6 space-y-3">
                    {item.points.map((p, k) => (
                      <motion.li key={p.b} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + k * 0.07 }} className="flex gap-3 text-[15px] leading-relaxed text-ink/65">
                        <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span>
                          <strong className="font-semibold text-ink">{p.b}</strong> {p.t}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand/15 via-gold/10 to-transparent blur-2xl" aria-hidden />
                  <motion.div initial={{ scale: 0.96, rotate: -1 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.6, ease: EASE }} className="relative">
                    <Visual />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ cross-device */

const DEVICE_ICONS = { windows: WindowsIcon, mac: AppleIcon, ios: AppleIcon, android: AndroidIcon };

export function CrossDevice({ ns, version }) {
  const t = useTranslations(`${ns}.devices`);
  const items = t.raw('items');
  const links = MT_LINKS[version] ?? MT_LINKS.mt4;

  return (
    <section id="devices" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4" stagger={0.08}>
          {items.map((d, i) => {
            const Icon = DEVICE_ICONS[d.id] ?? WindowsIcon;
            return (
              <StaggerItem key={d.id} className="h-full">
                <RingCard innerClassName="p-6 md:p-7">
                  <div className="pointer-events-none absolute -end-12 -top-12 size-36 rounded-full bg-brand/[0.06] blur-2xl transition-colors duration-500 group-hover:bg-gold/15" aria-hidden />
                  <span className="relative grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                    <motion.span className="absolute inset-0 rounded-2xl ring-2 ring-gold/40" animate={{ scale: [1, 1.3], opacity: [0.7, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }} aria-hidden />
                    <Icon className="size-6" />
                  </span>
                  <h3 className="heading-card relative mt-6">{d.name}</h3>
                  <p className="relative text-xs font-medium text-ink/45">{d.meta}</p>
                  <p className="relative mt-3 flex-1 text-[15px] leading-relaxed text-ink/60">{d.text}</p>
                  <a href={links[d.id] ?? '#'} className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white">
                    {d.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </a>
                </RingCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ better edge */

/** 0.0 pip: bid/ask bars converging to a zero gap. */
function SpreadVisual() {
  return (
    <div dir="ltr" className="flex h-16 items-center justify-center gap-1.5" aria-hidden>
      <motion.span className="h-10 w-3 rounded-sm bg-down/80" animate={{ x: [-18, 0, 0, -18] }} transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' }} />
      <motion.span className="h-px w-6 bg-gold" animate={{ scaleX: [1, 0, 0, 1] }} transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' }} />
      <motion.span className="h-10 w-3 rounded-sm bg-up/80" animate={{ x: [18, 0, 0, 18] }} transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' }} />
    </div>
  );
}

/** 38 ms: speed gauge with a sweeping needle. */
function SpeedVisual() {
  return (
    <div dir="ltr" className="relative mx-auto h-16 w-28" aria-hidden>
      <svg viewBox="0 0 120 64" className="absolute inset-0 size-full">
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round" />
        <motion.path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="url(#edge-speed)" strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 0.85 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE }} />
        <defs>
          <linearGradient id="edge-speed" x1="0" x2="1">
            <stop offset="0" stopColor="#8390d4" />
            <stop offset="1" stopColor="#d2a67a" />
          </linearGradient>
        </defs>
      </svg>
      <motion.span className="absolute bottom-1 left-1/2 h-10 w-0.5 origin-bottom -translate-x-1/2 rounded-full bg-white" animate={{ rotate: [-80, 60, 50, 60] }} transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1, ease: 'easeOut' }} />
      <span className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-gold" />
    </div>
  );
}

/** 100%: ring that fills, with a tick in the middle. */
function RingVisual() {
  const C = 2 * Math.PI * 24;
  return (
    <div dir="ltr" className="relative mx-auto grid size-16 place-items-center" aria-hidden>
      <svg viewBox="0 0 60 60" className="absolute inset-0 size-full -rotate-90">
        <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        <motion.circle cx="30" cy="30" r="24" fill="none" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: 0 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} />
      </svg>
      <ShieldCheck className="size-6 text-white" />
    </div>
  );
}

/** 24/7: clock with a turning hand and orbiting dot. */
function ClockVisual() {
  return (
    <div dir="ltr" className="relative mx-auto grid size-16 place-items-center rounded-full border-2 border-white/20" aria-hidden>
      <motion.span className="absolute inset-[-6px] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_rgba(182,135,86,0.9)]" />
      </motion.span>
      <motion.span className="absolute left-1/2 top-1/2 h-5 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-white" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
      <span className="absolute left-1/2 top-1/2 h-3.5 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rotate-90 rounded-full bg-gold-200" />
      <span className="relative size-2 rounded-full bg-white" />
    </div>
  );
}

const EDGE_VISUALS = [SpreadVisual, SpeedVisual, RingVisual, ClockVisual];

/** Dark navy band with four glass stat cards, each with its own little live visual. */
export function BetterEdge({ ns }) {
  const t = useTranslations(`${ns}.edge`);
  const items = t.raw('items');
  return (
    <section id="edge" className="is-dark relative overflow-hidden py-14 text-white md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <motion.span className="absolute -end-24 top-0 size-96 rounded-full bg-gold/15 blur-[120px]" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 7, repeat: Infinity }} aria-hidden />
      <div className="absolute -start-24 bottom-0 size-96 rounded-full bg-brand/40 blur-[120px]" aria-hidden />

      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4" stagger={0.1}>
          {items.map((s, i) => {
            const Visual = EDGE_VISUALS[i % EDGE_VISUALS.length];
            return (
              <StaggerItem key={s.label} className="h-full">
                <motion.article whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="group border-beam relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/[0.04] p-2 ring-1 ring-white/10 backdrop-blur">
                  <div className="relative grid h-32 place-items-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-700/50 via-brand-900/50 to-ink">
                    <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
                    <span className="absolute size-32 rounded-full bg-gold/15 blur-2xl transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-100" aria-hidden />
                    <div className="relative">
                      <Visual />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                    <div dir="ltr" className="text-gradient-gold text-4xl font-bold tracking-tight rtl:text-end">
                      <StatValue value={s.value} />
                    </div>
                    <h3 className="mt-1 font-semibold text-white">{s.label}</h3>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white/65">{s.text}</p>
                    <span className="mt-5 h-px w-12 bg-gradient-to-r from-gold to-transparent transition-all duration-700 group-hover:w-28 rtl:bg-gradient-to-l" aria-hidden />
                  </div>
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ three steps */

export function ThreeSteps({ ns }) {
  const t = useTranslations(`${ns}.steps`);
  return (
    <section id="get-started" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <NumberedSteps steps={t.raw('items')} className="mt-14 md:mt-16" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ FAQ */

export function MtFaq({ ns }) {
  const t = useTranslations(`${ns}.faq`);
  return (
    <section id="faq" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal y={16} className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('description')}</p>
          <NavLink href={CONTACT_HREF} className="group mt-8 inline-flex items-center gap-2 text-base font-semibold text-brand">
            {t('contact')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
          </NavLink>
        </Reveal>
        <FaqAccordion items={t.raw('items')} numbered />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ CTA */

export function MtCta({ ns, version }) {
  const t = useTranslations(`${ns}.cta`);
  const links = MT_LINKS[version] ?? MT_LINKS.mt4;
  return (
    <CtaBand
      id="download"
      layout="split"
     
      title={t('title')}
      description={t('description')}
      primary={{ label: t('primary'), href: links.windows }}
      secondary={{ label: t('secondary'), href: LIVE_ACCOUNT_HREF }}
      note={t('note')}
    />
  );
}
