'use client';
/**
 * Body sections shared by the GTC Go pages (main, Android, iPhone & iPad).
 * Every section reads from `ns` (default 'gtcGoApp'), so the device pages reuse the same body.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Check, Globe } from 'lucide-react';

import BandLine from '@/components/shared/BandLine';
import GtcGoPhone from '@/components/shared/GtcGoPhone';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import { useTicker, FlashPrice, Sparkline, pct } from '@/components/shared/ticker';
import { Reveal, Stagger, StaggerItem, TiltCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { AppleIcon, LinuxIcon, WindowsIcon } from '../../common-metatrader/components/brandIcons';
import StoreButtons from './StoreButtons';
import { AppTile, ChartChip, DeviceCluster, ExecutionChip, HomeScreenPhone, PILLAR_SCREENS } from './goVisuals';
import { GO_LINKS } from './links';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/* ------------------------------------------------------------ one app, every asset class */

/** One instrument per asset class, each from its live ticker group. */
function useAssetTiles() {
  const metals = useTicker(0, 1500);
  const energy = useTicker(1, 1700);
  const fx = useTicker(7, 1300);
  const indices = useTicker(4, 1900);
  return [metals[0], fx[0], energy[0], indices[0], metals[1], fx[1]];
}

/** 2×3 grid of live asset tiles: flashing price, change and a sparkline. */
function AssetTiles() {
  const tiles = useAssetTiles();
  return (
    <div dir="ltr" aria-hidden>
      <Stagger className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" stagger={0.07}>
        {tiles.map((r) => {
          const up = r.change >= 0;
          return (
            <StaggerItem key={r.s}>
              <motion.div whileHover={{ y: -4 }} className="relative overflow-hidden rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10 backdrop-blur transition-colors duration-500 hover:bg-white/[0.12] hover:ring-gold/40">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-white">{r.s}</span>
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-semibold', up ? 'bg-up/20 text-green-300' : 'bg-down/20 text-red-300')}>
                                        {pct(r.change)}
                  </span>
                </div>
                <div className="text-[9px] text-white/45">{r.n}</div>
                <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="mt-1.5 block text-sm font-bold text-white" />
                <Sparkline data={r.hist} up={up} width={120} height={22} className="mt-1 w-full" />
              </motion.div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}

/** Order-filled toast that drops onto the home screen every few seconds. */
function PushToast() {
  const t = useTranslations('app');
  const [show, setShow] = useState(false);
  useEffect(() => {
    const first = setTimeout(() => setShow(true), 1400);
    const id = setInterval(() => setShow((v) => !v), 3800);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          dir="ltr"
          initial={{ y: -40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -30, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="flex w-[270px] items-center gap-3 rounded-2xl bg-white/90 p-3 text-ink shadow-2xl shadow-black/30 ring-1 ring-white backdrop-blur-xl"
          aria-hidden
        >
          <AppTile className="size-10 rounded-xl text-sm" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center justify-between text-[10px] text-ink/45">
              GTCFX <span>now</span>
            </span>
            <span className="block text-[13px] font-bold">{t('filled')}</span>
            <span className="block truncate text-[11px] text-ink/60">{t('filledSub')}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Bento: navy copy card with live asset tiles (start) + a "stage" card where the iPhone home screen
 * rises in, with pulsing rings and a push notification (end).
 */
export function AssetClass({ ns = 'gtcGoApp' }) {
  const t = useTranslations(`${ns}.assets`);
  const stage = useRef(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end start'] });
  const phoneY = useSpring(useTransform(scrollYProgress, [0, 1], [90, -40]), { stiffness: 80, damping: 20 });

  return (
    <section id="assets" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-5 lg:grid-cols-[1.08fr_1fr] lg:gap-6">
        {/* navy copy card */}
        <Reveal className="h-full" x={-30} y={0}>
          <article className="is-dark group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-brand-950 p-7 text-white shadow-2xl shadow-brand/25 md:p-10 lg:min-h-[600px]">
            <div className="bg-grid-dark mask-radial absolute inset-0 opacity-50" aria-hidden />
            <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-violet-500/30 blur-[110px]" animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.12, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} aria-hidden />
            <span className="absolute -bottom-24 -start-24 size-80 rounded-full bg-gold/15 blur-[100px]" aria-hidden />

            <div className="relative flex items-center justify-between">
              <img src="/images/preview-logo-white.png" alt="GTC" className="h-8 w-auto md:h-9" />
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-up" />
                </span>
                LIVE
              </span>
            </div>

            <div className="relative mt-10 max-w-lg">
              <h2 className="heading-section">{t('title')}</h2>
              <p className="mt-5 text-pretty text-[15px] leading-relaxed text-white/75 md:text-base">{t('text')}</p>
            </div>

            <div className="relative mt-8">
              <AssetTiles />
            </div>

            <div className="relative mt-8 flex items-center gap-4 border-t border-white/10 pt-6 lg:mt-auto">
              <StoreButtons compact />
              <span className="hidden h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent sm:block rtl:bg-gradient-to-l" aria-hidden />
            </div>
          </article>
        </Reveal>

        {/* home-screen stage */}
        <Reveal className="h-full" x={30} y={0} delay={0.1}>
          <div ref={stage} className="relative h-[520px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-700 to-brand-950 md:h-[600px] lg:h-full lg:min-h-[600px]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_2px,transparent_2px_44px)] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
            <div className="absolute left-1/2 top-[58%] size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/25 blur-[100px]" aria-hidden />
            {[0, 1, 2].map((k) => (
              <motion.span key={k} className="absolute left-1/2 top-[58%] size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" animate={{ scale: [0.7, 1.7], opacity: [0.7, 0] }} transition={{ duration: 5, delay: k * 1.66, repeat: Infinity, ease: 'easeOut' }} aria-hidden />
            ))}

            {/* phone rises in, then drifts with scroll */}
            <motion.div className="absolute left-1/2 top-20 -translate-x-1/2 md:top-24" style={{ y: phoneY }}>
              <motion.div initial={{ y: 160, rotate: 0, opacity: 0 }} whileInView={{ y: 0, rotate: -10, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.2, ease: EASE }}>
                <HomeScreenPhone className="w-[290px] md:w-[340px]" />
              </motion.div>
            </motion.div>

            {/* push notification */}
            <div className="absolute inset-x-0 top-6 flex justify-center md:top-8">
              <PushToast />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-950/70 to-transparent" aria-hidden />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ workstation */

const PLATFORMS = [
  { key: 'windows', Icon: WindowsIcon, primary: true },
  { key: 'mac', Icon: AppleIcon },
  { key: 'linux', Icon: LinuxIcon },
  { key: 'web', Icon: (p) => <Globe {...p} strokeWidth={1.8} /> }
];

export function Workstation({ ns = 'gtcGoApp' }) {
  const t = useTranslations(`${ns}.workstation`);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  const tabletX = useTransform(p, [0, 1], ['18%', '0%']);
  const laptopX = useTransform(p, [0, 1], ['-18%', '0%']);
  const phonesY = useTransform(p, [0, 1], ['0%', '0%']);
  const glow = useTransform(p, [0, 1], [0.2, 1]);

  return (
    <section id="workstation" className="relative overflow-x-hidden bg-white pb-14 md:pb-24">
      <div className="absolute -start-40 top-40 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative overflow-visible">
        <Reveal className="mx-auto max-w-5xl text-center">
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-ink/80">{t('lead')}</p>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-ink/60 md:text-lg">{t('text')}</p>
          <LiveAccountButton variant="primary" className="mt-9">
            {t('cta')}
          </LiveAccountButton>
        </Reveal>

        <div ref={ref} className="relative mt-14 overflow-visible md:mt-20">
          <motion.div className="absolute inset-x-[15%] top-[20%] h-1/2 rounded-full bg-gradient-to-r from-brand/20 via-gold/20 to-brand/20 blur-3xl" style={{ opacity: glow }} aria-hidden />
          <DeviceCluster tabletX={tabletX} laptopX={laptopX} phonesY={phonesY} />
        </div>

        <Reveal className="mt-12 text-center md:mt-16">
          <p className="mx-auto max-w-3xl text-pretty text-base text-ink/60 md:text-lg">{t('note')}</p>
        </Reveal>
        <Stagger className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4" stagger={0.08}>
          {PLATFORMS.map(({ key, Icon, primary }) => (
            <StaggerItem key={key}>
              <a href={GO_LINKS[key]} target="_blank" rel="noopener noreferrer" className={cn('group relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl border text-base font-semibold transition-all duration-300 hover:-translate-y-0.5', primary ? 'border-brand bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-700' : 'border-brand/25 bg-white text-ink hover:border-brand hover:bg-brand hover:text-white hover:shadow-lg hover:shadow-brand/20')}>
                {primary && <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ left: ['-50%', '150%'] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4 }} aria-hidden />}
                <Icon className="relative size-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative">{t(`platforms.${key}`)}</span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ pillars */

/**
 * Showcase columns: `s<n>` = app screen n, `p<n>` = pillar text n (from `pillars.items`).
 * Columns alternate direction, speed and vertical offset so the wall never lines up.
 */
const SHOWCASE_COLUMNS = [
  { dir: 'up', duration: 38, offset: 0, items: ['s0', 'p0', 's1', 'p1', 's2', 'p2'] },
  { dir: 'down', duration: 44, offset: -56, items: ['p1', 's1', 'p2', 's2', 'p3', 's3'] },
  { dir: 'up', duration: 50, offset: -28, items: ['s2', 'p2', 's3', 'p3', 's4', 'p4'] },
  { dir: 'down', duration: 46, offset: -72, items: ['p3', 's3', 'p4', 's4', 'p0', 's0'] },
  { dir: 'up', duration: 42, offset: -40, items: ['s4', 'p4', 's0', 'p0', 's1', 'p2'] }
];

function PromoCard({ item, index, as: Tag = 'h3' }) {
  return (
    <article className="group/promo relative overflow-hidden rounded-2xl bg-white p-5 text-start ring-1 ring-brand/10 transition-shadow duration-500 hover:shadow-xl hover:shadow-brand/10">
      <span className="absolute -end-8 -top-8 size-20 rounded-full bg-gold/15 blur-2xl transition-opacity duration-500 md:opacity-0 md:group-hover/promo:opacity-100" aria-hidden />
      <span className="relative text-xs font-bold tabular-nums text-gold-700">0{index + 1}</span>
      <Tag className="relative mt-1 text-[17px] font-semibold leading-snug text-ink">{item.title}</Tag>
      <p className="relative mt-2.5 text-pretty text-sm leading-relaxed text-ink/60">{item.text}</p>
      <span className="relative mt-4 block h-px w-10 bg-gradient-to-r from-brand to-transparent transition-all duration-700 group-hover/promo:w-20 rtl:bg-gradient-to-l" aria-hidden />
    </article>
  );
}

function ShowcaseColumn({ column, pillars }) {
  const render = (token, k, dup) => {
    const n = Number(token.slice(1));
    if (token[0] === 'p') return <PromoCard key={`${token}-${k}`} item={pillars[n]} index={n} as={dup ? 'p' : 'h3'} />;
    const Screen = PILLAR_SCREENS[n % PILLAR_SCREENS.length];
    return (
      <div key={`${token}-${k}`} className="transition-transform duration-500 hover:-translate-y-1">
        <Screen />
      </div>
    );
  };

  return (
    <div className="vmarquee relative h-[440px] overflow-hidden sm:h-[540px] md:h-[620px] md:[margin-top:var(--vm-offset)] lg:h-[700px]" style={{ '--vm-duration': `${column.duration}s`, '--vm-offset': `${column.offset}px` }}>
      <div className={cn('vmarquee-track flex flex-col', column.dir === 'down' && 'vmarquee-track--down')}>
        <div className="flex flex-col gap-4 pb-4">{column.items.map((tok, k) => render(tok, k, false))}</div>
        <div className="flex flex-col gap-4 pb-4" aria-hidden>
          {column.items.map((tok, k) => render(tok, k, true))}
        </div>
      </div>
    </div>
  );
}

/**
 * "Built for serious traders": a wall of five scrolling columns (alternating up/down, different speeds
 * and offsets) mixing live app screens with the pillar cards. Hover a column to pause it.
 */
export function Pillars({ ns = 'gtcGoApp' }) {
  const t = useTranslations(`${ns}.pillars`);
  const items = t.raw('items');

  return (
    <section id="pillars" className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Reveal className="relative mt-10 md:mt-14" y={40}>
          {/* top / bottom fades */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[#f6f7fb] via-[#f6f7fb]/90 to-transparent md:h-32" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#f6f7fb] via-[#f6f7fb]/90 to-transparent md:h-32" aria-hidden />

          {/* mobile 2 · sm 3 · md+ 5 columns */}
          <div className="grid grid-cols-2 gap-3 overflow-hidden sm:grid-cols-3 md:grid-cols-5 md:gap-4 [&>*]:min-w-0">
            {SHOWCASE_COLUMNS.map((col, i) => (
              <div key={i} className={cn(i >= 3 ? 'hidden md:block' : i >= 2 && 'hidden sm:block')}>
                <ShowcaseColumn column={col} pillars={items} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ get the app */

/** Full-width navy closing band (same treatment as the other pages' last section). */
export function GetTheApp({ ns = 'gtcGoApp' }) {
  const t = useTranslations(`${ns}.getApp`);
  const th = useTranslations(`${ns}.hero`);
  const points = t.raw('points');

  return (
    <section id="get-the-app" className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <span className="absolute -bottom-32 -start-32 size-[420px] rounded-full bg-brand-500/30 blur-[120px]" aria-hidden />
      <BandLine />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{t('text')}</p>

          <Stagger as="ul" className="mt-8 grid gap-2.5 sm:grid-cols-2" stagger={0.08}>
            {points.map((p, i) => (
              <StaggerItem as="li" key={p} className={cn('group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-[15px] text-white backdrop-blur transition-colors duration-500 hover:border-gold/40 hover:bg-white/[0.09]', i === points.length - 1 && points.length % 2 === 1 && 'sm:col-span-2')}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-white shadow-md shadow-gold/30 transition-transform duration-500 group-hover:scale-110">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {p}
              </StaggerItem>
            ))}
          </Stagger>

          <StoreButtons tone="white" className="mt-10" delay={0.2} />
        </Reveal>

        {/* phone stage */}
        <div className="relative mx-auto flex w-full max-w-[440px] justify-center py-6">
          <div className="absolute inset-0 m-auto size-[360px] rounded-full bg-brand-500/40 blur-3xl" aria-hidden />
          {[300, 420, 540].map((s, k) => (
            <motion.span key={s} className="absolute left-1/2 top-1/2 hidden rounded-full border border-white/10 sm:block" style={{ width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2 }} animate={{ rotate: k % 2 ? -360 : 360 }} transition={{ duration: 36 + k * 14, repeat: Infinity, ease: 'linear' }} aria-hidden>
              <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-gold-200 shadow-[0_0_12px_rgba(210,166,122,0.9)]" />
            </motion.span>
          ))}

          <motion.div className="absolute -end-2 top-4 hidden sm:block lg:-end-10" initial={{ opacity: 0, x: 40, rotate: 8 }} whileInView={{ opacity: 1, x: 0, rotate: 4 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <ChartChip seed={27} className="w-48" />
            </motion.div>
          </motion.div>

          <TiltCard className="relative" max={8} glare={false}>
            <motion.div initial={{ opacity: 0, y: 60, rotate: 10 }} whileInView={{ opacity: 1, y: 0, rotate: -6 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}>
              <GtcGoPhone className="w-[240px] md:w-[270px]" />
            </motion.div>
          </TiltCard>

          <motion.div className="absolute -start-2 bottom-14 sm:-start-8" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <ExecutionChip label={th('execution')} value={th('executionValue')} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
