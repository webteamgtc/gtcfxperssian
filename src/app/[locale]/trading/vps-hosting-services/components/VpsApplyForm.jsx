'use client';
/**
 * VPS Application Form.
 * Payload (same as the original VpsHostingForm): ip, utm_campain (page path), utm_source (?utm_source),
 * first_name, last_name, platform (mt4|mt5), account_no (6–9 digits), package (bronze|silver|gold),
 * phone (+E.164 via react-phone-number-input), email, country, terms.
 * Submits to /api/vps-data-email, which adds the IP server-side and forwards to the Zapier webhook.
 * `?package=silver` in the URL preselects the plan.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronDown, CircleAlert, CircleCheck, Globe, Hash, LoaderCircle, Mail, MonitorSmartphone, Package, User, X } from 'lucide-react';
import { EMAIL_RE, post, useGtcCountries } from '@/components/shared/formKit';
import { cn } from '@/lib/utils';

const API = '/api/vps-data-email';
const EMPTY = { first_name: '', last_name: '', platform: '', account_no: '', email: '', phone: '', country: '' };

/* dark-glass field primitives */
const box = 'flex h-12 items-center gap-2.5 rounded-xl border bg-white/[0.06] px-3.5 transition-all focus-within:bg-white/[0.09] focus-within:ring-4';
const inputCls = 'h-full w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/35';
/* PhoneInput (react-phone-number-input) restyled for the dark glass field */
const phoneCls =
  '[&_.PhoneInput]:flex [&_.PhoneInput]:h-full [&_.PhoneInput]:w-full [&_.PhoneInput]:items-center [&_.PhoneInput]:gap-2.5 ' +
  '[&_.PhoneInputCountry]:me-0 [&_.PhoneInputCountry]:border-e [&_.PhoneInputCountry]:border-white/15 [&_.PhoneInputCountry]:pe-2.5 ' +
  '[&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountryIcon--border]:bg-transparent [&_.PhoneInputCountryIcon--border]:shadow-none ' +
  '[&_.PhoneInputCountrySelectArrow]:text-white/60 [&_.PhoneInputCountrySelectArrow]:opacity-70 ' +
  '[&_.PhoneInputCountrySelect_option]:bg-white [&_.PhoneInputCountrySelect_option]:text-ink ' +
  '[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-white/35';

const state = (err) => (err ? 'border-down/60 focus-within:border-down focus-within:ring-down/15' : 'border-white/15 focus-within:border-brand-300 focus-within:ring-brand-300/15');

