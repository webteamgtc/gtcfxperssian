'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Users, Layers, ChartNoAxesCombined, Languages } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';

import { Stagger, StaggerItem, CountUp, EASE } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';
import HeroTradingBackdrop from '@/components/shared/HeroBackdrop';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const STAT_ICONS = [Users, Layers, Languages, ChartNoAxesCombined];

export function CompanyHero() {
  const t = useTranslations('companyPage');
  const tb = useTranslations('companyPage.breadcrumb');
  const stats = useTranslations('stats').raw('items');

  return (
    <section className="is-dark relative overflow-hidden pb-14 pt-36 md:pb-20 md:pt-44">
      {/* background: moving navy/gold gradient mesh + horizon glow */}
      <HeroTradingBackdrop />

      <div className="container-x relative text-center">
        <Breadcrumb items={[{ label: tb('home'), href: '/' }, { label: tb('company') }]} />

        {/* h1 + intro render visible straight away (good LCP); only a light slide-in */}
        <motion.h1 className="heading-page mx-auto mt-7 max-w-4xl" initial={{ y: 18 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <AccentTitle text={t('hubSection.title')} />
        </motion.h1>
        <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-relaxed text-white/65 md:text-lg">{t('hubSection.description')}</p>

        <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE }}>
          <LiveAccountButton variant="gold">
            {t('hubSection.ctaLive')}
          </LiveAccountButton>
          <a href="#legal" className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
            {t('hubSection.ctaSecondary')}
          </a>
        </motion.div>

        {/* stats */}
        <Stagger className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-3 md:mt-20 md:gap-4 lg:grid-cols-4" stagger={0.1} delay={0.4}>
          {stats.map((s, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length];
            return (
              <StaggerItem key={s.label} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-start backdrop-blur-md transition-colors duration-500 hover:border-gold/40 md:p-6">
                <span className="absolute -end-10 -top-10 size-28 rounded-full bg-gold/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-0" aria-hidden />
                <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/10 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <div dir="ltr" className="heading-accent mt-5 text-start text-2xl font-bold tracking-tight md:text-3xl rtl:text-end">
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="mt-1.5 text-sm text-white/55">{s.label}</div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
