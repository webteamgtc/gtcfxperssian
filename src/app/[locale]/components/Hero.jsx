'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useLiveRows, TICKER_GROUPS, TAB_GROUPS, FlashPrice, Sparkline, UpDown, fmt, pct } from '@/components/shared/ticker';
import { useSymbolGroups } from '@/lib/hooks/useSymbolGroups';
import { useKlineCandles } from '@/lib/hooks/useKlineCandles';
import { CandleChart } from '@/components/shared/devices';
import { HeroIn, WordReveal, Magnetic, Marquee, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import NavLink from '@/components/shared/nav/NavLink';
import { PORTAL } from '@/config/menu';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

function Meteors({ count = 14 }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(Array.from({ length: count }, () => ({ left: Math.random() * 100, delay: Math.random() * 8, dur: 4 + Math.random() * 6 })));
  }, [count]);
  return (
    <div dir="ltr" className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((m, i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-px w-24 rotate-[215deg] bg-gradient-to-r from-gold to-transparent"
          style={{ left: `${m.left}%` }}
          initial={{ x: 0, y: -50, opacity: 0 }}
          animate={{ x: -500, y: 500, opacity: [0, 1, 0] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const t = useTranslations('hero');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rotateX = useTransform(scrollYProgress, [0, 0.45], [28, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.88, 1]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 md:pt-40">
      <div className="bg-grid-dark mask-radial absolute inset-0" />
      <motion.div style={{ y: glowY }} className="absolute inset-x-0 top-0 h-[700px]">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand/50 blur-[140px]" />
        <motion.div
          className="absolute start-[60%] top-20 size-[380px] rounded-full bg-gold/25 blur-[120px]"
          animate={{ x: [0, -120, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </motion.div>
      <Meteors />

      {/* orbit rings */}
      <div dir="ltr" className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2">
        {[520, 760, 1000].map((s, i) => (
          <div key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" style={{ width: s, height: s }}>
            <motion.div className="absolute inset-0" animate={{ rotate: i % 2 ? -360 : 360 }} transition={{ duration: 40 + i * 20, repeat: Infinity, ease: 'linear' }}>
              <span className="absolute -top-1 start-1/2 size-2 rounded-full bg-gold shadow-[0_0_20px_4px_rgba(182,135,86,0.7)]" />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="container-x relative text-center">
        <motion.span
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur"
        >
          <span className="size-1.5 rounded-full bg-gold" /> {t('badge')}
        </motion.span>

        <h1 className="heading-display is-dark mx-auto mt-8 max-w-5xl">
          <WordReveal text={t('titleA')} immediate delay={0.1} />
          <br />
          <WordReveal text={t('titleB')} immediate delay={0.3} wordClassName="heading-accent" />
        </h1>

        <HeroIn delay={0.55}>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/60">{t('subtitle')}</p>
        </HeroIn>

        <HeroIn delay={0.7} className="mt-10 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <LiveAccountButton look="button" size="lg" variant="gold">
              {t('ctaLive')}
            </LiveAccountButton>
          </Magnetic>
          <Magnetic>
            <Button size="lg" variant="outlineLight" as={NavLink} href={PORTAL.demo}>
              {t('ctaDemo')}
            </Button>
          </Magnetic>
        </HeroIn>

        {/* Terminal that flattens as you scroll */}
        <div className="relative mx-auto mt-16 max-w-6xl" style={{ perspective: 1400 }}>
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: EASE }}
            style={{ rotateX, scale, transformOrigin: 'top center' }}
          >
            <Terminal />
          </motion.div>
          <div className="absolute inset-x-10 -bottom-10 h-40 rounded-full bg-brand/40 blur-[90px]" />
        </div>
      </div>

      <div className="relative mt-20 border-y border-white/10 bg-white/[0.02] py-5">
        <TapeMarquee />
      </div>
    </section>
  );
}

// API category name → index in the translated `hero.tabs` array (same order as the symbols API).
const TYPE_LABEL_INDEX = { metals: 0, energy: 1, 'fx minors': 2, stock: 3, future: 4 };
const EMPTY_ROW = { s: '', label: '—', n: '', d: 2, bid: null, ask: null, dir: 1, change: null, hist: [], tick: 0 };

/** Tabs + symbols from the symbols API; falls back to the static TICKER_GROUPS if the API is unavailable. */
function useTerminalGroups(tabLabels) {
  const { groups, loading } = useSymbolGroups(4);
  return useMemo(() => {
    if (groups.length) {
      return {
        loading: false,
        groups: groups.map((g) => ({ ...g, label: tabLabels[TYPE_LABEL_INDEX[g.type.toLowerCase()]] ?? g.type }))
      };
    }
    if (loading) return { loading: true, groups: [] };
    return {
      loading: false,
      groups: TICKER_GROUPS.slice(0, TAB_GROUPS).map((items, i) => ({ key: `static-${i}`, type: tabLabels[i], label: tabLabels[i] ?? items[0].n, items }))
    };
  }, [groups, loading, tabLabels]);
}

const NO_ITEMS = [];

function Terminal() {
  const t = useTranslations('hero');
  const tabLabels = t.raw('tabs');
  const { groups, loading } = useTerminalGroups(tabLabels);
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState(0);
  const group = groups[tab] ?? groups[0];
  const rows = useLiveRows(group?.items ?? NO_ITEMS);
  const r = rows[sel] ?? rows[0] ?? EMPTY_ROW;
  const { candles, loading: chartLoading } = useKlineCandles(r.s, { date: 60, count: 48, livePrice: r.bid });
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#12152a] to-[#0b0d18] p-2 text-start shadow-[0_40px_120px_-20px_rgba(41,59,147,0.6)]">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <div className="no-scrollbar ms-4 flex gap-1 overflow-x-auto" role="tablist">
          {loading
            ? [64, 56, 72, 52].map((w, i) => <span key={i} className="h-7 shrink-0 animate-pulse rounded-lg bg-white/10" style={{ width: w }} />)
            : groups.map((g, i) => (
                <button
                  key={g.key}
                  role="tab"
                  aria-selected={tab === i}
                  onClick={() => {
                    setTab(i);
                    setSel(0);
                  }}
                  className={cn('relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium', tab === i ? 'text-ink' : 'text-white/50 hover:text-white')}
                >
                  {tab === i && <motion.span layoutId="d2-tab" className="absolute inset-0 rounded-lg bg-gold" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="relative">{g.label}</span>
                </button>
              ))}
        </div>
        <span className="ms-auto hidden items-center gap-2 text-xs text-white/50 sm:flex">
          <span className="size-2 animate-pulse rounded-full bg-up" /> {t('liveLabel')}
        </span>
      </div>
      <div className="grid gap-2 p-2 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="min-h-5 text-sm text-white/50">{r.n}</div>
              <div className="mt-1 flex items-center gap-2 text-2xl font-bold md:text-3xl">
                {r.label ?? r.s} <UpDown dir={r.dir} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <div className="text-white/40">{t('bid')}</div>
                <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-xl font-bold" />
              </div>
              <div>
                <div className="text-white/40">{t('ask')}</div>
                <FlashPrice value={r.ask} decimals={r.d} dir={r.dir} tick={r.tick} className="text-xl font-bold" />
              </div>
            </div>
          </div>
          <div className="mt-4 h-56 md:h-72">
            <AnimatePresence mode="wait">
              {candles.length ? (
                <motion.div key={r.s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <CandleChart data={candles} dark trigger="mount" className="h-full" />
                </motion.div>
              ) : (
                <motion.div
                  key="chart-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn('grid h-full place-items-center rounded-xl bg-white/[0.02] text-xs text-white/30', (loading || chartLoading) && 'animate-pulse')}
                >
                  {!loading && !chartLoading && '—'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="shine rounded-xl bg-down/90 py-3 text-sm font-bold">SELL · {fmt(r.bid, r.d)}</button>
            <button className="shine rounded-xl bg-up/90 py-3 text-sm font-bold">BUY · {fmt(r.ask, r.d)}</button>
          </div>
        </div>
        <div className="space-y-2">
          {loading &&
            Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[74px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />)}
          {rows.map((x, i) => (
            <motion.button
              key={x.s}
              onClick={() => setSel(i)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.08 }}
              className={cn('flex w-full items-center justify-between rounded-2xl border p-4 text-start transition-all', sel === i ? 'border-gold/50 bg-gold/10' : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]')}
            >
              <div className="min-w-0">
                <div className="font-semibold">{x.label ?? x.s}</div>
                <div className="max-w-[9rem] truncate text-xs text-white/40" title={x.n}>{x.n}</div>
              </div>
              <Sparkline data={x.hist} up={x.dir > 0} width={70} height={26} />
              <div className="text-end">
                <FlashPrice value={x.bid} decimals={x.d} dir={x.dir} tick={x.tick} className="font-bold" />
                <div className={cn('text-xs', x.change >= 0 ? 'text-up' : 'text-down')}>{pct(x.change)}</div>
              </div>
            </motion.button>
          ))}
          <p className="px-2 pt-1 text-[11px] text-white/30">{t('pricesNote')}</p>
        </div>
      </div>
    </div>
  );
}

const STATIC_TAPE = [...TICKER_GROUPS[0], ...TICKER_GROUPS[2], ...TICKER_GROUPS[4]];

/** Symbols of every API category (first `perType` each, de-duplicated); static list if the API is unavailable. */
function useTapeItems(perType = 6) {
  const { groups, loading } = useSymbolGroups(perType);
  return useMemo(() => {
    if (!groups.length) return { loading, items: loading ? NO_ITEMS : STATIC_TAPE };
    const seen = new Set();
    const items = groups.flatMap((g) => g.items).filter((x) => !seen.has(x.s) && seen.add(x.s));
    return { loading: false, items };
  }, [groups, loading]);
}

function TapeMarquee() {
  const { loading, items } = useTapeItems(6);
  const all = useLiveRows(items, 2000);

  if (loading) {
    return (
      <div className="mask-fade-x flex justify-center gap-12 overflow-hidden" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="h-5 w-40 shrink-0 animate-pulse rounded bg-white/10" />
        ))}
      </div>
    );
  }

  return (
    <Marquee duration={Math.max(45, all.length * 3)} gap="3rem" className="mask-fade-x">
      {all.map((r) => (
        <span key={r.s} className="flex items-center gap-3 whitespace-nowrap text-sm">
          <span className="font-semibold text-white/80">{r.label ?? r.s}</span>
          <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-white" />
          <span className={cn('flex items-center text-xs', r.dir > 0 ? 'text-up' : 'text-down')}>
            <UpDown dir={r.dir} /> {pct(r.change, true)}
          </span>
        </span>
      ))}
    </Marquee>
  );
}
