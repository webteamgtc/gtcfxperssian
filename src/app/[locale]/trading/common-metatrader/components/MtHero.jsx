'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { CandleChart, PhoneMockup, TabletMockup } from '@/components/shared/devices';
import { useTicker, FlashPrice, pct, fmt } from '@/components/shared/ticker';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { MT_LINKS } from './links';
import { AndroidIcon, AppleIcon, LinuxIcon, WindowsIcon } from './brandIcons';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const TF = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];
const MACD = [8, 12, 6, 4, 3, 2, 5, 9, 14, 11, 7, 4, 3, 2, 3, 6, 10, 16, 13, 6, 4, 8, 14, 18, 20, 17];

/** Live EUR/USD terminal card: ticking price, timeframe chips cycling, candles + MACD bars. */
function TerminalCard() {
  const rows = useTicker(7, 1300);
  const eur = rows.find((r) => r.s === 'EURUSD') ?? rows[0];
  const [tf, setTf] = useState(2);
  useEffect(() => {
    const id = setInterval(() => setTf((v) => (v + 1) % TF.length), 2600);
    return () => clearInterval(id);
  }, []);
  const up = eur.change >= 0;

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[540px] [perspective:1400px]" aria-hidden>
      <div className="absolute -inset-8 rounded-[3rem] bg-brand/40 blur-3xl" />
      <motion.div initial={{ rotateY: -16, rotateX: 6, opacity: 0, y: 30 }} animate={{ rotateY: -6, rotateX: 3, opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.7)] ring-1 ring-white/20">
          <div className="flex items-start justify-between border-b border-brand/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex -space-x-2">
                <span className="size-6 rounded-full bg-brand-900 ring-2 ring-white" />
                <span className="size-6 rounded-full bg-brand-400 ring-2 ring-white" />
              </span>
              <span>
                <span className="block text-sm font-bold text-brand">EUR / USD</span>
                <span className="block text-[11px] text-ink/45">M15 · ASK {fmt(eur.ask, 5)}</span>
              </span>
            </div>
            <span className="text-end">
              <FlashPrice value={eur.bid} decimals={5} dir={eur.dir} tick={eur.tick} className="text-xl font-bold text-ink" />
              <span className={cn('block text-[11px] font-semibold', up ? 'text-up' : 'text-down')}>
                                {pct(eur.change)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-5 pt-3">
            {TF.map((t, i) => (
              <span key={t} className={cn('relative rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors', tf === i ? 'text-white' : 'bg-brand-50 text-brand/60')}>
                {tf === i && <motion.span layoutId="mt-tf" className="absolute inset-0 rounded-md bg-brand" />}
                <span className="relative">{t}</span>
              </span>
            ))}
            <span className="ms-auto rounded-md bg-brand-50 px-2 py-0.5 text-[10px] text-brand/60">+ Indicator</span>
          </div>
          <div className="h-48 px-3 pt-2 md:h-56">
            <CandleChart n={30} seed={tf + 3} className="h-full w-full" trigger="mount" />
          </div>
          <div className="border-t border-brand/10 px-5 pb-4 pt-3">
            <span className="text-[10px] text-ink/40">MACD (12,26,9)</span>
            <div className="mt-2 flex h-12 items-end gap-[3px]">
              {MACD.map((h, i) => (
                <motion.span key={i} className={cn('flex-1 rounded-t-sm', i % 9 < 4 ? 'bg-down/30' : 'bg-up/40')} animate={{ height: [`${h * 4}%`, `${Math.min(100, h * 4 + 20)}%`, `${h * 4}%`] }} transition={{ duration: 2.4 + (i % 4) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Windows / Linux / macOS download segments. */
export function DownloadBar({ version, labels, className ,links}) {
  const items = [
    { key: 'windows', Icon: WindowsIcon, label: labels.windows, href: links.windows, primary: true },
    { key: 'linux', Icon: LinuxIcon, label: labels.linux, href: links.windows },
    { key: 'mac', Icon: AppleIcon, label: labels.mac, href: links.windows }
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease: EASE }} className={cn('mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md sm:grid-cols-3', className)}>
      {items.map(({ key, Icon, label, href, primary }) => (
        <a key={key} href={href} className={cn('group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl px-5 py-4 text-[15px] font-semibold transition-colors', primary ? 'bg-gold text-white shadow-lg shadow-gold/25 hover:bg-gold-600' : 'text-white/85 hover:bg-white/10 hover:text-white')}>
          {primary && <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ left: ['-50%', '150%'] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }} />}
          <Icon className="relative size-5" />
          <span className="relative">{label}</span>
          <Download className="relative size-4 opacity-0 transition-all duration-300 group-hover:translate-y-0.5 group-hover:opacity-100" />
        </a>
      ))}
    </motion.div>
  );
}

/** MT4 / MT5 platform hero: copy + pills on the start side, the live terminal card on the end side, download bar below. */
export function PlatformHero({ ns, version, links }) {
  const t = useTranslations(`${ns}.hero`);
  const tb = useTranslations(`${ns}.breadcrumb`);
  const td = useTranslations(`${ns}.downloads`);
  const pills = t.raw('pills');
  
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />

        <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="border-beam inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <ArrowLink href={links.windows} variant="gold">
                {t('ctaDownload')}
              </ArrowLink>
              <LiveAccountButton look="button" variant="outlineLight" arrow={false}>
                {t('ctaLive')}
              </LiveAccountButton>
            </motion.div>
            <motion.ul className="mt-9 flex flex-wrap justify-center gap-2.5 border-t border-white/10 pt-6 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } } }}>
              {pills.map((p) => (
                <motion.li key={p} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                  <span className="size-1.5 rounded-full bg-gold" />
                  {p}
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <TerminalCard />
        </div>

        <DownloadBar version={version} links={links} labels={{ windows: td('windows'), linux: td('linux'), mac: td('mac') }} className="mt-14 md:mt-20" />
      </div>
    </section>
  );
}

/** iPhone / iPad and Android hero: centred copy with floating devices at the sides. */
export function DeviceHero({ ns, device,links }) {
  const t = useTranslations(`${ns}.hero`);
  const tb = useTranslations(`${ns}.breadcrumb`);
  const os = device === 'android' ? 'android' : 'ios';

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-28 md:pt-44">
      <HeroBackdrop />

      {/* floating devices */}
      <div dir="ltr" className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <motion.div className="absolute -start-16 top-1/3 opacity-70" initial={{ opacity: 0, x: -60, rotate: -14 }} animate={{ opacity: 0.7, x: 0, rotate: -10 }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}>
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
            <PhoneMockup className="w-[210px]" dark symbol="EURUSD" price="1.08742" seed={5} />
          </motion.div>
        </motion.div>
        <motion.div className="absolute -end-24 top-[28%] opacity-70" initial={{ opacity: 0, x: 60, rotate: 12 }} animate={{ opacity: 0.7, x: 0, rotate: 8 }} transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
            {device === 'android' ? <PhoneMockup className="w-[260px]" dark symbol="XAUUSD" price="2,354.42" seed={9} /> : <TabletMockup className="w-[420px]" dark symbol="XAUUSD" price="4,158.99" seed={11} />}
          </motion.div>
        </motion.div>
      </div>

      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />

        <div className="mx-auto mt-14 max-w-3xl text-center md:mt-20">
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15 backdrop-blur">
            {os === 'android' ? <AndroidIcon className="size-8" /> : <AppleIcon className="size-8" />}
          </motion.span>
          <motion.h1 className="heading-page mt-7" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
            <AccentTitle text={t('title')} />
          </motion.h1>
          <motion.p className="mt-4 text-xl font-semibold text-white md:text-2xl" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}>
            {t('subtitle')}
          </motion.p>
          <motion.p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            {t('text')}
          </motion.p>
          <motion.div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <a href={links.androidMt4} className="group relative inline-flex h-13 items-center gap-2.5 overflow-hidden rounded-full bg-gold px-7 text-base font-semibold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
              <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ left: ['-50%', '150%'] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }} aria-hidden />
              <span className="relative">{t('ctaMt4')}</span>
              <Download className="relative size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href={links.androidMt5} className="group inline-flex h-13 items-center gap-2.5 rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
              {t('ctaMt5')}
              <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
