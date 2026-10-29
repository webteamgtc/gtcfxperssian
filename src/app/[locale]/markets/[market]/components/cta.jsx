'use client';
/** Closing CTA for both templates built on the site's CTA designs. Copy: pages.<id>.cta + marketsPage.detail.cta. */
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { PORTAL, LIVE_ACCOUNT_HREF } from '@/config/menu';
import CtaBand from '@/components/shared/CtaBand';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { useLiveRows, FlashPrice } from '@/components/shared/ticker';
import { Reveal } from '@/components/motion';
import { useMarket, usePageT, useSymbolHref } from './shared';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

function Shell({ children }) {
  return (
    <section className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />
      <div className="container-x relative">{children}</div>
    </section>
  );
}

function Risk({ className }) {
  const t = useTranslations('marketsPage.detail.cta');
  return (
    <p className={`mt-10 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-xs leading-relaxed text-white/60 ${className ?? ''}`}>
      <strong className="me-1 text-white">{t('riskTitle')}</strong>
      {t('risk')}
    </p>
  );
}

/** Band — the site's centred navy CTA band (pulsing rings, price line, risk warning). */
export function CtaCentered() {
  const t = usePageT();
  const td = useTranslations('marketsPage.detail.cta');
  return <CtaBand id="start" title={t('cta.title')} description={t('cta.description')} primary={{ label: td('start'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: td('demo'), href: PORTAL.demo }} riskTitle={td('riskTitle')} risk={td('risk')} />;
}

/** Split + live — copy on the start side, buttons on the other, this market's live prices along the bottom. */
export function CtaSplitLive() {
  const t = usePageT();
  const td = useTranslations('marketsPage.detail.cta');
  const { symbols } = useMarket();
  const href = useSymbolHref();
  const list = useMemo(() => symbols.slice(0, 6), [symbols]);
  const rows = useLiveRows(list, 1400);
  return (
    <Shell>
      <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('cta.title')} />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{t('cta.description')}</p>
        </Reveal>
        <Reveal y={16} delay={0.1} className="flex flex-col gap-3 lg:ms-auto lg:w-full lg:max-w-sm">
          <LiveAccountButton variant="gold" className="justify-between">
            {td('start')}
          </LiveAccountButton>
          <p className="text-center text-xs text-white/50">{td('noAccount')}</p>
          <div className="grid grid-cols-2 gap-3">
            <LiveAccountButton look="button" variant="outlineLight" size="md" arrow={false} className="h-12 px-4">
              {td('live')}
            </LiveAccountButton>
            <NavLink href={PORTAL.demo} className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-900">
              {td('demo')}
            </NavLink>
          </div>
        </Reveal>
      </div>
      {rows.length > 0 && (
      <div dir="ltr" className="mt-12 flex flex-wrap gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
        {rows.map((r) => (
          <NavLink key={r.s} href={href(r.s)} prefetch={false} className="min-w-[45%] flex-1 bg-brand-950/60 px-4 py-3 transition-colors hover:bg-brand-900 sm:min-w-[30%] lg:min-w-0">
            <span className="block text-[11px] font-semibold text-white/55">{r.s}</span>
            <FlashPrice value={r.bid} decimals={r.d} dir={r.dir} tick={r.tick} className="text-sm font-bold text-white" />
          </NavLink>
        ))}
      </div>
      )}
      <Risk />
    </Shell>
  );
}

/** The closing CTA of each template; the symbol pages reuse their market's. */
export const MARKET_CTA = { A: CtaCentered, B: CtaSplitLive };
