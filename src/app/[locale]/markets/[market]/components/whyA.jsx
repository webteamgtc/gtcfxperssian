'use client';
/** Template A "Why trade … with GTCFX?" Copy: pages.<id>.why (cards ×4 + panel). */
import { motion } from 'motion/react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { usePageT, Icon } from './shared';

function Chips({ chips, dark = false }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {chips.map((c) => (
        <span key={c.label} className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold', dark ? 'bg-white/10 text-white ring-1 ring-white/15' : 'bg-brand-50 text-brand')}>
          <Icon name={c.icon} className="size-4" />
          {c.label}
        </span>
      ))}
    </div>
  );
}

/** Hub — the big stat in a pulsing ring at the centre, the four benefits on both sides with connector lines that draw in. */
export function WhyHubA() {
  const t = usePageT();
  const cards = t.raw('why.cards');
  const panel = t.raw('why.panel');
  const side = (list, end) => (
    <Stagger className="grid gap-5" stagger={0.12}>
      {list.map((c) => (
        <StaggerItem key={c.title}>
          <div className={cn('relative rounded-3xl bg-white p-6 ring-1 ring-brand/10', end ? 'lg:text-start' : 'lg:text-end')}>
            <span className={cn('grid size-11 place-items-center rounded-xl bg-brand-50 text-brand', end ? '' : 'lg:ms-auto')}>
              <Icon name={c.icon} className="size-5" />
            </span>
            <h3 className="heading-card mt-4" dir="ltr">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{c.text}</p>
            <motion.span className={cn('absolute top-1/2 hidden h-px w-10 bg-gradient-to-r from-brand/40 to-gold lg:block', end ? '-start-10 origin-right' : '-end-10 origin-left')} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4, ease: EASE }} aria-hidden />
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
  return (
    <section className="relative overflow-hidden bg-[#f6f7fb] py-14 text-ink md:py-24">
      <div className="container-x">
        <SectionIntro title={t('why.title')} description={t('why.description')} />
        <div className="mt-12 grid items-center gap-10 md:mt-16 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
          {side(cards.slice(0, 2), false)}
          <Reveal y={20} className="mx-auto">
            <div className="relative grid size-72 place-items-center md:size-80">
              {[0, 1, 2].map((k) => (
                <motion.span key={k} className="absolute inset-0 rounded-full border border-brand/20" animate={{ scale: [0.85, 1.1], opacity: [0.7, 0] }} transition={{ duration: 3.6, repeat: Infinity, delay: k * 1.2, ease: 'easeOut' }} aria-hidden />
              ))}
              <div className="relative grid size-60 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-900 p-6 text-center text-white shadow-[0_30px_80px_-30px_rgba(41,59,147,0.8)] md:size-64">
                <div>
                  <p className="text-4xl font-bold tracking-tight text-gold-200 md:text-5xl" dir="ltr">{panel.stat.value}</p>
                  <p className="mt-2 text-sm font-semibold">{panel.stat.label}</p>
                  <p className="mt-1 text-xs text-white/55">{panel.stat.sub}</p>
                </div>
              </div>
            </div>
          </Reveal>
          {side(cards.slice(2), true)}
        </div>
        <Reveal y={16} className="mx-auto mt-12 max-w-3xl text-center">
          <h3 className="heading-card">{panel.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{panel.text}</p>
          <div className="flex justify-center">
            <Chips chips={panel.chips} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
