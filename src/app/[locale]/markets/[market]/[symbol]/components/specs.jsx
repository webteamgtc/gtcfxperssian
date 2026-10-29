'use client';
/**
 * Symbol page — trading specifications + about. Copy: marketsPage.symbol.specs / .about.
 * Contract values come from the symbols API (/trade/symbol_info); anything it doesn't return shows "—".
 */
import { Package, Scale, Ruler, Coins, Gauge, Percent, CalendarClock, Clock, Sparkles } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';
import { useSymT, useFigures, useAbout, RelatedSymbols } from './shared';

const SPEC_ICON = { contractSize: Package, minLot: Scale, tickSize: Ruler, valuePerPip: Coins, leverage: Gauge, marginRate: Percent, tripleSwap: CalendarClock, hours: Clock };

function Chips({ chips, className }) {
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((c) => (
        <li key={c} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand">
          {c}
        </li>
      ))}
    </ul>
  );
}

/** eight spec tiles with icons that rise in, then a wide about band with chips and related symbols. */
export function SpecsTiles() {
  const t = useSymT();
  const f = useFigures();
  const a = useAbout();
  return (
    <section className="bg-[#f6f8fc] py-14 text-ink md:py-24">
      <div className="container-x">
        <SectionIntro title={t('specs.heading')} description={t('specs.description')} />
        <Stagger className="mt-12 grid grid-cols-2 gap-4 md:mt-16 lg:grid-cols-4" stagger={0.06}>
          {f.specs.map(([k, v]) => {
            const I = SPEC_ICON[k] ?? Sparkles;
            return (
              <StaggerItem key={k}>
                <div className="group h-full rounded-3xl bg-white p-5 ring-1 ring-brand/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(41,59,147,0.5)] md:p-6">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <I className="size-5" aria-hidden />
                  </span>
                  <p className="mt-5 text-sm text-ink/50">{t(`specs.${k}`)}</p>
                  <p className="mt-1 text-lg font-semibold md:text-xl" dir={k === 'hours' || k === 'tripleSwap' ? undefined : 'ltr'}>
                    {v}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
        <Reveal y={20} className="mt-6">
          <div className="grid gap-8 rounded-[2rem] bg-white p-7 ring-1 ring-brand/10 md:p-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
            <div>
              <h3 className="heading-card">{a.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/65 md:text-base">{a.text}</p>
              <Chips chips={a.chips} className="mt-5" />
            </div>
            <RelatedSymbols className="lg:border-s lg:border-brand/10 lg:ps-10" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
