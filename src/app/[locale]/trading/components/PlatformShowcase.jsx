'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Activity, Bot, LineChart, Layers, Monitor, Smartphone } from 'lucide-react';
import { PORTAL } from '@/config/menu';
import ArrowLink from '@/components/shared/ArrowLink';
import { LaptopMockup, PhoneMockup } from '@/components/shared/devices';
import { Stagger, StaggerItem, TiltCard } from '@/components/motion';
import { cn } from '@/lib/utils';
import { SectionIntro } from '@/components/shared/SectionIntro';

const BLOCKS = [
  {
    key: 'mt4',
    tag: 'MT4',
    Icon: Monitor,
    bg: 'from-brand-600 via-brand-800 to-brand-950',
    glow: 'bg-brand-400/40',
    chips: [
      { Icon: Bot, label: 'EA', cls: 'start-4 top-6' },
      { Icon: LineChart, label: '30+', cls: 'end-4 bottom-10' }
    ],
    Visual: () => <LaptopMockup className="w-[min(100%,380px)]" symbol="GBPUSD" price="1.34218" seed={21} />
  },
  {
    key: 'mt5',
    tag: 'MT5',
    Icon: Smartphone,
    bg: 'from-[#3a2a16] via-[#1d160d] to-ink',
    glow: 'bg-gold/35',
    chips: [
      { Icon: Layers, label: 'DOM', cls: 'start-4 top-8' },
      { Icon: Activity, label: '21 TF', cls: 'end-4 bottom-12' }
    ],
    Visual: () => <PhoneMockup className="w-[170px]" symbol="EURUSD" price="1.16035" seed={5} />
  }
];


/** Trading Platforms: dark band with two tilting cards, each with a floating device, glow and live chips. */
export function PlatformShowcase() {
  const t = useTranslations('tradingPage.platforms');

  return (
    <section id="platforms" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-white" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />

      <div className="container-x relative">
        <SectionIntro title={t('title')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-2" stagger={0.15}>
          {BLOCKS.map(({ key, tag, Icon, bg, glow, chips, Visual }, i) => (
            <StaggerItem key={key} className="h-full">
              <TiltCard max={5} className="h-full rounded-[2rem]">
                <article className={cn('group is-dark border-beam relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br p-7 text-white md:p-10', bg)}>
                  <span className={cn('absolute -end-20 -top-20 size-72 rounded-full blur-[100px] transition-opacity duration-700 group-hover:opacity-100 md:opacity-60', glow)} aria-hidden />

                  <div className="relative flex items-center justify-between gap-6">
                    <span className="grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold tracking-[0.18em] text-gold-200">{tag}</span>
                  </div>

                  {/* device stage */}
                  <div dir="ltr" className="relative my-8 grid min-h-[240px] place-items-center md:min-h-[280px]" aria-hidden>
                    {[1, 2, 3].map((r) => (
                      <motion.span key={r} className="absolute rounded-full border border-white/10" style={{ width: 120 + r * 80, height: 120 + r * 80 }} animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 4, delay: r * 0.4, repeat: Infinity }} />
                    ))}
                    <motion.div className="relative" animate={{ y: [0, -10, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}>
                      <Visual />
                    </motion.div>
                    {chips.map(({ Icon: C, label, cls }, k) => (
                      <motion.span
                        key={label}
                        className={cn('absolute z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-900 shadow-lg', cls)}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.5 + k, repeat: Infinity, ease: 'easeInOut', delay: k * 0.6 }}
                      >
                        <C className="size-3.5 text-gold-700" /> {label}
                      </motion.span>
                    ))}
                  </div>

                  <h3 className="heading-title relative">{t(`${key}.title`)}</h3>
                  <p className="relative mt-3 max-w-lg flex-1 text-[15px] leading-relaxed text-white/70 md:text-base">{t(`${key}.text`)}</p>
                  <div className="relative mt-7 flex items-center justify-between gap-4">
                    <ArrowLink href={PORTAL.demo} variant="gold">
                      {t(`${key}.cta`)}
                    </ArrowLink>
                    <span className="h-px w-16 bg-gradient-to-r from-gold to-transparent transition-all duration-700 group-hover:w-32 rtl:bg-gradient-to-l" aria-hidden />
                  </div>
                </article>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
