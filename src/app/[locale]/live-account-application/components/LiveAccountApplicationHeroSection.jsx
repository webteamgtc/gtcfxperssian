'use client';
/** Dark hero: breadcrumb, eyebrow, title and the subtitle of the account chosen via ?account=. */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';

export default function LiveAccountApplicationHeroSection({ accountKey, showAccount }) {
  const t = useTranslations('liveAccountApplicationPage');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-40 pt-36 text-white md:pb-48 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb items={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.trading'), href: '/trading' }, { label: t('breadcrumb.current') }]} />
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <motion.span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-200 ring-1 ring-white/10 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <ShieldCheck className="size-3.5" />
            {t('hero.eyebrow')}
          </motion.span>
          <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75, ease: EASE }}>
            <AccentTitle text={t('hero.title')} />
          </motion.h1>
          {showAccount && (
            <motion.span className="mt-5 inline-flex rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-gold/30" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>
              {t(`accounts.${accountKey}.title`)}
            </motion.span>
          )}
          <motion.p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            {t(`accounts.${accountKey}.subtitle`)}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
