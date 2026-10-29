'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Globe, Monitor, MonitorSmartphone, Smartphone } from 'lucide-react';
import { LaptopMockup, PhoneMockup, TabletMockup } from '@/components/shared/devices';
import GtcGoPhone from '@/components/shared/GtcGoPhone';
import { Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

const LOOK = {
  gtcgo: { Icon: Smartphone, Visual: () => <GtcGoPhone className="w-[150px]" dark />, wide: true },
  mt5: { Icon: Monitor, Visual: () => <LaptopMockup className="w-[220px]" symbol="EURUSD" price="1.16035" seed={7} /> },
  mt4: { Icon: MonitorSmartphone, Visual: () => <TabletMockup className="w-[180px]" symbol="XAUUSD" price="4,158.99" seed={11} /> },
  web: { Icon: Globe, Visual: () => <PhoneMockup className="w-[100px]" symbol="GBPUSD" price="1.34218" seed={5} /> }
};

/** Platforms: four cards; the device floats up out of its stage on hover. GTC Go gets the wide card. */
export function PlatformsGrid() {
  const t = useTranslations('openLiveAccountPage.platforms');
  const items = t.raw('items');

  return (
    <section id="platforms" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />

      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]" stagger={0.1}>
          {items.map((p, i) => {
            const { Icon, Visual } = LOOK[p.id] ?? LOOK.mt5;
            return (
              <StaggerItem key={p.id} className="h-full">
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="group is-dark border-beam relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/[0.04] p-2 text-white ring-1 ring-white/10 backdrop-blur"
                >
                  <div className="relative grid h-48 place-items-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-700/60 via-brand-900/60 to-ink">
                    <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
                    <span className={cn('absolute size-40 rounded-full blur-[60px] transition-opacity duration-700 group-hover:opacity-100 md:opacity-60', i % 2 ? 'bg-gold/30' : 'bg-brand-400/40')} aria-hidden />
                    <div dir="ltr" className="relative translate-y-10 transition-transform duration-700 group-hover:translate-y-4" aria-hidden>
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}>
                        <Visual />
                      </motion.div>
                    </div>
                    <span className="absolute start-4 top-4 grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                    <h3 className="heading-card">{p.title}</h3>
                    <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-white/65">{p.text}</p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <li key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-gold-200">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
