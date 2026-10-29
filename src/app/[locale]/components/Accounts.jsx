'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';
import { ACCOUNT_KEYS, ACCOUNT_DETAIL_KEYS, ACCOUNT_DETAIL_ICONS } from './accounts.constants';
import { AccountsCompareDialog } from './AccountsCompareDialog';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

export function Accounts() {
  const t = useTranslations('accounts');
  const [compare, setCompare] = useState(false);
  const accIds = ['standard', 'ecn'];
  const labels = ACCOUNT_KEYS.map((k) => t(`labels.${k}`));
  const items = accIds.map((id) => ({
    id,
    name: t(`${id}.name`),
    description: t(`${id}.desc`),
    values: Object.fromEntries(ACCOUNT_KEYS.map((k) => [t(`labels.${k}`), t(`${id}.${k}`)]))
  }));

  return (
    <section id="accounts" className="relative overflow-hidden bg-[#eef0f5] py-10 text-ink md:py-16">
      <div className="container-x relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal y={16} className="max-w-xl">
            <h2 className="heading-section">
              {t('titleA')}
              <br />
              <span className="heading-accent">{t('titleB')}</span>
            </h2>
          </Reveal>
          <Reveal y={12} delay={0.1} className="max-w-md lg:pb-1">
            <p className="text-[15px] leading-relaxed text-ink/55 md:text-base">{t('subtitle')}</p>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-7">
          {items.map((item, i) => {
            const spreadsRaw = item.values[labels[1]] ?? '';
            const spreadParts = spreadsRaw.split(' ');
            const spreadAmount = spreadParts[0] ?? spreadsRaw;
            const spreadUnit = spreadParts.slice(1).join(' ');
            const standard = item.id === 'standard';
            return (
              <Reveal key={item.id} delay={i * 0.1} y={32}>
                <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white shadow-[0_20px_50px_-24px_rgba(41,59,147,0.35)]">
                  <div
                    className={cn(
                      'px-6 pb-7 pt-6 md:px-7 md:pt-7',
                      standard ? 'bg-brand text-white' : 'bg-[#d4d8e1] text-ink'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-[0.18em]',
                          standard ? 'text-white/55' : 'text-ink/40'
                        )}
                      >
                        0{i + 1} / GTCFX
                      </span>
                      {standard && (
                        <span className="rounded-full border border-white/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {t('recommended')}
                        </span>
                      )}
                    </div>
                    <h3 className={cn('heading-title mt-4', standard && 'is-dark')}>
                      {item.name}
                    </h3>
                    <p
                      className={cn(
                        'mt-2 max-w-[95%] text-[13px] leading-relaxed md:text-sm',
                        standard ? 'text-white/75' : 'text-ink/55'
                      )}
                    >
                      {item.description}
                    </p>
                    <div
                      className={cn(
                        'mt-6 grid grid-cols-2 gap-4 border-t pt-5',
                        standard ? 'border-white/15' : 'border-brand/10'
                      )}
                    >
                      <div>
                        <span className={cn('text-xs font-medium', standard ? 'text-white/55' : 'text-ink/45')}>{labels[1]}</span>
                        <div className="mt-1 flex items-baseline gap-1" dir="ltr">
                          <strong className={cn('text-[2rem] font-bold leading-none', standard ? 'text-white' : 'text-brand')}>
                            {spreadAmount}
                          </strong>
                          {spreadUnit && (
                            <span className={cn('text-sm font-medium', standard ? 'text-white/70' : 'text-gold-600')}>{spreadUnit}</span>
                          )}
                        </div>
                      </div>
                      <div className={cn('border-s ps-4', standard ? 'border-white/15' : 'border-brand/10')}>
                        <span className={cn('text-xs font-medium', standard ? 'text-white/55' : 'text-ink/45')}>{labels[2]}</span>
                        <strong
                          className={cn('mt-1 block text-[2rem] font-bold leading-none', standard ? 'text-white' : 'text-ink')}
                          dir="ltr"
                        >
                          {item.values[labels[2]]}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col bg-white px-6 pb-6 pt-2 md:px-7 md:pb-7">
                    <dl className="flex-1">
                      {ACCOUNT_DETAIL_KEYS.map((key, row) => {
                        const DetailIcon = ACCOUNT_DETAIL_ICONS[row];
                        const label = t(`labels.${key}`);
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 border-b border-brand/10 py-4 text-sm last:border-b-0"
                          >
                            <dt className="flex min-w-0 flex-1 items-center gap-2.5 font-medium text-ink/55">
                              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f0f2f8] text-brand">
                                <DetailIcon className="size-4" strokeWidth={1.6} />
                              </span>
                              <span className="truncate">{label}</span>
                            </dt>
                            <dd className="shrink-0 font-semibold text-ink">
                              <bdi>{item.values[label]}</bdi>
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                    <LiveAccountButton look="button" account={`${item.id}-account`} size="lg" className="mt-5 w-full" variant={standard ? 'primary' : 'outline'} arrow={false}>
                      {t('open')}
                    </LiveAccountButton>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setCompare(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand underline decoration-gold decoration-2 underline-offset-[6px] transition hover:text-brand-700"
          >
            <SlidersHorizontal className="size-4" strokeWidth={2} aria-hidden />
            {t('compare')}
          </button>
        </Reveal>
      </div>

      <AccountsCompareDialog open={compare} onOpenChange={setCompare} t={t} items={items} labels={labels} />
    </section>
  );
}
