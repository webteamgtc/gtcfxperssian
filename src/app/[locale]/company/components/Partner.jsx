'use client';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Handshake, Crown } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { Stagger, StaggerItem, TiltCard } from '@/components/motion';
import { cn } from '@/lib/utils';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { NetworkVisual, LiquidityVisual } from './partnerVisuals';

const TABS = [
  { id: 'partners', href: '/partners', Icon: Handshake },
  { id: 'prime', href: '/gtc-prime', Icon: Crown }
];

const LOOK = {
  partners: { bg: 'from-brand-600 via-brand-800 to-brand-950', glow: 'bg-brand-400/40', Visual: NetworkVisual },
  prime: { bg: 'from-[#3a2a16] via-[#1d160d] to-ink', glow: 'bg-gold/35', Visual: LiquidityVisual }
};

/** Partner with Us: dark band with two tilting program cards, each with its own live illustration. */
export function Partner() {
  const t = useTranslations('companyPage.partnerSection');
  return (
    <section id="partners" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-2" stagger={0.15}>
          {TABS.map(({ id, href, Icon }) => {
            const { bg, glow, Visual } = LOOK[id];
            return (
              <StaggerItem key={id}>
                <TiltCard max={6} className="h-full rounded-[2rem]">
                  <NavLink href={href} aria-label={t(`tabs.${id}.linkAriaLabel`)} className={cn('group is-dark border-beam relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br p-7 text-white md:p-10', bg)}>
                    <span className={cn('absolute -end-20 -top-20 size-72 rounded-full blur-[100px] transition-opacity duration-700 group-hover:opacity-100 md:opacity-60', glow)} aria-hidden />
                    <div className="relative flex items-start justify-between gap-6">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                        <Icon className="size-5" />
                      </span>
                      <span className="grid size-12 place-items-center rounded-full bg-white text-brand-900 transition-all duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-white">
                        <ArrowUpRight className="size-5 rtl:-scale-x-100" />
                      </span>
                    </div>
                    <Visual className="relative my-6 md:my-8" />
                    <h3 className="heading-title relative">{t(`tabs.${id}.contentTitle`)}</h3>
                    <p className="relative mt-3 max-w-lg text-[15px] leading-relaxed text-white/70 md:text-base">{t(`tabs.${id}.contentDescription`)}</p>
                    <span className="relative mt-6 h-px w-16 bg-gradient-to-r from-gold to-transparent transition-all duration-700 group-hover:w-40 rtl:bg-gradient-to-l" aria-hidden />
                  </NavLink>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
