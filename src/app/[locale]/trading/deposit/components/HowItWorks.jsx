'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, FileDown, LogIn, MousePointerClick, WalletCards } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

const STEP_ICONS = [LogIn, MousePointerClick, WalletCards];

/** Three connected steps (a gold line draws across), then the flow strip with a travelling dot + tutorial link. */
export function HowItWorks() {
  const t = useTranslations('depositPage.how');
  const steps = t.raw('steps');
  const flow = t.raw('flow');

  return (
    <section id="how" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Reveal y={24} className="relative mt-12 md:mt-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-xl shadow-brand/5">
            {/* progress line across the top */}
            <div className="absolute inset-x-0 top-0 h-1 bg-brand/5" aria-hidden>
              <motion.span className="block h-full bg-gradient-to-r from-gold to-brand rtl:bg-gradient-to-l" initial={{ width: '0%' }} whileInView={{ width: '100%' }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.2 }} />
            </div>

            <Stagger className="grid divide-y divide-brand/10 md:grid-cols-3 md:divide-x md:divide-y-0 rtl:md:divide-x-reverse" stagger={0.2}>
              {steps.map((s, i) => {
                const Icon = STEP_ICONS[i % STEP_ICONS.length];
                return (
                  <StaggerItem key={s.title} className="group relative p-7 md:p-9">
                    <div className="flex items-center gap-2.5">
                      <motion.span className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white shadow-lg shadow-brand/25" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.4 + i * 0.5 }}>
                        {i + 1}
                      </motion.span>
                      <span className="text-sm font-semibold text-brand">{t('step')}</span>
                    </div>
                    <span className="relative mt-7 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                      <motion.span className="absolute inset-0 rounded-2xl ring-2 ring-gold/40" animate={{ scale: [1, 1.3], opacity: [0.7, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }} aria-hidden />
                      <Icon className="size-6" />
                    </span>
                    <h3 className="heading-card mt-7">{s.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{s.text}</p>
                    {i < steps.length - 1 && (
                      <span className="absolute -end-4 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-brand/10 bg-white text-brand shadow-sm md:grid" aria-hidden>
                        <ChevronRight className="size-4 rtl:-scale-x-100" />
                      </span>
                    )}
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </Reveal>

        {/* flow strip */}
        <Reveal y={16} delay={0.1} className="mt-5">
          <div className="flex flex-col gap-5 rounded-[1.5rem] border border-brand/10 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:p-6">
            <ol className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
              {flow.map((f, i) => {
                const last = i === flow.length - 1;
                return (
                  <li key={f} className="flex items-center gap-3">
                    <motion.span initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.25 }} className={cn('inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold', last ? 'bg-up/10 text-up' : 'bg-[#f4f6fb] text-ink')}>
                      <span className={cn('size-1.5 rounded-full', last ? 'bg-up' : 'bg-brand')} />
                      {f}
                    </motion.span>
                    {!last && (
                      <motion.span className="text-brand/40" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }} aria-hidden>
                        <ArrowRight className="size-4 rtl:-scale-x-100" />
                      </motion.span>
                    )}
                  </li>
                );
              })}
            </ol>
            <a href="#" className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl border border-brand/15 bg-white px-4 py-3 text-sm font-semibold text-brand-900 transition-colors hover:border-brand hover:bg-brand hover:text-white">
              <FileDown className="size-4 text-brand transition-colors group-hover:text-white" />
              {t('pdf')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
