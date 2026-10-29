'use client';
/**
 * GTC Financial Consultancy L.L.C. (CAT 5) enquiry → POST /api/uae-enquiry (e-mail via Mailgun and/or Zapier, see that route).
 * Sends the page URL and utm_* so the team can see which campaign the enquiry came from.
 * `split` (Contact Us page): First Name + Last Name, then Email, Country of Residence, Phone Number, Preferred
 * Language (optional). Home: Full Name, Email, Phone, Country of Residence, Preferred Language.
 */
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react';
import { EMAIL_RE, Field, fieldBox, fieldInput, fieldState, post } from '@/components/shared/formKit';
import { CAT5_CONTACT, CAT5_LANGUAGES } from '@/config/regions';
import { cn } from '@/lib/utils';

const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const EMPTY = { name: '', firstName: '', lastName: '', email: '', phone: '', country: '', language: '', message: '', consent: false, website: '' };

function validate(v, t, split) {
  const e = {};
  if (split) {
    if (!v.firstName.trim()) e.firstName = t('errors.firstName');
    if (!v.lastName.trim()) e.lastName = t('errors.lastName');
  } else if (v.name.trim().length < 2) e.name = t('errors.name');
  if (!EMAIL_RE.test(v.email.trim())) e.email = t('errors.email');
  if (!PHONE_RE.test(v.phone.trim())) e.phone = t('errors.phone');
  if (v.country.trim().length < 2) e.country = t('errors.country');
  if (!CAT5_LANGUAGES.includes(v.language)) e.language = t('errors.language');
  if (!v.consent) e.consent = t('errors.consent');
  return e;
}

