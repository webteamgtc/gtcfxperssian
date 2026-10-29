'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import { Flag } from './Flag';

function CopyNumber({ value, t }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(value).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        })
      }
      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand opacity-0 transition-all hover:bg-brand hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
    >
      {done ? <Check className="size-3" /> : <Copy className="size-3" />}
      {done ? t('copied') : t('copy')}
    </button>
  );
}

/** White section: one "register extract" card per entity, with a link to the regulator's register. */
export function RegEntities() {
  const t = useTranslations('regulationsPage.entities');
  const items = t.raw('items');
  const labels = t.raw('labels');
  return (
    <section id="entities" className="relative scroll-mt-24 overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-16 size-[440px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {items.map((e) => (
            <StaggerItem key={e.id} className="h-full">
              <motion.article
                id={`entity-${e.id}`}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-brand/10 target:ring-2 target:ring-gold"
              >
                {/* header band with a large faded flag */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#f3f5fb] to-[#e8ebf5] px-6 pb-5 pt-6 md:px-7">
                  <Flag code={e.code} className="pointer-events-none absolute -end-6 -top-4 h-28 w-[168px] rotate-[-8deg] opacity-[0.12] ring-0" />
                  <div className="relative flex items-center justify-between">
                    <Flag code={e.code} title={e.country} className="h-7 w-[42px]" />
                    <span dir="ltr" className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand shadow-sm ring-1 ring-brand/10">
                      {e.short}
                    </span>
                  </div>
                  <p className="relative mt-4 text-xs font-medium text-ink/50">
                    {e.country} · {e.city}
                  </p>
                  <h3 className="heading-card relative mt-1">
                    <bdi>{e.name}</bdi>
                  </h3>
                </div>
                <dl className="flex-1 divide-y divide-dashed divide-brand/10 px-6 md:px-7">
                  {e.rows.map((r) => (
                    <div key={r.id} className="grid grid-cols-[7.5rem_1fr] gap-3 py-3 text-sm">
                      <dt className="text-ink/45">{labels[r.id]}</dt>
                      <dd className="min-w-0 break-words font-semibold leading-snug text-ink/85">
                        <bdi>{r.value}</bdi>
                        {r.id === 'licence' && (
                          <span className="ms-2 align-middle">
                            <CopyNumber value={r.value} t={t} />
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-2 border-t border-brand/10 px-6 py-4 md:px-7">
                  {e.registerUrl ? (
                    <a href={e.registerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-gold-700">
                      {t('verify', { regulator: e.short })}
                      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                    </a>
                  ) : (
                    <span className={cn('text-sm font-medium text-ink/40')}>{t('verifySoon')}</span>
                  )}
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
