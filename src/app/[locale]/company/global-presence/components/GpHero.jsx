'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, CountUp, EASE } from '@/components/motion';
import { LicenceRing } from './HeroVisuals';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

export function GpHero() {
  const t = useTranslations('globalPresencePage.hero');
  const tb = useTranslations('globalPresencePage.breadcrumb');
  const te = useTranslations('globalPresencePage.entities');
  const entities = te.raw('items');
  const stats = t.raw('stats');
  return (
    <section className="is-dark relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div className="text-center lg:text-start">
            <motion.h1 className="heading-page" initial={{ y: 18 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0">{t('description')}</p>
            <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE }}>
              <LiveAccountButton variant="gold">
                {t('primary')}
              </LiveAccountButton>
              <a href="#entities" className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-brand-900">
                {t('secondary')}
              </a>
            </motion.div>

            <Stagger className="mt-12 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-6 rtl:divide-x-reverse" stagger={0.1} delay={0.4}>
              {stats.map((s) => (
                <StaggerItem key={s.label} className="px-3 text-center first:ps-0 lg:text-start">
                  <div dir="ltr" className="heading-accent text-3xl font-bold tracking-tight md:text-4xl">
                    <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="mt-1.5 text-xs font-medium text-white/55 md:text-sm">{s.label}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease: EASE }} className="relative">
            <div className="absolute end-0 top-0 z-40">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
                <ShieldCheck className="size-3.5" />
                {t('commission')}
              </span>
            </div>
            <LicenceRing entities={entities} licenceLabel={te('labels.licence')} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