function DarkField({ id, label, error, children, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-white/70">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-[11px] text-red-300">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectBox({ id, Icon, value, onChange, onBlur, error, disabled, children }) {
  return (
    <span className={cn(box, state(error), 'relative')}>
      <Icon className="size-4 shrink-0 text-white/40" />
      <select id={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} className={cn(inputCls, 'cursor-pointer appearance-none pe-6 disabled:cursor-wait [&>option]:bg-[#0A1240] [&>option]:text-white', !value && 'text-white/45')}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3.5 size-4 text-white/40" />
    </span>
  );
}

/** Bottom-corner toast (portalled to <body> so parent filters/transforms can't trap it), auto-hides after 5s. */
function Toast({ toast, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onClose, 5000);
    return () => clearTimeout(id);
  }, [toast, onClose]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {toast && (
        <motion.div role={toast.type === 'error' ? 'alert' : 'status'} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="fixed bottom-6 end-6 z-[100] flex max-w-sm items-start gap-3 rounded-2xl bg-white p-4 text-sm text-ink shadow-2xl shadow-black/30 ring-1 ring-brand/10">
          <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', toast.type === 'ok' ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>{toast.type === 'ok' ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}</span>
          <span className="flex-1 pt-1.5 font-medium">{toast.text}</span>
          <button type="button" onClick={onClose} className="grid size-7 place-items-center rounded-full text-ink/40 hover:bg-brand-50 hover:text-ink" aria-label="Close">
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function VpsApplyForm({ pkg, onPkg, packages }) {
  const t = useTranslations('vpsHostingPage.apply.form');
  const platforms = t.raw('platforms');
  const { countries, failed, suggested } = useGtcCountries();
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [utm, setUtm] = useState({ path: '', source: '' });

  // URL params are read after mount (no useSearchParams → no Suspense boundary needed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({ path: window.location.pathname, source: params.get('utm_source') ?? '' });
    const p = params.get('package');
    if (p && packages.some((x) => x.id === p)) onPkg(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // default country from the visitor's region
  useEffect(() => {
    if (suggested) setValues((v) => (v.country ? v : { ...v, country: suggested.name }));
  }, [suggested]);

  const selected = countries.find((c) => c.name === values.country);
  // phone country defaults to the visitor's region (like the original useLocationDetail), UAE otherwise
  const phoneDefaultCountry = /^[A-Z]{2}$/.test(suggested?.code ?? '') ? suggested.code : 'AE';

  const errors = useMemo(() => {
    const e = {};
    for (const k of ['first_name', 'last_name']) {
      const v = values[k].trim();
      if (!v) e[k] = t(k === 'first_name' ? 'errors.firstName' : 'errors.lastName');
      else if (v.length < 2) e[k] = t('errors.minLimit');
    }
    if (!values.platform) e.platform = t('errors.platform');
    const acc = values.account_no.trim();
    if (!acc) e.account_no = t('errors.account');
    else if (acc.length < 6) e.account_no = t('errors.accountMin');
    else if (acc.length > 9) e.account_no = t('errors.accountMax');
    if (!pkg) e.package = t('errors.package');
    if (!values.email.trim()) e.email = t('errors.email');
    else if (!EMAIL_RE.test(values.email.trim())) e.email = t('errors.emailInvalid');
    if (!values.phone) e.phone = t('errors.phone');
    else if (!isValidPhoneNumber(values.phone)) e.phone = t('errors.phoneInvalid');
    if (!values.country) e.country = t('errors.country');
    return e;
  }, [values, pkg, t]);

  const err = (k) => ((touched[k] || submitted) && errors[k] ? errors[k] : undefined);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e?.target ? e.target.value : e }));
  const blur = (k) => () => setTouched((tc) => ({ ...tc, [k]: true }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      const res = await post(API, {
        ip: '',
        utm_campain: utm.path,
        utm_source: utm.source,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        platform: values.platform,
        account_no: values.account_no.trim(),
        package: pkg,
        phone: values.phone,
        email: values.email.trim(),
        country: selected?.name ?? values.country,
        terms: false
      });
      if (res?.ok) {
        setToast({ type: 'ok', text: t('toastSubmitted') });
        setValues((v) => ({ ...EMPTY, country: v.country }));
        setTouched({});
        setSubmitted(false);
      } else {
        setToast({ type: 'error', text: t('errors.generic') });
      }
    } catch {
      setToast({ type: 'error', text: t('errors.generic') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.05] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" aria-hidden />
      <div className="border-b border-white/10 px-6 py-5 md:px-7">
        <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
      </div>

      <form className="space-y-4 p-6 md:p-7" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <DarkField id="vps-first" label={t('firstName')} error={err('first_name')}>
            <span className={cn(box, state(err('first_name')))}>
              <User className="size-4 shrink-0 text-white/40" />
              <input id="vps-first" name="first_name" className={inputCls} value={values.first_name} onChange={set('first_name')} onBlur={blur('first_name')} placeholder={t('firstName')} autoComplete="given-name" />
            </span>
          </DarkField>
          <DarkField id="vps-last" label={t('lastName')} error={err('last_name')}>
            <span className={cn(box, state(err('last_name')))}>
              <User className="size-4 shrink-0 text-white/40" />
              <input id="vps-last" name="last_name" className={inputCls} value={values.last_name} onChange={set('last_name')} onBlur={blur('last_name')} placeholder={t('lastName')} autoComplete="family-name" />
            </span>
          </DarkField>
        </div>

        <DarkField id="vps-platform" label={t('platform')} error={err('platform')}>
          <SelectBox id="vps-platform" Icon={MonitorSmartphone} value={values.platform} onChange={set('platform')} onBlur={blur('platform')} error={err('platform')}>
            <option value="">{t('platformSelect')}</option>
            {platforms.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </SelectBox>
        </DarkField>

        <div className="grid gap-4 sm:grid-cols-2">
          <DarkField id="vps-account" label={t('account')} error={err('account_no')}>
            <span className={cn(box, state(err('account_no')))}>
              <Hash className="size-4 shrink-0 text-white/40" />
              <input id="vps-account" name="account_no" inputMode="numeric" className={inputCls} value={values.account_no} onChange={(e) => set('account_no')(e.target.value.replace(/\D/g, '').slice(0, 12))} onBlur={blur('account_no')} placeholder={t('accountPlaceholder')} />
            </span>
          </DarkField>
          <DarkField id="vps-package" label={t('package')} error={err('package')}>
            <SelectBox id="vps-package" Icon={Package} value={pkg} onChange={(e) => onPkg(e.target.value)} error={err('package')}>
              <option value="">{t('platformSelect')}</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectBox>
          </DarkField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DarkField id="vps-email" label={t('email')} error={err('email')}>
            <span className={cn(box, state(err('email')))}>
              <Mail className="size-4 shrink-0 text-white/40" />
              <input id="vps-email" name="email" type="email" className={inputCls} value={values.email} onChange={set('email')} onBlur={blur('email')} placeholder={t('email')} autoComplete="email" />
            </span>
          </DarkField>
          <DarkField id="vps-phone" label={t('phone')} error={err('phone')}>
            <span className={cn(box, state(err('phone')), phoneCls, 'px-3')} dir="ltr">
              <PhoneInput
                key={phoneDefaultCountry}
                id="vps-phone"
                name="phone"
                international
                countryCallingCodeEditable={false}
                defaultCountry={phoneDefaultCountry}
                value={values.phone || undefined}
                onChange={(v) => set('phone')(v ?? '')}
                onBlur={blur('phone')}
                autoComplete="tel"
              />
            </span>
          </DarkField>
        </div>

        <DarkField id="vps-country" label={t('country')} error={err('country')}>
          <SelectBox id="vps-country" Icon={Globe} value={values.country} onChange={set('country')} onBlur={blur('country')} error={err('country')} disabled={!countries.length}>
            <option value="">{countries.length ? t('countrySelect') : failed ? t('errors.countryLoad') : t('countryLoading')}</option>
            {countries.map((c,index) => (
              <option key={`${c.code}-${index}`} value={c.name}>
                {c.name}
              </option>
            ))}
          </SelectBox>
        </DarkField>

        <button type="submit" disabled={loading} className="shine group inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F7DF5] to-[#1B318E] text-[15px] font-bold text-white shadow-lg shadow-brand/40 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {loading ? t('submitting') : t('submit')}
          {!loading && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />}
        </button>
      </form>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
