'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { PORTAL } from '@/config/menu';
import { MARKETS_LEAD } from '@/config/markets';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useLiveRows, FlashPrice } from '@/components/shared/ticker';
import { Reveal } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

function CtaShell({ children }) {
  return (
    <section className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />
      <div className="container-x relative">{children}</div>
    </section>
  );
}

function Risk() {
  const t = useTranslations('marketsPage.cta');
  return (
    <p className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-xs leading-relaxed text-white/60">
      <strong className="me-1 text-white">{t('riskTitle')}</strong>
      {t('risk')}
    </p>
  );
}

/** Split — the screenshot layout: copy on the start side, buttons on the end side, live prices along the bottom. */
export function CtaSplit() {
  const t = useTranslations('marketsPage.cta');
  const rows = useLiveRows(MARKETS_LEAD, 1500);
  return (
    <CtaShell>
      <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{t('description')}</p>
        </Reveal>
        <Reveal y={16} delay={0.1} className="flex flex-col gap-3 lg:ms-auto lg:w-full lg:max-w-sm">
          <LiveAccountButton variant="gold" className="justify-between">
            {t('live')}
          </LiveAccountButton>
          <NavLink href={PORTAL.demo} className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
            {t('demo')}
          </NavLink>
        </Reveal>
      </div>
      <div dir="ltr" className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4 lg:grid-cols-7" aria-hidden>
        {rows.map((r) => (
          <div key={r.s} className="bg-brand-950/60 px-4 py-3">
            <span className="block text-[11px] font-semibold text-white/55">{r.n}</span>
            <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-sm font-bold text-white" />
          </div>
        ))}
      </div>
      <Risk />
    </CtaShell>
  );
}

/** Closing CTA: copy on the start side, buttons on the end side, live prices along the bottom, then the risk warning. */
export function MarketsCta() {
  const t = useTranslations('marketsPage.cta');
  const rows = useLiveRows(MARKETS_LEAD, 1500);
  return (
    <CtaShell>
      <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{t('description')}</p>
        </Reveal>
        <Reveal y={16} delay={0.1} className="flex flex-col gap-3 lg:ms-auto lg:w-full lg:max-w-sm">
          <LiveAccountButton variant="gold" className="justify-between">
            {t('live')}
          </LiveAccountButton>
          <NavLink href={PORTAL.demo} className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
            {t('demo')}
          </NavLink>
        </Reveal>
      </div>
      <div dir="ltr" className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4 lg:grid-cols-7" aria-hidden>
        {rows.map((r) => (
          <div key={r.s} className="bg-brand-950/60 px-4 py-3">
            <span className="block text-[11px] font-semibold text-white/55">{r.n}</span>
            <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-sm font-bold text-white" />
          </div>
        ))}
      </div>
      <Risk />
    </CtaShell>
  );
}
