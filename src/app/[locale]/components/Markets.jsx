'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { MARKET_ICONS } from '@/components/shared/icons';
import { AreaChart } from '@/components/shared/devices';
import { SectionHeading } from '@/components/shared/blocks';
import { getDir } from '@/i18n/locales';
import { TiltCard } from '@/components/motion';
import { cn } from '@/lib/utils';
import NavLink from '@/components/shared/nav/NavLink';
import { MARKET_LINKS } from '@/config/menu';

export function Markets() {
  const t = useTranslations('markets');
  const tc = useTranslations('common');
  const items = Object.entries(t.raw('markets')).map(([key, m]) => ({ key, ...m }));
  const rtl = getDir(useLocale()) === 'rtl';
  const ref = useRef(null);
  const rowRef = useRef(null);
  const headRef = useRef(null);
  const [dist, setDist] = useState(0);
  const [headH, setHeadH] = useState(110);
  const [vh, setVh] = useState(900);
  useEffect(() => {
    const measure = () => {
      // How far the row must move until the last card is fully on screen (0 = all cards fit).
      const row = rowRef.current;
      if (row) {
        const gutter = parseFloat(getComputedStyle(row).paddingInlineStart) || 0;
        const cards = row.scrollWidth - gutter * 2;
        setDist(Math.max(0, Math.ceil(gutter + cards + 20 - document.documentElement.clientWidth)));
      }
      if (headRef.current) setHeadH(headRef.current.offsetHeight);
      setVh(window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headRef.current) ro.observe(headRef.current);
    if (rowRef.current) ro.observe(rowRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // When pinned, the panel is exactly one screen tall and the cards grow to fill it,
  // so there is no empty band above/below. If the screen is so tall that the cards
  // would exceed CARD_MAX, pinning would leave gaps — then the row instead slides
  // while the (natural-height) section is fully on screen.
  const TOP = 88; // clears the fixed site header
  const BOTTOM = 40;
  const ROW_GAP = 40;
  const CARD = 440;
  const CARD_MIN = 400;
  const CARD_MAX = 580;
  const fit = vh - TOP - BOTTOM - headH - ROW_GAP;
  const pin = dist > 0 && fit <= CARD_MAX + 60;
  const cardH = pin ? Math.min(CARD_MAX, Math.max(CARD_MIN, fit)) : CARD;
  const panelH = pin ? Math.max(vh, TOP + BOTTOM + headH + ROW_GAP + cardH) : 0;
  const pinTop = pin ? Math.min(0, vh - panelH) : 0;
  const naturalH = 64 * 2 + headH + 48 + CARD; // py-16 + heading + mt-12 + cards

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: pin ? [`start ${pinTop}px`, `end ${pinTop + panelH}px`] : ['start end', 'end start']
  });
  // Non-pinned: the section is fully on screen between these progress points.
  const total = vh + naturalH;
  const from = pin ? 0 : Math.min(naturalH, vh) / total;
  const to = pin ? 1 : Math.max(vh, naturalH) / total;
  const span = to - from;
  const xRaw = useTransform(scrollYProgress, [from + span * 0.05, from + span * 0.95], [0, rtl ? dist : -dist]);
  const x = useSpring(xRaw, { stiffness: 90, damping: 25 });
  const bar = useTransform(scrollYProgress, [from, to], ['0%', '100%']);

  return (
    <section ref={ref} style={pin ? { height: panelH + dist * 1.2 } : undefined} className="relative bg-[#eef0f5] text-ink">
      <div className="bg-dots-light mask-radial pointer-events-none absolute inset-0 opacity-50" />
      <div
        style={pin ? { top: pinTop, height: panelH, paddingTop: TOP, paddingBottom: BOTTOM } : undefined}
        className={cn('flex flex-col justify-center overflow-hidden', pin ? 'sticky' : 'py-16')}
      >
      <div className="relative">
        <div ref={headRef} className="container-x relative flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={t('titleLine1')} titleB={t('titleLine2')} align="start" />
          <div className={cn('w-48', dist === 0 && 'invisible')}>
            <div className="text-xs text-ink/45">{tc('scroll')}</div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-brand/10">
              <motion.div style={{ width: bar }} className="h-full rounded-full bg-gradient-to-r from-gold to-brand" />
            </div>
          </div>
        </div>
        <motion.div ref={rowRef} style={{ x, marginTop: pin ? ROW_GAP : 48 }} className="relative flex w-max gap-6 px-[max(1.25rem,calc((100vw-1280px)/2+2rem))]">
          {items.map((it, i) => {
            const Icon = MARKET_ICONS[it.key] ?? MARKET_ICONS.forex;
            return (
              <TiltCard key={it.key} max={7} className="group shrink-0">
                <div style={{ minHeight: cardH }} className="relative h-full flex w-[320px] flex-col overflow-hidden rounded-[2rem] border border-brand/10 bg-white p-8 shadow-xl shadow-brand/5 transition-shadow duration-500 group-hover:border-brand/20 group-hover:shadow-2xl group-hover:shadow-brand/10 md:w-[360px]">
                  <div className="absolute -end-16 -top-16 size-48 rounded-full bg-brand/15 blur-3xl transition-all duration-700 group-hover:bg-gold/25" />
                  <div className="relative flex items-center justify-between">
                    <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-800 text-white shadow-lg shadow-brand/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-8" strokeWidth={1.5} />
                    </span>
                    <span className="text-6xl font-bold text-brand/[0.07]">0{i + 1}</span>
                  </div>
                  <div className="relative mt-auto">
                    <h3 className="heading-title mt-3">{it.cardTitle}</h3>
                    <p className="mt-1.5 text-ink/60">{it.description}</p>
                    <div className="mt-5 h-14">
                      <AreaChart seed={i + 4} color={i % 2 ? '#b68756' : '#5565bd'} className="h-full" />
                    </div>
                    <NavLink href={MARKET_LINKS[it.key] ?? '/markets'} aria-label={t('selectMarketAria', { label: it.label })} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                      {t('viewMore')}
                      <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand transition-all group-hover:rotate-45 group-hover:bg-gold group-hover:text-white">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </NavLink>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </motion.div>
      </div>
      </div>
    </section>
  );
}
