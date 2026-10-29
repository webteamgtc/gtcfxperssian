'use client';
/**
 * "Apply live trading account" form.
 * Talks to the GTC proxy routes in /api/gtc: get-country → check-email → get-code → reg.
 * Partner code / deep link are read from the URL (?code, ?ref, ?partner_id, ?partner_code, ?ib, ?deep_link_value).
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'react-toastify';
import { ChevronDown, Eye, EyeOff, Globe, LoaderCircle, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PORTAL } from '@/config/menu';
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { EMAIL_RE as EMAIL, LETTERS_RE as LETTERS, post, Field, fieldBox as box, fieldInput as input, fieldState as boxState, phoneField as phoneCls, dialFor, useGtcCountries } from './formKit';

const LOGIN_URL = PORTAL.login;
const TERMS_URL = 'https://www.gtcfx.com/terms';
const PRIVACY_URL = 'https://www.gtcfx.com/privacy';

const EMPTY = { firstname: '', lastname: '', email: '', otp: '', password: '', country: '', phone: '', partnerCode: '', terms: false };

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstname: '', lastname: '' };
  if (parts.length === 1) return { firstname: parts[0], lastname: parts[0] };
  return { firstname: parts[0], lastname: parts.slice(1).join(' ') };
}

function readUrlParams() {
  if (typeof window === 'undefined') return { partner: '', locked: false, deepLink: '' };
  const q = new URLSearchParams(window.location.search);
  const partner = q.get('code') || q.get('ref') || q.get('partner_id') || q.get('partner_code') || q.get('ib') || '';
  return { partner, locked: !!(q.get('code') || q.get('ref')), deepLink: q.get('deep_link_value') || '' };
}

/**
 * Messages (code sent, already registered, registration result…) are shown as react-toastify toasts —
 * the page must render <Toaster /> (src/components/shared/Toaster.jsx).
 * `title` / `subtitle` override the card header (defaults: tradingPage.liveForm.title / subtitle).
 * `variant="page"` is the roomier layout used on /live-account-application; the default suits a hero column.
 */
