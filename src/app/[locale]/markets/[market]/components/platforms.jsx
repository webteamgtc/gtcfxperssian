'use client';
/** Template A platforms band (dark) Copy: marketsPage.detail.platforms (shared by all pages). */
import { useTranslations } from 'next-intl';
import { Download, Monitor, MonitorSmartphone, Smartphone } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, TiltCard } from '@/components/motion';

const LOGO = { mt4: Monitor, mt5: MonitorSmartphone, go: Smartphone };

function Band({ children }) {
  return (
    <section className="is-dark relative overflow-hidden bg-ink py-14 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-50" aria-hidden />
      <span className="absolute -start-40 top-10 size-[420px] rounded-full bg-brand/30 blur-[120px]" aria-hidden />
      <BandLine />
      <div className="container-x relative">{children}</div>
    </section>
  );
}

const OsChips = ({ os }) => (
  <div className="mt-5 flex flex-wrap gap-2">
    {os.map((o) => (
      <span key={o} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10">
        {o}
      </span>
    ))}
  </div>
);

/** Cards — three glass cards that tilt toward the pointer, each with its platforms and a link to the platform page. */
export function PlatformCards() {
  const t = useTranslations('marketsPage.detail.platforms');
  const items = t.raw('items');
  return (
    <Band>
      <SectionIntro dark title={t('title')} description={t('description')} />
      <Stagger className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3" stagger={0.1}>
        {items.map((p) => {
          const L = LOGO[p.id] ?? Monitor;
          return (
            <StaggerItem key={p.id}>
              <TiltCard className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur">
                <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-600 text-white shadow-lg shadow-gold/20">
                  <L className="size-6" />
                </span>
                <h3 className="heading-card mt-6 flex items-center gap-2">
                  {p.name}
                  {p.badge && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-gold-200">{p.badge}</span>}
                </h3>
                <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-white/60">{p.text}</p>
                <OsChips os={p.os} />
                <NavLink href={p.href} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-gold-50">
                  <Download className="size-4" /> {p.cta}
                </NavLink>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </Stagger>
      <p className="mt-6 text-center text-xs text-white/40">* {t('note')}</p>
    </Band>
  );
}
