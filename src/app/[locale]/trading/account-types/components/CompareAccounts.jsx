'use client';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useSpring } from 'motion/react';
import { Box, Check, Info, Layers, Minus, Sparkles } from 'lucide-react';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const ICONS = { standard: Box, ecn: Layers };

/** Account header card (top of each column). */
function AccountHead({ acc, featured, recommended, cta }) {
  const Icon = ICONS[acc.id] ?? Box;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('group relative h-full rounded-[1.75rem] border p-6 md:p-7', featured ? 'is-dark border-brand bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white shadow-2xl shadow-brand/30' : 'border-brand/10 bg-white shadow-xl shadow-brand/5')}
    >
      {featured && (
        <>
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden>
            <div className="bg-grid-dark absolute inset-0 opacity-40" />
            <motion.span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-[80px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} />
          </div>
          <motion.span className="absolute -top-3 end-6 inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1 text-xs font-semibold text-white shadow-lg shadow-gold/30" animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Sparkles className="size-3.5" />
            {recommended}
          </motion.span>
        </>
      )}
      <div className="relative flex items-center gap-4">
        <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl ring-1 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110', featured ? 'bg-white/10 text-white ring-white/20' : 'bg-brand-50 text-brand ring-brand/10')}>
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xl font-bold md:text-2xl">{acc.name}</h3>
          <p className={cn('mt-0.5 text-sm', featured ? 'text-white/70' : 'text-ink/55')}>{acc.tagline}</p>
        </div>
      </div>
      <LiveAccountButton look="button" account={`${acc.id}-account`} variant={featured ? 'gold' : 'primary'} className="relative mt-6 h-12 w-full text-[15px]">
        {cta}
      </LiveAccountButton>
    </motion.div>
  );
}

/** One comparison cell. Empty value renders a muted dash. */
function Cell({ value, featured, good, bad }) {
  if (!value)
    return (
      <span className="inline-flex items-center gap-2 text-ink/30">
        <Minus className="size-4" />
      </span>
    );
  return (
    <span className={cn('inline-flex items-start gap-2.5 text-sm font-medium md:text-[15px]', bad ? 'text-down' : good ? 'text-up' : 'text-ink/80')}>
      <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', bad ? 'bg-down/10 text-down' : featured ? 'bg-gold text-white' : 'bg-brand text-white')}>
        {bad ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
      </span>
      {value}
    </span>
  );
}

/**
 * Compare accounts: header cards, then a "key differences" table (only the rows that differ, so the
 * choice is obvious), then the features both accounts share as chips — no more two long identical lists.
 */
export function CompareAccounts() {
  const t = useTranslations('accountTypesPage.compare');
  const [std, ecn] = t.raw('accounts');
  const [hover, setHover] = useState(-1);

  const common = std.features.filter((f) => ecn.features.includes(f));
  const stdOnly = std.features.filter((f) => !common.includes(f));
  const ecnOnly = ecn.features.filter((f) => !common.includes(f));
  const rows = Array.from({ length: Math.max(stdOnly.length, ecnOnly.length) }, (_, i) => [stdOnly[i], ecnOnly[i]]);

  const tableRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: tableRef, offset: ['start 0.8', 'end 0.5'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="compare" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />

      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mx-auto mt-14 max-w-5xl">
          {/* account headers */}
          <Stagger className="grid grid-cols-2 gap-3 md:gap-6" stagger={0.12}>
            <StaggerItem>
              <AccountHead acc={std} featured recommended={t('recommended')} cta={t('cta')} />
            </StaggerItem>
            <StaggerItem>
              <AccountHead acc={ecn} cta={t('cta')} />
            </StaggerItem>
          </Stagger>

          {/* key differences */}
          <Reveal y={20} className="mt-6">
            <div ref={tableRef} className="relative overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white shadow-xl shadow-brand/5">
              <div className="flex items-center justify-between border-b border-brand/10 px-5 py-4 md:px-7">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brand">{t('differences')}</h3>
                <span className="relative h-1 w-24 overflow-hidden rounded-full bg-brand/10" aria-hidden>
                  <motion.span className="absolute inset-y-0 start-0 w-full origin-left rounded-full bg-gradient-to-r from-gold to-brand rtl:origin-right" style={{ scaleX: fill }} />
                </span>
              </div>
              <div role="table" aria-label={t('differences')}>
                {rows.map(([a, b], i) => (
                  <motion.div
                    key={i}
                    role="row"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(-1)}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.45, ease: EASE, delay: i * 0.05 }}
                    className={cn('relative grid grid-cols-2 border-b border-brand/5 last:border-b-0 transition-colors duration-300', hover === i && 'bg-brand-50/50')}
                  >
                    <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-brand/10" aria-hidden />
                    <div role="cell" className="relative px-5 py-4 md:px-7">
                      <Cell value={a} featured />
                    </div>
                    <div role="cell" className="relative px-5 py-4 md:px-7">
                      <Cell value={b} />
                    </div>
                  </motion.div>
                ))}
                {/* swap-free row */}
                <div role="row" className="grid grid-cols-2 bg-[#f6f7fb]">
                  {[std, ecn].map((acc) => (
                    <div key={acc.id} role="cell" className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm md:px-7">
                      <span className="text-ink/55">{t('swapLabel')}</span>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-bold', acc.swapAvailable ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>{acc.swap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* shared features */}
          <Reveal y={20} delay={0.05} className="mt-6">
            <div className="rounded-[1.75rem] border border-brand/10 bg-white p-5 shadow-sm md:p-7">
              <h3 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.18em] text-brand">
                <span className="flex -space-x-1.5" aria-hidden>
                  <span className="grid size-6 place-items-center rounded-full bg-brand text-white ring-2 ring-white">
                    <Box className="size-3" />
                  </span>
                  <span className="grid size-6 place-items-center rounded-full bg-gold text-white ring-2 ring-white">
                    <Layers className="size-3" />
                  </span>
                </span>
                {t('shared')}
              </h3>
              <Stagger className="mt-5 flex flex-wrap gap-2" stagger={0.04}>
                {common.map((f) => (
                  <StaggerItem key={f}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-[#f6f7fb] px-3.5 py-2 text-sm text-ink/75 transition-colors duration-300 hover:border-brand/30 hover:bg-brand-50">
                      <Check className="size-3.5 text-up" strokeWidth={3} />
                      {f}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Reveal>

          {/* footnote + notice */}
          <Reveal y={12} className="mt-8 space-y-4">
            <p className="text-center text-sm text-brand">{t('footnote')}</p>
            <div className="flex gap-4 rounded-2xl border border-gold/30 bg-gold-50/60 p-5 md:p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-700">
                <Info className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-brand-900">{t('noticeTitle')}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/65">{t('notice')}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
