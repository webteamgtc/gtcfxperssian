'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ChartLine, Code2, Globe, Headset, LayoutPanelLeft, Radio, Server, UserRound } from 'lucide-react';
import RingCard from '@/components/shared/RingCard';
import { Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';

const ICONS = { mt4: ChartLine, mt5: LayoutPanelLeft, web: Globe, signals: Radio, vps: Server, api: Code2, support: Headset, manager: UserRound };

/** Eight platform / tool cards with pulsing icon chips; the first row is platforms, the second services. */
export function PlatformsTools() {
  const t = useTranslations('accountTypesPage.tools');
  const items = t.raw('items');

  return (
    <section id="tools" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4" stagger={0.06}>
          {items.map((it, i) => {
            const Icon = ICONS[it.id] ?? Globe;
            return (
              <StaggerItem key={it.id} className="h-full">
                <RingCard innerClassName="p-6 md:p-7">
                  <div className="flex items-start justify-between">
                    <span className="relative grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                      <motion.span className="absolute inset-0 rounded-2xl ring-2 ring-gold/40" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: (i % 4) * 0.4 }} aria-hidden />
                      <Icon className="size-5" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.2em] text-ink/20">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="heading-card mt-6">{it.title}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/60">{it.text}</p>
                  <span className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-brand transition-all duration-700 group-hover:w-20 rtl:bg-gradient-to-l" aria-hidden />
                </RingCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
