'use client';
import { useTranslations } from 'next-intl';
import { Stagger, StaggerItem, CountUp } from '@/components/motion';
import { cn } from '@/lib/utils';

export function Stats() {
  const t = useTranslations('stats');
  const items = t.raw('items');
  return (
    <section className="relative overflow-hidden py-10 md:py-16">
      <div className="bg-dots-dark mask-radial absolute inset-0 opacity-70" />
      <div className="container-x relative">
        <Stagger className="grid grid-cols-2 gap-y-14 lg:grid-cols-4" stagger={0.15}>
          {items.map((s, i) => (
            <StaggerItem key={s.label} className={cn('relative px-4 text-center', i > 0 && 'lg:border-s lg:border-white/10')}>
              <div className="text-gradient-gold text-3xl font-bold tracking-tight md:text-4xl xl:text-5xl lg:whitespace-nowrap">
                <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="mt-3 text-sm uppercase tracking-[0.18em] text-white/50">{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
