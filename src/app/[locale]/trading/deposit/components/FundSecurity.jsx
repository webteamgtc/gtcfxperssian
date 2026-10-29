'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, Landmark, LockKeyhole, ShieldCheck, Undo2 } from 'lucide-react';

import RingCard from '@/components/shared/RingCard';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { AccentTitle, SectionIntro } from '@/components/shared/SectionIntro';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const ICONS = [Landmark, LockKeyhole, Undo2, ShieldCheck];

/** Shield with rotating rings (decorative, sits in the navy panel). */
function ShieldOrb() {
  return (
    <div dir="ltr" className="pointer-events-none absolute -end-16 -top-16 grid size-72 place-items-center opacity-90" aria-hidden>
      {[1, 2, 3].map((r) => (
        <motion.span key={r} className="absolute rounded-full border border-white/10" style={{ width: 80 + r * 60, height: 80 + r * 60 }} animate={{ rotate: r % 2 ? 360 : -360 }} transition={{ duration: 20 + r * 8, repeat: Infinity, ease: 'linear' }}>
          <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(182,135,86,0.8)]" />
        </motion.span>
      ))}
      <motion.span className="grid size-20 place-items-center rounded-3xl bg-white/10 text-gold-200 ring-1 ring-white/20 backdrop-blur" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <ShieldCheck className="size-9" strokeWidth={1.5} />
      </motion.span>
    </div>
  );
}

export function FundSecurity() {
  const t = useTranslations('depositPage.security');
  const items = t.raw('items');
  const points = t.raw('panel.points');

  return (
    <section id="security" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mt-12 grid items-stretch gap-6 md:mt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <Stagger className="grid gap-4" stagger={0.1}>
            {items.map((it, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <StaggerItem key={it.title}>
                  <RingCard lift={4} innerClassName="flex-row gap-5 p-6">
                    <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="heading-card text-base md:text-lg">{it.title}</h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-ink/60">{it.text}</p>
                    </div>
                  </RingCard>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal y={28} delay={0.15} className="h-full">
            <div className="is-dark relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-8 text-white shadow-2xl shadow-brand/30 md:p-10">
              <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
              <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
              <ShieldOrb />

              <h3 className="heading-title relative max-w-[15rem]">
                <AccentTitle text={t('panel.title')} />
              </h3>
              <ul className="relative mt-8 flex-1 space-y-5 border-t border-white/10 pt-7">
                {points.map((p, i) => (
                  <motion.li key={p} className="flex gap-3.5 text-[15px] leading-relaxed text-white/85" initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}>
                    <motion.span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-brand" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.4 + i * 0.15 }}>
                      <Check className="size-3.5" strokeWidth={3} />
                    </motion.span>
                    {p}
                  </motion.li>
                ))}
              </ul>
              <LiveAccountButton variant="light" className="relative mt-9 self-start">
                {t('panel.cta')}
              </LiveAccountButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
