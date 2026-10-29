'use client';
/**
 * Account deletion request form.
 * Get OTP → /api/validate-email, then /api/otp-smtp emails a 6-digit code (checked by /api/verify-otp).
 * Submit (only once the email is verified) → /api/delete-account (emails the support team).
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'react-toastify';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { BadgeCheck, CalendarDays, Check, Hash, LoaderCircle, Mail, PenLine, ShieldCheck, TriangleAlert, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateBusinessEmail } from '@/lib/emailValidation';
import { EMAIL_RE, post, Field, fieldBox as box, fieldInput as input, fieldState } from '@/components/shared/formKit';
import { useLocationDetail } from '@/config/useLocationDetails';

const PLATFORMS = ['mt4', 'mt5', 'both'];
const CONFIRMS = ['c1', 'c2', 'c3'];
const ACCOUNTS_RE = /^\s*\d+(\s*,\s*\d+)*\s*$/;
const REASON_MAX = 1000;
const COOLDOWN = 60;
const PHONE_COUNTRIES = new Set(getCountries()); // ISO codes PhoneInput can show as a flag
const EMPTY = { fullName: '', email: '', phone: '', platform: '', accounts: '', reason: '', otp: '', c1: false, c2: false, c3: false, signature: '', dob: '' };

/* PhoneInput (react-phone-number-input) restyled to match the other fields */
const phoneCls =
  '[&_.PhoneInput]:flex [&_.PhoneInput]:h-full [&_.PhoneInput]:w-full [&_.PhoneInput]:items-center [&_.PhoneInput]:gap-2.5 ' +
  '[&_.PhoneInputCountry]:me-0 [&_.PhoneInputCountry]:border-e [&_.PhoneInputCountry]:border-brand/10 [&_.PhoneInputCountry]:pe-2.5 ' +
  '[&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountryIcon--border]:bg-transparent [&_.PhoneInputCountryIcon--border]:shadow-none ' +
  '[&_.PhoneInputCountrySelectArrow]:text-ink/50 [&_.PhoneInputCountrySelectArrow]:opacity-80 ' +
  '[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-ink [&_.PhoneInputInput]:outline-none';

