'use client';
import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Landmark, LockKeyhole, MessageSquare, Zap } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useTicker, fmt, pct } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const TRUST_ICONS = [Landmark, LockKeyhole, Zap, MessageSquare];

/** Live EUR/USD card: ticking price, area chart from the tick history, bid/ask/volume and floating stat chips. */
function LiveQuoteCard() {
  const t = useTranslations('openLiveAccountPage.hero.card');
  const gid = useId().replace(/:/g, '');
  const rows = useTicker(7, 1300);
  const row = rows.find((r) => r.s === 'EURUSD') ?? rows[0];
  const up = row.change >= 0;
  const price = fmt(row.bid, row.d);
  const main = price.slice(0, -2);
  const tail = price.slice(-2);

  const W = 320;
  const H = 120;
  const data = row.hist.length > 1 ? row.hist : [0, 0]; // flat line until live ticks arrive
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - ((v - min) / (max - min || 1)) * (H - 12) - 6]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[460px] [perspective:1400px]" aria-hidden>
      <motion.div initial={{ rotateY: -18, rotateX: 8, opacity: 0, y: 30 }} animate={{ rotateY: -8, rotateX: 4, opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }} className="relative">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative overflow-hidden rounded-[1.75rem] bg-white p-5 text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.7)] ring-1 ring-white/20 md:p-6">
          <div className="bg-grid-light absolute inset-0 opacity-50" />
          <div className="relative flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="size-2 rounded-full bg-[#ff5f57]" />
              <span className="size-2 rounded-full bg-[#febc2e]" />
              <span className="size-2 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-sm font-semibold text-brand">
              {t('pair')} <span className="text-ink/40">·</span> {t('timeframe')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] text-ink/45">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-up" />
              </span>
              {t('live')}
            </span>
          </div>

          <div className="relative mt-5 flex items-end justify-between gap-3">
            <div className="text-4xl font-bold tracking-tight tabular-nums md:text-5xl">
              <motion.span key={row.tick} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
                {main}
              </motion.span>
              <span className="ms-1 text-xl font-semibold text-ink/40 md:text-2xl">{tail}</span>
            </div>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', up ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>
              {up ? '+' : '−'}
              {pct(row.change, true)}
            </span>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="relative mt-4 h-28 w-full overflow-visible md:h-32" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`ola-a-${gid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#293b93" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#293b93" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#ola-a-${gid})`} />
            <path d={line} fill="none" stroke="#293b93" strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <circle cx={last[0]} cy={last[1]} r="4" fill="#8390d4" stroke="white" strokeWidth="2" />
          </svg>

          <div className="relative mt-4 grid grid-cols-3 gap-2.5">
            {[
              [t('bid'), fmt(row.bid, 4)],
              [t('ask'), fmt(row.ask, 4)],
              [t('volume'), t('volumeValue')]
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-[#f4f6fb] px-3 py-2.5 text-center ring-1 ring-brand/5">
                <div className="text-[10px] text-ink/45">{k}</div>
                <div className="mt-0.5 text-base font-bold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* floating chips */}
        {[
          { cls: '-start-4 -top-8 md:-start-10', label: t('spread'), value: t('spreadValue'), unit: t('pips'), d: 4.5, r: -6 },
          { cls: '-end-3 top-1/2 md:-end-8', label: t('traders'), value: t('tradersValue'), unit: '', d: 5, r: 3 },
          { cls: '-bottom-9 start-8', label: t('execution'), value: t('executionValue'), unit: t('msAvg'), d: 5.5, r: -2 }
        ].map((c, i) => (
          <motion.div
            key={c.label}
            className={cn('absolute z-10 rounded-2xl bg-white px-4 py-2.5 text-ink shadow-xl shadow-brand/20 ring-1 ring-brand/10', c.cls)}
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: c.r, y: [0, -7, 0] }}
            transition={{ opacity: { delay: 0.9 + i * 0.15 }, scale: { delay: 0.9 + i * 0.15, type: 'spring' }, y: { duration: c.d, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-ink/55">
              <span className="size-1.5 rounded-full bg-brand" />
              {c.label}
            </div>
            <div className="mt-0.5 text-lg font-bold">
              {c.value} {c.unit && <span className="text-xs font-medium text-ink/45">{c.unit}</span>}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function OlaHero() {
  const t = useTranslations('openLiveAccountPage.hero');
  const tb = useTranslations('openLiveAccountPage.breadcrumb');
  const pills = t.raw('pills');
  const trust = t.raw('trust');

  return (
    <section className="is-dark relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44">
      <HeroBackdrop />

      <div className="container-x relative">
        <Breadcrumb
          className="lg:justify-start"
          items={[
            { label: tb('home'), href: '/' },
            { label: tb('trading'), href: '/trading' },
            { label: tb('current') }
          ]}
        />

        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('badge')}
            </motion.span>

            <motion.h1 className="heading-page mt-6 max-w-2xl lg:max-w-none" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>

            <motion.ul className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}>
              {pills.map((p) => (
                <motion.li key={p.label} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                  {p.label} <bdi className="font-semibold text-gold-200">{p.value}</bdi>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-5 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
              <LiveAccountButton variant="gold">
                {t('ctaLive')}
              </LiveAccountButton>
              <NavLink href={PORTAL.demo} className="text-base font-semibold text-white/80 underline decoration-gold decoration-2 underline-offset-[6px] transition-colors hover:text-white">
                {t('ctaDemo')}
              </NavLink>
            </motion.div>

            <motion.ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 lg:justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {trust.map((label, i) => {
                const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
                return (
                  <li key={label} className="inline-flex items-center gap-2 text-sm font-medium text-white/75">
                    <Icon className="size-4 text-gold-200" strokeWidth={1.75} />
                    {label}
                  </li>
                );
              })}
            </motion.ul>
          </div>

          <div className="px-6 pb-8 pt-6 sm:px-10">
            <LiveQuoteCard />
          </div>
        </div>
      </div>
    </section>
  );
}
