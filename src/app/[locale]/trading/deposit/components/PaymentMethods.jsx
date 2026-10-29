'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { ArrowRight, Bitcoin, CircleCheck, Clock3, CreditCard, Landmark, Play, Smartphone, Wallet, Wifi } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import { Reveal, EASE } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

const AUTO_MS = 4200;

/* ---------- one illustration per method ---------- */

function CardVisual() {
  return (
    <motion.div className="relative h-36 w-56 [perspective:800px]" animate={{ rotateY: [-12, 12, -12] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="absolute inset-0 translate-x-5 translate-y-4 rotate-6 rounded-2xl bg-gradient-to-br from-gold-200 to-gold opacity-70 shadow-xl" />
      <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 p-4 text-white shadow-2xl shadow-brand/40">
        <span className="absolute -end-10 -top-10 size-32 rounded-full bg-white/10" />
        <span className="block h-6 w-8 rounded-md bg-gradient-to-br from-gold-200 to-gold" />
        <div className="mt-5 flex gap-2.5 font-mono text-xs tracking-widest text-white/80">
          <span>••••</span>
          <span>••••</span>
          <span>••••</span>
          <span>4242</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="h-1.5 w-16 rounded-full bg-white/30" />
          <span className="flex -space-x-2">
            <span className="size-6 rounded-full bg-[#eb001b]/90" />
            <span className="size-6 rounded-full bg-[#f79e1b]/90" />
          </span>
        </div>
        <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ left: ['-50%', '150%'] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }} />
      </div>
    </motion.div>
  );
}

function BankVisual() {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-16 place-items-center rounded-2xl bg-white text-brand shadow-lg ring-1 ring-brand/10">
        <Landmark className="size-7" />
      </span>
      <div className="relative h-1 w-28 rounded-full bg-brand/10">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="absolute -top-1 size-3 rounded-full bg-gold shadow-[0_0_10px_rgba(182,135,86,0.8)]" animate={{ left: ['0%', '92%'], opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }} />
        ))}
      </div>
      <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-900 text-white shadow-lg shadow-brand/30">
        <Wallet className="size-7" />
      </span>
    </div>
  );
}

function WalletVisual() {
  return (
    <div className="relative grid h-40 w-40 place-items-end">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="absolute left-1/2 top-0 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-b from-gold-200 to-gold text-xs font-bold text-white shadow" style={{ marginLeft: (i - 1) * 26 }} animate={{ y: [0, 70], opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: 'easeIn' }}>
          $
        </motion.span>
      ))}
      <div className="relative mx-auto h-24 w-36 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 shadow-2xl shadow-brand/30">
        <span className="absolute -top-2 start-3 h-5 w-24 rounded-t-xl bg-brand-400/70" />
        <span className="absolute end-0 top-1/2 h-9 w-12 -translate-y-1/2 rounded-s-xl bg-white/15 ring-1 ring-white/20" />
        <span className="absolute end-3 top-1/2 size-3 -translate-y-1/2 rounded-full bg-gold" />
      </div>
    </div>
  );
}

function CryptoVisual() {
  return (
    <div className="relative grid size-44 place-items-center">
      <motion.span className="absolute inset-0 rounded-full border-2 border-dashed border-gold/40" animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }} />
      <motion.span className="absolute inset-5 rounded-full border border-brand/15" animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-brand" />
      </motion.span>
      <motion.span className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#26a17b] to-[#1a7a5c] text-3xl font-bold text-white shadow-2xl shadow-[#26a17b]/40" animate={{ rotateY: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        ₮
      </motion.span>
    </div>
  );
}

function PhoneVisual() {
  return (
    <div className="relative flex items-center gap-6">
      <div className="h-40 w-20 rounded-[1.4rem] bg-ink p-1 shadow-2xl shadow-brand/30">
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[1.15rem] bg-white">
          <motion.span className="grid size-9 place-items-center rounded-full bg-up/10 text-up" animate={{ scale: [0.8, 1, 0.8] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <CircleCheck className="size-5" />
          </motion.span>
          <span className="h-1.5 w-10 rounded-full bg-ink/15" />
          <span className="h-1.5 w-7 rounded-full bg-ink/10" />
        </div>
      </div>
      <div className="relative grid size-16 place-items-center text-brand">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-brand/30" animate={{ scale: [0.4, 1.3], opacity: [0.9, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }} />
        ))}
        <Wifi className="size-7 rotate-90" />
      </div>
    </div>
  );
}

const LOOK = {
  card: { Icon: CreditCard, Visual: CardVisual },
  bank: { Icon: Landmark, Visual: BankVisual },
  ewallet: { Icon: Wallet, Visual: WalletVisual },
  crypto: { Icon: Bitcoin, Visual: CryptoVisual },
  apple: { Icon: Smartphone, Visual: PhoneVisual },
  google: { Icon: Play, Visual: PhoneVisual }
};

