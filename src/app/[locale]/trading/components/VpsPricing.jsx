'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, Clock, Headphones, LockKeyhole, ShieldCheck } from 'lucide-react';

import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { ServerRack } from './tradingVisuals';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const BADGE_ICONS = { setup: Clock, uptime: ShieldCheck, support: Headphones, root: LockKeyhole };

/** VPS plans: three pricing cards, the middle one featured on navy; each with a live server rack. */
export function VpsPricing() {
  const t = useTranslations('tradingPage.vpsPricing');
  const badges = t.raw('badges');
  const plans = t.raw('plans');

  return (
    <section id="vps" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />

      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('subtitle')} />

        <Stagger className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4" stagger={0.06}>
          {badges.map(({ id, label }) => {
            const Icon = BADGE_ICONS[id] ?? ShieldCheck;
            return (
              <StaggerItem key={id} className="group flex items-center gap-3 rounded-2xl border border-brand/10 bg-[#f6f7fb] px-4 py-3 transition-colors duration-500 hover:border-brand/25 hover:bg-white">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-brand-900">{label}</span>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Stagger className="mt-12 grid items-stretch gap-6 md:mt-14 lg:grid-cols-3 lg:gap-7" stagger={0.1}>
          {plans.map((plan, i) => {
            const featured = i === 1;
            return (
              <StaggerItem key={plan.id} className="h-full">
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-2 transition-shadow duration-500',
                    featured
                      ? 'is-dark border-brand bg-gradient-to-br from-brand-700 via-brand-900 to-brand-950 text-white shadow-2xl shadow-brand/30 lg:-my-3'
                      : 'border-brand/10 bg-white shadow-[0_20px_50px_-24px_rgba(41,59,147,0.28)] hover:border-brand/25 hover:shadow-2xl hover:shadow-brand/10'
                  )}
                >
                  {featured && (
                    <>
                      <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
                      <motion.span className="absolute -end-20 -top-20 size-64 rounded-full bg-gold/25 blur-[90px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
                      <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
                    </>
                  )}

                  {/* stage: plan name + price beside a live server rack */}
                  <div className={cn('relative flex items-center justify-between gap-4 overflow-hidden rounded-[1.6rem] p-5 md:p-6', featured ? 'bg-white/[0.06] ring-1 ring-white/10' : 'bg-gradient-to-br from-[#f3f5fb] to-[#eaedf6]')}>
                    {!featured && <div className="bg-grid-light absolute inset-0 opacity-70" aria-hidden />}
                    <div className="relative">
                      <p className={cn('text-xs font-bold tracking-[0.18em]', featured ? 'text-gold-200' : 'text-gold-700')}>{plan.name}</p>
                      <div className="mt-2 flex items-end gap-1" dir="ltr">
                        <span className={cn('text-4xl font-bold tracking-tight', featured ? 'text-white' : 'text-ink')}>${plan.price}</span>
                        <span className={cn('pb-1.5 text-sm font-medium', featured ? 'text-white/55' : 'text-ink/45')}>{t('perMonth')}</span>
                      </div>
                    </div>
                    <div className="relative w-28 shrink-0 transition-transform duration-700 group-hover:-translate-y-1">
                      <ServerRack units={i + 2} dark={featured} />
                    </div>
                  </div>

                  <div className="relative flex flex-1 flex-col px-5 pb-6 pt-5 md:px-6">
                    <p className={cn('min-h-[3rem] text-sm leading-relaxed', featured ? 'text-white/70' : 'text-ink/55')}>{plan.description}</p>
                    <ul className={cn('mt-5 flex-1 space-y-3 border-t pt-5', featured ? 'border-white/10' : 'border-brand/10')}>
                      {plan.features.map((line) => (
                        <li key={line} className={cn('flex items-start gap-2.5 text-sm', featured ? 'text-white/80' : 'text-ink/70')}>
                          <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', featured ? 'bg-gold text-white' : 'bg-brand text-white')}>
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          <span className={line.startsWith('FREE') ? cn('font-semibold', featured ? 'text-gold-200' : 'text-brand') : ''}>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <LiveAccountButton variant={featured ? 'gold' : 'primary'} className="w-full justify-between">
                        {t('subscribe')}
                      </LiveAccountButton>
                      <p className={cn('mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.12em]', featured ? 'text-white/40' : 'text-ink/40')}>{t('vatNote')}</p>
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
