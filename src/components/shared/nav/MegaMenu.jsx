'use client';
/**
 * Desktop mega-menu panel. One floating card under the header; content cross-slides
 * when moving between top-level items and the card height animates to fit.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { MENU } from '@/config/menu';
import { cn } from '@/lib/utils';
import { useTicker, FlashPrice, Sparkline, pct } from '../ticker';
import { CandleChart, AreaChart } from '../devices';
import { EASE } from '../../motion';
import NavLink, { useIsActive } from './NavLink';
import DownloadsPromo from './DownloadsPromo';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function useHeight(ref) {
  const [h, setH] = useState('auto');
  useIsoLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setH(e.contentRect.height));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}

export default function MegaMenu({ group, direction, onNavigate, id, dark = false, floating = false }) {
  const innerRef = useRef(null);
  const height = useHeight(innerRef);
  const data = MENU.find((g) => g.id === group);

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.25, ease: EASE } }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn('beam-drop relative overflow-hidden border-t', dark ? 'border-white/10 bg-ink/95 text-white' : floating ? 'border-brand/10 text-ink' : 'border-brand/10 bg-white text-ink')}
    >
      <motion.div animate={{ height }} transition={{ duration: 0.35, ease: EASE }} className="relative">
        <div ref={innerRef}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={group}
              custom={direction}
              variants={{
                enter: (d) => ({ opacity: 0, x: d * 36 }),
                center: { opacity: 1, x: 0 },
                exit: (d) => ({ opacity: 0, x: d * -36 })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: EASE }}
            >
              {data && <PanelBody data={data} onNavigate={onNavigate} dark={dark} floating={floating} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PanelBody({ data, onNavigate, dark, floating }) {
  const cols = data.columns.length;
  return (
    <div className={cn('grid grid-cols-12 gap-6 py-5', floating ? 'px-5' : 'container-x')}>
      <motion.div
        className={cn('col-span-9 grid gap-x-4 gap-y-4', cols >= 3 ? 'grid-cols-3' : 'grid-cols-2')}
        initial="h"
        animate="s"
        variants={{ h: {}, s: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } }}
      >
        {data.columns.map((col, ci) => (
          <div key={ci} className="min-w-0 space-y-4">
            {col.map((sec) => (
              <Section key={sec.id} sec={sec} onNavigate={onNavigate} dark={dark} />
            ))}
          </div>
        ))}
      </motion.div>
      <div className="col-span-3">
        <Promo promo={data.promo} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

const item = { h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } };

function Section({ sec, onNavigate, dark }) {
  const t = useTranslations('menu');
  return (
    <motion.div variants={item} className="min-w-0">
      <h3 className={cn('heading-label px-2.5 !text-[11px]', dark && 'is-dark')}>{t(`sections.${sec.id}`)}</h3>
      {sec.live !== undefined ? (
        <LiveList sec={sec} onNavigate={onNavigate} dark={dark} />
      ) : (
        <ul className="mt-1.5">
          {sec.items.map((it) => (
            <li key={it.id}>
              <MenuItem it={it} onNavigate={onNavigate} dark={dark} />
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function MenuItem({ it, onNavigate, dark }) {
  const t = useTranslations('menu');
  const isActive = useIsActive();
  const on = isActive(it.href);
  const Icon = it.icon ?? ArrowUpRight;
  return (
    <NavLink
      href={it.href}
      onClick={onNavigate}
      aria-current={on ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold',
        dark ? (on ? 'bg-white/[0.07]' : 'hover:bg-white/5') : on ? 'bg-brand-50' : 'hover:bg-brand-50'
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110',
          dark ? 'bg-white/5 text-gold group-hover:bg-gold group-hover:text-ink' : 'bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white',
          on && (dark ? 'bg-gold text-ink' : 'bg-brand text-white')
        )}
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className={cn('block truncate text-sm font-semibold leading-snug', dark ? 'text-white' : 'text-brand-900')}>{t(`links.${it.id}`)}</span>
        {t.has(`desc.${it.id}`) && <span className={cn('block truncate text-xs leading-snug', dark ? 'text-white/55' : 'text-brand-900/60')}>{t(`desc.${it.id}`)}</span>}
      </span>
    </NavLink>
  );
}

function LiveList({ sec, onNavigate, dark }) {
  const t = useTranslations('menu');
  const rows = useTicker(sec.live, 1300);
  return (
    <ul className="mt-1.5">
      {sec.items.map((it) => {
        const r = rows.find((x) => x.s === it.id) ?? rows[0];
        if (!r) return null;
        const up = r.change >= 0;
        return (
          <li key={it.id}>
            <NavLink
              href={it.href}
              onClick={onNavigate}
              className={cn('group grid grid-cols-[1fr_auto] items-center gap-x-3 rounded-xl px-2.5 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold', dark ? 'hover:bg-white/5' : 'hover:bg-brand-50')}
            >
              <span className="min-w-0">
                <span className={cn('block truncate text-sm font-semibold', dark ? 'text-white' : 'text-brand-900')}>{t(`links.${it.id}`)}</span>
                <span className={cn('flex items-center gap-1.5 text-xs tabular-nums', dark ? 'text-white/55' : 'text-brand-900/55')}>
                  <span dir="ltr">
                    <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} />
                  </span>
                  <span className={cn('font-semibold', up ? 'text-up' : 'text-down')} dir="ltr">
                    {pct(r.change)}
                  </span>
                </span>
              </span>
              <Sparkline data={r.hist} up={r.dir > 0} width={48} height={18} />
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------ promo card */
function Promo({ promo, onNavigate }) {
  const t = useTranslations('menu');
  const p = `promos.${promo.id}`;
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-950 p-4 text-white">
      <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
      <motion.div className="absolute -end-10 -top-10 size-32 rounded-full bg-gold/30 blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-25" aria-hidden>
        <CandleChart n={34} seed={promo.id.length * 7} dark trigger="mount" showLine={false} className="h-full" />
      </div>

      <motion.div className="relative" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4, ease: EASE }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-200">{t('eyebrow')}</p>
        <h3 className="heading-card is-dark mt-2 !text-base">{t(`${p}.title`)}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/75">{t(`${p}.text`)}</p>
      </motion.div>

      <motion.div className="relative mt-3 flex-1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45, ease: EASE }}>
        {promo.visual === 'accounts' && <AccountsVisual />}
        {promo.visual === 'downloads' && <DownloadsPromo onNavigate={onNavigate} />}
        {promo.visual === 'chart' && <ChartVisual />}
        {promo.visual === 'insight' && <InsightVisual />}
        {promo.visual === 'currencies' && <CurrencyVisual />}
      </motion.div>

      {promo.href && (
        <NavLink
          href={promo.href}
          onClick={onNavigate}
          className="group relative mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-900 transition hover:bg-gold hover:text-white"
        >
          {t(`${p}.cta`)}
          <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
        </NavLink>
      )}
    </div>
  );
}