export function LiveAccountForm({ title, subtitle, variant = 'compact', className }) {
  const t = useTranslations('tradingPage.liveForm');
  const page = variant === 'page';
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const { countries, failed: countriesFailed, suggested } = useGtcCountries();
  const [showPw, setShowPw] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerLocked, setPartnerLocked] = useState(false);
  const [deepLink, setDeepLink] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // URL params (read after mount so the page can stay statically rendered)
  useEffect(() => {
    const { partner, locked, deepLink: dl } = readUrlParams();
    if (partner) {
      setValues((v) => ({ ...v, partnerCode: partner }));
      setPartnerOpen(true);
    }
    setPartnerLocked(locked);
    setDeepLink(dl);
  }, []);

  // preselect the visitor's country once the list arrives
  useEffect(() => {
    if (suggested) setValues((v) => (v.country ? v : { ...v, country: suggested.name }));
  }, [suggested]);

  const selected = countries.find((c) => c.name === values.country);
  const dial = dialFor(selected);
  // phone holds an international number ("+971501234567") from PhoneInput; just a dial code counts as empty
  const phoneEmpty = !values.phone || /^\+\d{0,4}$/.test(values.phone);

  // picking a country (or the preselected one) starts the phone with its dial code, unless a number was typed
  useEffect(() => {
    if (dial) setValues((v) => (!v.phone || /^\+\d{0,4}$/.test(v.phone) ? { ...v, phone: `+${dial}` } : v));
  }, [dial]);

  const errors = useMemo(() => {
    const e = {};
    if (!values.firstname.trim()) e.firstname = t('errors.firstName');
    else if (!LETTERS.test(values.firstname)) e.firstname = t('errors.firstNameLetters');
    if (!values.lastname.trim()) e.lastname = t('errors.lastName');
    else if (!LETTERS.test(values.lastname)) e.lastname = t('errors.lastNameLetters');
    if (!values.email.trim()) e.email = t('errors.email');
    else if (!EMAIL.test(values.email.trim())) e.email = t('errors.emailInvalid');
    if (!values.otp) e.otp = t('errors.otpRequired');
    else if (!/^\d{6}$/.test(values.otp)) e.otp = t('errors.otpLength');
    if (!values.password) e.password = t('errors.passwordRequired');
    else if (values.password.length < 8) e.password = t('errors.passwordMin');
    else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(values.password)) e.password = t('errors.passwordPattern');
    if (!values.country) e.country = t('errors.country');
    if (phoneEmpty) e.phone = t('errors.phone');
    else if (!isValidPhoneNumber(values.phone)) e.phone = t('errors.phoneInvalid');
    if (!values.terms) e.terms = t('errors.terms');
    return e;
  }, [values, phoneEmpty, t]);

  const err = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const blur = (k) => () => setTouched((tc) => ({ ...tc, [k]: true }));

  const sendCode = async () => {
    setTouched((tc) => ({ ...tc, email: true }));
    if (errors.email) {
      toast.error(errors.email);
      return;
    }
    setOtpLoading(true);
    try {
      const check = await post('/api/gtc/check-email', { email: values.email.trim() });
      if (!(check?.code === 200 && /available/i.test(check?.message || ''))) {
        toast.error(check?.message || t('errors.emailRegistered'));
        return;
      }
      const res = await post('/api/gtc/get-code', { email: values.email.trim(), type: '0' });
      if (res?.code === 200) {
        setCodeSent(true);
        toast.success(res?.message || t('toast.otpSent'));
      } else toast.error(res?.message || t('toast.codeError'));
    } catch {
      toast.error(t('toast.codeError'));
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (Object.keys(errors).length) return;
    if (!selected) {
      toast.error(t('errors.validCountry'));
      return;
    }

    const { firstname, lastname: splitLast } = splitName(values.firstname);
    const lastname = values.lastname.trim() || splitLast;
    const partner = values.partnerCode.trim();
    const payload = {
      code: values.otp,
      is_company: 0,
      area: parsePhoneNumber(values.phone)?.countryCallingCode || dial,
      country: selected.name,
      email: values.email.trim(),
      phone: values.phone,
      password: values.password,
      lastname,
      firstname,
      ...(partner ? { ref: partner, invite_code: partner } : {}),
      ...(deepLink.trim() ? { deep_link_value: deepLink.trim() } : {})
    };

    setLoading(true);
    try {
      const res = await post('/api/gtc/reg', payload);
      if (res?.code === 200) {
        toast.success(res?.message || t('toast.registrationSuccess'));
        setValues((v) => ({ ...EMPTY, country: v.country, phone: dial ? `+${dial}` : '', partnerCode: partnerLocked ? v.partnerCode : '' }));
        setTouched({});
        setCodeSent(false);
      } else toast.error(res?.message || t('toast.registrationFailed'));
    } catch {
      toast.error(t('toast.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('overflow-hidden rounded-[1.75rem] border border-white/10 bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.6)]', className)}>
      <div className={cn('relative overflow-hidden bg-gradient-to-r from-brand via-brand-800 to-brand-950 text-white', page ? 'px-6 py-6 text-center md:px-10 md:py-7' : 'px-5 py-4 md:px-7')}>
        {page && <span className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />}
        {page && <motion.span className="absolute -end-10 -top-16 size-48 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />}
        <h2 className={cn('relative is-dark', page ? 'heading-title' : 'heading-card')}>{title ?? t('title')}</h2>
        <p className={cn('relative mt-1 text-white/75', page ? 'text-sm' : 'text-xs md:text-sm')}>{subtitle ?? t('subtitle')}</p>
      </div>

      <form className={cn(page ? 'space-y-5 p-6 md:p-10' : 'space-y-3.5 p-5 md:p-6')} onSubmit={onSubmit} noValidate>
        <div className={cn('grid sm:grid-cols-2', page ? 'gap-x-5 gap-y-5' : 'gap-x-3.5 gap-y-3.5')}>
          {/* names */}
          <Field id="lf-first" label={t('firstName')} required error={err('firstname')}>
            <span className={cn(box, boxState(err('firstname')))}>
              <User className="size-4 shrink-0 text-ink/35" />
              <input id="lf-first" className={input} value={values.firstname} onChange={set('firstname')} onBlur={blur('firstname')} placeholder={t('firstName')} autoComplete="given-name" />
            </span>
          </Field>
          <Field id="lf-last" label={t('lastName')} required error={err('lastname')}>
            <span className={cn(box, boxState(err('lastname')))}>
              <User className="size-4 shrink-0 text-ink/35" />
              <input id="lf-last" className={input} value={values.lastname} onChange={set('lastname')} onBlur={blur('lastname')} placeholder={t('lastName')} autoComplete="family-name" />
            </span>
          </Field>

          {/* email + code */}
          <Field id="lf-email" label={t('email')} required error={err('email')}>
            <span className={cn(box, boxState(err('email')))}>
              <Mail className="size-4 shrink-0 text-ink/35" />
              <input id="lf-email" type="email" className={input} value={values.email} onChange={set('email')} onBlur={blur('email')} placeholder={t('emailPlaceholder')} autoComplete="email" />
            </span>
          </Field>
          <Field id="lf-otp" label={t('code')} required error={err('otp')}>
            <span className={cn(box, boxState(err('otp')))}>
              <ShieldCheck className="size-4 shrink-0 text-ink/35" />
              <input id="lf-otp" className={input} value={values.otp} onChange={(e) => set('otp')(e.target.value.replace(/\D/g, '').slice(0, 6))} onBlur={blur('otp')} inputMode="numeric" maxLength={6} placeholder={t('codePlaceholder')} autoComplete="one-time-code" />
              <button type="button" onClick={sendCode} disabled={otpLoading} className="shrink-0 whitespace-nowrap text-xs font-semibold text-brand transition-colors hover:text-gold-700 disabled:opacity-60">
                {otpLoading ? t('sendingCode') : codeSent ? t('resendCode') : t('getCode')}
              </button>
            </span>
          </Field>

          {/* password + country */}
          <Field id="lf-pw" label={t('password')} required error={err('password')} hint={t('passwordHint')}>
            <span className={cn(box, boxState(err('password')))}>
              <LockKeyhole className="size-4 shrink-0 text-ink/35" />
              <input id="lf-pw" type={showPw ? 'text' : 'password'} className={input} value={values.password} onChange={set('password')} onBlur={blur('password')} placeholder={t('password')} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="shrink-0 text-ink/35 transition-colors hover:text-brand" aria-label={showPw ? t('hidePassword') : t('showPassword')}>
                {showPw ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </span>
          </Field>
          <Field id="lf-country" label={t('country')} required error={err('country')}>
            <span className={cn(box, boxState(err('country')), 'relative')}>
              <Globe className="size-4 shrink-0 text-ink/35" />
              <select id="lf-country" value={values.country} onChange={set('country')} onBlur={blur('country')} disabled={!countries.length} className={cn(input, 'cursor-pointer appearance-none pe-6 disabled:cursor-wait', !values.country && 'text-ink/40')}>
                <option value="" disabled>
                  {countries.length ? t('countrySelect') : countriesFailed ? t('errors.country') : t('countryLoading')}
                </option>
                {countries.map((c, index) => (
                  <option key={`c.code-${index}`} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3.5 size-4 text-ink/35" />
            </span>
          </Field>

          {/* phone + partner code */}
          <Field id="lf-phone" label={t('phone')} required error={err('phone')}>
            <span className={cn(box, boxState(err('phone')), phoneCls)} dir="ltr">
              <PhoneInput
                id="lf-phone"
                name="phone"
                international
                defaultCountry={selected?.code || suggested?.code || 'AE'}
                value={values.phone || undefined}
                onChange={(v) => set('phone')(v ?? '')}
                onBlur={blur('phone')}
                autoComplete="tel"
              />
            </span>
          </Field>
          <div className="min-w-0">
            <button type="button" onClick={() => setPartnerOpen((v) => !v)} className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-ink/65" aria-expanded={partnerOpen} aria-controls="lf-partner">
              <span>
                {t('partner')} <span className="font-normal text-ink/40">{t('optional')}</span>
              </span>
              <ChevronDown className={cn('size-4 text-ink/35 transition-transform duration-300', partnerOpen && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {partnerOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <span className={cn(box, boxState(false), partnerLocked && 'bg-[#f4f6fb]')}>
                    <input id="lf-partner" className={cn(input, partnerLocked && 'cursor-not-allowed')} value={values.partnerCode} onChange={set('partnerCode')} readOnly={partnerLocked} aria-label={t('partner')} />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* declaration */}
        <div>
          <label className="flex cursor-pointer gap-2.5 rounded-xl bg-[#f6f7fb] p-3 text-[11.5px] leading-relaxed text-ink/65 ring-1 ring-brand/5">
            <input type="checkbox" checked={values.terms} onChange={set('terms')} onBlur={blur('terms')} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#293b93]" />
            <span className={cn('space-y-1 pe-1', !page && 'max-h-28 overflow-y-auto')}>
              <span className="block font-medium text-ink/80">{t('confirmIntro')}</span>
              <span className="block">
                {t('confirm1Start')}{' '}
                <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
                  {t('terms')}
                </a>{' '}
                {t('and')}{' '}
                <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
                  {t('privacy')}
                </a>
                ;
              </span>
              <span className="block">{t('confirm2')}</span>
              <span className="block">{t('confirm3')}</span>
            </span>
          </label>
          {err('terms') && <p className="mt-1 text-[11px] text-down">{err('terms')}</p>}
        </div>

        <button type="submit" disabled={loading} className={cn('shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60', page ? 'h-12 text-base' : 'h-11 text-sm')}>
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {loading ? t('registering') : t('submit')}
        </button>

        <p className="text-center text-xs text-ink/60">
          {t('haveAccount')}{' '}
          <a href={LOGIN_URL} className="font-semibold text-brand underline underline-offset-2 hover:text-gold-700">
            {t('login')}
          </a>
        </p>
      </form>
    </div>
  );
}