/** Compact section: small numbered badge (turns into a tick when complete) + title + divider. */
function Section({ n, title, done, children }) {
  return (
    <section id={`del-step-${n}`} className="scroll-mt-32">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-all duration-500', done ? 'bg-up text-white shadow-md shadow-up/30' : 'bg-brand-50 text-brand ring-1 ring-brand/15')}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={done ? 'done' : 'n'} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.2 }}>
              {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
            </motion.span>
          </AnimatePresence>
        </span>
        <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink/70">{title}</h3>
        <span className="h-px flex-1 bg-gradient-to-r from-brand/15 to-transparent rtl:bg-gradient-to-l" aria-hidden />
      </div>
      {children}
    </section>
  );
}

/** `onProgress({ personal, account, confirmations, signature })` reports which sections are complete (page sidebar). */
export default function DeleteForm({ onProgress }) {
  const t = useTranslations('deleteAccountPage.form');
  // phone country follows the visitor's IP country (ipinfo), UAE until / unless it is known
  const { countryCode } = useLocationDetail();
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [codeOpen, setCodeOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const phoneCountry = countryCode && PHONE_COUNTRIES.has(countryCode) ? countryCode : 'AE';

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const errors = useMemo(() => {
    const e = {};
    if (!values.fullName.trim()) e.fullName = t('validation.fullNameRequired');
    const email = values.email.trim();
    if (!email) e.email = t('validation.emailRequired');
    else if (!EMAIL_RE.test(email)) e.email = t('validation.emailInvalid');
    else {
      const { reason } = validateBusinessEmail(email);
      if (reason === 'plus_alias') e.email = t('validation.emailNoPlus');
      else if (reason === 'blocked_domain') e.email = t('validation.emailBlockedDomain');
    }
    if (!values.platform) e.platform = t('validation.platformRequired');
    else if (!PLATFORMS.includes(values.platform)) e.platform = t('validation.platformInvalid');
    if (!values.accounts.trim()) e.accounts = t('validation.accountsRequired');
    else if (!ACCOUNTS_RE.test(values.accounts)) e.accounts = t('validation.accountsInvalid');
    if (values.reason.length > REASON_MAX) e.reason = t('validation.reasonMax');
    if (!values.otp) e.otp = t('validation.otpRequired');
    else if (values.otp.length !== 6) e.otp = t('validation.otpLength');
    CONFIRMS.forEach((k) => !values[k] && (e[k] = t(`validation.${k}`)));
    if (!values.signature.trim()) e.signature = t('validation.signatureRequired');
    if (!values.dob) e.dob = t('validation.dobRequired');
    return e;
  }, [values, t]);

  const err = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const blur = (k) => () => setTouched((x) => ({ ...x, [k]: true }));

  const done = {
    personal: !errors.fullName && !errors.email && verified,
    account: !errors.platform && !errors.accounts && !errors.reason,
    confirmations: values.c1 && values.c2 && values.c3,
    signature: !errors.signature && !errors.dob
  };
  const doneKey = Object.values(done).join(',');
  useEffect(() => {
    onProgress?.(done);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey]);

  // a different email needs a new code
  const setEmail = (e) => {
    const email = e.target.value;
    setValues((v) => ({ ...v, email, otp: '' }));
    if (verified || codeOpen) {
      setVerified(false);
      setCodeOpen(false);
    }
  };

  const sendCode = async () => {
    const email = values.email.trim();
    if (!email) return toast.error(t('toasts.emailFirst'));
    if (cooldown > 0) return;
    setLoadingOtp(true);
    try {
      const check = await post('/api/validate-email', { email });
      if (!check?.valid) {
        return toast.error(check?.reason === 'plus_alias' ? t('validation.emailNoPlus') : check?.reason === 'blocked_domain' ? t('validation.emailBlockedDomain') : t('toasts.emailInvalid'));
      }
      const res = await post('/api/otp-smtp', { email, first_name: values.fullName.trim() });
      if (!res?.success) {
        setCodeOpen(false);
        return toast.error(res?.reason ? t('toasts.invalidEmail') : t('toasts.otpSendFailed'));
      }
      setValues((v) => ({ ...v, otp: '' }));
      setVerified(false);
      setCodeOpen(true);
      setCooldown(COOLDOWN);
      toast.success(t('toasts.otpSent'));
    } catch {
      setCodeOpen(false);
      toast.error(t('toasts.otpSendFailed'));
    } finally {
      setLoadingOtp(false);
    }
  };

  const onOtp = async (e) => {
    const otp = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValues((v) => ({ ...v, otp }));
    setVerified(false);
    if (otp.length !== 6) return;
    const res = await post('/api/verify-otp', { email: values.email.trim(), otp });
    if (res?.success) {
      setVerified(true);
      toast.success(t('toasts.emailVerified'));
    } else toast.error(t('toasts.invalidOtp'));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (!verified) return toast.error(t('toasts.verifyFirst'));
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: values.phone || null,
          platform: values.platform,
          accounts: values.accounts
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          reason: values.reason.trim() || null,
          confirmations: { ownerConfirm: values.c1, dataRemovalAcknowledge: values.c2, positionsClosedConfirm: values.c3 },
          signature: values.signature.trim(),
          dob: values.dob
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message);
      toast.success(t('toasts.submitted'));
      setValues(EMPTY);
      setTouched({});
      setCodeOpen(false);
      setVerified(false);
    } catch (error) {
      toast.error(error?.message || t('toasts.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  const confirmErr = CONFIRMS.some((k) => err(k));

  return (
    <form onSubmit={submit} noValidate className="space-y-7 p-5 md:p-7">
      {/* 1 · personal */}
      <Section n={1} title={t('sections.personal')} done={done.personal}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="del-name" label={t('fields.fullNameLabel')} required error={err('fullName')}>
            <span className={cn(box, fieldState(err('fullName')))}>
              <User className="size-4 shrink-0 text-ink/35" />
              <input id="del-name" className={input} value={values.fullName} onChange={set('fullName')} onBlur={blur('fullName')} placeholder={t('fields.fullNamePlaceholder')} autoComplete="name" />
            </span>
          </Field>

          <Field id="del-email" label={t('fields.emailLabel')} required error={err('email')}>
            <span className={cn(box, fieldState(err('email')), 'pe-1.5')}>
              <Mail className="size-4 shrink-0 text-ink/35" />
              <input id="del-email" type="email" className={input} value={values.email} onChange={setEmail} onBlur={blur('email')} placeholder={t('fields.emailPlaceholder')} autoComplete="email" />
              {verified ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-up/10 px-2 py-1 text-[11px] font-bold text-up">
                  <BadgeCheck className="size-3.5" />
                  {t('otp.verified')}
                </span>
              ) : (
                <button type="button" onClick={sendCode} disabled={loadingOtp || !values.email.trim() || cooldown > 0} className="shrink-0 whitespace-nowrap rounded-lg bg-brand px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50">
                  {loadingOtp ? t('otp.sending') : cooldown > 0 ? `${t('otp.resendPrefix')} ${cooldown}${t('otp.resendSuffix')}` : t('otp.get')}
                </button>
              )}
            </span>
          </Field>

          {/* verification code strip */}
          <AnimatePresence initial={false}>
            {codeOpen && !verified && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden sm:col-span-2">
                <div className="flex flex-col gap-3 rounded-2xl bg-brand-50/60 p-3 ring-1 ring-brand/10 sm:flex-row sm:items-center">
                  <span className="hidden size-9 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-md shadow-brand/25 sm:grid">
                    <ShieldCheck className="size-4" />
                  </span>
                  <p className="min-w-0 flex-1 text-xs leading-relaxed text-ink/60">
                    {t('otp.sentToPrefix')} <span className="font-semibold text-ink">{values.email}</span>
                    <span className="block text-ink/45">{t('otp.instruction')}</span>
                  </p>
                  <span className={cn(box, fieldState(err('otp')), 'w-full sm:w-40')}>
                    <input id="del-otp" aria-label={t('fields.codeLabel')} className={cn(input, 'text-center font-bold tracking-[0.45em]')} value={values.otp} onChange={onOtp} onBlur={blur('otp')} inputMode="numeric" maxLength={6} placeholder="••••••" autoComplete="one-time-code" />
                  </span>
                </div>
                {err('otp') && <p className="mt-1 text-[11px] text-down">{err('otp')}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <Field id="del-phone" label={`${t('fields.phoneLabel')} ${t('fields.phoneOptional')}`} className="sm:col-span-2">
            <span className={cn(box, fieldState(false), phoneCls)} dir="ltr">
              <PhoneInput key={phoneCountry} id="del-phone" international countryCallingCodeEditable={false} defaultCountry={phoneCountry} value={values.phone || undefined} onChange={(v) => set('phone')(v ?? '')} autoComplete="tel" />
            </span>
          </Field>
        </div>
      </Section>

      {/* 2 · account */}
      <Section n={2} title={t('sections.account')} done={done.account}>
        <div className="grid gap-3.5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0">
            <span className="mb-1.5 block text-xs font-medium text-ink/65">
              {t('fields.platformLabel')} <span className="text-down">*</span>
            </span>
            <div className={cn('grid h-11 grid-cols-3 gap-1 rounded-xl bg-[#f3f5fb] p-1 ring-1', err('platform') ? 'ring-down/40' : 'ring-brand/10')} role="radiogroup" aria-label={t('fields.platformLabel')}>
              {PLATFORMS.map((id) => (
                <button key={id} type="button" role="radio" aria-checked={values.platform === id} onClick={() => setValues((v) => ({ ...v, platform: id }))} className={cn('relative rounded-lg text-xs font-bold transition-colors', values.platform === id ? 'text-white' : 'text-ink/60 hover:text-brand')}>
                  {values.platform === id && <motion.span layoutId="del-platform" className="absolute inset-0 rounded-lg bg-brand shadow-md shadow-brand/25" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="relative">{t(`platforms.${id}`)}</span>
                </button>
              ))}
            </div>
            {err('platform') && <p className="mt-1 text-[11px] text-down">{err('platform')}</p>}
          </div>

          <Field id="del-accounts" label={t('fields.accountsLabel')} required error={err('accounts')}>
            <span className={cn(box, fieldState(err('accounts')))}>
              <Hash className="size-4 shrink-0 text-ink/35" />
              <input id="del-accounts" className={cn(input, 'tabular-nums')} value={values.accounts} onChange={(e) => set('accounts')(e.target.value.replace(/[^\d,\s]/g, ''))} onBlur={blur('accounts')} placeholder={t('fields.accountsPlaceholder')} inputMode="numeric" />
            </span>
          </Field>

          <Field id="del-reason" label={`${t('fields.reasonLabel')} ${t('fields.reasonOptional')}`} error={err('reason')} className="sm:col-span-2">
            <div className="relative">
              <textarea
                id="del-reason"
                rows={2}
                value={values.reason}
                onChange={set('reason')}
                onBlur={blur('reason')}
                placeholder={t('fields.reasonPlaceholder')}
                className={cn('min-h-[4.5rem] w-full resize-y rounded-xl border bg-white px-3.5 pb-6 pt-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:ring-4', err('reason') ? 'border-down/60 focus:border-down focus:ring-down/10' : 'border-brand/15 focus:border-brand focus:ring-brand/10')}
              />
              <span className={cn('pointer-events-none absolute bottom-2 end-3 text-[10px] tabular-nums', values.reason.length > REASON_MAX ? 'text-down' : 'text-ink/35')}>
                {values.reason.length}/{REASON_MAX}
              </span>
            </div>
          </Field>
        </div>
      </Section>

      {/* 3 · confirmations — one checklist panel */}
      <Section n={3} title={t('sections.confirmations')} done={done.confirmations}>
        <div className={cn('divide-y overflow-hidden rounded-2xl ring-1 transition-colors', confirmErr ? 'divide-down/10 ring-down/30' : 'divide-brand/10 ring-brand/10')}>
          {CONFIRMS.map((k) => (
            <label key={k} className={cn('flex cursor-pointer items-start gap-3 px-3.5 py-3 transition-colors', values[k] ? 'bg-brand-50/60' : 'bg-white hover:bg-[#f8f9fc]')}>
              <input type="checkbox" checked={values[k]} onChange={set(k)} onBlur={blur(k)} className="sr-only" />
              <span className={cn('mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-md border-2 transition-all duration-300', values[k] ? 'border-brand bg-brand text-white' : err(k) ? 'border-down/60 bg-white' : 'border-ink/25 bg-white')} aria-hidden>
                <AnimatePresence>
                  {values[k] && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="size-3" strokeWidth={3.5} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="text-[13px] leading-relaxed text-ink/75">{t(`confirmations.${k}`)}</span>
            </label>
          ))}
        </div>
        {CONFIRMS.map((k) => err(k) && <p key={k} className="mt-1 text-[11px] text-down">{err(k)}</p>)}
      </Section>

      {/* 4 · signature */}
      <Section n={4} title={t('sections.signature')} done={done.signature}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="del-sign" label={t('fields.signatureLabel')} required error={err('signature')}>
            <span className={cn(box, fieldState(err('signature')))}>
              <PenLine className="size-4 shrink-0 text-ink/35" />
              <input id="del-sign" className={cn(input, 'italic')} value={values.signature} onChange={set('signature')} onBlur={blur('signature')} placeholder={t('fields.signaturePlaceholder')} />
            </span>
          </Field>
          <Field id="del-dob" label={t('fields.dobLabel')} required error={err('dob')}>
            <span className={cn(box, fieldState(err('dob')))}>
              <CalendarDays className="size-4 shrink-0 text-ink/35" />
              <input id="del-dob" type="date" max={new Date().toISOString().slice(0, 10)} className={cn(input, !values.dob && 'text-ink/40')} value={values.dob} onChange={set('dob')} onBlur={blur('dob')} />
            </span>
          </Field>
        </div>
      </Section>

      {/* footer: warning + submit in one bar */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-down/20">
        <p className="flex items-start gap-2.5 bg-down/[0.06] px-4 py-3 text-xs leading-relaxed text-down">
          <TriangleAlert className="mt-px size-4 shrink-0" />
          {t('warning')}
        </p>
        <div className="flex flex-col gap-3 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-ink/50">{t('helpText')}</p>
          <button type="submit" disabled={loading || !verified} className="shine inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-900 px-6 text-sm font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand disabled:cursor-not-allowed disabled:bg-brand/45 disabled:shadow-none">
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : verified ? <Check className="size-4" strokeWidth={3} /> : <ShieldCheck className="size-4" />}
            {loading ? t('submit.submitting') : verified ? t('submit.ready') : t('submit.verifyFirst')}
          </button>
        </div>
      </div>
    </form>
  );
}
