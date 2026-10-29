'use client';
import { motion } from 'motion/react';
import ArrowLink from '@/components/shared/ArrowLink';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { Reveal } from '@/components/motion';
import { AccentTitle } from '@/components/shared/SectionIntro';

/**
 * Full-width navy closing band used at the end of inner pages:
 * pulsing gold rings, the price line, title ([accent] supported),
 * description, primary + secondary buttons and an optional risk warning.
 *
 *   <CtaBand title="The market is [moving.]" description="…"
 *            primary={{ label, href }} secondary={{ label, href }} riskTitle="Risk warning." risk="…" />
 *
 * layout="split": copy on the start side, the two buttons stacked on the end side (+ optional `note` under them).
 */
export default function CtaBand({ id, title, description, primary, secondary, riskTitle, risk, note, layout = 'center' }) {
  return (
    <section id={id} className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div dir="ltr" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
        {[300, 500, 700, 900].map((sz, i) => (
          <motion.span key={sz} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/15" style={{ width: sz, height: sz }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: i * 0.6, repeat: Infinity }} />
        ))}
      </div>
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />

      {layout === 'split' ? (
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={title} />
            </h2>
            {description && <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{description}</p>}
          </Reveal>
          <Reveal y={16} delay={0.12} className="flex flex-col gap-3 lg:ms-auto lg:w-full lg:max-w-sm">
            {primary && (
              <ArrowLink href={primary.href} variant="gold" className="justify-between">
                {primary.label}
              </ArrowLink>
            )}
            {secondary && (
              <NavLink href={secondary.href} className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
                {secondary.label}
              </NavLink>
            )}
            {note && <p className="text-center text-xs text-white/50 lg:text-start">{note}</p>}
          </Reveal>
        </div>
      ) : (
      <div className="container-x relative mx-auto max-w-4xl text-center">
        <Reveal y={16} delay={0.05}>
          <h2 className="heading-section mx-auto max-w-2xl">
            <AccentTitle text={title} />
          </h2>
        </Reveal>
        {description && (
          <Reveal y={12} delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{description}</p>
          </Reveal>
        )}
        <Reveal y={12} delay={0.18} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {primary && (
            <ArrowLink href={primary.href} variant="gold">
              {primary.label}
            </ArrowLink>
          )}
          {secondary && (
            <NavLink href={secondary.href} className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
              {secondary.label}
            </NavLink>
          )}
        </Reveal>
        {risk && (
          <Reveal y={10} delay={0.25}>
            <p className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-start text-xs leading-relaxed text-white/60 backdrop-blur">
              {riskTitle && <strong className="me-1 text-white">{riskTitle}</strong>}
              {risk}
            </p>
          </Reveal>
        )}
      </div>
      )}
    </section>
  );
}