function AccountsVisual() {
  const t = useTranslations('menu.accountsVisual');
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {[
        ['standard', '1.0', 'pips'],
        ['ecn', '0.0', 'pips']
      ].map(([k, v, u], i) => (
        <motion.div key={k} whileHover={{ y: -3 }} className={cn('rounded-xl p-2.5 ring-1 backdrop-blur', i ? 'bg-white/10 ring-white/15' : 'bg-white text-brand ring-white')}>
          <div className={cn('text-[11px] font-semibold uppercase tracking-wider', i ? 'text-white/60' : 'text-brand/60')}>{t(k)}</div>
          <div className="mt-1 text-[11px] opacity-60">{t('from')}</div>
          <div dir="ltr" className="flex items-baseline gap-1 rtl:justify-end">
            <span className="text-xl font-bold">{v}</span>
            <span className={cn('text-xs font-semibold', i ? 'text-gold-200' : 'text-gold-600')}>{u}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ChartVisual() {
  const t = useTranslations('menu');
  const [r] = useTicker(7, 1200);
  return (
    <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">EURUSD</span>
        <span className="inline-flex items-center gap-1.5 text-white/60">
          <span className="size-1.5 animate-pulse rounded-full bg-green-400" /> {t('live')}
        </span>
      </div>
      <div dir="ltr" className="mt-1 text-xl font-bold">
        <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} />
      </div>
      <div className="mt-1.5 h-10">
        <AreaChart seed={5} dark color="#d2a67a" className="h-full" />
      </div>
    </div>
  );
}

function InsightVisual() {
  const items = [62, 38, 81];
  return (
    <div className="space-y-2">
      {['FX', 'Metals', 'Indices'].map((k, i) => (
        <div key={k} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 text-xs ring-1 ring-white/10">
          <span className="w-12 font-semibold">{k}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
            <motion.span className="block h-full rounded-full bg-gradient-to-r from-gold-200 to-gold" initial={{ width: 0 }} animate={{ width: `${items[i]}%` }} transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: EASE }} />
          </span>
          <span className="w-8 text-end tabular-nums text-white/70">{items[i]}%</span>
        </div>
      ))}
    </div>
  );
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD', 'HKD', 'CNY', 'INR', 'THB', 'MYR', 'IDR', 'VND', 'PHP', 'TRY'];
function CurrencyVisual() {
  const t = useTranslations('menu');
  return (
    <div className="relative">
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold leading-none tracking-tight text-gold-200">29</span>
        <span className="pb-1 text-xs text-white/60">{t('currencies')}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1" dir="ltr">
        {CURRENCIES.map((c, i) => (
          <motion.span key={c} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.025 }} className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold ring-1 ring-white/10">
            {c}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
