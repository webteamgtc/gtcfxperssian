'use client';
/**
 * Region rules, opened as the intro fades out (settings: src/config/regions.js, copy: common.json → geo):
 *  - US visitors: "Important notice" — must accept to use the site (remembered 30 days)
 *  - UAE visitors (any language) and /en-ae: CAT 1 (full site) or CAT 5 (marketing page only) — remembered 30 days, changeable from the footer
 *  - visitor on another region's site (e.g. a South African on /en-intl): small "go to your region?" note
 */
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, ChevronDown, Globe, MapPin, X } from 'lucide-react';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { getLocale } from '@/i18n/locales';
import { COOKIES, CAT5_LOCALE, CAT5_PATH, REGION_LOCALES, regionForCountry } from '@/config/regions';
import { cn } from '@/lib/utils';
import { readCookie, writeCookie, useCountry, whenIntroLeaving, localeHref } from './geoClient';
import { Gate, EASE } from './Gate';
import UsNotice from './UsNotice';

/* ------------------------------------------------------------------ UAE */

function UaeCategory({ onChoose }) {
  const t = useTranslations('geo.uae');
  // pre-selected when coming from "Visit Category 1" on the CAT 5 page (geoClient.resetUaeCategory)
  const [pick, setPick] = useState(() => {
    try {
      const p = sessionStorage.getItem('gtc_uae_pick');
      sessionStorage.removeItem('gtc_uae_pick');
      return p === '1' || p === '5' ? p : null;
    } catch {
      return null;
    }
  });
  const [ack, setAck] = useState(false);
  const [open, setOpen] = useState(false);
  const [tried, setTried] = useState(false);
  const cats = ['1', '5'];
  const go = () => {
    if (!pick) return;
    if (!ack) return setTried(true);
    onChoose(pick);
  };
  return (
    <Gate labelledBy="geo-uae-title" wide>
      <div className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand">
          <MapPin className="size-3.5" /> {t('eyebrow')}
        </p>
        <h2 id="geo-uae-title" className="heading-title mt-4">
          <AccentTitle text={t('title')} />
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink/65">{t('text')}</p>
      </div>
      <div role="radiogroup" aria-labelledby="geo-uae-title" className="mt-8 grid gap-4 sm:grid-cols-2">
        {cats.map((c, i) => {
          const on = pick === c;
          const pts = t.raw(`cat${c}.points`);
          return (
            <motion.button
              key={c}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPick(c)}
              onDoubleClick={() => ack && onChoose(c)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: EASE }}
              className={cn('group relative overflow-hidden rounded-3xl border-2 p-6 text-start outline-none transition-all duration-300 focus-visible:ring-4 focus-visible:ring-brand/20', on ? 'border-brand bg-gradient-to-b from-brand-50 to-white shadow-[0_24px_60px_-30px_rgba(41,59,147,0.6)]' : 'border-brand/10 hover:-translate-y-0.5 hover:border-brand/30')}
            >
              <span className="flex items-center justify-between">
                <span className={cn('rounded-full px-3 py-1 text-xs font-bold tracking-wide', c === '1' ? 'bg-brand text-white' : 'bg-gold text-white')}>{t(`cat${c}.badge`)}</span>
                <span className={cn('grid size-6 place-items-center rounded-full border-2 transition-colors', on ? 'border-brand bg-brand text-white' : 'border-brand/20')}>{on && <Check className="size-3.5" strokeWidth={3} />}</span>
              </span>
              <span className="heading-card mt-4 block">{t(`cat${c}.title`)}</span>
              <span className="mt-2 block text-sm leading-relaxed text-ink/60">{t(`cat${c}.text`)}</span>
              <span className="mt-4 block space-y-1.5">
                {pts.map((p) => (
                  <span key={p} className="flex items-center gap-2 text-sm text-ink/75">
                    <Check className={cn('size-4 shrink-0', c === '1' ? 'text-brand' : 'text-gold-700')} /> {p}
                  </span>
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>
      <Acknowledge t={t} checked={ack} onChange={(v) => (setAck(v), v && setTried(false))} open={open} onToggle={() => setOpen((o) => !o)} error={tried && !ack} />
      <div className="mt-6 flex flex-col items-center gap-3">
        <button type="button" disabled={!pick} onClick={go} className={cn(!ack && 'opacity-60', 'inline-flex h-13 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none')}>
          {t('continue')} <ArrowRight className="size-4 rtl:-scale-x-100" />
        </button>
        <p className="text-xs text-ink/50">{t('note')}</p>
      </div>
      <p className="mt-6 rounded-2xl bg-[#f6f8fc] px-4 py-3 text-xs leading-relaxed text-ink/55">
        <strong className="me-1 text-ink/70">{t('disclaimerTitle')}:</strong>
        {t('disclaimer')}
      </p>
    </Gate>
  );
}

/**
 * UAE acknowledgement (DRAFT wording for compliance, common.json → geo.uae.ack): must be ticked before continuing.
 * The full statement opens below the tick box; the date it was accepted is kept with the category choice.
 */
function Acknowledge({ t, checked, onChange, open, onToggle, error }) {
  return (
    <div className={cn('mt-6 rounded-2xl border p-4 transition-colors', error ? 'border-down/50 bg-down/5' : checked ? 'border-brand/30 bg-brand-50/60' : 'border-brand/10 bg-[#f6f8fc]')}>
      <label className="flex cursor-pointer items-start gap-3">
        <input id="geo-uae-ack" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-invalid={error} aria-describedby={error ? 'geo-uae-ack-err' : undefined} />
        <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20', checked ? 'border-brand bg-brand text-white' : error ? 'border-down/60 bg-white' : 'border-brand/30 bg-white')} aria-hidden>
          {checked && <Check className="size-3.5" strokeWidth={3} />}
        </span>
        <span className="text-[13px] leading-relaxed text-ink/75">{t('ack.label')}</span>
      </label>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls="geo-uae-statement" className="ms-8 mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
        {open ? t('ack.less') : t('ack.more')} <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id="geo-uae-statement" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
            <div className="ms-8 mt-3 max-h-48 overflow-y-auto pe-2">
              <p className="text-xs font-semibold text-ink/80">{t('ack.title')}</p>
              <ol className="mt-2 list-decimal space-y-1.5 ps-4 text-xs leading-relaxed text-ink/60">
                {t.raw('ack.points').map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <p id="geo-uae-ack-err" role="alert" className="ms-8 mt-2 text-xs text-down">
          {t('ack.error')}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ region suggestion */

function RegionSuggest({ country, target, onClose }) {
  const t = useTranslations('geo.region');
  const locale = useLocale();
  let name = country;
  try {
    name = new Intl.DisplayNames(['en'], { type: 'region' }).of(country) || country;
  } catch {}
  const go = () => window.location.assign(localeHref(target));
  return (
    <motion.div role="status" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.4, ease: EASE }} className="fixed inset-x-4 top-28 z-[90] mx-auto max-w-md rounded-2xl bg-white p-4 text-ink shadow-[0_24px_70px_-20px_rgba(0,0,0,0.45)] ring-1 ring-brand/10 md:inset-x-auto md:bottom-6 md:start-6 md:top-auto md:mx-0 md:w-[26rem]" dir={locale.startsWith('fa') ? 'rtl' : undefined}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
          <Globe className="size-5" />
        </span>
        <p className="flex-1 text-sm leading-relaxed text-ink/75">{t('text', { country: name })}</p>
        <button type="button" onClick={onClose} aria-label={t('stay')} className="grid size-8 place-items-center rounded-full text-ink/40 hover:bg-brand-50 hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold text-ink/60 hover:text-ink">
          {t('stay')}
        </button>
        <button type="button" onClick={go} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          {t('switch', { region: getLocale(target).label })}
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ gate */

export default function GeoGate() {
  const locale = useLocale();
  const country = useCountry();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(null); // 'us' | 'uae' | 'region' | null

  useEffect(() => {
    let alive = true;
    whenIntroLeaving().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !country) return;
    if (country === 'US' && readCookie(COOKIES.usAccepted) !== '1') return setStep('us');
    if ((country === 'AE' || locale === CAT5_LOCALE) && !readCookie(COOKIES.uaeCategory)) return setStep('uae');
    const home = regionForCountry(country);
    if (REGION_LOCALES.includes(locale) && home !== locale && home !== 'en-intl' && readCookie(COOKIES.regionDismissed) !== locale) return setStep('region');
    setStep(null);
  }, [ready, country, locale]);

  const next = () => setStep(null);
  const acceptUs = () => {
    writeCookie(COOKIES.usAccepted, '1');
    // continue with the next rule (e.g. UAE category) if any
    setStep((country === 'AE' || locale === CAT5_LOCALE) && !readCookie(COOKIES.uaeCategory) ? 'uae' : null);
  };
  const chooseCat = (c) => {
    writeCookie(COOKIES.uaeCategory, c);
    writeCookie(COOKIES.uaeAck, new Date().toISOString());
    if (c === '5') window.location.assign(localeHref(CAT5_LOCALE, CAT5_PATH));
    else next();
  };
  const stayHere = () => {
    writeCookie(COOKIES.regionDismissed, locale);
    next();
  };

  return (
    <AnimatePresence>
      {step === 'us' && <UsNotice key="us" onAccept={acceptUs} />}
      {step === 'uae' && <UaeCategory key="uae" onChoose={chooseCat} />}
      {step === 'region' && <RegionSuggest key="region" country={country} target={regionForCountry(country)} onClose={stayHere} />}
    </AnimatePresence>
  );
}
