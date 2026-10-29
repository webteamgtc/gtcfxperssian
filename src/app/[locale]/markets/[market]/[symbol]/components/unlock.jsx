'use client';
/**
 * Symbol page — "Unlock Global Markets With A Reliable CFD Broker": the devices picture + four download buttons.
 * Picture and button links: SYMBOL_PAGE in src/config/marketPages.js. Copy: marketsPage.symbol.unlock.
 */
import Image from 'next/image';
import { Apple, Globe, SquareTerminal, Download } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { SYMBOL_PAGE } from '@/config/marketPages';
import { cn } from '@/lib/utils';
import { useSymT } from './shared';

const WindowsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M3 5.1 10.4 4v7.2H3V5.1Zm0 13.8 7.4 1.1v-7.1H3v6Zm8.3 1.2L21 21.5v-8.6h-9.7v7.2Zm0-16.2v7.3H21V2.5l-9.7 1.4Z" />
  </svg>
);
const DL_ICON = { windows: WindowsIcon, mac: Apple, linux: SquareTerminal, web: Globe };

function Devices({ className }) {
  const t = useSymT();
  const img = SYMBOL_PAGE.devicesImage;
  return <Image src={img.src} width={img.width} height={img.height} alt={t('unlock.imageAlt')} sizes="(min-width: 1280px) 1100px, 100vw" className={cn('h-auto w-full', className)} />;
}

/** dark band: the picture rises onto a lit stage, the downloads sit under it as glass buttons. */
export function UnlockStage() {
  const t = useSymT();
  return (
    <section className="is-dark relative overflow-hidden bg-ink py-14 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-50" aria-hidden />
      <span className="absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/35 blur-[140px]" aria-hidden />
      <BandLine />
      <div className="container-x relative">
        <SectionIntro dark title={t('unlock.title')} description={t('unlock.text')} />
        <Reveal y={40} className="mx-auto mt-10 max-w-5xl md:mt-14">
          <div className="rounded-[2rem] bg-white p-3 shadow-[0_60px_120px_-40px_rgba(41,59,147,0.9)] ring-1 ring-white/20 sm:p-6">
            <Devices />
          </div>
        </Reveal>
        <Stagger className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.07}>
          {SYMBOL_PAGE.downloads.map((d) => {
            const I = DL_ICON[d.id] ?? Download;
            return (
              <StaggerItem key={d.id}>
                <NavLink href={d.href} className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] text-base font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-gold">
                  <I className="size-5" />
                  {t(`unlock.${d.id}`)}
                </NavLink>
              </StaggerItem>
            );
          })}
        </Stagger>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-white/55">{t('unlock.note')}</p>
      </div>
    </section>
  );
}
