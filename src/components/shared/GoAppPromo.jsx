'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import BandLine from '@/components/shared/BandLine';
import GtcGoPhone from '@/components/shared/GtcGoPhone';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, TiltCard, EASE } from '@/components/motion';
import StoreButtons from '@/app/[locale]/trading/common-gtc-components/components/StoreButtons';

/** QR to the GTC Go page on this site (built after mount, so it uses the current origin). */
export function GoQr({ label }) {
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(`${window.location.origin}/trading/gtc-go-app`), []);
  return (
    <div className="hidden items-center gap-3 rounded-2xl bg-white p-2.5 pe-4 text-ink shadow-xl sm:inline-flex">
      <div className="grid size-20 place-items-center rounded-xl bg-white">{url ? <QRCodeSVG value={url} size={72} fgColor="#0d153a" /> : <span className="size-[72px] animate-pulse rounded-lg bg-brand-50" />}</div>
      <span className="max-w-[9rem] text-xs font-semibold leading-snug text-ink/70">{label}</span>
    </div>
  );
}

/**
 * Navy GTC Go band: copy, store buttons + QR, optional stats; the live app phone on the other side.
 * `ns` = translation namespace with { title, description, qrLabel, stats? }.
 */
export function GoAppPromo({ ns = 'knowledgePage.gtcGoPromo' }) {
  const t = useTranslations(ns);
  const stats = t.has('stats') ? t.raw('stats') : [];
  return (
    <section id="gtc-go" className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('title')} accentClassName="text-gradient-gold" />
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-lg text-white/70">{t('description')}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StoreButtons tone="white" />
            <GoQr label={t('qrLabel')} />
          </div>
          {stats.length > 0 && (
            <Stagger className="mt-10 grid max-w-lg grid-cols-3 gap-3" stagger={0.1}>
              {stats.map((s) => (
                <StaggerItem key={s.label} className="rounded-2xl bg-white/[0.06] px-4 py-4 text-center ring-1 ring-white/10 backdrop-blur">
                  <div dir="ltr" className="text-gradient-gold text-2xl font-bold">
                    <StatValue value={s.value} />
                  </div>
                  <div className="mt-1 text-xs text-white/55">{s.label}</div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Reveal>

        <div className="relative mx-auto flex w-full max-w-[420px] justify-center py-6">
          <div className="absolute inset-0 m-auto size-[340px] rounded-full bg-brand-500/40 blur-3xl" aria-hidden />
          {[300, 420].map((s, k) => (
            <motion.span key={s} className="absolute left-1/2 top-1/2 hidden rounded-full border border-white/10 sm:block" style={{ width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2 }} animate={{ rotate: k ? -360 : 360 }} transition={{ duration: 40 + k * 15, repeat: Infinity, ease: 'linear' }} aria-hidden>
              <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-gold-200" />
            </motion.span>
          ))}
          <TiltCard className="relative" max={8} glare={false}>
            <motion.div initial={{ opacity: 0, y: 60, rotate: 10 }} whileInView={{ opacity: 1, y: 0, rotate: -6 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}>
              <GtcGoPhone className="w-[240px] md:w-[260px]" />
            </motion.div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
