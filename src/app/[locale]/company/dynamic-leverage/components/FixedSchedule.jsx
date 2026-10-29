'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { BellRing, Check, Clock, Info, MoonStar, ShieldAlert, TriangleAlert, X } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { CandleChart } from '@/components/shared/devices';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const TZ = { china: 'bg-brand', server: 'bg-up', uae: 'bg-gold' };

function CardHead({ Icon, title, tone = 'brand' }) {
  return (
    <div className="flex items-center gap-3.5 border-b border-brand/10 pb-5">
      <span className={cn('grid size-11 place-items-center rounded-xl ring-1', tone === 'warn' ? 'bg-gold/10 text-gold-700 ring-gold/20' : 'bg-brand-50 text-brand ring-brand/10')}>
        <Icon className="size-5" />
      </span>
      <h3 className="text-lg font-semibold text-ink md:text-xl">{title}</h3>
    </div>
  );
}

/** Timeline of times, each with its timezone dot; XAUUSD cutoffs in red. */
function Timeline({ title, rows }) {
  return (
    <div className="mt-6">
      <h4 className="text-[15px] font-semibold text-brand">{title}</h4>
      <Stagger as="ol" className="relative mt-3 space-y-1 ps-5" stagger={0.06}>
        <span className="absolute inset-y-2 start-[5px] w-px bg-gradient-to-b from-brand/30 via-brand/15 to-transparent" aria-hidden />
        {rows.map((r, i) => (
          <StaggerItem as="li" key={`${r.time}-${i}`} className="relative flex items-center gap-4 rounded-lg py-1.5 transition-colors hover:bg-brand-50/50">
            <span className={cn('absolute -start-5 size-2.5 rounded-full ring-4 ring-white', r.cutoff ? 'bg-down' : TZ[r.tz])} />
            <span className={cn('w-14 font-bold tabular-nums', r.cutoff ? 'text-down' : 'text-brand')}>{r.time}</span>
            <span className={cn('text-[15px]', r.cutoff ? 'italic text-down' : 'text-ink/70')}>{r.zone}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

/** Code-drawn stand-in for the coins photo: rising coin stacks in front of a live candle chart. */
function MarketVisual() {
  const stacks = [5, 8, 11, 15, 19];
  return (
    <div className="relative h-72 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-600 via-brand-800 to-ink md:h-80" aria-hidden>
      <div className="bg-grid-dark absolute inset-0 opacity-50" />
      <div className="absolute inset-x-0 top-0 h-3/4 opacity-70">
        <CandleChart n={34} seed={41} dark className="h-full" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div dir="ltr" className="absolute inset-x-0 bottom-6 flex items-end justify-center gap-4">
        {stacks.map((n, i) => (
          <div key={n} className="flex flex-col-reverse">
            {Array.from({ length: n }, (_, k) => (
              <motion.span key={k} className="-mt-1.5 block h-3 w-12 rounded-[50%] border border-gold-700/60 bg-gradient-to-b from-gold-200 via-gold to-gold-700 shadow-sm md:w-14" initial={{ opacity: 0, y: -30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.12 + k * 0.03, duration: 0.35, ease: EASE }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 24h dial with the 23:30 – 00:15 rollover arc highlighted and a sweeping hand. */
function RolloverDial() {
  const R = 44;
  const C = 2 * Math.PI * R;
  const arc = (45 / 1440) * C;
  const start = (23.5 / 24) * 360;
  return (
    <div dir="ltr" className="relative grid size-36 shrink-0 place-items-center" aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(41,59,147,0.1)" strokeWidth="8" />
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1="50" y1="9" x2="50" y2={i % 6 ? 12 : 15} stroke="rgba(41,59,147,0.3)" strokeWidth="1" transform={`rotate(${i * 15} 50 50)`} />
        ))}
        <motion.circle cx="50" cy="50" r={R} fill="none" stroke="#b68756" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${arc} ${C}`} transform={`rotate(${start - 90} 50 50)`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
      </svg>
      <motion.span className="absolute left-1/2 top-1/2 h-11 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-brand" animate={{ rotate: [start - 20, start + 30, start - 20] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <span className="relative grid size-9 place-items-center rounded-full bg-white text-brand shadow-md ring-1 ring-brand/10">
        <MoonStar className="size-4" />
      </span>
    </div>
  );
}

export function FixedSchedule() {
  const t = useTranslations('dynamicLeveragePage.fixed');
  const w = t.raw('weekend');
  const legend = t.raw('legend');
  const news = t.raw('news');
  const notes = t.raw('notes');
  const ro = t.raw('rollover');
  const hmr = t.raw('hmr');

  return (
    <section id="fixed" className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-2 lg:gap-6">
          {/* start column */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <Reveal x={-24} y={0}>
              <article className="rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-sm md:p-7">
                <CardHead Icon={Clock} title={w.title} />
                <Timeline title={w.before.title} rows={w.before.rows} />
                <Timeline title={w.after.title} rows={w.after.rows} />
              </article>
            </Reveal>
            <Reveal x={-24} y={0} delay={0.1}>
              <article className="rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-sm md:p-7">
                <CardHead Icon={TriangleAlert} title={news.title} tone="warn" />
                <Stagger as="ul" className="mt-5 space-y-3" stagger={0.08}>
                  {news.points.map((p) => (
                    <StaggerItem as="li" key={p} className="flex items-center gap-3 text-[15px] text-ink/70">
                      <BellRing className="size-4 shrink-0 text-gold-700" />
                      {p}
                    </StaggerItem>
                  ))}
                </Stagger>
              </article>
            </Reveal>
          </div>

          {/* end column */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <Reveal x={24} y={0}>
              <MarketVisual />
            </Reveal>
            <Reveal x={24} y={0} delay={0.08}>
              <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-2xl border border-brand/10 bg-white px-5 py-4 text-sm text-ink/70">
                {Object.entries(legend).map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-2">
                    <span className={cn('size-2.5 rounded-full', TZ[k])} />
                    {v}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal x={24} y={0} delay={0.16}>
              <article className="relative overflow-hidden rounded-[1.75rem] border border-down/15 bg-gradient-to-br from-red-50 to-white p-6 md:p-7">
                <div className="flex items-center gap-3.5">
                  <span className="relative grid size-11 place-items-center rounded-xl bg-down/10 text-down">
                    <motion.span className="absolute inset-0 rounded-xl bg-down/20" animate={{ scale: [1, 1.35], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                    <Info className="relative size-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-down md:text-xl">{notes.title}</h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {notes.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-[15px] text-ink/75">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-down/10 text-down">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        </div>

        {/* rollover */}
        <Reveal className="mt-5 lg:mt-6" y={20}>
          <article className="grid items-center gap-6 rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-sm md:grid-cols-[auto_1fr] md:gap-10 md:p-8">
            <RolloverDial />
            <div>
              <h3 className="text-xl font-semibold text-ink">{ro.title}</h3>
              <div className="mt-4 rounded-2xl bg-[#f6f7fb] px-5 py-4 ring-1 ring-brand/5">
                <div className="text-sm text-ink/60">{ro.label}</div>
                <div className="mt-1 text-xl font-bold text-brand md:text-2xl">{ro.time}</div>
                <div className="mt-1 text-sm text-ink/45">{ro.sub}</div>
              </div>
              {ro.lines.map((l) => (
                <p key={l} className="mt-3 text-[15px] text-ink/65">
                  {l}
                </p>
              ))}
            </div>
          </article>
        </Reveal>

        {/* HMR */}
        <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
          <Reveal y={20}>
            <article className="h-full rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-sm md:p-8">
              <h3 className="text-xl font-semibold text-ink">{hmr.title}</h3>
              <Stagger as="ul" className="mt-5 grid gap-2.5 sm:grid-cols-2" stagger={0.07}>
                {hmr.points.map((p) => (
                  <StaggerItem as="li" key={p} className="flex items-center gap-3 rounded-xl bg-[#f6f7fb] px-4 py-3 text-sm text-ink/75 ring-1 ring-brand/5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">
                      <X className="size-3" strokeWidth={3} />
                    </span>
                    {p}
                  </StaggerItem>
                ))}
              </Stagger>
              {hmr.lines.map((l) => (
                <p key={l} className="mt-4 text-[15px] leading-relaxed text-ink/65">
                  {l}
                </p>
              ))}
              <p className="mt-5 flex items-center gap-2.5 rounded-xl bg-up/5 px-4 py-3 text-[15px] font-semibold text-ink ring-1 ring-up/15">
                <Check className="size-4 shrink-0 text-up" strokeWidth={3} />
                {hmr.strong}
              </p>
            </article>
          </Reveal>
          <Reveal y={20} delay={0.1}>
            <article className="is-dark relative h-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-6 text-white shadow-xl shadow-brand/20 md:p-8">
              <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
              <motion.span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/20 blur-3xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15">
                <ShieldAlert className="size-6" />
              </span>
              <h3 className="relative mt-5 text-xl font-semibold">{t('notice.title')}</h3>
              <p className="relative mt-3 text-[15px] leading-relaxed text-white/70">{t('notice.text')}</p>
              {/* margin requirement rising and falling back */}
              <div dir="ltr" className="relative mt-6 flex h-14 items-end gap-1" aria-hidden>
                {Array.from({ length: 24 }, (_, i) => {
                  const spike = i >= 10 && i <= 14;
                  return <motion.span key={i} className={cn('flex-1 rounded-t-sm', spike ? 'bg-gold' : 'bg-white/25')} initial={{ height: 0 }} whileInView={{ height: spike ? `${60 + (i === 12 ? 40 : 20)}%` : '28%' }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 + i * 0.03, ease: EASE }} />;
                })}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
