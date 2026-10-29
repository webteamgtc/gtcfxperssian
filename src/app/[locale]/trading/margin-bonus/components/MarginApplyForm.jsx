'use client';
/**
 * Margin Bonus application form (registered GTCFX clients only).
 *  - e-mail: on blur, GET /api/margin-bonus?email= shows whether it's a registered client;
 *    "Send Code" e-mails a 6-digit code (/api/otp-smtp) that the server checks on submit
 *  - POST /api/margin-bonus saves the sign-up (database + Zapier + e-mail), then → /thank-you
 * Tracking sent along (as on the original campaign form): page path, ?utm_source, ?fbclid, ?id (QR code), user_referrer.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'react-toastify';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { ChevronDown, CircleAlert, CircleCheck, DollarSign, Globe, Hash, LoaderCircle, Mail, ShieldCheck, User } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import NavLink from '@/components/shared/nav/NavLink';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import { EMAIL_RE, LETTERS_RE, post, Field, fieldBox as box, fieldInput as input, fieldState, phoneField, useGtcCountries } from '@/components/shared/formKit';
import { cn } from '@/lib/utils';

const API = '/api/margin-bonus';
const EXCLUDED_COUNTRIES = ['AU', 'GB', 'US'];
const EMPTY = { Full_name: '', email: '', otp: '', phone: '', account_no: '', deposit_amount: '', country: '', terms: false };
const FIELDS = Object.keys(EMPTY);

export function MarginApplyForm() {
  const t = useTranslations('marginBonusPage.apply.form');
  const router = useRouter();
  const { countries: all, failed, suggested } = useGtcCountries();
  const countries = useMemo(() => all.filter((c) => !EXCLUDED_COUNTRIES.includes(c.code)), [all]);
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [client, setClient] = useState(null); // null | 'checking' | 'registered' | 'notRegistered'
  const [codeSent, setCodeSent] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState({});

  // URL params after mount (no useSearchParams → no Suspense boundary needed)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    let referrer = '';
    try {
      referrer = localStorage.getItem('user_referrer') ?? '';
    } catch {}
    setTracking({ utm_campain: window.location.pathname, utm_source: q.get('utm_source') ?? '', fbclid: q.get('fbclid') ?? '', qr_code_id: q.get('id') ?? '', user_referrer: referrer });
  }, []);

  useEffect(() => {
    if (suggested && !EXCLUDED_COUNTRIES.includes(suggested.code)) setValues((v) => (v.country ? v : { ...v, country: suggested.name }));
  }, [suggested]);

  const errors = useMemo(() => {
    const e = {};
    const name = values.Full_name.trim();
    if (!name) e.Full_name = t('errors.fullName');
    else if (!LETTERS_RE.test(name) || name.length < 2) e.Full_name = t('errors.letters');
    if (!values.email.trim()) e.email = t('errors.email');
    else if (!EMAIL_RE.test(values.email.trim())) e.email = t('errors.emailInvalid');
    if (!codeSent) e.otp = t('errors.codeFirst');
    else if (!/^\d{6}$/.test(values.otp)) e.otp = t('errors.code');
    if (!values.phone) e.phone = t('errors.phone');
    else if (!isValidPhoneNumber(values.phone)) e.phone = t('errors.phoneInvalid');
    if (!values.account_no) e.account_no = t('errors.account');
    else if (!/^\d{6,8}$/.test(values.account_no)) e.account_no = t('errors.accountDigits');
    if (!values.deposit_amount) e.deposit_amount = t('errors.deposit');
    else if (!(Number(values.deposit_amount) > 0)) e.deposit_amount = t('errors.depositMin');
    if (!values.country) e.country = t('errors.country');
    if (!values.terms) e.terms = t('errors.terms');
    return e;
  }, [values, codeSent, t]);

  const err = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const blur = (k) => () => setTouched((tc) => ({ ...tc, [k]: true }));

  const onEmailChange = (e) => {
    set('email')(e);
    // a new address needs a new check and a new code
    setClient(null);
    setCodeSent(false);
    setValues((v) => ({ ...v, otp: '' }));
  };

  const checkClient = async () => {
    blur('email')();
    const email = values.email.trim();
    if (!EMAIL_RE.test(email)) return;
    setClient('checking');
    try {
      const res = await fetch(`${API}?email=${encodeURIComponent(email)}`).then((r) => r.json());
      setClient(res?.registered === true ? 'registered' : res?.registered === false ? 'notRegistered' : null);
    } catch {
      setClient(null);
    }
  };

  const sendCode = async () => {
    setTouched((tc) => ({ ...tc, email: true }));
    if (errors.email) return toast.error(errors.email);
    if (client === 'notRegistered') return toast.error(t('errors.notRegistered'));
    setCodeLoading(true);
    try {
      const res = await post('/api/otp-smtp', { email: values.email.trim(), first_name: values.Full_name.trim() });
      if (res?.success) {
        setCodeSent(true);
        toast.success(t('codeSent', { email: values.email.trim() }));
      } else toast.error(t('errors.codeError'));
    } catch {
      toast.error(t('errors.codeError'));
    } finally {
      setCodeLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((k) => [k, true])));
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      const res = await post(API, {
        ...tracking,
        Full_name: values.Full_name.trim(),
        email: values.email.trim(),
        otp: values.otp,
        phone: values.phone,
        account_no: values.account_no,
        deposit_amount: values.deposit_amount,
        country: values.country,
        terms: values.terms
      });
      if (res?.ok) {
        router.push('/thank-you');
        return;
      }
      if (res?.error === 'notRegistered') setClient('notRegistered');
      toast.error(t(`errors.${['notRegistered', 'alreadyApplied', 'otp'].includes(res?.error) ? res.error : 'generic'}`));
    } catch {
      toast.error(t('errors.generic'));
    }
    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink [--heading-fg:var(--color-ink)] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/20">
      <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-brand-500 to-gold" aria-hidden />

      {/* the three steps of the promotion */}
      <div className="border-b border-brand/10 px-6 pb-5 pt-7 md:px-7">
        <h3 className="heading-card">{t('title')}</h3>
        <ol className="mt-4 grid grid-cols-3 gap-2">
          {t.raw('steps').map((step, i) => (
            <li key={step} className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-start">
              <span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold', i === 2 ? 'bg-gold text-white' : 'bg-brand-50 text-brand ring-1 ring-brand/15')}>{i + 1}</span>
              <span className="text-[11px] font-medium leading-tight text-ink/60">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <form className="space-y-4 p-6 md:p-7" onSubmit={submit} noValidate>
        <Field id="mb-name" label={t('fullName')} required error={err('Full_name')}>
          <span className={cn(box, fieldState(err('Full_name')))}>
            <User className="size-4 shrink-0 text-ink/35" />
            <input id="mb-name" className={input} value={values.Full_name} onChange={set('Full_name')} onBlur={blur('Full_name')} placeholder={t('fullName')} autoComplete="name" />
          </span>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="mb-email" label={t('email')} required error={err('email')}>
            <span className={cn(box, fieldState(err('email') || client === 'notRegistered'))}>
              <Mail className="size-4 shrink-0 text-ink/35" />
              <input id="mb-email" type="email" className={input} value={values.email} onChange={onEmailChange} onBlur={checkClient} placeholder={t('email')} autoComplete="email" />
              {client === 'checking' && <LoaderCircle className="size-4 shrink-0 animate-spin text-ink/35" aria-label={t('checking')} />}
              {client === 'registered' && <CircleCheck className="size-4 shrink-0 text-up" />}
            </span>
          </Field>
          <Field id="mb-otp" label={t('code')} required error={err('otp')}>
            <span className={cn(box, fieldState(err('otp')))}>
              <ShieldCheck className="size-4 shrink-0 text-ink/35" />
              <input id="mb-otp" className={input} value={values.otp} onChange={(e) => set('otp')(e.target.value.replace(/\D/g, '').slice(0, 6))} onBlur={blur('otp')} inputMode="numeric" maxLength={6} placeholder={t('codePlaceholder')} autoComplete="one-time-code" />
              <button type="button" onClick={sendCode} disabled={codeLoading || client === 'notRegistered'} className="shrink-0 whitespace-nowrap text-xs font-semibold text-brand transition-colors hover:text-gold-700 disabled:opacity-50">
                {codeLoading ? t('sendingCode') : codeSent ? t('resendCode') : t('getCode')}
              </button>
            </span>
          </Field>
        </div>

        {/* registered-client check */}
        <AnimatePresence initial={false}>
          {(client === 'registered' || client === 'notRegistered') && (
            <motion.p key={client} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={cn('flex items-start gap-2 overflow-hidden rounded-xl px-3.5 py-2.5 text-xs', client === 'registered' ? 'bg-up/[0.07] text-up' : 'bg-down/[0.06] text-down')}>
              {client === 'registered' ? <CircleCheck className="size-4 shrink-0" /> : <CircleAlert className="size-4 shrink-0" />}
              <span>
                {client === 'registered'
                  ? t('registered')
                  : t.rich('notRegistered', {
                      link: (c) => (
                        <NavLink href={LIVE_ACCOUNT_HREF} className="font-semibold underline underline-offset-2">
                          {c}
                        </NavLink>
                      )
                    })}
              </span>
            </motion.p>
          )}
        </AnimatePresence>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="mb-phone" label={t('phone')} required error={err('phone')}>
            <span className={cn(box, fieldState(err('phone')), phoneField)} dir="ltr">
              <PhoneInput id="mb-phone" name="phone" international defaultCountry={suggested?.code || 'AE'} value={values.phone || undefined} onChange={(v) => set('phone')(v ?? '')} onBlur={blur('phone')} autoComplete="tel" />
            </span>
          </Field>
          <Field id="mb-country" label={t('country')} required error={err('country')}>
            <span className={cn(box, fieldState(err('country')), 'relative')}>
              <Globe className="size-4 shrink-0 text-ink/35" />
              <select id="mb-country" value={values.country} onChange={set('country')} onBlur={blur('country')} disabled={!countries.length} className={cn(input, 'cursor-pointer appearance-none pe-6 disabled:cursor-wait', !values.country && 'text-ink/40')}>
                <option value="" disabled>
                  {countries.length ? t('countrySelect') : failed ? t('errors.countryLoad') : t('countryLoading')}
                </option>
                {countries.map((c, i) => (
                  <option key={`${c.code}-${i}`} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3.5 size-4 text-ink/35" />
            </span>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="mb-account" label={t('account')} required error={err('account_no')}>
            <span className={cn(box, fieldState(err('account_no')))}>
              <Hash className="size-4 shrink-0 text-ink/35" />
              <input id="mb-account" inputMode="numeric" className={input} value={values.account_no} onChange={(e) => set('account_no')(e.target.value.replace(/\D/g, '').slice(0, 8))} onBlur={blur('account_no')} placeholder={t('accountPlaceholder')} />
            </span>
          </Field>
          <Field id="mb-deposit" label={t('deposit')} required error={err('deposit_amount')}>
            <span className={cn(box, fieldState(err('deposit_amount')))}>
              <DollarSign className="size-4 shrink-0 text-ink/35" />
              <input id="mb-deposit" inputMode="decimal" className={input} value={values.deposit_amount} onChange={(e) => set('deposit_amount')(e.target.value.replace(/[^\d.]/g, '').slice(0, 10))} onBlur={blur('deposit_amount')} placeholder={t('depositPlaceholder')} />
            </span>
          </Field>
        </div>

        <div>
          <label className="flex cursor-pointer gap-2.5 rounded-xl bg-[#f6f7fb] p-3 text-[11.5px] leading-relaxed text-ink/65 ring-1 ring-brand/5">
            <input type="checkbox" checked={values.terms} onChange={set('terms')} onBlur={blur('terms')} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#293b93]" />
            <span>{t('terms')}</span>
          </label>
          {err('terms') && <p className="mt-1 text-[11px] text-down">{err('terms')}</p>}
        </div>

        <button type="submit" disabled={loading || client === 'notRegistered'} className="shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-900 text-base font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60">
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  );
}