export default function EnquiryForm({ split = false }) {
  const t = useTranslations('marketingPage.form');
  const locale = useLocale();
  const fresh = () => ({ ...EMPTY, language: locale === 'fa' ? 'fa' : 'en' });
  const [v, setV] = useState(fresh);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const pick = (k, value) => {
    setV((p) => ({ ...p, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };
  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setV((p) => ({ ...p, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validate(v, t, split);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`enq-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    const q = new URLSearchParams(window.location.search);
    const res = await post('/api/uae-enquiry', {
      ...v,
      name: split ? `${v.firstName.trim()} ${v.lastName.trim()}` : v.name,
      page: window.location.href.split('#')[0],
      utm_source: q.get('utm_source') || '',
      utm_campaign: q.get('utm_campaign') || ''
    }).catch(() => ({}));
    setStatus(res?.ok ? 'success' : 'error');
    if (res?.ok) setV(fresh());
  }

  return (
    <div className="relative rounded-3xl bg-white p-6 text-ink shadow-2xl shadow-black/30 md:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-80 flex-col items-center justify-center text-center" role="status">
            <span className="grid size-16 place-items-center rounded-full bg-up/10 text-up">
              <CircleCheck className="size-8" aria-hidden />
            </span>
            <p className="mt-5 max-w-sm text-pretty text-base leading-relaxed text-ink/75">{t('success')}</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2">
            {split ? (
              <>
                <Field id="enq-firstName" label={t('firstName')} required error={errors.firstName}>
                  <div className={cn(fieldBox, fieldState(errors.firstName))}>
                    <input id="enq-firstName" className={fieldInput} value={v.firstName} onChange={set('firstName')} autoComplete="given-name" aria-invalid={!!errors.firstName} />
                  </div>
                </Field>
                <Field id="enq-lastName" label={t('lastName')} required error={errors.lastName}>
                  <div className={cn(fieldBox, fieldState(errors.lastName))}>
                    <input id="enq-lastName" className={fieldInput} value={v.lastName} onChange={set('lastName')} autoComplete="family-name" aria-invalid={!!errors.lastName} />
                  </div>
                </Field>
              </>
            ) : (
              <Field id="enq-name" label={t('name')} required error={errors.name} className="sm:col-span-2">
                <div className={cn(fieldBox, fieldState(errors.name))}>
                  <input id="enq-name" className={fieldInput} value={v.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
                </div>
              </Field>
            )}
            <Field id="enq-email" label={t('email')} required error={errors.email}>
              <div className={cn(fieldBox, fieldState(errors.email))}>
                <input id="enq-email" type="email" className={fieldInput} value={v.email} onChange={set('email')} autoComplete="email" dir="ltr" aria-invalid={!!errors.email} />
              </div>
            </Field>
            {split ? (
              <>
                <Field id="enq-country" label={t('country')} required error={errors.country}>
                  <div className={cn(fieldBox, fieldState(errors.country))}>
                    <input id="enq-country" className={fieldInput} value={v.country} onChange={set('country')} autoComplete="country-name" aria-invalid={!!errors.country} />
                  </div>
                </Field>
                <Field id="enq-phone" label={t(split ? 'phoneNumber' : 'phone')} required error={errors.phone}>
                  <div className={cn(fieldBox, fieldState(errors.phone))}>
                    <input id="enq-phone" type="tel" inputMode="tel" className={fieldInput} value={v.phone} onChange={set('phone')} autoComplete="tel" placeholder="+971" dir="ltr" aria-invalid={!!errors.phone} />
                  </div>
                </Field>
              </>
            ) : (
              <>
                <Field id="enq-phone" label={t(split ? 'phoneNumber' : 'phone')} required error={errors.phone}>
                  <div className={cn(fieldBox, fieldState(errors.phone))}>
                    <input id="enq-phone" type="tel" inputMode="tel" className={fieldInput} value={v.phone} onChange={set('phone')} autoComplete="tel" placeholder="+971" dir="ltr" aria-invalid={!!errors.phone} />
                  </div>
                </Field>
                <Field id="enq-country" label={t('country')} required error={errors.country}>
                  <div className={cn(fieldBox, fieldState(errors.country))}>
                    <input id="enq-country" className={fieldInput} value={v.country} onChange={set('country')} autoComplete="country-name" aria-invalid={!!errors.country} />
                  </div>
                </Field>
              </>
            )}
            <Field id="enq-language" label={t('language')} required={!split} error={errors.language}>
              <div role="radiogroup" aria-label={t('language')} className="grid h-12 grid-cols-2 gap-1 rounded-xl border border-brand/15 bg-white p-1">
                {CAT5_LANGUAGES.map((l) => (
                  <button
                    key={l}
                    id={l === CAT5_LANGUAGES[0] ? 'enq-language' : undefined}
                    type="button"
                    role="radio"
                    aria-checked={v.language === l}
                    onClick={() => pick('language', l)}
                    className={cn('rounded-lg text-sm font-semibold transition-colors', v.language === l ? 'bg-brand text-white shadow' : 'text-ink/60 hover:bg-brand-50 hover:text-brand')}
                  >
                    {t(`languages.${l}`)}
                  </button>
                ))}
              </div>
            </Field>
            <Field id="enq-message" label={t('message')} className="sm:col-span-2">
              <textarea
                id="enq-message"
                rows={3}
                maxLength={2000}
                value={v.message}
                onChange={set('message')}
                placeholder={t('messagePlaceholder')}
                className="w-full resize-none rounded-xl border border-brand/15 bg-white px-3.5 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </Field>
            {/* honeypot — hidden from people, filled by bots */}
            <input type="text" name="website" value={v.website} onChange={set('website')} tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] size-px opacity-0" aria-hidden />
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink/65">
                <input id="enq-consent" type="checkbox" checked={v.consent} onChange={set('consent')} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand" aria-invalid={!!errors.consent} />
                {t('consent')}
              </label>
              {errors.consent && <p className="mt-1 ps-7 text-[11px] text-down">{errors.consent}</p>}
            </div>
            {status === 'error' && (
              <p className="flex items-start gap-2 rounded-xl bg-down/10 px-4 py-3 text-xs text-down sm:col-span-2" role="alert">
                <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden /> {t('error', { email: CAT5_CONTACT.email })}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-white shadow-lg shadow-gold/30 transition-all hover:bg-gold-600 disabled:opacity-70 sm:col-span-2"
            >
              {status === 'sending' ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden /> {t('sending')}
                </>
              ) : (
                <>
                  {t('submit')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" aria-hidden />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
