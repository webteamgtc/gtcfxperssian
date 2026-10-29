'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { FEATURE_ICONS } from '@/components/shared/icons';
import { SectionHeading, HeadingStyle, Ambient } from '@/components/shared/blocks';
import { Stagger, StaggerItem, SpotlightCard } from '@/components/motion';
import { cn } from '@/lib/utils';
import { LeverageGauge } from './LeverageGauge';

export function Features() {
  const t = useTranslations('features');
  const items = t.raw('items');
  const layout = ['', 'md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-2', '', '', '', 'md:col-span-2 lg:col-span-3'];
  return (
    <section className="relative overflow-hidden bg-white py-16 text-ink md:py-16">
      <Ambient tone="light" />
      <HeadingStyle.Provider value="pill">
        <div className="container-x relative">
          <SectionHeading title={t('titleA')} titleB={t('titleB')} subtitle={t('subtitle')} />
          <Stagger className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
            {items.map((it, i) => {
              const Icon = FEATURE_ICONS[i];
              const hero = i === 1;
              return (
                <StaggerItem key={it.title} className={layout[i]}>
                  <SpotlightCard
                    color={hero ? 'rgba(182,135,86,0.35)' : 'rgba(41,59,147,0.10)'}
                    className={cn(
                      'h-full min-h-[230px] rounded-[1.75rem] border p-7 transition-all duration-500 hover:-translate-y-1.5',
                      i === 5 && 'lg:min-h-0',
                      hero
                        ? 'border-brand bg-gradient-to-br from-brand via-brand-700 to-brand-900 text-white shadow-2xl shadow-brand/30'
                        : 'border-brand/10 bg-white hover:border-brand/25 hover:shadow-2xl hover:shadow-brand/10'
                    )}
                  >
                    {hero && <div className="bg-grid-dark absolute inset-0 opacity-60" />}
                    <div className={cn('relative flex h-full flex-col', i === 5 && 'lg:flex-row lg:items-center lg:gap-10')}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={cn('text-xs font-medium', hero ? 'text-white/60' : 'text-ink/45')}>{it.eyebrow}</p>
                          <h3 className={cn('mt-1.5', hero ? 'heading-title is-dark' : 'heading-card')}>{it.title}</h3>
                        </div>
                        <motion.span
                          whileHover={{ rotate: 12, scale: 1.1 }}
                          className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', hero ? 'bg-white/10 text-gold-200' : 'bg-brand-50 text-brand')}
                        >
                          <Icon className="size-6" />
                        </motion.span>
                      </div>

                      {hero && (
                        <div className="my-8 flex flex-1 flex-col items-center justify-center">
                          <LeverageGauge />
                        </div>
                      )}

                      <p className={cn('mt-auto pt-6 leading-relaxed', i === 5 && 'lg:order-first lg:hidden', hero ? 'text-white/75' : 'text-ink/60')}>{it.text}</p>
                      {i === 5 && <p className="hidden max-w-2xl leading-relaxed text-ink/60 lg:block">{it.text}</p>}
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </HeadingStyle.Provider>
    </section>
  );
}
