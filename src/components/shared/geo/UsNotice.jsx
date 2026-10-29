'use client';
/**
 * US visitors: "Important notice" — must accept to use the site (copy: common.json → geo.us).
 * Three short points, the full legal notice in a framed box, one large Accept button; Reject → "Access
 * restricted" with "Accept to visit website" / "Back to disclaimer". Accepting is remembered for 30 days.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BadgeAlert, CircleX, FileText, Landmark, ShieldAlert, TrendingDown } from 'lucide-react';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';
import { Gate, IconTile, EASE } from './Gate';

const swap = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.28, ease: EASE } };
const btnPrimary = 'inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-700';

/** "Access restricted" step after Reject. */
function Restricted({ t, onAccept, onBack }) {
  return (
    <motion.div key="restricted" {...swap} className="text-center">
      <IconTile tone="red">
        <CircleX className="size-7" />
      </IconTile>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-700">{t('restrictedEyebrow')}</p>
      <h2 id="geo-us-title" className="heading-title mt-3">
        {t('restrictedTitle')}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink/65">{t('restrictedText')}</p>
      <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3">
        <button type="button" onClick={onAccept} className={cn(btnPrimary, 'w-full')}>
          {t('acceptToVisit')}
        </button>
        <button type="button" onClick={onBack} className="text-sm font-medium text-ink/55 underline-offset-4 hover:text-brand hover:underline">
          {t('back')}
        </button>
      </div>
    </motion.div>
  );
}

export default function UsNotice({ onAccept }) {
  const t = useTranslations('geo.us');
  const [restricted, setRestricted] = useState(false);
  const icons = [TrendingDown, BadgeAlert, Landmark];
  return (
    <Gate labelledBy="geo-us-title" bare className="max-w-xl bg-white p-7 sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {!restricted ? (
          <motion.div key="notice" {...swap}>
            <div className="flex items-center justify-between gap-4">
              <h2 id="geo-us-title" className="heading-section">
                <AccentTitle text={t('title')} />
              </h2>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold/10 text-gold-700">
                <ShieldAlert className="size-6" />
              </span>
            </div>
            <ul className="mt-6 grid gap-2.5">
              {t.raw('points').map((p, i) => {
                const I = icons[i] ?? BadgeAlert;
                return (
                  <motion.li key={p} className="flex items-center gap-3 rounded-2xl bg-[#f6f8fc] px-4 py-3 text-sm font-semibold text-ink/80" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: EASE }}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                      <I className="size-4" />
                    </span>
                    {p}
                  </motion.li>
                );
              })}
            </ul>
            <div className="mt-5 rounded-2xl border border-brand/10 border-s-4 border-s-gold p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/50">
                <FileText className="size-3.5" /> {t('readFull')}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/65">{t('text')}</p>
            </div>
            <button type="button" onClick={onAccept} className={cn(btnPrimary, 'mt-7 w-full')}>
              {t('accept')} <ArrowRight className="size-4 rtl:-scale-x-100" />
            </button>
            <div className="mt-4 flex items-center justify-between gap-4 text-xs text-ink/45">
              <span>{t('note')}</span>
              <button type="button" onClick={() => setRestricted(true)} className="shrink-0 text-sm font-semibold text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                {t('reject')}
              </button>
            </div>
          </motion.div>
        ) : (
          <Restricted key="r" t={t} onAccept={onAccept} onBack={() => setRestricted(false)} />
        )}
      </AnimatePresence>
    </Gate>
  );
}
