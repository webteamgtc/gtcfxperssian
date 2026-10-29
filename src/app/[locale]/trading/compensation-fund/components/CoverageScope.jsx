'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Ban, BadgeEuro, Building2, Check, FileCheck2, Gavel, ShieldCheck, ShieldX, TrendingDown, X } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

const COVERED_ICONS = [FileCheck2, Gavel, BadgeEuro];
const EXCLUDED_ICONS = [TrendingDown, Building2, Ban];

/** Center medallion: half green / half red shield with a turning ring (desktop). */
function Medallion() {
  return (
    <div dir="ltr" className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block" aria-hidden>
      <motion.span className="absolute -inset-4 rounded-full border-2 border-dashed border-brand/20" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
      <motion.div initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }} className="relative grid size-20 place-items-center overflow-hidden rounded-full bg-white shadow-2xl shadow-brand/20 ring-4 ring-white">
        <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#22c55e] to-[#15803d]" />
        <span className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br from-[#ef4444] to-[#b91c1c]" />
        <ShieldCheck className="relative size-9 text-white" strokeWidth={1.6} />
      </motion.div>
    </div>
  );
}

function Column({ title, items, icons, positive }) {
  const Head = positive ? ShieldCheck : ShieldX;
  const Mark = positive ? Check : X;
  return (
    <div className={cn('relative p-6 md:p-10', positive ? 'bg-gradient-to-br from-up/[0.06] via-white to-white md:pe-16' : 'bg-gradient-to-bl from-down/[0.06] via-white to-white md:ps-16')}>
      <div className="flex items-center gap-3.5">
        <span className={cn('grid size-12 place-items-center rounded-2xl text-white shadow-lg', positive ? 'bg-gradient-to-br from-[#22c55e] to-[#15803d] shadow-up/25' : 'bg-gradient-to-br from-[#ef4444] to-[#b91c1c] shadow-down/25')}>
          <Head className="size-6" />
        </span>
        <h3 className={cn('text-2xl font-bold', positive ? 'text-[#15803d]' : 'text-down')}>{title}</h3>
      </div>

      <ul className="mt-7 space-y-3">
        {items.map((it, i) => {
          const Icon = icons[i % icons.length];
          return (
            <motion.li
              key={it}
              initial={{ opacity: 0, x: positive ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={cn('group flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg', positive ? 'border-up/15 hover:border-up/40 hover:shadow-up/10' : 'border-down/15 hover:border-down/40 hover:shadow-down/10')}
            >
              <span className={cn('relative grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-500 group-hover:-rotate-6', positive ? 'bg-up/10 text-[#15803d]' : 'bg-down/10 text-down')}>
                <Icon className="size-5" />
                <motion.span className={cn('absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full text-white ring-2 ring-white', positive ? 'bg-up' : 'bg-down')} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 320, damping: 15, delay: 0.5 + i * 0.12 }}>
                  <Mark className="size-3" strokeWidth={3} />
                </motion.span>
              </span>
              <span className="text-[15px] leading-relaxed text-ink/75">{it}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** Covered vs not covered in one split card, joined by a half-green / half-red shield medallion. */
export function CoverageScope() {
  const t = useTranslations('compensationFundPage.scope');
  return (
    <section id="scope" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Reveal y={24} className="mt-12 md:mt-14">
          <div className="relative grid overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-[0_40px_100px_-50px_rgba(41,59,147,0.45)] md:grid-cols-2">
            <span className="pointer-events-none absolute inset-y-8 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-brand/15 to-transparent md:block" aria-hidden />
            <Column title={t('coveredTitle')} items={t.raw('covered')} icons={COVERED_ICONS} positive />
            <div className="border-t border-brand/10 md:border-t-0">
              <Column title={t('excludedTitle')} items={t.raw('excluded')} icons={EXCLUDED_ICONS} />
            </div>
            <Medallion />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
