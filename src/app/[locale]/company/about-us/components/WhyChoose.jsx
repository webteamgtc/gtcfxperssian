'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Zap, BadgeDollarSign, ShieldCheck, MonitorSmartphone, Headset } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

const ICONS = { execution: Zap, pricing: BadgeDollarSign, compliance: ShieldCheck, platforms: MonitorSmartphone, service: Headset };
// bento placement on large screens
const SPAN = {
  execution: 'lg:col-span-7',
  pricing: 'lg:col-span-5',
  compliance: 'lg:col-span-4',
  platforms: 'lg:col-span-4',
  service: 'lg:col-span-4'
};

/** Execution pulse: a bar racing across under 10ms. */
function SpeedLine() {
  return (
    <div className="relative mt-6 h-14 overflow-hidden rounded-2xl bg-[#f3f5fb] ring-1 ring-brand/10" aria-hidden>
      <div className="bg-grid-light absolute inset-0 opacity-70" />
      <motion.span className="absolute inset-y-3 start-3 w-24 rounded-xl bg-gradient-to-r from-brand/0 via-brand/50 to-gold" animate={{ x: ['-30%', '480%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: [0.7, 0, 0.3, 1], repeatDelay: 0.6 }} />
      <span className="absolute inset-y-0 end-4 my-auto h-2 w-2 rounded-full bg-up shadow-[0_0_10px_rgba(22,163,74,0.8)]" />
    </div>
  );
}

export function WhyChoose() {
  const t = useTranslations('aboutUsPage.why');
  const items = t.raw('items');
  return (
    <section id="why" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-20 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-12" stagger={0.08}>
          {items.map((it) => {
            const Icon = ICONS[it.id] ?? Zap;
            const featured = it.id === 'pricing';
            return (
              <StaggerItem key={it.id} className={cn('h-full', SPAN[it.id], (it.id === 'execution' || it.id === 'service') && 'md:col-span-2 lg:col-span-4', it.id === 'execution' && 'lg:col-span-7')}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-[2rem] p-7 transition-shadow duration-500 md:p-8',
                    featured ? 'is-dark bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 text-white shadow-xl shadow-brand/25' : 'border border-brand/10 bg-white shadow-sm hover:shadow-2xl hover:shadow-brand/10'
                  )}
                >
                  {featured && <span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-[80px]" aria-hidden />}
                  <span className={cn('relative grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110', featured ? 'bg-white/10 text-gold-200 ring-1 ring-white/15' : 'bg-brand-50 text-brand ring-1 ring-brand/10')}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className={cn('relative mt-6', it.id === 'execution' ? 'heading-title' : 'heading-card')}>{it.title}</h3>
                  <p className={cn('relative mt-3 text-[15px] leading-relaxed', featured ? 'text-white/70' : 'text-ink/60')}>{it.text}</p>

                  {it.id === 'execution' && <SpeedLine />}
                  {it.stats && (
                    <div className="relative mt-6 grid grid-cols-3 gap-4 border-t border-brand/10 pt-6">
                      {it.stats.map((s) => (
                        <div key={s.label}>
                          <div dir="ltr" className="heading-accent text-start text-2xl font-bold md:text-3xl rtl:text-end">
                            {s.value}
                          </div>
                          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {it.note && <div className={cn('relative mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.18em]', featured ? 'text-gold-200' : 'text-brand')}>{it.note}</div>}
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
