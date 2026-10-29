'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import ArrowLink from '@/components/shared/ArrowLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import { CopyScreen } from '../../common-gtc-components/components/goVisuals';
import { START_URL } from './copyUtils';

/** Flag pair for "GBP/USD" → two overlapping flag discs. */
function PairFlags({ pair }) {
  const [a, b] = pair.split('/').map((c) => ({ EUR: 'eu', GBP: 'gb', USD: 'us', AUD: 'au', JPY: 'jp' })[c] ?? 'un');
  return (
    <span className="relative flex shrink-0">
      <img src={`https://flagcdn.com/w40/${a}.png`} alt="" className="size-7 rounded-full object-cover ring-2 ring-white" />
      <img src={`https://flagcdn.com/w40/${b}.png`} alt="" className="-ms-2.5 mt-2.5 size-5 rounded-full object-cover ring-2 ring-white" />
    </span>
  );
}

const CHIP_POS = ['-start-4 top-6 md:-start-10', '-end-4 top-28 md:-end-12', '-start-6 top-1/2 md:-start-16', '-end-2 bottom-20 md:-end-8'];

/** Phone running the copy-trading screen, with floating currency-pair chips. */
function CopyPhone() {
  const t = useTranslations('copyTradingPage.hero');
  const pairs = t.raw('pairs');
  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-[420px] py-6">
      <div className="absolute inset-0 m-auto size-[380px] rounded-full bg-brand/40 blur-3xl" aria-hidden />
      {[0, 1, 2].map((k) => (
        <motion.span key={k} className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" animate={{ scale: [0.8, 1.6], opacity: [0.6, 0] }} transition={{ duration: 4.5, delay: k * 1.5, repeat: Infinity, ease: 'easeOut' }} aria-hidden />
      ))}

      <motion.div className="relative mx-auto w-[260px] md:w-[280px]" initial={{ opacity: 0, y: 60, rotate: 6 }} animate={{ opacity: 1, y: 0, rotate: -4 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative rounded-[2.6rem] bg-[#0e1018] p-[9px] shadow-[0_50px_100px_-30px_rgba(41,59,147,0.7)] ring-1 ring-white/10">
          <span className="absolute -start-[3px] top-24 h-12 w-[3px] rounded-s bg-[#2a2d38]" />
          <span className="absolute -end-[3px] top-20 h-16 w-[3px] rounded-e bg-[#2a2d38]" />
          <div className="relative overflow-hidden rounded-[2.1rem] bg-white pt-7">
            <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <div className="[&>div]:rounded-none [&>div]:shadow-none [&>div]:ring-0">
              <CopyScreen />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {pairs.map((p, i) => (
        <motion.div key={p.pair} className={`absolute z-10 ${CHIP_POS[i % CHIP_POS.length]}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 220, damping: 16 }}>
          <motion.div animate={{ y: [0, i % 2 ? 7 : -7, 0] }} transition={{ duration: 4.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }} className="flex items-center gap-2.5 rounded-2xl bg-white/90 px-3 py-2 text-ink shadow-xl shadow-black/25 ring-1 ring-white backdrop-blur">
            <PairFlags pair={p.pair} />
            <span className="leading-tight">
              <span className="block text-xs font-bold text-brand">{p.pair}</span>
              <span className="text-[11px] font-semibold text-up">{p.change} ▲</span>
            </span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export function CopyHero() {
  const t = useTranslations('copyTradingPage.hero');
  const tb = useTranslations('copyTradingPage.breadcrumb');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-28 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />
        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
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
            <motion.div className="mt-9 flex justify-center lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <ArrowLink href={START_URL} variant="gold" target="_blank" rel="noopener noreferrer">
                {t('cta')}
              </ArrowLink>
            </motion.div>
          </div>
          <CopyPhone />
        </div>
      </div>
    </section>
  );
}
