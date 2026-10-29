'use client';
/**
 * GTC Go heroes (dark, like the other trading heroes).
 *   <AppHero ns="gtcGoApp" />                      split: copy + store buttons | live GTC Go phone with floating chips
 *   <DeviceHero ns="gtcGoAndroidPage" device="android" />   centred copy + one download button, devices drifting behind
 */
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Download } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import GtcGoPhone from '@/components/shared/GtcGoPhone';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { PhoneMockup, TabletMockup } from '@/components/shared/devices';
import { EASE } from '@/components/motion';
import { AndroidIcon, AppleIcon } from '../../common-metatrader/components/brandIcons';
import StoreButtons from './StoreButtons';
import { AppTile, ChartChip, ExecutionChip, SupportChip } from './goVisuals';
import { GO_LINKS } from './links';

/** Soft vertical light stripes, like a stage curtain. */
function Curtain() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0_2px,transparent_2px_46px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <motion.div className="absolute -top-1/3 left-1/2 h-[140%] w-[60%] -translate-x-1/2 rounded-full bg-brand/35 blur-[140px]" animate={{ opacity: [0.55, 0.9, 0.55] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  );
}

function Crumbs({ ns }) {
  const tb = useTranslations(`${ns}.breadcrumb`);
  return <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('trading'), href: '/trading' }, { label: tb('current') }]} />;
}

/** Main GTC Go hero. */
export function AppHero({ ns = 'gtcGoApp' }) {
  const t = useTranslations(`${ns}.hero`);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const chipY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section ref={ref} className="is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-24 md:pt-44">
      <HeroBackdrop />
      <Curtain />
      <div className="container-x relative">
        <Crumbs ns={ns} />

        <div className="mt-10 grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <div className="text-center lg:text-start">
            <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="inline-block">
              <AppTile className="text-xl" />
            </motion.div>
            <motion.h1 className="heading-page mt-7" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mt-5 text-lg text-white/75 md:text-2xl" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
              {t('subtitle')}
            </motion.p>
            <StoreButtons className="mt-10 justify-center lg:justify-start" delay={0.35} />
          </div>

          {/* phone + floating chips */}
          <div className="relative mx-auto flex w-full max-w-[460px] justify-center py-6">
            <div className="absolute inset-0 m-auto size-[380px] rounded-full bg-brand/40 blur-3xl" aria-hidden />
            {[0, 1, 2].map((k) => (
              <motion.span key={k} className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" animate={{ scale: [0.8, 1.6], opacity: [0.6, 0] }} transition={{ duration: 4.5, delay: k * 1.5, repeat: Infinity, ease: 'easeOut' }} aria-hidden />
            ))}
            <motion.div style={{ y: phoneY }} className="relative">
              <motion.div initial={{ opacity: 0, y: 60, rotate: 6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                  <GtcGoPhone className="w-[250px] md:w-[270px]" />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div style={{ y: chipY }} className="absolute -start-2 top-6 sm:start-0" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.7, ease: EASE }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <SupportChip label={t('support')} />
              </motion.div>
            </motion.div>
            <motion.div className="absolute -start-4 bottom-20 sm:-start-8" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.7, ease: EASE }}>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
                <ExecutionChip label={t('execution')} value={t('executionValue')} />
              </motion.div>
            </motion.div>
            <motion.div style={{ y: chipY }} className="absolute -end-6 top-1/3 hidden sm:block xl:-end-16" initial={{ opacity: 0, x: 30, rotate: 6 }} animate={{ opacity: 1, x: 0, rotate: 3 }} transition={{ delay: 0.8, duration: 0.8, ease: EASE }}>
              <ChartChip className="w-48" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Android / iPhone & iPad hero: centred copy with devices drifting behind it. */
export function DeviceHero({ ns, device }) {
  const t = useTranslations(`${ns}.hero`);
  const android = device === 'android';
  const href = android ? GO_LINKS.android : GO_LINKS.ios;
  const OsIcon = android ? AndroidIcon : AppleIcon;

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-24 pt-36 text-white md:pb-32 md:pt-44">
      <HeroBackdrop />

      {/* devices behind the copy */}
      <div dir="ltr" className="pointer-events-none absolute inset-0" aria-hidden>
        {android ? (
          <motion.div className="absolute left-1/2 top-24 -translate-x-[95%] opacity-35 md:top-28" initial={{ opacity: 0, y: 80, rotate: -4 }} animate={{ opacity: 0.35, y: 0, rotate: -8 }} transition={{ duration: 1.2, ease: EASE }}>
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <PhoneMockup className="w-[260px] md:w-[320px]" symbol="EURUSD" price="1.16035" seed={5} />
            </motion.div>
          </motion.div>
        ) : (
          <>
            <motion.div className="absolute left-[8%] top-40 hidden opacity-35 md:block" initial={{ opacity: 0, x: -60, rotate: -6 }} animate={{ opacity: 0.35, x: 0, rotate: -14 }} transition={{ duration: 1.2, ease: EASE }}>
              <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
                <PhoneMockup className="w-[220px]" symbol="XAUUSD" price="4,158.99" seed={9} />
              </motion.div>
            </motion.div>
            <motion.div className="absolute -end-10 top-48 opacity-35 md:end-[4%]" initial={{ opacity: 0, x: 60, rotate: 2 }} animate={{ opacity: 0.35, x: 0, rotate: -6 }} transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}>
              <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
                <TabletMockup className="w-[360px] md:w-[560px]" symbol="XAUEUR" price="4,113.23" seed={11} />
              </motion.div>
            </motion.div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/40 to-ink" />
      </div>

      <div className="container-x relative">
        <Crumbs ns={ns} />

        <div className="mx-auto mt-16 max-w-4xl text-center md:mt-24">
          <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }} className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15 backdrop-blur">
            <OsIcon className="size-8" />
          </motion.span>
          <motion.h1 className="heading-page mt-7" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <AccentTitle text={t('title')} />
          </motion.h1>
          <motion.p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-relaxed text-white/75 md:text-xl" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            {t('text')}
          </motion.p>
          <motion.div className="mt-10 flex justify-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-brand px-8 text-base font-semibold text-white shadow-xl shadow-brand/40 ring-1 ring-white/15 transition-colors hover:bg-brand-600">
              <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ left: ['-50%', '150%'] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }} aria-hidden />
              <span className="relative">{t('cta')}</span>
              <Download className="relative size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
