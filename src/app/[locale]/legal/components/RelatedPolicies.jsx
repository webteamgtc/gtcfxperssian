'use client';
/** Grid of the web policy pages (all of them, or all but `current`). Used on every policy page and the legal hub. */
import { useTranslations } from 'next-intl';
import { ArrowUpRight, BadgeCheck, Cookie, FileText, Scale, ShieldAlert, ShieldCheck, UserCheck, Wallet } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

export const POLICIES = [
  { slug: 'privacy-policy', Icon: ShieldCheck },
  { slug: 'terms-and-conditions', Icon: Scale },
  { slug: 'risk-disclosure', Icon: ShieldAlert },
  { slug: 'cookie-policy', Icon: Cookie },
  { slug: 'deposit-and-refund-policy', Icon: Wallet },
  { slug: 'kyc-compliance-policy', Icon: UserCheck },
  { slug: 'website-disclaimer', Icon: FileText },
  // { slug: 'swap-free-terms-and-conditions', Icon: BadgeCheck }
];

export function PolicyGrid({ current, className }) {
  const t = useTranslations('legalPage');
  const items = POLICIES.filter((p) => p.slug !== current);
  return (
    <Stagger className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)} stagger={0.06} amount={0.1}>
      {items.map(({ slug, Icon }, i) => (
        <StaggerItem key={slug} className="h-full">
          <NavLink href={`/legal/${slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white p-5 shadow-lg shadow-brand/5 ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/15 hover:ring-brand/25">
            <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand via-brand-400 to-gold transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <span className="text-2xl font-black tabular-nums text-ink/[0.06]">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="mt-4 text-base font-bold text-ink transition-colors group-hover:text-brand">{t(`docs.${slug}.name`)}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/55">{t(`docs.${slug}.summary`)}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              {t('document.read')}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
            </span>
          </NavLink>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function RelatedPolicies({ current }) {
  const t = useTranslations('legalPage.document.related');
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <PolicyGrid current={current} className="mt-10 md:mt-12" />
      </div>
    </section>
  );
}
