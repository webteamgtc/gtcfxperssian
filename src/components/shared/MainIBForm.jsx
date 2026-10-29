'use client';
/**
 * "Open your Free Demo Account" form.
 * 1. Get Code → POST /api/send-phone-otp (WhatsApp); the 6-digit code is checked by POST /api/verify-otp
 * 2. Submit (only once the phone is verified):
 *    /api/validate-email → /api/mt5-server (creates the MT5 demo account, generated passwords)
 *    → Zapier webhook + /api/mt5-completion-mail (login details email)
 * Messages are react-toastify toasts — the page renders <Toaster /> (src/components/shared/Toaster.jsx).
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'react-toastify';
import PhoneInput, { getCountries, isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { BadgeCheck, ChevronDown, Globe, LoaderCircle, Mail, MonitorSmartphone, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateBusinessEmail } from '@/lib/emailValidation';
import { useLocationDetail } from '@/config/useLocationDetails';
import { EMAIL_RE, post, Field, fieldBox as box, fieldInput as input, fieldState, useGtcCountries } from './formKit';

const PHONE_COUNTRIES = new Set(getCountries()); // ISO codes PhoneInput can show as a flag

const CLIENT_AGREEMENT_PDF = 'https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/pdf-files/Vanuatu.pdf';
const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/16420445/3ajp4wk/';
// MT5 server group per account type id (freeDemoAccount.form.accountTypes); types without a group are not offered
const GROUPS = { mt5: 'demo\\web.hedged' };
const EMPTY = { fullName: '', email: '', phone: '', code: '', accountType: '', country: '', consent: false };

/** 12 chars with at least one lower, upper, digit and symbol (MT5 password rules). */
function generatePassword(length = 12) {
  const sets = ['abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789', '!@#$%^&*'];
  const all = sets.join('');
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  const chars = [...sets.map(pick), ...Array.from({ length: length - sets.length }, () => pick(all))];
  return chars.sort(() => Math.random() - 0.5).join('');
}

/* PhoneInput (react-phone-number-input) restyled to match the other fields */
const phoneCls =
  '[&_.PhoneInput]:flex [&_.PhoneInput]:h-full [&_.PhoneInput]:w-full [&_.PhoneInput]:items-center [&_.PhoneInput]:gap-2.5 ' +
  '[&_.PhoneInputCountry]:me-0 [&_.PhoneInputCountry]:border-e [&_.PhoneInputCountry]:border-brand/10 [&_.PhoneInputCountry]:pe-2.5 ' +
  '[&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountryIcon--border]:bg-transparent [&_.PhoneInputCountryIcon--border]:shadow-none ' +
  '[&_.PhoneInputCountrySelectArrow]:text-ink/50 [&_.PhoneInputCountrySelectArrow]:opacity-80 ' +
  '[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-ink [&_.PhoneInputInput]:outline-none';

