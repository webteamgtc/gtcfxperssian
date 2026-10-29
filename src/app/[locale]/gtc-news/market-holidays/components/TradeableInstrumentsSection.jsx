'use client';
/**
 * Tradeable instruments (white): five asset-class cards, each with today's session drawn on a 24h GMT bar,
 * a moving "now" marker and a live open / closed status.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ChartColumn, Coins, Flame, Gem, Landmark } from 'lucide-react';
import RingCard from '@/components/shared/RingCard';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { TRADING_HOURS, isOpenAt, parseSessions } from './tradingHoursData';

// same order as marketHolidaysPage.instruments.items; `row` drives the bar + live status, `fixed` keeps the copy's status
const CARDS = [
  { Icon: Coins, row: TRADING_HOURS.fx[0] },
  { Icon: Gem, row: TRADING_HOURS.goldSilver[0] },
  { Icon: Flame, row: TRADING_HOURS.crudeOil[0] },
  { Icon: ChartColumn, row: TRADING_HOURS.cashIndices.find((r) => r.symbol === 'US30c'), fixed: 'amber' },
  { Icon: Landmark, row: TRADING_HOURS.stocks[0], fixed: 'amber' }
];

function SessionBar({ row, now, open }) {
  const day = now ? (now.getUTCDay() + 6) % 7 : 0;
  const sessions = day > 4 ? (row.always ? [[0, 1440]] : []) : parseSessions(row.days[day][1]);
  const pos = now ? ((now.getUTCHours() * 60 + now.getUTCMinutes()) / 1440) * 100 : null;
  return (
    <div dir="ltr" className="relative mt-5">
      <div className="relative h-2 overflow-hidden rounded-full bg-brand/[0.07]">
        {sessions.map(([a, b]) => (
          <motion.span key={a} className={cn('absolute inset-y-0 rounded-full', open ? 'bg-gradient-to-r from-up to-green-300' : 'bg-gradient-to-r from-brand-300 to-brand')} style={{ left: `${(a / 1440) * 100}%`, width: `${((b - a) / 1440) * 100}%`, originX: 0 }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} />
        ))}
      </div>
      {pos !== null && (
        <motion.span className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_8px_2px_rgba(182,135,86,0.6)]" style={{ left: `${pos}%` }} initial={{ opacity: 0 }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} aria-hidden />
      )}
      <div className="mt-1.5 flex justify-between text-[10px] font-medium tabular-nums text-ink/35">
        <span>00:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}

export default function TradeableInstrumentsSection() {
  const t = useTranslations('marketHolidaysPage.instruments');
  const items = t.raw('items');
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="instruments" className="relative scroll-mt-20 overflow-clip bg-white py-14 md:py-24">
      <div className="absolute -start-40 bottom-10 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <Reveal y={16} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand ring-1 ring-brand/10">
            <span className="size-1.5 rounded-full bg-gold" />
            {t('eyebrow')}
          </span>
          <h2 className="heading-section mt-5">
            <AccentTitle text={t('heading')} />
          </h2>
          <p className="mx-auto mt-5 text-pretty text-[15px] leading-relaxed text-ink/60 md:text-base">{t('sub')}</p>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3" stagger={0.08}>
          {items.map((it, i) => {
            const { Icon, row, fixed } = CARDS[i] ?? CARDS[0];
            const open = now ? isOpenAt(row, now) : null;
            const tone = fixed ? 'amber' : open === false ? 'off' : 'on';
            const status = fixed || open !== false ? it.status : t('closed');
            return (
              <StaggerItem key={it.title} className="h-full">
                <RingCard innerClassName="p-6">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand transition-all duration-500 group-hover:-rotate-12 group-hover:bg-brand group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand/25">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="heading-card">{it.title}</h3>
                      <p dir="ltr" className="mt-1 text-sm text-ink/55 rtl:text-end">
                        {it.hours}
                      </p>
                    </div>
                  </div>
                  <SessionBar row={row} now={now} open={tone === 'on'} />
                  <div className="mt-4 flex items-center justify-between border-t border-brand/10 pt-4">
                    {open === null && !fixed ? (
                      <span className="h-6 w-24 animate-pulse rounded-full bg-brand/5" />
                    ) : (
                      <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1', tone === 'on' ? 'bg-up/10 text-up ring-up/20' : tone === 'amber' ? 'bg-gold/10 text-gold-700 ring-gold/25' : 'bg-ink/5 text-ink/45 ring-ink/10')}>
                        <span className="relative flex size-2">
                          {tone === 'on' && <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />}
                          <span className={cn('relative inline-flex size-2 rounded-full', tone === 'on' ? 'bg-up' : tone === 'amber' ? 'bg-gold' : 'bg-ink/30')} />
                        </span>
                        {status}
                      </span>
                    )}
                    <span className="text-xs font-bold tabular-nums tracking-[0.2em] text-brand/30">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </RingCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
