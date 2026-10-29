'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading, Ambient } from '@/components/shared/blocks';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import NavLink from '@/components/shared/nav/NavLink';
import { PLATFORM_LINKS } from '@/config/menu';

// platform screenshots in public/ (intrinsic size: width × height)
const PLATFORM_IMAGES = {
  mt4: { src: '/metatrade4.png', alt: 'MetaTrader 4', width: 597, height: 435 },
  gtcgo: { src: '/metatrade5.png', alt: 'GTC Go', width: 210, height: 411 },
  mt5: { src: '/gtcgo.png', alt: 'MetaTrader 5', width: 940, height: 590 }
};

function PlatformImage({ k, className, sizes }) {
  const img = PLATFORM_IMAGES[k];
  return <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes={sizes} className={cn('h-auto select-none drop-shadow-2xl', className)} draggable={false} />;
}

/** Left → right matches tab order (GTC Go · MT5 · MT4). GTC Go uses the phone asset; MT5 uses the wide desktop asset. */
const PLATFORM_DEVICES = {
  gtcgo: { className: 'start-[2%] bottom-[40px] z-30', node: () => <PlatformImage k="gtcgo" className="w-[158px] sm:w-[170px]" sizes="170px" /> },
  mt5: {
    className: 'start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bottom-[52px] z-20',
    node: () => <PlatformImage k="mt5" className="w-[min(100vw-3rem,420px)] lg:w-[470px]" sizes="470px" />
  },
  mt4: { className: 'end-[3%] bottom-[64px] z-10', node: () => <PlatformImage k="mt4" className="w-[300px] lg:w-[330px]" sizes="330px" /> }
};

const PLATFORM_VISUAL_ORDER = ['gtcgo', 'mt5', 'mt4'];

function platformBadge(key) {
  if (key === 'gtcgo') return 'G';
  if (key === 'mt5') return '5';
  return '4';
}

/* ------------------------------------------------------- PLATFORMS (tabs) */
export function Platforms() {
  const t = useTranslations('platforms');
  const items = t.raw('items');
  const features = t.raw('features');
  const perks = t.raw('perks');
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const DURATION = 6500;

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setI((x) => (x + 1) % items.length), DURATION);
    return () => clearTimeout(id);
  }, [i, paused, items.length]);

  const it = items[i];
  return (
    <section className="relative overflow-hidden bg-white py-10 text-ink md:py-16">
      <div className="bg-dots-light mask-radial pointer-events-none absolute inset-0 opacity-30" />
      <Ambient tone="light" />
      <div className="container-x relative">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />

        <Reveal y={24} className="relative mt-14 overflow-hidden rounded-[2rem] border border-brand/10 bg-[#f7f8fc] shadow-xl shadow-brand/[0.06]">
          <div className="absolute -end-24 -top-24 size-72 rounded-full bg-gold-100/80 blur-3xl" aria-hidden />
          <div className="absolute -start-20 bottom-0 size-64 rounded-full bg-brand-100/60 blur-3xl" aria-hidden />

          <div className="relative border-b border-brand/5 px-5 py-6 md:px-8 md:py-7">
            <div className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-[#f4f5fa] p-1.5 no-scrollbar">
              {items.map((x, k) => (
                <button
                  key={x.key}
                  type="button"
                  onClick={() => setI(k)}
                  className={cn(
                    'relative overflow-hidden whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
                    i === k ? 'text-white' : 'text-ink/55 hover:text-ink'
                  )}
                >
                  {i === k && (
                    <motion.span layoutId="d4-plat" className="absolute inset-0 rounded-full bg-brand shadow-md shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
                      {!paused && (
                        <motion.span
                          key={`plat-progress-${i}`}
                          className="absolute inset-y-0 start-0 bg-white/20"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: DURATION / 1000, ease: 'linear' }}
                        />
                      )}
                    </motion.span>
                  )}
                  <span className="relative">{x.brand}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative grid lg:grid-cols-[min(100%,380px)_1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="relative border-b border-brand/5 p-6 md:p-8 lg:border-b-0 lg:border-e lg:pe-8">
              <AnimatePresence mode="wait">
                <motion.div key={it.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.45, ease: EASE }}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-[#f7f8fc] px-3 py-1.5 text-xs font-semibold text-brand">
                    <span className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-600 text-[9px] font-black text-white">{platformBadge(it.key)}</span>
                    {it.brand}
                  </span>
                  <h3 className="heading-title mt-5">{it.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/60 md:text-base">{it.tagline}</p>
                  <ul className="mt-6 space-y-2.5">
                    {features.map((f, k) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + k * 0.07 }}
                        className="flex items-center gap-3 text-sm text-ink/75"
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white shadow-sm shadow-brand/20">
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </span>
                        {f}
                      </motion.li>
                    ))}
                  </ul>
                  <Button size="lg" className="mt-8 w-full sm:w-auto" as={NavLink} href={PLATFORM_LINKS[it.key]}>
                    <Download /> {it.cta}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[400px] overflow-hidden bg-gradient-to-b from-[#eef1fb] via-[#f4f6fc] to-white md:min-h-[520px]">
              <div className="absolute inset-x-[-18%] bottom-[-32%] h-[78%] [perspective:600px]">
                <motion.div
                  className="h-full w-full origin-top [transform:rotateX(62deg)] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(41,59,147,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(41,59,147,0.12) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                  }}
                  animate={{ backgroundPositionY: ['0px', '48px'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <motion.div
                className="absolute bottom-8 h-20 w-72 rounded-[100%] bg-brand/20 blur-2xl"
                animate={{ left: it.key === 'gtcgo' ? '6%' : it.key === 'mt5' ? '32%' : '58%' }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              />
              {perks.map((p, k) => (
                <motion.span
                  key={p}
                  className={cn(
                    'absolute z-40 hidden items-center gap-2 rounded-full border border-brand/10 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-brand shadow-md shadow-brand/10 md:inline-flex',
                    ['start-4 top-4', 'end-4 top-6', 'start-[38%] top-3'][k]
                  )}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4 + k, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="size-3.5 text-gold" /> {p}
                </motion.span>
              ))}

              <div dir="ltr" className="absolute inset-0 hidden md:block">
                {PLATFORM_VISUAL_ORDER.map((k) => {
                  const on = it.key === k;
                  const idx = items.findIndex((x) => x.key === k);
                  const dev = PLATFORM_DEVICES[k];
                  return (
                    <motion.button
                      key={k}
                      type="button"
                      onClick={() => setI(idx)}
                      className={cn('absolute origin-bottom', dev.className, on && 'z-40')}
                      animate={{
                        scale: on ? 1.05 : 0.88,
                        opacity: on ? 1 : 0.5,
                        filter: on ? 'blur(0px) saturate(1)' : 'blur(1px) saturate(0.75)',
                        y: on ? -8 : 0
                      }}
                      whileHover={{ opacity: 0.92 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                      aria-label={items[idx].brand}
                    >
                      <div className={cn(on && 'animate-float')}>{dev.node()}</div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="absolute inset-0 flex items-end justify-center pb-10 md:hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={it.key} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: EASE }}>
                    {it.key === 'gtcgo' ? (
                      <PlatformImage k="gtcgo" className="w-[180px]" sizes="180px" />
                    ) : it.key === 'mt5' ? (
                      <PlatformImage k="mt5" className="w-[min(100vw-2.5rem,340px)]" sizes="340px" />
                    ) : (
                      <PlatformImage k="mt4" className="w-[min(100vw-2.5rem,320px)]" sizes="320px" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
