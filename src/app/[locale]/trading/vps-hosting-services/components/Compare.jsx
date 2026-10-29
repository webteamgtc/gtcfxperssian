'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, Clock, Monitor, Power, ShieldCheck, Star, TrendingUp, Wifi, X, Zap } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const WITHOUT_ICONS = [Monitor, Power, Wifi, Zap];
const WITH_ICONS = [TrendingUp, ShieldCheck, Clock, Star];

/** Uptime strip: 48 slots — the PC one has outages, the server one stays green. */
function UptimeStrip({ broken }) {
  const down = new Set([7, 8, 9, 21, 22, 34, 35, 36, 37, 44]);
  return (
    <div dir="ltr" className="flex h-7 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: 48 }, (_, i) => {
        const off = broken && down.has(i);
        return (
          <motion.span
            key={i}
            className={cn('flex-1 rounded-sm', off ? 'bg-down/70' : broken ? 'bg-gold/50' : 'bg-up/70')}
            initial={{ height: '20%', opacity: 0 }}
            whileInView={{ height: off ? '35%' : '100%', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.015, ease: EASE }}
          />
        );
      })}
    </div>
  );
}

function Column({ data, positive }) {
  const icons = positive ? WITH_ICONS : WITHOUT_ICONS;
  return (
    <Reveal className="h-full" x={positive ? 30 : -30} y={0} delay={positive ? 0.1 : 0}>
      <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 transition-shadow duration-500', positive ? 'shadow-xl shadow-brand/15 ring-brand/20 hover:shadow-2xl hover:shadow-brand/20' : 'ring-brand/10 hover:shadow-lg')}>
        <header className={cn('relative flex items-center gap-4 overflow-hidden px-6 py-5', positive ? 'is-dark bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 text-white' : 'bg-[#f8f5ef]')}>
          {positive && <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />}
          <span className={cn('relative grid size-11 shrink-0 place-items-center rounded-xl', positive ? 'bg-white/15 text-white ring-1 ring-white/20' : 'bg-down/10 text-down')}>{positive ? <Check className="size-5" strokeWidth={3} /> : <X className="size-5" strokeWidth={3} />}</span>
          <span className="relative">
            <span className="block text-lg font-semibold">{data.title}</span>
            <span className={cn('block text-sm', positive ? 'text-white/70' : 'text-ink/55')}>{data.sub}</span>
          </span>
        </header>

        <div className={cn('border-b px-6 py-4', positive ? 'border-brand/10 bg-brand-50/40' : 'border-brand/10 bg-[#fcfbf8]')}>
          <UptimeStrip broken={!positive} />
        </div>

        <Stagger as="ul" className="flex-1 divide-y divide-brand/10" stagger={0.08}>
          {data.points.map((p, i) => {
            const Icon = icons[i % icons.length];
            return (
              <StaggerItem as="li" key={p} className="flex items-start gap-3.5 px-6 py-4 text-[15px] leading-relaxed text-ink/70 transition-colors hover:bg-brand-50/40">
                <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg', positive ? 'bg-brand-50 text-brand' : 'bg-down/5 text-down/80')}>
                  <Icon className="size-4" />
                </span>
                {p}
              </StaggerItem>
            );
          })}
        </Stagger>
      </article>
    </Reveal>
  );
}

export function Compare() {
  const t = useTranslations('vpsHostingPage.compare');
  return (
    <section id="why-vps" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-20 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <div className="relative mt-12 grid gap-6 md:mt-14 lg:grid-cols-2 lg:gap-8">
          <Column data={t.raw('without')} />
          <Column data={t.raw('with')} positive />
          <motion.span className="absolute left-1/2 top-1/2 z-10 hidden size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-black tracking-wider text-brand shadow-xl shadow-brand/20 ring-1 ring-brand/10 lg:grid" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.4 }} aria-hidden>
            VS
          </motion.span>
        </div>
      </div>
    </section>
  );
}
