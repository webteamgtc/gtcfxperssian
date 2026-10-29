'use client';
/**
 * Shared pieces of the course / section / article pages:
 * LearnShell (header, footer, scroll progress), LearnHero (dark), LearnAppPromo + LearnCta (shared copy).
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import GtcGoPhone from '@/components/shared/GtcGoPhone';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import StoreButtons from '../../../trading/common-gtc-components/components/StoreButtons';
import { SHARED_NS } from '../../courses';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

export function LearnShell({ children }) {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>{children}</main>
      <Footer theme="dark" />
    </div>
  );
}

/** Dark hero: breadcrumb, back link, optional `kicker` (above the title), title ([accent] supported), subtitle, `aside` card. */
export function LearnHero({ crumbs, back, kicker, title, subtitle, aside, children }) {
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={crumbs} />
        <div className={aside ? 'mt-10 grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]' : 'mt-10'}>
          <div className="text-center lg:text-start">
            {back && (
              <NavLink href={back.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-gold-200">
                <ArrowLeft className="size-4 rtl:-scale-x-100" />
                {back.label}
              </NavLink>
            )}
            {kicker}
            <motion.h1 className="heading-page mt-5 max-w-4xl text-balance" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={title} />
            </motion.h1>
            {subtitle && (
              <motion.p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                {subtitle}
              </motion.p>
            )}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

/**
 * GTC Go app promo. Default: navy card on gray. `band`: full-width navy band used as a page's closing CTA
 * (phone rising from the bottom edge, store buttons, risk line).
 */
export function LearnAppPromo({ band = false }) {
  const t = useTranslations(`${SHARED_NS}.appPromo`);
  if (band) {
    return (
      <section className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 pt-16 text-white md:pt-24">
        <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
        <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
        <motion.span className="absolute -start-32 bottom-0 size-80 rounded-full bg-brand-400/20 blur-[110px]" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 7, repeat: Infinity }} aria-hidden />
        <BandLine />
        <div className="container-x relative grid items-end gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal y={16} className="pb-16 text-center md:pb-24 lg:text-start">
            <h2 className="heading-section">
              <AccentTitle text={t('title')} accentClassName="text-gradient-gold" />
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base lg:mx-0">{t('description')}</p>
            <StoreButtons tone="white" className="mt-8 justify-center lg:justify-start" />
          </Reveal>
          <div className="relative mx-auto h-[300px] w-[250px] md:h-[380px] md:w-[290px]" aria-hidden>
            <div className="absolute inset-x-0 bottom-0 h-3/4 rounded-full bg-gold/25 blur-3xl" />
            <motion.span className="absolute bottom-10 start-1/2 size-[340px] -translate-x-1/2 rounded-full border border-white/10" animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 5, repeat: Infinity }} />
            <motion.div className="absolute inset-x-0 top-0" initial={{ y: 120, rotate: 8, opacity: 0 }} whileInView={{ y: 0, rotate: -4, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE }}>
              <GtcGoPhone className="mx-auto w-full" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-20">
      <div className="container-x">
        <Reveal y={20}>
          <div className="is-dark relative grid items-center gap-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink px-6 py-10 text-white md:px-12 md:py-12 lg:grid-cols-[1.3fr_1fr]">
            <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
            <motion.span className="absolute -end-20 -top-20 size-80 rounded-full bg-gold/20 blur-[100px]" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <div className="relative">
              <h2 className="heading-section">
                <AccentTitle text={t('title')} accentClassName="text-gradient-gold" />
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-white/70">{t('description')}</p>
              <StoreButtons tone="white" className="mt-8" />
            </div>
            <div className="relative mx-auto -mb-24 hidden lg:block">
              <motion.div initial={{ y: 80, rotate: 8, opacity: 0 }} whileInView={{ y: 0, rotate: -6, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}>
                <GtcGoPhone className="w-[230px]" />
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LearnCta() {
  const t = useTranslations(`${SHARED_NS}.cta`);
  const stats = t.raw('stats');
  const badges = t.raw('trustBadges');
  return (
    <section className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('title')} accentClassName="text-gradient-gold" />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{t('description')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LiveAccountButton variant="gold">
              {t('openLiveAccount')}
            </LiveAccountButton>
            <NavLink href="/trading/free-demo-account" className="inline-flex h-13 items-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
              {t('tryDemoFirst')}
            </NavLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {badges.map((b) => (
              <li key={b} className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-gold-200" /> {b}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-white/45">{t('disclaimer')}</p>
        </Reveal>
        <Stagger className="grid gap-3" stagger={0.1}>
          {stats.map((s) => (
            <StaggerItem key={s.label} className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-6 py-5 ring-1 ring-white/10 backdrop-blur">
              <span className="text-sm font-semibold uppercase tracking-wider text-white/55">{s.label}</span>
              <span dir="ltr" className="text-gradient-gold text-3xl font-bold">
                <StatValue value={s.value} />
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
