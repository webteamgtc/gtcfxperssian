'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Gem, Network } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { CountUp, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const ICONS = { standard: Network, ecn: Gem };
const SWAP_ROW = 4;

/** Choose your account: featured navy Standard card next to a light ECN card. */
export function ChooseAccount() {
  const t = useTranslations('openLiveAccountPage.accounts');
  const rows = t.raw('rows');
  const items = t.raw('items');

  return (
    <section id="accounts" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />

      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8" stagger={0.12}>
          {items.map((acc, i) => {
            const featured = i === 0;
            const Icon = ICONS[acc.id] ?? Network;
            const num = Number(String(acc.deposit).replace(/[^\d.]/g, ''));
            return (
              <StaggerItem key={acc.id} className="h-full">
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className={cn(
                    'group relative flex h-full flex-col rounded-[2rem] border p-7 md:p-8',
                    featured ? 'is-dark border-brand bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white shadow-2xl shadow-brand/30' : 'border-brand/10 bg-white shadow-[0_20px_50px_-24px_rgba(41,59,147,0.28)] hover:border-brand/25 hover:shadow-2xl hover:shadow-brand/10'
                  )}
                >
                  {featured && (
                    <>
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden>
                        <div className="bg-grid-dark absolute inset-0 opacity-50" />
                        <motion.span className="absolute -end-20 -top-20 size-64 rounded-full bg-gold/25 blur-[90px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} />
                      </div>
                      <motion.span className="absolute -top-3.5 end-8 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-gold/30" animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                        {t('recommended')}
                      </motion.span>
                    </>
                  )}

                  <div className="relative">
                    <span className={cn('grid size-12 place-items-center rounded-2xl ring-1 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110', featured ? 'bg-white/10 text-white ring-white/20' : 'bg-brand-50 text-brand ring-brand/10')}>
                      <Icon className="size-5" />
                    </span>
                    <h3 className={cn('heading-title mt-6', featured && 'is-dark')}>{acc.name}</h3>
                    <p className={cn('mt-1 text-sm', featured ? 'text-white/70' : 'text-ink/55')}>{acc.tagline}</p>
                    <div className="mt-6 flex items-baseline gap-2">
                      <span dir="ltr" className="text-4xl font-bold tracking-tight">
                        $<CountUp value={num} />
                      </span>
                      <span className={cn('text-sm', featured ? 'text-white/65' : 'text-ink/55')}>{t('minDeposit')}</span>
                    </div>
                  </div>

                  <dl className="relative mt-6 flex-1">
                    {rows.map((label, r) => {
                      const v = acc.values[r];
                      const swap = r === SWAP_ROW;
                      return (
                        <div key={label} className={cn('flex items-center justify-between gap-4 border-b border-dashed py-3.5 text-sm last:border-b-0', featured ? 'border-white/15' : 'border-brand/10')}>
                          <dt className={featured ? 'text-white/70' : 'text-ink/55'}>{label}</dt>
                          <dd dir="ltr" className={cn('font-semibold', swap ? (acc.swap ? 'text-[#4ade80]' : 'text-down') : featured ? 'text-white' : 'text-ink')}>
                            {v}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>

                  <LiveAccountButton look="button" account={`${acc.id}-account`} variant={featured ? 'gold' : 'outline'} className="relative mt-7">
                    {t('cta')}
                  </LiveAccountButton>
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal y={12} delay={0.15} className="mt-12 flex justify-center">
          <ArrowLink href="/trading#accounts">{t('compare')}</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
