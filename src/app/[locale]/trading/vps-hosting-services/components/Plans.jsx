'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, Cpu, FileCode2, HardDrive, MemoryStick, Monitor, Sparkles } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const ICONS = { cpu: Cpu, ram: MemoryStick, ssd: HardDrive, os: Monitor, mt: FileCode2 };

/** Leading number of a spec ("2,560MB RAM" → 2560, "4 vCPU" → 4). */
const num = (s) => parseFloat(String(s).replace(/,/g, '')) || 0;

/**
 * Three plan cards. Numeric specs (vCPU, RAM, SSD) get capacity bars relative to the biggest plan.
 * "Subscribe Now" preselects the package in the application form and scrolls to it.
 */
export function Plans({ onSelect }) {
  const t = useTranslations('vpsHostingPage.plans');
  const plans = t.raw('items');
  const max = Object.fromEntries(['cpu', 'ram', 'ssd'].map((k) => [k, Math.max(...plans.map((p) => num(p.features.find((f) => f.icon === k)?.value)))]));

  const choose = (id) => {
    onSelect?.(id);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="plans" className="relative scroll-mt-24 overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid items-stretch gap-6 md:mt-16 lg:grid-cols-3" stagger={0.12}>
          {plans.map((p) => {
            const pop = !!p.popular;
            return (
              <StaggerItem key={p.id} className={cn('h-full', pop && 'lg:-my-4')}>
                <motion.article whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className={cn('group relative flex h-full flex-col rounded-[2rem] bg-white p-6 shadow-sm ring-1 transition-shadow duration-500 hover:shadow-2xl md:p-7', pop ? 'shadow-xl shadow-gold/15 ring-2 ring-gold/70 hover:shadow-gold/25' : 'ring-brand/10 hover:shadow-brand/15')}>
                  {pop && (
                    <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gold px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-gold/30">
                      <Sparkles className="size-3.5" />
                      {t('popular')}
                    </span>
                  )}
                  <span className={cn('absolute -end-16 -top-16 size-40 rounded-full blur-3xl transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-100', pop ? 'bg-gold/20' : 'bg-brand/10')} aria-hidden />

                  <div className="relative">
                    <div className={cn('text-xs font-bold uppercase tracking-[0.24em]', pop ? 'text-gold-700' : 'text-brand')}>{p.tier}</div>
                    <h3 className="mt-1 text-2xl font-bold text-ink">{p.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span dir="ltr" className={cn('text-4xl font-bold tracking-tight', pop ? 'text-gold-700' : 'text-brand')}>
                        {p.price}
                      </span>
                      <span className="text-sm text-ink/50">{t('perMonth')}</span>
                    </div>
                    <div className="mt-4 flex items-start gap-2 rounded-2xl bg-up/[0.07] px-4 py-3 text-sm font-medium text-up ring-1 ring-up/20">
                      <Check className="mt-0.5 size-4 shrink-0" strokeWidth={3} />
                      {p.free}
                    </div>
                  </div>

                  <ul className="relative mt-5 flex-1 divide-y divide-dashed divide-brand/10">
                    {p.features.map((f, i) => {
                      const Icon = ICONS[f.icon] ?? Check;
                      const scale = max[f.icon] ? num(f.value) / max[f.icon] : null;
                      return (
                        <li key={f.icon} className="flex items-center gap-3.5 py-3.5">
                          <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl ring-1 transition-colors duration-500', pop ? 'bg-gold/10 text-gold-700 ring-gold/20' : 'bg-brand-50 text-brand ring-brand/10 group-hover:bg-brand group-hover:text-white')}>
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold text-ink">{f.value}</span>
                            <span className="block text-xs text-ink/50">{f.label}</span>
                          </span>
                          {scale !== null && (
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-brand/10" aria-hidden>
                              <motion.span className={cn('block h-full rounded-full', pop ? 'bg-gradient-to-r from-gold-200 to-gold' : 'bg-gradient-to-r from-brand-300 to-brand')} initial={{ width: 0 }} whileInView={{ width: `${Math.max(12, scale * 100)}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: EASE }} />
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className={cn('relative mt-5 rounded-2xl px-4 py-3.5 text-sm', pop ? 'bg-gold/10 text-gold-700' : 'bg-brand-50 text-brand')}>
                    <div className="font-semibold">{t('thresholdTitle')}</div>
                    <p className="mt-1 opacity-80">{p.threshold}</p>
                  </div>

                  <button type="button" onClick={() => choose(p.id)} className={cn('shine relative mt-5 flex h-12 items-center justify-center rounded-xl text-[15px] font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5', pop ? 'bg-gold shadow-gold/30 hover:bg-gold-600' : 'bg-brand shadow-brand/25 hover:bg-brand-700')}>
                    {t('subscribe')}
                  </button>
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
