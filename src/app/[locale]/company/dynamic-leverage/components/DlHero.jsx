'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useTicker, FlashPrice, Sparkline } from '@/components/shared/ticker';
import { Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { selectScheduleTab } from './scheduleEvents';

/** Feed symbol for each sheet row (US500 is SPX500 in the demo feed). */
const FEED = { US500: 'SPX500' };

/** White "Live · Margin Sheet" card: ticking prices + each instrument's max leverage and margin. */
function MarginSheet() {
  const t = useTranslations('dynamicLeveragePage.hero.sheet');
  const rows = t.raw('rows');
  const majors = useTicker(7, 1300);
  const indices = useTicker(8, 1600);
  const feed = [...majors, ...indices];

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[500px] [perspective:1400px]" aria-hidden>
      <div className="absolute -inset-8 rounded-[3rem] bg-brand/40 blur-3xl" />
      <motion.div initial={{ rotateY: -16, rotateX: 6, opacity: 0, y: 30 }} animate={{ rotateY: -6, rotateX: 3, opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.7)] ring-1 ring-white/20">
          <div className="flex items-center justify-between border-b border-brand/10 px-5 py-4">
            <span className="text-sm font-medium text-ink/70">{t('title')}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-up">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('status')}
            </span>
          </div>
          <div className="divide-y divide-brand/5">
            {rows.map((row, i) => {
              const live = feed.find((r) => r.s === (FEED[row.symbol] ?? row.symbol));
              const up = live ? live.change >= 0 : true;
              return (
                <motion.div key={row.symbol} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: EASE }} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold">{row.symbol}</span>
                    <span className="block text-xs text-ink/45">{row.terms}</span>
                  </span>
                  {live && <Sparkline data={live.hist} up={up} width={70} height={24} className="hidden sm:block" />}
                  <span className="w-24 text-end">
                    {live ? <FlashPrice value={live.bid} decimals={live.d} dir={live.dir} tick={live.tick} className="block text-[15px] font-bold" /> : <span className="block font-bold">—</span>}
                    <span className={cn('text-[11px] font-semibold', up ? 'text-up' : 'text-down')}>
                      {live ? `${up ? '+' : ''}${live?.change?.toFixed(2)}%` : '—'}
                    </span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* floating max-leverage chip */}
      <motion.div className="absolute -bottom-6 -start-4 z-10 rounded-2xl bg-white px-4 py-2.5 shadow-xl shadow-brand/25 ring-1 ring-brand/10 md:-start-10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }} transition={{ opacity: { delay: 1.1 }, scale: { delay: 1.1, type: 'spring' }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}>
        <div className="text-[11px] text-ink/50">{t('maxLabel')}</div>
        <div className="text-lg font-bold text-brand">{t('maxValue')}</div>
      </motion.div>
    </div>
  );
}

/** Four glass "at a glance" stat cards with animated fill bars. */
function Glance() {
  const t = useTranslations('dynamicLeveragePage.glance');
  const items = t.raw('items');
  return (
    <div className="mt-20 md:mt-24">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
        <span>
          <span className="text-gold-200">/</span> {t('eyebrow')}
        </span>
        <span>{t('count')}</span>
      </div>
      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
        {items.map((it) => (
          <StaggerItem key={it.tag} className="h-full">
            <motion.article whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="group border-beam relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur transition-colors duration-500 hover:bg-white/[0.08]">
              <span className="absolute -end-10 -top-10 size-28 rounded-full bg-gold/15 blur-2xl transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100" aria-hidden />
              <span className="relative text-xs text-white/50">
                <span className="text-gold-200">/</span> {it.tag}
              </span>
              <div dir="ltr" className="text-gradient-gold relative mt-3 text-4xl font-bold tracking-tight md:text-5xl rtl:text-end">
                <StatValue value={it.value} />
              </div>
              <p className="relative mt-3 flex-1 text-sm leading-relaxed text-white/60">{it.text}</p>
              <span className="relative mt-6 block h-1 overflow-hidden rounded-full bg-white/10">
                <motion.span className="block h-full rounded-full bg-gradient-to-r from-brand-300 to-gold" initial={{ width: 0 }} whileInView={{ width: `${it.fill}%` }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE, delay: 0.3 }} />
              </span>
            </motion.article>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

export function DlHero() {
  const t = useTranslations('dynamicLeveragePage.hero');
  const tb = useTranslations('dynamicLeveragePage.breadcrumb');
  const links = t.raw('links');

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />

        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="size-1.5 rounded-full bg-gold" />
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap justify-center gap-2.5 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } } }}>
              {links.map((l) => {
                const cls = 'group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-gold/50 hover:bg-white hover:text-brand-900';
                const inner = (
                  <>
                    {l.label}
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </>
                );
                return (
                  <motion.span key={l.label} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                    {l.href ? (
                      <NavLink href={l.href} className={cls}>
                        {inner}
                      </NavLink>
                    ) : (
                      <a href="#schedule" onClick={() => selectScheduleTab(l.tab)} className={cls}>
                        {inner}
                      </a>
                    )}
                  </motion.span>
                );
              })}
            </motion.div>
          </div>
          <MarginSheet />
        </div>

        <Glance />
      </div>
    </section>
  );
}
