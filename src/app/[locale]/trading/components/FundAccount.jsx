'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeftRight, Wallet } from 'lucide-react';

import { Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';
import { AccentTitle } from '@/components/shared/SectionIntro';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

function Frame({ children, className }) {
  return (
    <div className={cn('relative rounded-[2.2rem] bg-ink p-2 shadow-2xl shadow-brand/30 ring-1 ring-black/10', className)}>
      <span className="absolute left-1/2 top-3.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-ink" />
      <div className="relative overflow-hidden rounded-[1.8rem] bg-[#f4f6fb] pt-8">{children}</div>
    </div>
  );
}

const CHANNELS = [
  ['bg-[#26a17b]', 'bg-[#e8403a]'],
  ['bg-[#26a17b]', 'bg-[#f0b90b]'],
  ['bg-[#f0b90b]'],
  ['bg-[#26a17b]', 'bg-[#627eea]'],
  ['bg-[#4a6cf7]']
];

/** Phone 1: deposit channels, the selected one moves down the list. */
function ChannelsPhone() {
  const [sel, setSel] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSel((s) => (s + 1) % CHANNELS.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <Frame className="w-[200px] md:w-[220px]">
      <div className="px-3 pb-4">
        <div className="mx-auto h-1.5 w-20 rounded-full bg-ink/15" />
        <div className="mt-3 rounded-xl bg-white p-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/gtc-logo.png" alt="" className="mx-auto h-4 w-auto" />
          <div className="mt-3 space-y-1.5">
            {CHANNELS.map((dots, i) => (
              <div key={i} className={cn('relative flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors duration-300', sel === i ? 'border-brand/40 bg-brand-50' : 'border-ink/10')}>
                <span className={cn('grid size-3 place-items-center rounded-full border', sel === i ? 'border-brand' : 'border-ink/25')}>
                  {sel === i && <motion.span layoutId="dep-radio" className="size-1.5 rounded-full bg-brand" />}
                </span>
                <span className="flex -space-x-1">
                  {dots.map((c, k) => (
                    <span key={k} className={cn('size-3 rounded-full ring-1 ring-white', c)} />
                  ))}
                </span>
                <span className="h-1.5 flex-1 rounded-full bg-ink/10" />
              </div>
            ))}
          </div>
          <div className="mt-3 h-6 rounded-md bg-brand" />
        </div>
      </div>
    </Frame>
  );
}

/** Phone 2: amount being typed and the arrival amount following it. */
function AmountPhone() {
  const steps = ['8', '88', '888'];
  const [k, setK] = useState(2);
  useEffect(() => {
    const id = setInterval(() => setK((v) => (v + 1) % steps.length), 1400);
    return () => clearInterval(id);
  }, [steps.length]);
  const amt = steps[k];
  return (
    <Frame className="w-[200px] md:w-[220px]">
      <div className="space-y-2 px-3 pb-4">
        <div className="mx-auto h-1.5 w-20 rounded-full bg-ink/15" />
        {[0, 1].map((r) => (
          <div key={r} className="rounded-lg bg-white px-2.5 py-2 shadow-sm">
            <span className="block h-1 w-12 rounded-full bg-ink/20" />
            <span className="mt-1.5 flex items-center gap-2">
              <span className={cn('size-3 rounded-full', r ? 'bg-brand/30' : 'bg-[#26a17b]')} />
              <span className="h-1.5 flex-1 rounded-full bg-ink/10" />
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 shadow-sm" dir="ltr">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={amt} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="text-xs font-bold text-ink">
              {amt}
            </motion.span>
          </AnimatePresence>
          <motion.span className="h-3 w-px bg-brand" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          <span className="ms-auto text-[9px] font-bold text-ink/50">USD</span>
        </div>
        {['USDT', 'USD'].map((cur) => (
          <div key={cur} className="rounded-lg bg-[#eef0f5] px-2.5 py-2" dir="ltr">
            <span className="block h-1 w-14 rounded-full bg-ink/15" />
            <span className="mt-1 block text-[11px] font-bold text-ink">
              {amt}.00 {cur}
            </span>
          </div>
        ))}
        <div className="h-6 rounded-md bg-brand-900" />
      </div>
    </Frame>
  );
}

/** Fund Your Account: two live-looking wallet screens beside the copy. */
export function FundAccount() {
  const t = useTranslations('tradingPage.fund');
  return (
    <section id="fund" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* stage */}
        <Reveal y={24} className="order-2 lg:order-1">
          <div dir="ltr" className="relative grid min-h-[460px] place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f3f5fb] to-[#eaedf6] p-8 ring-1 ring-brand/10 md:min-h-[540px]" aria-hidden>
            <div className="bg-grid-light absolute inset-0 opacity-70" />
            <div className="absolute size-72 rounded-full bg-brand/15 blur-[80px]" />
            {[1, 2, 3].map((r) => (
              <motion.span key={r} className="absolute rounded-full border border-brand/10" style={{ width: 180 + r * 90, height: 180 + r * 90 }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: r * 0.4, repeat: Infinity }} />
            ))}
            <motion.span className="absolute size-[360px] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}>
              <span className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_14px_rgba(182,135,86,0.9)]" />
            </motion.span>

            <div className="relative flex items-center gap-5">
              <motion.div animate={{ y: [0, -10, 0], rotate: -4 }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <ChannelsPhone />
              </motion.div>
              <motion.div className="hidden sm:block" animate={{ y: [0, 10, 0], rotate: 3 }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
                <AmountPhone />
              </motion.div>
            </div>

            {/* wallet ⇄ account transfer chip */}
            <motion.div className="absolute start-4 top-10 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 text-brand shadow-xl shadow-brand/10 ring-1 ring-brand/10 md:start-8" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <span className="grid size-8 place-items-center rounded-xl bg-gold/15 text-gold-700">
                <Wallet className="size-4" />
              </span>
              <motion.span animate={{ x: [0, 4, 0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
                <ArrowLeftRight className="size-4 text-gold-700" />
              </motion.span>
              <span className="grid size-8 place-items-center rounded-xl bg-brand text-[10px] font-bold text-white">MT</span>
            </motion.div>
          </div>
        </Reveal>

        {/* copy */}
        <div className="order-1 lg:order-2">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('title')} words={2} />
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('text')}</p>
          </Reveal>
          <Reveal y={12} delay={0.25} className="mt-10">
            <LiveAccountButton variant="primary">{t('cta')}</LiveAccountButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
