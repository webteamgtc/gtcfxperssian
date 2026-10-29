'use client';
/**
 * Animated "GTC Go" app advert inside a phone.
 * Loops through 4 screens: splash (GTCFX icon + splashTitle) → watchlist → trade (order filled) → portfolio.
 */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart3, Briefcase, Check, LineChart, User, Wifi, BatteryFull, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTicker, FlashPrice, Sparkline, UpDown, fmt, pct } from './ticker';
import { CandleChart, AreaChart } from './devices';
import { CountUp, EASE } from '../motion';
import { GTC_GO_APP_STORE_URL, GTC_GO_PLAY_STORE_URL } from '@/config/gtcGoStoreLinks';
import { logoSrc } from './Logo';

const STORE_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' };

const SCREENS = ['splash', 'watch', 'trade', 'portfolio'];
const TAB_FOR = { splash: 0, watch: 0, trade: 1, portfolio: 2 };

export default function GtcGoPhone({ className, dark = false, interval = 3600 }) {
  const t = useTranslations('app');
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % SCREENS.length), interval);
    return () => clearInterval(id);
  }, [interval]);
  const screen = SCREENS[i];
  const tabs = t.raw('tabs');
  const TabIcons = [BarChart3, LineChart, Briefcase, User];

  return (
    <div dir="ltr" className={cn('relative aspect-[9/19] w-[270px] rounded-[3rem] bg-[#0e1018] p-[9px] shadow-[0_50px_100px_-30px_rgba(41,59,147,0.55)] ring-1 ring-white/10', className)}>
      {/* side buttons */}
      <span className="absolute -start-[3px] top-28 h-12 w-[3px] rounded-s bg-[#2a2d38]" />
      <span className="absolute -end-[3px] top-24 h-16 w-[3px] rounded-e bg-[#2a2d38]" />
      <div className={cn('relative h-full overflow-hidden rounded-[2.5rem]', dark ? 'bg-[#0b0e1f] text-white' : 'bg-[#f6f7fb] text-ink')}>
        {/* status bar */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-3 text-[10px] font-semibold">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <Wifi className="size-3" />
            <BatteryFull className="size-3.5" />
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-0 pt-9"
          >
            {screen === 'splash' && <Splash t={t} />}
            {screen === 'watch' && <Watch dark={dark} />}
            {screen === 'trade' && <Trade t={t} dark={dark} />}
            {screen === 'portfolio' && <Portfolio t={t} dark={dark} />}
          </motion.div>
        </AnimatePresence>

        {/* tab bar */}
        {screen !== 'splash' && (
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            className={cn('absolute inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-2xl p-1.5 backdrop-blur', dark ? 'bg-white/10' : 'bg-white shadow-lg shadow-brand/10')}
          >
            {tabs.map((label, k) => {
              const Icon = TabIcons[k];
              const on = TAB_FOR[screen] === k;
              return (
                <div
                  key={label}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[8px] font-semibold',
                    on && 'bg-brand-600 shadow-sm shadow-brand/25'
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="gtcgo-tab"
                      className="absolute inset-0 z-0 rounded-xl bg-brand-600"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('relative z-[1] size-3.5', on ? 'text-gold' : 'text-ink/45')} strokeWidth={on ? 2.25 : 2} />
                  <span className={cn('relative z-[1]', on ? 'text-white' : 'text-ink/45')}>{label}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Splash({ t }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-brand via-brand-700 to-brand-950 px-6 text-center text-white">
      <div className="bg-grid-dark absolute inset-0 opacity-50" />
      {[0, 1, 2].map((k) => (
        <motion.span
          key={k}
          className="absolute size-40 rounded-full border border-gold/40"
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 2.4, delay: k * 0.6, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} className="relative">
        <Image src="/GTCFX-ICON.svg" alt="" width={80} height={80} unoptimized className="mx-auto size-20 object-contain" />
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }} className="relative mt-5 max-w-[220px] text-[13px] font-bold leading-snug tracking-tight">
        {t('splashTitle')}
      </motion.p>
      <div className="relative mt-8 h-1 w-24 overflow-hidden rounded-full bg-white/20">
        <motion.div className="h-full bg-gold" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3 }} />
      </div>
    </div>
  );
}

function PhoneLogoHeader({ trailing }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Image src={logoSrc(false)} alt="GTCFX" width={174} height={62} className="h-7 w-auto max-w-[130px] shrink-0 object-contain object-left" />
      {trailing}
    </div>
  );
}

function Watch({ dark }) {
  const rows = [...useTicker(0, 900), ...useTicker(2, 1000)].slice(0, 6);
  return (
    <div className="px-4">
      <PhoneLogoHeader trailing={<span className="rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-bold text-gold">LIVE</span>} />
      <div className="mt-3 space-y-1.5">
        {rows.map((r, k) => (
          <motion.div
            key={r.s}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + k * 0.07 }}
            className={cn('flex items-center justify-between rounded-xl px-2.5 py-2', dark ? 'bg-white/5' : 'bg-white shadow-sm')}
          >
            <div>
              <div className="text-[11px] font-bold">{r.s}</div>
              <div className="text-[8px] opacity-50">{r.n}</div>
            </div>
            <Sparkline data={r.hist} up={r.dir > 0} width={46} height={18} />
            <div className="text-end text-[11px] font-bold">
              <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} />
              <div className={cn('text-[8px]', r.change >= 0 ? 'text-up' : 'text-down')}>{pct(r.change)}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Trade({ t, dark }) {
  const [r] = useTicker(0, 800);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setFilled(true), 1500);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="relative h-full px-4">
      <div className="text-[9px] font-semibold opacity-50">Gold · XAUUSD</div>
      <div className="flex items-center gap-1.5 text-lg font-bold">
        <FlashPrice value={r.bid} decimals={2} dir={r.dir} tick={r.tick} /> <UpDown dir={r.dir} />
      </div>
      <div className={cn('mt-2 h-36 rounded-2xl p-1', dark ? 'bg-white/5' : 'bg-white shadow-sm')}>
        <CandleChart n={26} seed={17} dark={dark} trigger="mount" className="h-full" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[9px] font-semibold">
        {['0.01', '0.10', '1.00'].map((l, k) => (
          <span key={l} className={cn('rounded-lg py-1.5', k === 1 ? 'bg-brand text-white' : dark ? 'bg-white/5' : 'bg-white')}>{l}</span>
        ))}
      </div>
      <div className="relative mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-down py-2.5 text-center text-[10px] font-bold text-white">
          {t('sell')} <span className="block text-[9px] opacity-80">{fmt(r.bid, 2)}</span>
        </div>
        <motion.div animate={filled ? { scale: [1, 0.92, 1] } : {}} transition={{ duration: 0.3 }} className="relative overflow-hidden rounded-xl bg-up py-2.5 text-center text-[10px] font-bold text-white">
          {t('buy')} <span className="block text-[9px] opacity-80">{fmt(r.ask, 2)}</span>
          {filled && <motion.span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 8, opacity: 0 }} transition={{ duration: 0.6 }} />}
        </motion.div>
        {/* tapping finger */}
        {!filled && (
          <motion.span className="absolute end-8 top-1 size-7 rounded-full border-2 border-white bg-white/40 shadow-lg" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} />
        )}
      </div>
      <AnimatePresence>
        {filled && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} className="absolute inset-x-3 top-0 z-10 flex items-center gap-2 rounded-2xl bg-ink/90 p-2.5 text-white shadow-xl backdrop-blur">
            <span className="grid size-7 place-items-center rounded-full bg-up">
              <Check className="size-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold">{t('filled')}</div>
              <div className="text-[9px] text-white/60">{t('filledSub')}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Portfolio({ t, dark }) {
  return (
    <div className="px-4">
      <PhoneLogoHeader />
      <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-900 p-4 text-white">
        <div className="text-[9px] text-white/60">{t('balance')}</div>
        <div className="text-xl font-bold">
          $<CountUp value={24860.5} duration={1.6} />
        </div>
        <div className="text-[9px] font-semibold text-green-300">+ $1,284.20 · {t('today')}</div>
        <div className="mt-2 h-12">
          <AreaChart seed={8} dark color="#d2a67a" className="h-full" />
        </div>
      </div>
      <div className={cn('mt-3 flex items-center gap-3 rounded-2xl p-3', dark ? 'bg-white/5' : 'bg-white shadow-sm')}>
        <span className="grid size-9 place-items-center rounded-xl bg-gold/15 text-gold">
          <Users className="size-4" />
        </span>
        <div className="flex-1">
          <div className="text-[11px] font-bold">{t('copy')}</div>
          <div className="text-[9px] opacity-50">{t('copySub')}</div>
        </div>
        <span className="text-[11px] font-bold text-up">+18.4%</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[62, 24, 14].map((v, k) => (
          <div key={k} className={cn('rounded-xl p-2', dark ? 'bg-white/5' : 'bg-white shadow-sm')}>
            <div className="h-1 overflow-hidden rounded-full bg-brand/10">
              <motion.div className={cn('h-full', k === 0 ? 'bg-brand' : k === 1 ? 'bg-gold' : 'bg-up')} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1, delay: 0.2 + k * 0.15 }} />
            </div>
            <div className="mt-1.5 text-[10px] font-bold">{v}%</div>
            <div className="text-[8px] opacity-50">{['FX', 'Metals', 'Indices'][k]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** App store badges (generic, not official artwork) */
export function StoreBadges({ dark = false, className }) {
  const t = useTranslations('app');
  const base = cn('inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-transform hover:-translate-y-0.5', dark ? 'bg-white text-ink' : 'bg-ink text-white');
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <a href={GTC_GO_APP_STORE_URL} {...STORE_LINK_PROPS} className={base}>
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.4-1-2.4-4.1ZM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4Z" /></svg>
        <span className="text-start leading-none">
          <span className="block text-[9px] opacity-70">{t('onAppStore')}</span>
          <span className="text-sm font-semibold">{t('appStore')}</span>
        </span>
      </a>
      <a href={GTC_GO_PLAY_STORE_URL} {...STORE_LINK_PROPS} className={base}>
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path d="M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1Z" fill="#34a853" /><path d="m16.7 8.7-3.3 3.3-9.8-9.7c.2-.1.5-.1.8 0l12.3 6.4Z" fill="#fbbc04" /><path d="m16.7 15.3-12.3 6.4c-.3.1-.6.1-.8 0l9.8-9.7 3.3 3.3Z" fill="#ea4335" /><path d="M20.3 12c0 .5-.3.9-.7 1.1l-2.9 2.2-3.3-3.3 3.3-3.3 2.9 2.2c.4.2.7.6.7 1.1Z" fill="#4285f4" /></svg>
        <span className="text-start leading-none">
          <span className="block text-[9px] opacity-70">{t('onPlay')}</span>
          <span className="text-sm font-semibold">{t('googlePlay')}</span>
        </span>
      </a>
    </div>
  );
}