/** Payment methods as a selector: list of six on one side, a detail panel (illustration, stats, CTA) on the other.
 *  Auto-advances while visible until the visitor picks one. */
export function PaymentMethods() {
  const t = useTranslations('depositPage.methods');
  const items = t.raw('items');
  const labels = t.raw('labels');
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });

  useEffect(() => {
    if (manual || hover || !inView) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % items.length), AUTO_MS);
    return () => clearTimeout(id);
  }, [active, manual, hover, inView, items.length]);

  const pick = (i) => {
    setManual(true);
    setActive(i);
  };

  const m = items[active];
  const { Icon, Visual } = LOOK[m.id] ?? LOOK.card;

  return (
    <section id="methods" ref={ref} className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Reveal y={24} className="mt-12 md:mt-14">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {/* method list */}
            <div role="tablist" aria-label={t('tabsLabel')} className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {items.map((it, i) => {
                const { Icon: ItIcon } = LOOK[it.id] ?? LOOK.card;
                const on = active === i;
                return (
                  <button
                    key={it.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="pm-panel"
                    onClick={() => pick(i)}
                    className={cn(
                      'group relative flex min-w-[230px] shrink-0 items-center gap-3.5 overflow-hidden rounded-2xl border px-4 py-3.5 text-start transition-all duration-500 lg:min-w-0',
                      on ? 'border-transparent text-white shadow-xl shadow-brand/25' : 'border-brand/10 bg-white hover:border-brand/25 hover:shadow-md'
                    )}
                  >
                    {on && <motion.span layoutId="pm-active" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                    <span className={cn('relative grid size-11 shrink-0 place-items-center rounded-xl ring-1 transition-all duration-500', on ? 'bg-white/10 text-gold-200 ring-white/20' : 'bg-brand-50 text-brand ring-brand/10 group-hover:-rotate-6')}>
                      <ItIcon className="size-5" />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className={cn('block truncate font-semibold capitalize', on ? 'text-white' : 'text-ink')}>{it.name}</span>
                      <span className={cn('block truncate text-xs', on ? 'text-white/60' : 'text-ink/45')}>{it.sub}</span>
                    </span>
                    <span className={cn('relative rounded-full px-2.5 py-1 text-[11px] font-bold', on ? 'bg-white/15 text-white' : 'bg-up/10 text-up')}>{it.cost}</span>
                    {/* auto-advance progress */}
                    {on && !manual && <motion.span key={`p-${active}`} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gold rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: inView && !hover ? 1 : 0 }} transition={{ duration: AUTO_MS / 1000, ease: 'linear' }} />}
                  </button>
                );
              })}
            </div>

            {/* detail panel */}
            <div id="pm-panel" role="tabpanel" className="relative overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-xl shadow-brand/5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE }} className="flex h-full flex-col">
                  {/* stage */}
                  <div className="relative m-2 grid min-h-[230px] place-items-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#f3f5fb] via-white to-[#eaedf6] md:min-h-[260px]">
                    <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
                    <div className="absolute size-56 rounded-full bg-brand/10 blur-3xl" aria-hidden />
                    <div dir="ltr" className="relative" aria-hidden>
                      <Visual />
                    </div>
                    <span className="absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/40 shadow-sm ring-1 ring-brand/10">0{active + 1} / 0{items.length}</span>
                  </div>

                  {/* copy */}
                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <div className="flex items-center gap-3.5">
                      <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-800 text-white shadow-lg shadow-brand/25">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="heading-title text-2xl capitalize">{m.name}</h3>
                        <p className="text-sm text-ink/50">{m.sub}</p>
                      </div>
                    </div>

                    <dl className="mt-6 grid grid-cols-3 gap-3">
                      {[
                        [labels.lowest, m.lowest, 'text-ink', Wallet],
                        [labels.received, m.received, 'text-brand', Clock3],
                        [labels.cost, m.cost, 'text-up', CircleCheck]
                      ].map(([k, v, c, KIcon], i) => (
                        <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="rounded-2xl bg-[#f4f6fb] px-3 py-4 text-center ring-1 ring-brand/5">
                          <KIcon className="mx-auto size-4 text-ink/30" />
                          <dt className="mt-1.5 text-[11px] text-ink/45">{k}</dt>
                          <dd dir="ltr" className={cn('mt-0.5 text-base font-bold capitalize', c)}>
                            {v}
                          </dd>
                        </motion.div>
                      ))}
                    </dl>

                    <NavLink href={PORTAL.clientPortal} className="group mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold capitalize text-white shadow-lg shadow-brand/25 transition-colors hover:bg-brand-800">
                      {t('cta')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                    </NavLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
