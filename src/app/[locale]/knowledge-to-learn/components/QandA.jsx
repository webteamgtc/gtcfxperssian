'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { MessageCircleQuestion, Search } from 'lucide-react';

import FaqAccordion from '@/components/shared/FaqAccordion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

/** Searchable FAQ: navy panel with stats + CTA on the start side, the filtered accordion on the other. */
export function QandA() {
  const t = useTranslations('knowledgePage.qanda');
  const items = t.raw('items');
  const stats = t.raw('stats');
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((it) => `${it.q} ${it.a}`.toLowerCase().includes(s)) : items;
  }, [items, q]);

  return (
    <section id="faq" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -start-40 top-1/3 size-[420px] rounded-full bg-brand/[0.05] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} />
        <div className="mt-12 grid gap-6 md:mt-14 lg:grid-cols-[360px_1fr] lg:gap-8">
          <Reveal y={20}>
            <div className="is-dark relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-7 text-white shadow-xl shadow-brand/20">
              <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
              <motion.span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/20 blur-3xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15">
                <MessageCircleQuestion className="size-6" />
              </span>
              <h3 className="relative mt-5 text-xl font-semibold">{t('leftHeading')}</h3>
              <p className="relative mt-3 text-[15px] leading-relaxed text-white/65">{t('leftDesc')}</p>
              <div className="relative mt-6 grid grid-cols-3 gap-2">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/[0.06] px-2 py-3 text-center ring-1 ring-white/10">
                    <div dir="ltr" className="text-gradient-gold text-lg font-bold">
                      {s.value}
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">{s.label}</div>
                  </div>
                ))}
              </div>
              <LiveAccountButton variant="gold" className="relative mt-7">
                {t('openAccountCta')}
              </LiveAccountButton>
            </div>
          </Reveal>

          <div>
            <Reveal y={16}>
              <label className="relative block">
                <span className="sr-only">{t('searchPlaceholder')}</span>
                <Search className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-ink/35" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} className="h-14 w-full rounded-2xl border border-brand/15 bg-[#f6f7fb] ps-14 pe-5 text-[15px] text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10" />
              </label>
            </Reveal>
            {shown.length ? (
              <FaqAccordion key={q} items={shown} className="mt-5" />
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-brand/20 px-6 py-12 text-center text-sm text-ink/50">{t('noResults')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
