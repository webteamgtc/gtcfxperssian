'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Award, Globe2, ShieldCheck, Vault } from 'lucide-react';
import { Stagger, StaggerItem } from '@/components/motion';
import OrbitChip from '@/components/shared/OrbitChip';
import { SectionIntro } from '@/components/shared/SectionIntro';

const LOOKS = [
  { Icon: ShieldCheck, chip: 'from-brand to-brand-800 shadow-brand/30' },
  { Icon: Vault, chip: 'from-gold to-gold-600 shadow-gold/30' },
  { Icon: Award, chip: 'from-brand-800 to-ink shadow-ink/30' },
  { Icon: Globe2, chip: 'from-brand to-brand-800 shadow-brand/30' }
];

/** Regulation: four pillars, each card with a lit orbit stage over the copy. */
export function Regulation() {
  const t = useTranslations('openLiveAccountPage.regulation');
  const items = t.raw('items');

  return (
    <section id="regulation" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4" stagger={0.1}>
          {items.map((it, i) => {
            const { Icon, chip } = LOOKS[i % LOOKS.length];
            return (
              <StaggerItem key={it.title} className="h-full">
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="group relative h-full rounded-[2rem] bg-brand/10 p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/15"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                  <div className="relative flex h-full flex-col rounded-[calc(2rem-1.5px)] bg-white p-2">
                    <div className="relative grid h-36 place-items-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#f3f5fb] via-white to-[#eaedf6]">
                      <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />
                      <span className="heading-accent absolute -bottom-5 end-3 select-none text-7xl font-black leading-none opacity-20 transition-transform duration-700 group-hover:-translate-y-1" aria-hidden>
                        0{i + 1}
                      </span>
                      <OrbitChip Icon={Icon} chip={chip} speed={10 + i * 2} className="relative" />
                    </div>
                    <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
                      <h3 className="heading-card">{it.title}</h3>
                      <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink/60">{it.text}</p>
                      <span className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-brand transition-all duration-700 group-hover:w-24 rtl:bg-gradient-to-l" aria-hidden />
                    </div>
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
