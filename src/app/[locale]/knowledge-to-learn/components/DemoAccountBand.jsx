'use client';
/**
 * Free demo account: copy + buttons beside a laptop/phone composition (orbit ring + glow),
 * then one connected feature strip whose hover highlight slides between the four features.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Gauge, Layers, Scale, Zap } from 'lucide-react';

import NavLink from '@/components/shared/nav/NavLink';
import { LaptopMockup, PhoneMockup } from '@/components/shared/devices';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const ICONS = { tightestSpread: Gauge, bestLeverage: Scale, tradingInstrument: Layers, ultraFastExecution: Zap };

function Devices() {
  return (
    <div dir="ltr" className="relative mx-auto aspect-[1.3/1] w-full max-w-[580px]" aria-hidden>
      {/* glow + orbit rings */}
      <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-brand/20 via-brand/10 to-gold/20 blur-3xl" />
      <motion.div className="absolute inset-[2%] rounded-full border border-dashed border-brand/20" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute start-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_0_6px_rgba(182,135,86,0.18)]" />
      </motion.div>
      <motion.div className="absolute inset-[16%] rounded-full border border-brand/10" animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute bottom-0 start-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand" />
      </motion.div>

      <motion.div className="absolute start-0 top-[8%] w-[84%]" initial={{ opacity: 0, x: -40, rotate: -2 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <LaptopMockup className="w-full drop-shadow-[0_30px_40px_rgba(18,25,64,0.25)]" symbol="XAUUSD" price="4,158.99" seed={17} />
        </motion.div>
      </motion.div>
      <motion.div className="absolute bottom-[2%] end-0 w-[30%]" initial={{ opacity: 0, y: 50, rotate: 6 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE, delay: 0.25 }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <PhoneMockup className="w-full rounded-[1.6rem] border-[5px] drop-shadow-[0_30px_40px_rgba(18,25,64,0.3)]" symbol="EURUSD" price="1.16035" seed={5} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureStrip({ features }) {
  const [hover, setHover] = useState(null);
  return (
    <Reveal y={24} className="mt-14 md:mt-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-2 shadow-2xl shadow-brand/10 ring-1 ring-brand/10" onMouseLeave={() => setHover(null)}>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = ICONS[f.key] ?? Zap;
            const on = hover === i;
            return (
              <li key={f.key} className="relative" onMouseEnter={() => setHover(i)}>
                {on && <motion.span layoutId="demo-feature" className="absolute inset-0 rounded-[1.6rem] bg-gradient-to-br from-brand-700 to-brand-950" transition={{ type: 'spring', stiffness: 380, damping: 34 }} aria-hidden />}
                {i > 0 && <span className={cn('absolute inset-y-6 start-0 hidden w-px bg-brand/10 lg:block', (on || hover === i - 1) && 'opacity-0')} aria-hidden />}
                <motion.div className="relative flex h-full flex-col p-6 md:p-7" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.1 }}>
                  <div className="flex items-center justify-between">
                    <span className={cn('grid size-12 place-items-center rounded-2xl transition-all duration-500', on ? '-rotate-6 scale-110 bg-gold text-white shadow-lg shadow-gold/30' : 'bg-brand-50 text-brand')}>
                      <Icon className="size-5" />
                    </span>
                    <span dir="ltr" className={cn('text-xs font-bold tracking-[0.2em] transition-colors duration-500', on ? 'text-gold-200' : 'text-brand/25')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className={cn('mt-6 text-lg font-semibold transition-colors duration-500', on ? 'text-white' : 'text-ink')}>{f.title}</h3>
                  <p className={cn('mt-2 text-sm leading-relaxed transition-colors duration-500', on ? 'text-white/65' : 'text-ink/55')}>{f.description}</p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </Reveal>
  );
}

/** Free demo account: copy + buttons beside a laptop/phone composition, the four features below. */
export function DemoAccountBand() {
  const t = useTranslations('knowledgePage.demoTrading');
  const features = t.raw('features');
  return (
    <section id="demo" className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -end-32 top-0 size-[520px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal y={16} className="text-center lg:text-start">
            <h2 className="heading-section">
              <AccentTitle text={t('title')} />
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink/60 md:text-lg lg:mx-0">{t('description')}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <LiveAccountButton variant="primary">{t('openLiveAccount')}</LiveAccountButton>
              <NavLink href="/trading/free-demo-account" className="inline-flex h-13 items-center rounded-full border border-brand/20 bg-white px-7 text-base font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
                {t('openDemoAccount')}
              </NavLink>
            </div>
          </Reveal>
          <Devices />
        </div>
        <FeatureStrip features={features} />
      </div>
    </section>
  );
}