export function DemoAccountForm({ id = 'demo-form', className }) {
  const t = useTranslations('freeDemoAccount.form');
  const locale = useLocale();
  const types = t.raw('accountTypes').filter((o) => GROUPS[o.id]);
  const { countries, failed, suggested } = useGtcCountries();
  const { countryCode } = useLocationDetail(); // visitor's IP country (ipinfo)
  const [values, setValues] = useState({ ...EMPTY, accountType: types[0]?.id ?? '' });
  const [countryPicked, setCountryPicked] = useState(false); // the visitor chose a country themselves
  const [touched, setTouched] = useState({});
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Country: IP country first, browser-language guess as a fallback; never overrides the visitor's own choice
  const ipCountry = useMemo(() => (countryCode ? countries.find((c) => c.code === countryCode) : null), [countries, countryCode]);
  useEffect(() => {
    const preferred = ipCountry ?? suggested;
    if (!preferred || countryPicked) return;
    setValues((v) => (v.country === preferred.name || (v.country && !ipCountry) ? v : { ...v, country: preferred.name }));
  }, [ipCountry, suggested, countryPicked]);

  // Phone flag: IP country → browser-language guess → UAE
  const phoneCountry = [countryCode, suggested?.code].find((c) => c && PHONE_COUNTRIES.has(c)) ?? 'AE';

  const phoneValid = Boolean(values.phone) && isValidPhoneNumber(values.phone);

  const errors = useMemo(() => {
    const e = {};
    if (!values.fullName.trim()) e.fullName = t('errors.fullName');
    const email = values.email.trim();
    if (!email) e.email = t('errors.email');
    else if (!EMAIL_RE.test(email)) e.email = t('errors.emailInvalid');
    else {
      const { reason } = validateBusinessEmail(email);
      if (reason === 'plus_alias') e.email = t('errors.emailNoPlus');
      else if (reason === 'blocked_domain') e.email = t('errors.emailBlockedDomain');
    }
    if (!values.phone) e.phone = t('errors.phone');
    if (!values.country) e.country = t('errors.country');
    if (!values.code) e.code = t('errors.otpRequired');
    else if (values.code.length !== 6) e.code = t('errors.otpLength');
    if (!values.consent) e.consent = t('errors.consent');
    return e;
  }, [values, t]);

  const err = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const blur = (k) => () => setTouched((tc) => ({ ...tc, [k]: true }));

  // a new number needs a new code
  const setPhone = (phone) => {
    setValues((v) => ({ ...v, phone: phone ?? '', code: '' }));
    setVerified(false);
  };

  const requestCode = async () => {
    setTouched((tc) => ({ ...tc, phone: true }));
    if (!values.phone) return toast.error(t('errors.phone'));
    if (!phoneValid) return toast.error(t('errors.phoneInvalid'));
    setCodeLoading(true);
    try {
      const res = await post('/api/send-phone-otp', { phone: values.phone, first_name: values.fullName.trim(), locale, channel: 'whatsapp' });
      if (res?.success || (res?.message && res?.success !== false)) {
        setValues((v) => ({ ...v, code: '' }));
        setVerified(false);
        setCodeOpen(true);
        toast.success(t('toast.otpSent'));
      } else {
        setCodeOpen(false);
        toast.error(res?.message || t('toast.error'));
      }
    } catch {
      setCodeOpen(false);
      toast.error(t('toast.error'));
    } finally {
      setCodeLoading(false);
    }
  };

  const verifyCode = async (code) => {
    if (code.length !== 6) return;
    try {
      const res = await post('/api/verify-otp', { phone: values.phone, otp: code });
      if (res?.success) {
        toast.success(t('toast.otpVerified'));
        setCodeOpen(false);
        setVerified(true);
      } else {
        toast.error(res?.message || t('toast.otpFailed'));
        setVerified(false);
      }
    } catch {
      toast.error(t('toast.otpFailed'));
      setVerified(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (!verified) return toast.error(t('verifyPhoneRequired'));
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const check = await post('/api/validate-email', { email: values.email.trim() });
      if (!check?.valid) {
        return toast.error(check?.reason === 'plus_alias' ? t('errors.emailNoPlus') : check?.reason === 'blocked_domain' ? t('errors.emailBlockedDomain') : t('errors.emailInvalid'));
      }

      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'formSubmission', formName: 'Form' });
      } catch {
        /* analytics optional */
      }

      const group = GROUPS[values.accountType];
      const password = generatePassword();
      const investPassword = generatePassword();
      const country = countries.find((c) => c.name === values.country)?.name ?? values.country;
      const account = { first_name: values.fullName.trim(), phone: values.phone, email: values.email.trim(), password, company: 'no', country, group, invest_password: investPassword };

      const mt5 = await post('/api/mt5-server', account);
      if (!mt5?.success) return toast.error(mt5?.message || mt5?.error || t('toast.mt5Failed'));
      toast.success(mt5?.message || t('toast.mt5Success'));

      const submitted = { nickname: account.first_name, email: account.email, phone: account.phone, password, invest_password: investPassword, country, platform: group, otp: values.code, terms: values.consent };
      setValues((v) => ({ ...EMPTY, accountType: v.accountType, country: v.country }));
      setTouched({});
      setCodeOpen(false);
      setVerified(false);

      const [, mail] = await Promise.allSettled([
        // text/plain body (no CORS preflight), same as the previous site
        fetch(ZAPIER_WEBHOOK, { method: 'POST', body: JSON.stringify(submitted) }),
        post('/api/mt5-completion-mail', { name: account.first_name, phone: account.phone, email: account.email, password, user: mt5?.data?.data?.user, invest_password: investPassword, server_name: group })
      ]);
      if (mail.status === 'fulfilled' && (mail.value?.success ?? true)) toast.success(mail.value?.message || t('toast.emailSuccess'));
      else toast.error((mail.status === 'fulfilled' && mail.value?.message) || t('toast.emailFailed'));
    } catch {
      toast.error(t('toast.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={id} className={cn('scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white text-ink shadow-[0_40px_100px_-30px_rgba(41,59,147,0.6)]', className)}>
      <div className="bg-gradient-to-r from-brand via-brand-800 to-brand-950 px-5 py-4 text-white md:px-7">
        <h2 className="text-base font-bold tracking-tight md:text-lg">{t('title')}</h2>
      </div>

      <form className="space-y-3.5 p-5 md:p-6" onSubmit={submit} noValidate>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="df-name" label={t('fullName')} required error={err('fullName')}>
            <span className={cn(box, fieldState(err('fullName')))}>
              <User className="size-4 shrink-0 text-ink/35" />
              <input id="df-name" className={input} value={values.fullName} onChange={set('fullName')} onBlur={blur('fullName')} placeholder={t('fullNamePlaceholder')} autoComplete="name" />
            </span>
          </Field>
          <Field id="df-email" label={t('email')} required error={err('email')}>
            <span className={cn(box, fieldState(err('email')))}>
              <Mail className="size-4 shrink-0 text-ink/35" />
              <input id="df-email" type="email" className={input} value={values.email} onChange={set('email')} onBlur={blur('email')} placeholder={t('emailPlaceholder')} autoComplete="email" />
            </span>
          </Field>
        </div>

        <Field id="df-phone" label={t('phone')} required error={err('phone')}>
          <div className="flex gap-2.5">
            <span className={cn(box, fieldState(err('phone')), phoneCls, 'flex-1')} dir="ltr">
              <PhoneInput key={phoneCountry} id="df-phone" international countryCallingCodeEditable={false} defaultCountry={phoneCountry} value={values.phone || undefined} onChange={setPhone} onBlur={blur('phone')} autoComplete="tel" />
              {verified && <BadgeCheck className="size-4 shrink-0 text-up" aria-label={t('verified')} />}
            </span>
            <button type="button" onClick={requestCode} disabled={codeLoading || !phoneValid} className="h-11 shrink-0 rounded-xl border border-brand/25 px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-brand">
              {codeLoading ? <LoaderCircle className="size-4 animate-spin" /> : t('getCode')}
            </button>
          </div>
        </Field>

        <AnimatePresence initial={false}>
          {codeOpen && !verified && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <Field id="df-code" label={t('code')} error={err('code')} hint={t('codeSent')}>
                <span className={cn(box, fieldState(err('code')))}>
                  <ShieldCheck className="size-4 shrink-0 text-ink/35" />
                  <input
                    id="df-code"
                    className={input}
                    value={values.code}
                    onChange={(e) => {
                      const code = e.target.value.replace(/\D/g, '').slice(0, 6);
                      set('code')(code);
                      if (code.length === 6) verifyCode(code);
                    }}
                    onBlur={blur('code')}
                    inputMode="numeric"
                    placeholder={t('codePlaceholder')}
                    autoComplete="one-time-code"
                  />
                </span>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="df-type" label={t('accountType')}>
            <span className={cn(box, fieldState(false), 'relative')}>
              <MonitorSmartphone className="size-4 shrink-0 text-ink/35" />
              <select id="df-type" value={values.accountType} onChange={set('accountType')} className={cn(input, 'cursor-pointer appearance-none pe-6')}>
                {types.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3.5 size-4 text-ink/35" />
            </span>
          </Field>
          <Field id="df-country" label={t('country')} required error={err('country')}>
            <span className={cn(box, fieldState(err('country')), 'relative')}>
              <Globe className="size-4 shrink-0 text-ink/35" />
              <select
                id="df-country"
                value={values.country}
                onChange={(e) => {
                  setCountryPicked(true);
                  set('country')(e);
                }} onBlur={blur('country')} disabled={!countries.length} className={cn(input, 'cursor-pointer appearance-none pe-6 disabled:cursor-wait', !values.country && 'text-ink/40')}>
                <option value="" disabled>
                  {countries.length ? t('countrySelect') : failed ? t('errors.country') : t('countryLoading')}
                </option>
                {countries.map((c) => (
                  <option key={`${c.code}-${c.name}`} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3.5 size-4 text-ink/35" />
            </span>
          </Field>
        </div>

        <div>
          <label className="flex cursor-pointer gap-2.5 text-xs leading-relaxed text-ink/60">
            <input type="checkbox" checked={values.consent} onChange={set('consent')} onBlur={blur('consent')} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#293b93]" />
            <span>
              {t('consentStart')}{' '}
              <a href={CLIENT_AGREEMENT_PDF} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-2">
                {t('agreements')}
              </a>{' '}
              {t('consentEnd')}
            </span>
          </label>
          {err('consent') && <p className="mt-1 text-[11px] text-down">{err('consent')}</p>}
        </div>

        <button type="submit" disabled={loading || !verified} className="shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand/45 disabled:shadow-none">
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  );
}
