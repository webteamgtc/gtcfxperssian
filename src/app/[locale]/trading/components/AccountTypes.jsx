'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Building2, Gauge, Percent, Scale, Wallet, Zap } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const ROW_ICONS = [Wallet, Scale, Gauge, Percent, Zap, Building2];
const LEVERAGE_ROW = 1;

/** Account Types: the two account cards (same design as the homepage accounts) + a "show only differences" switch. */
export function AccountTypes() {
  const t = useTranslations('tradingPage.accountTypes');
  const rows = t.raw('rows');
  const accounts = t.raw('accounts');
  const [diffOnly, setDiffOnly] = useState(false);

  const visible = rows.map((label, r) => ({ label, r })).filter(({ r }) => !diffOnly || new Set(accounts.map((a) => a.values[r])).size > 1);

  return (
    <section id="accounts" className="relative overflow-hidden bg-[#eef0f5] py-10 text-ink md:py-16">
      <div className="container-x relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal y={16} className="max-w-xl">
            <h2 className="heading-section">
              <span className="heading-accent">{t('title')}</span>
            </h2>
          </Reveal>
          <Reveal y={12} delay={0.1} className="max-w-md lg:pb-1">
            <p className="text-[15px] leading-relaxed text-ink/55 md:text-base">{t('description')}</p>
            <button type="button" role="switch" aria-checked={diffOnly} onClick={() => setDiffOnly((v) => !v)} className="mt-5 inline-flex items-center gap-3 text-sm font-medium text-brand">
              <span className={cn('relative h-6 w-11 rounded-full transition-colors duration-300', diffOnly ? 'bg-brand' : 'bg-ink/15')}>
                <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow', diffOnly ? 'end-0.5' : 'start-0.5')} />
              </span>
              {t('toggle')}
            </button>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-7">
          {accounts.map((acc, i) => {
            const standard = i === 0;
            return (
              <Reveal key={acc.id} delay={i * 0.1} y={32}>
                <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white shadow-[0_20px_50px_-24px_rgba(41,59,147,0.35)]">
                  <div className={cn('px-6 pb-7 pt-6 md:px-7 md:pt-7', standard ? 'bg-brand text-white' : 'bg-[#d4d8e1] text-ink')}>
                    <span className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', standard ? 'text-white/55' : 'text-ink/40')}>0{i + 1} / GTCFX</span>
                    <h3 className={cn('heading-title mt-4', standard && 'is-dark')}>{acc.name}</h3>
                    <div className={cn('mt-6 flex items-center gap-2 border-t pt-5', standard ? 'border-white/15' : 'border-brand/10')}>
                      <ArrowUp className={cn('size-4', standard ? 'text-white/70' : 'text-brand')} />
                      <span className={cn('text-sm font-medium', standard ? 'text-white/70' : 'text-ink/55')}>{t('upTo')}</span>
                      <strong dir="ltr" className={cn('ms-auto text-[2rem] font-bold leading-none', standard ? 'text-white' : 'text-brand')}>
                        {acc.values[LEVERAGE_ROW]}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col bg-white px-6 pb-6 pt-2 md:px-7 md:pb-7">
                    <dl className="flex-1">
                      <AnimatePresence initial={false}>
                        {visible.map(({ label, r }) => {
                          const RowIcon = ROW_ICONS[r % ROW_ICONS.length];
                          return (
                            <motion.div key={label} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                              <div className="flex items-center justify-between gap-4 border-b border-brand/10 py-4 text-sm">
                                <dt className="flex min-w-0 items-center gap-2.5 font-medium text-ink/55">
                                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f0f2f8] text-brand">
                                    <RowIcon className="size-4" strokeWidth={1.6} />
                                  </span>
                                  <span className="truncate">{label}</span>
                                </dt>
                                <dd className="text-end font-semibold text-ink">
                                  {r === LEVERAGE_ROW ? (
                                    <span dir="ltr" className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand ring-1 ring-brand/10">
                                      {acc.values[r]}
                                    </span>
                                  ) : (
                                    <bdi>{acc.values[r]}</bdi>
                                  )}
                                </dd>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </dl>
                    <LiveAccountButton look="button" account={`${acc.id}-account`} className="mt-5 w-full" variant={standard ? 'primary' : 'outline'} arrow={false}>
                      {acc.cta}
                    </LiveAccountButton>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
