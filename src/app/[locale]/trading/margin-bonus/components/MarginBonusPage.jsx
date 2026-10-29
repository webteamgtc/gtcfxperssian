'use client';
/**
 * /trading/margin-bonus
 * Rhythm: dark hero (bonus calculator + summary band) → gray (how to apply) → white (terms, sticky contents)
 * → dark (application form).
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Headset, Info } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Toaster from '@/components/shared/Toaster';
import LiveAccountButton from '@/components/shared/LiveAccountButton';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, ScrollProgress } from '@/components/motion';
import { MarginHero } from './MarginHero';
import { MarginSteps, MarginTerms } from './MarginTerms';
import { MarginApplyForm } from './MarginApplyForm';

const NOTE_ICONS = [Info, Headset];

function ApplySection() {
  const t = useTranslations('marginBonusPage.apply');
  return (
    <section id="apply" className="is-dark relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-brand-900 via-brand-950 to-ink py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -start-24 top-1/4 size-96 rounded-full bg-brand-500/30 blur-[120px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 7, repeat: Infinity }} aria-hidden />
      <span className="absolute -end-24 bottom-0 size-96 rounded-full bg-gold/10 blur-[120px]" aria-hidden />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal y={16}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-200">{t('eyebrow')}</p>
          <h2 className="heading-section mt-4">
            <AccentTitle text={t('title')} accentClassName="text-gradient-gold" />
          </h2>
          <p className="mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-white/70 md:text-base">{t('text')}</p>

          <ul className="mt-8 max-w-lg space-y-3">
            {t.raw('notes').map((note, i) => {
              const Icon = NOTE_ICONS[i] ?? Info;
              return (
                <li key={note} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-relaxed text-white/70 backdrop-blur">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold-200">
                    <Icon className="size-4" />
                  </span>
                  {note}
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="text-sm text-white/60">{t('noAccount')}</span>
            <LiveAccountButton look="button" variant="gold" size="md">
              {t('openLive')}
            </LiveAccountButton>
          </div>
        </Reveal>

        <Reveal y={24} delay={0.1}>
          <MarginApplyForm />
        </Reveal>
      </div>
    </section>
  );
}

export default function MarginBonusPage() {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <MarginHero />
        <MarginSteps />
        <MarginTerms />
        <ApplySection />
      </main>
      <Footer theme="dark" />
      <Toaster />
    </div>
  );
}
