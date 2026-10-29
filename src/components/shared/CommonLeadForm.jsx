'use client';
/**
 * Reusable lead form (site theme): name, business email, country, phone with WhatsApp code verification, terms.
 *
 * Submit (only once the phone is verified):
 *   POST endpoints.validateEmail → endpoints.strapiIfxExpos (optional, first)
 *   → in parallel: endpoints.ifxEvent2026, endpoints.webhookUrl, endpoints.salesforceLeadForm (/api/lead-form)
 *   → toast, onSuccess(values, { locale }), optional successRedirect.
 * UTM source / campaign and fbclid are read from the URL and sent with the lead.
 * Copy: messages/<locale>/common.json → `leadForm` (override with translationNamespace).
 * Messages are react-toastify toasts — the page renders <Toaster /> (src/components/shared/Toaster.jsx).
 *
 * Props: dark, wide (3-column desktop layout), className, formTitle, hideDisclaimer, endpoints, links,
 *        successRedirect (default none), onSuccess, mapPartnerPayload, mapWebhookPayload, otpChannel, secondaryAction,
 *        defaultCampaign (utm_campaign when the URL has none)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'react-toastify';
import PhoneInput, { getCountries, isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { ArrowRight, BadgeCheck, Check, ChevronDown, LoaderCircle, Search, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE } from '@/components/motion';
import { validateBusinessEmail } from '@/lib/emailValidation';
import { useLocationDetail } from '@/config/useLocationDetails';
import { EMAIL_RE, post, useGtcCountries } from './formKit';

export const DEFAULT_LEAD_FORM_ENDPOINTS = {
  validateEmail: '/api/validate-email',
  sendPhoneOtp: '/api/send-phone-otp',
  verifyOtp: '/api/verify-otp',
  /** Strapi / CMS lead save — runs first; null skips */
  strapiIfxExpos: null,
  /** Marketing Cloud / IFX event API — parallel with the others; null skips */
  ifxEvent2026: null,
  /** Zapier (or other) webhook — null skips */
  webhookUrl: null,
  /** Salesforce Apex leadform/v1 proxy — null skips */
  salesforceLeadForm: '/api/lead-form'
};

export const DEFAULT_LEAD_FORM_LINKS = {
  clientAgreementPdf: 'https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/Website+Client+Document/GTC+Global+Trade+Capital+Co.+Ltd+(VANUATU)/T%26S+-+GTC+GLOBAL+TRADE+CAPITAL+CO.+LTD.pdf',
  termsPdf: 'https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/Website+Client+Document/GTC+Global+LTD/TERMS+AND+CONDITIONS+-+GTC+Global+Ltd.pdf'
};

const OFFER_KEYS = ['level1', 'level2', 'level3', 'level4', 'level5', 'premium', 'eliteRaw'];
const PHONE_COUNTRIES = new Set(getCountries());
const EMPTY = { firstName: '', lastName: '', email: '', country: '', phone: '', otp: '', terms: false };

/** "  " / "null" → null so an endpoint can be switched off from config */
const endpointOf = (v) => (typeof v === 'string' && v.trim() && v.trim().toLowerCase() !== 'null' ? v.trim() : null);

/** Flag image (same SVG set PhoneInput uses — emoji flags don't render on Windows). */
function Flag({ code, className }) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return <span className={cn('inline-block rounded-sm bg-white/10', className)} aria-hidden />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`} alt="" aria-hidden loading="lazy" className={cn('inline-block rounded-[3px] object-cover shadow-sm', className)} />;
}

/**
 * Searchable country dropdown in the site theme (the native <select> list can't be styled for the dark form).
 * Type to filter, ↑/↓ to move, Enter to pick, Esc to close.
 */
function CountrySelect({ id, label, value, countries, onChange, onBlur, error, dark, placeholder, searchPlaceholder, shellClass, fixedLabel }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null); // fixed-position coordinates of the portalled panel
  const wrap = useRef(null);
  const btn = useRef(null);
  const panel = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  // the panel is portalled to <body> so a parent with overflow:hidden (hero sections) can't clip it;
  // it opens upwards when there isn't room below
  useEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const r = btn.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom;
      const up = below < 340 && r.top > below;
      setPos({ left: r.left, width: r.width, top: up ? undefined : r.bottom + 8, bottom: up ? window.innerHeight - r.top + 8 : undefined, max: Math.max(160, Math.min(256, (up ? r.top : below) - 80)) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);
  const selected = countries.find((c) => c.code === value);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return countries;
    // names starting with the query first ("ind" → India, Indonesia, then British Indian Ocean Territory)
    const rank = (c) => (c.code.toLowerCase() === s ? 0 : c.name.toLowerCase().startsWith(s) ? 1 : 2);
    return countries.filter((c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase() === s).sort((a, b) => rank(a) - rank(b));
  }, [countries, q]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => !wrap.current?.contains(e.target) && !panel.current?.contains(e.target) && close();
    document.addEventListener('mousedown', onDoc);
    setActive(Math.max(0, list.findIndex((c) => c.code === value)));
    setTimeout(() => searchRef.current?.focus(), 30);
    return () => document.removeEventListener('mousedown', onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function close() {
    setOpen(false);
    setQ('');
    onBlur?.();
  }
  const pick = (c) => {
    onChange(c.code);
    close();
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(list.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list[active]) pick(list[active]);
    } else if (e.key === 'Escape') close();
  };

  return (
    <div ref={wrap} className="relative">
      <button
        ref={btn}
        id={id}
        type="button"
        onClick={() => countries.length && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(shellClass, 'flex items-center gap-2.5 px-4 pt-4 text-start text-[15px] outline-none', !countries.length && 'cursor-wait')}
      >
        <span className={fixedLabel}>{label}</span>
        {selected && <Flag code={selected.code} className="h-[15px] w-[22px] shrink-0" />}
        <span className={cn('min-w-0 flex-1 truncate', selected ? (dark ? 'text-white' : 'text-ink') : dark ? 'text-white/45' : 'text-ink/45')}>{selected?.name ?? placeholder}</span>
        <ChevronDown className={cn('size-4 shrink-0 -translate-y-1.5 transition-transform', open && 'rotate-180', dark ? 'text-white/50' : 'text-ink/50')} />
      </button>
      {typeof document !== 'undefined' &&
        createPortal(
      <AnimatePresence>
        {open && pos && (
          <motion.div
            ref={panel}
            initial={{ opacity: 0, y: pos.top !== undefined ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: pos.top !== undefined ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
            className={cn('z-[120] overflow-hidden rounded-2xl text-start shadow-2xl ring-1', dark ? 'bg-[#151935] shadow-black/50 ring-white/10' : 'bg-white shadow-brand/15 ring-brand/10')}
          >
            <div className={cn('flex items-center gap-2 border-b px-3.5', dark ? 'border-white/10' : 'border-brand/10')}>
              <Search className={cn('size-4 shrink-0', dark ? 'text-white/40' : 'text-ink/40')} />
              <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder={searchPlaceholder} className={cn('h-11 w-full bg-transparent text-sm outline-none', dark ? 'text-white placeholder:text-white/35' : 'text-ink placeholder:text-ink/35')} />
            </div>
            <ul ref={listRef} role="listbox" style={{ maxHeight: pos.max }} className="overflow-y-auto overscroll-contain p-1.5">
              {list.length === 0 && <li className={cn('px-3 py-3 text-center text-sm', dark ? 'text-white/45' : 'text-ink/45')}>—</li>}
              {list.map((c, i) => {
                const on = c.code === value;
                return (
                  <li key={`${c.code}-${c.name}`} data-i={i} role="option" aria-selected={on}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pick(c)}
                      className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start text-sm transition-colors', i === active ? (dark ? 'bg-white/10 text-white' : 'bg-brand-50 text-brand') : dark ? 'text-white/80' : 'text-ink/80', on && 'font-semibold')}
                    >
                      <Flag code={c.code} className="h-[14px] w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      {on && <Check className={cn('size-4 shrink-0', dark ? 'text-gold' : 'text-brand')} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body
        )}
      {error}
    </div>
  );
}

function readTracking() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  return { utm_source: q.get('utm_source') || '', utm_campaign: q.get('utm_campaign') || '', fbclid: q.get('fbclid') || '' };
}

export default function CommonLeadForm({
  dark = false,
  wide = false,
  className,
  formTitle = '',
  hideDisclaimer = false,
  translationNamespace = 'leadForm',
  endpoints: endpointsProp,
  links: linksProp,
  successRedirect = null,
  onSuccess,
  mapPartnerPayload,
  mapWebhookPayload,
  otpChannel = 'whatsapp',
  secondaryAction = null,
  /** utm_campaign sent when the URL has none (e.g. the event slug on the events page) */
  defaultCampaign = ''
}) {
  const t = useTranslations(translationNamespace);
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();
  const endpoints = useMemo(() => ({ ...DEFAULT_LEAD_FORM_ENDPOINTS, ...endpointsProp }), [endpointsProp]);
  const links = useMemo(() => ({ ...DEFAULT_LEAD_FORM_LINKS, ...linksProp }), [linksProp]);
  const offer = t(`offers.${OFFER_KEYS[0]}`);

  const { countries, failed, suggested } = useGtcCountries();
  const { countryCode } = useLocationDetail(); // visitor's country (proxy cookie / ipinfo)
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [countryPicked, setCountryPicked] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codePhone, setCodePhone] = useState(''); // number the code was sent to
  const [verified, setVerified] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState({});
  useEffect(() => setTracking(readTracking()), []);

  // country: visitor's IP country → browser-language guess; never overrides the visitor's own choice
  const ipCountry = useMemo(() => (countryCode ? countries.find((c) => c.code === countryCode) : null), [countries, countryCode]);
  useEffect(() => {
    const preferred = ipCountry ?? suggested;
    if (!preferred || countryPicked) return;
    setValues((v) => (v.country === preferred.code || (v.country && !ipCountry) ? v : { ...v, country: preferred.code }));
  }, [ipCountry, suggested, countryPicked]);

  // phone flag follows the selected country until a number is typed
  const phoneCountry = [values.country, countryCode, suggested?.code].find((c) => c && PHONE_COUNTRIES.has(c)) ?? 'AE';
  const phoneValid = Boolean(values.phone) && isValidPhoneNumber(values.phone);

  // a different number needs a new code
  useEffect(() => {
    if (codePhone && values.phone !== codePhone) {
      setCodeOpen(false);
      setVerified(false);
      setCodePhone('');
      setValues((v) => ({ ...v, otp: '' }));
    }
  }, [values.phone, codePhone]);

  const errors = useMemo(() => {
    const e = {};
    if (!values.firstName.trim()) e.firstName = t('errors.firstName');
    if (!values.lastName.trim()) e.lastName = t('errors.lastName');
    const email = values.email.trim();
    if (!email) e.email = t('errors.emailRequired');
    else if (!EMAIL_RE.test(email)) e.email = t('errors.emailInvalid');
    else {
      const { reason } = validateBusinessEmail(email);
      if (reason === 'plus_alias') e.email = t('errors.emailNoPlus');
      else if (reason === 'blocked_domain') e.email = t('errors.emailBlockedDomain');
    }
    if (!values.country) e.country = t('errors.countryRequired');
    if (!values.phone) e.phone = t('errors.phoneRequired');
    else if (!isValidPhoneNumber(values.phone)) e.phone = t('errors.phoneInvalid');
    else if (values.country && parsePhoneNumber(values.phone)?.country !== values.country) e.phone = t('errors.phoneCountryMismatch');
    if (!values.otp) e.otp = t('errors.otpRequired');
    else if (values.otp.length !== 6) e.otp = t('errors.otpLength');
    if (!values.terms) e.terms = t('errors.termsRequired');
    return e;
  }, [values, t]);

  const err = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const blur = (k) => () => setTouched((x) => ({ ...x, [k]: true }));

  const sendCode = async () => {
    setTouched((x) => ({ ...x, phone: true }));
    if (!values.phone) return toast.error(t('errors.phoneRequired'));
    if (!phoneValid) return toast.error(t('errors.phoneInvalid'));
    setCodeLoading(true);
    try {
      const res = await post(endpoints.sendPhoneOtp, { phone: values.phone, first_name: values.firstName.trim(), locale, channel: otpChannel });
      if (res?.success) {
        setValues((v) => ({ ...v, otp: '' }));
        setVerified(false);
        setCodePhone(values.phone);
        setCodeOpen(true);
        toast.success(t('toast.otpSent'));
      } else toast.error(res?.message || t('toast.otpSendFailed'));
    } catch {
      toast.error(t('toast.otpSendFailed'));
    } finally {
      setCodeLoading(false);
    }
  };

  const onOtp = async (e) => {
    const otp = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValues((v) => ({ ...v, otp }));
    if (otp.length !== 6) return;
    try {
      const res = await post(endpoints.verifyOtp, { phone: values.phone, otp });
      if (res?.success) {
        setVerified(true);
        setCodeOpen(false);
        toast.success(t('toast.otpVerified'));
      } else {
        setVerified(false);
        toast.error(res?.message || t('toast.otpInvalid'));
      }
    } catch {
      setVerified(false);
      toast.error(t('toast.otpVerifyFailed'));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (!verified) return toast.error(t('toast.verifyPhoneFirst'));
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const check = await post(endpoints.validateEmail, { email: values.email.trim() });
      if (!check?.valid) {
        return toast.error(check?.reason === 'plus_alias' ? t('errors.emailNoPlus') : check?.reason === 'blocked_domain' ? t('errors.emailBlockedDomain') : t('toast.invalidEmail'));
      }

      const lead = { ...values, email: values.email.trim(), firstName: values.firstName.trim(), lastName: values.lastName.trim(), offer, ...tracking, utm_campaign: tracking.utm_campaign || defaultCampaign };
      const ctx = { locale };
      const defaultPartner = { email: lead.email, firstName: lead.firstName, lastName: lead.lastName, phone: lead.phone, country: lead.country, optinEmail: Boolean(lead.terms) };
      const partnerPayload = mapPartnerPayload ? mapPartnerPayload(lead, { ...ctx, defaultPayload: defaultPartner }) : defaultPartner;
      const defaultWebhook = { nickname: lead.firstName, lastName: lead.lastName, email: lead.email, phone: lead.phone, country: lead.country, offer, locale, fbclid: lead.fbclid, utm_campaign: lead.utm_campaign, utm_source: lead.utm_source, utm_path: path };
      const webhookPayload = mapWebhookPayload ? mapWebhookPayload(lead, { ...ctx, defaultPayload: defaultWebhook }) : defaultWebhook;
      const leadFormPayload = {
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        country: lead.country,
        terms: true,
        termsAccepted: true,
        optinEmail: true,
        locale,
        offer,
        fbclid: lead.fbclid,
        utm_campaign: lead.utm_campaign || 'website',
        utm_source: lead.utm_source || 'website'
      };

      // throws with the API's message when a call fails
      const send = async (url, body, raw = false) => {
        const res = await fetch(url, raw ? { method: 'POST', body: JSON.stringify(body) } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.details || data?.error || data?.message || `Request failed (${res.status})`);
        }
      };

      const strapi = endpointOf(endpoints.strapiIfxExpos);
      if (strapi) await send(strapi, partnerPayload);
      const tasks = [];
      const ifx = endpointOf(endpoints.ifxEvent2026);
      const webhook = endpointOf(endpoints.webhookUrl);
      const salesforce = endpointOf(endpoints.salesforceLeadForm);
      if (ifx) tasks.push(send(ifx, partnerPayload));
      if (webhook) tasks.push(send(webhook, webhookPayload, true)); // text/plain: no CORS preflight for Zapier
      if (salesforce) tasks.push(send(salesforce, leadFormPayload));
      await Promise.all(tasks);

      toast.success(t('toast.success'));
      try {
        localStorage.setItem('user', JSON.stringify(lead));
      } catch {}
      await onSuccess?.(lead, ctx);
      setValues((v) => ({ ...EMPTY, country: v.country }));
      setTouched({});
      setVerified(false);
      setCodePhone('');
      if (successRedirect) router.push(successRedirect);
    } catch (error) {
      toast.error(error?.message || t('toast.genericError'));
    } finally {
      setLoading(false);
    }
  };

  /* ---------- styles (floating-label fields, dark or light) ---------- */
  const shell = (error) =>
    cn(
      'relative h-14 w-full rounded-2xl border transition-all focus-within:ring-4',
      error ? 'border-down/60 focus-within:border-down focus-within:ring-down/15' : dark ? 'border-white/15 bg-white/5 focus-within:border-gold focus-within:ring-gold/15' : 'border-brand/15 bg-white focus-within:border-brand focus-within:ring-brand/10',
      error && (dark ? 'bg-white/5' : 'bg-white')
    );
  const inputCls = cn('peer h-full w-full rounded-2xl bg-transparent px-4 pt-4 text-[15px] outline-none placeholder-transparent', dark ? 'text-white' : 'text-ink');
  const floatLabel = cn(
    'pointer-events-none absolute start-4 top-1.5 text-[11px] font-medium transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-1.5 peer-focus:text-[11px]',
    dark ? 'text-white/50 peer-focus:text-gold' : 'text-ink/50 peer-focus:text-brand'
  );
  const fixedLabel = cn('pointer-events-none absolute start-4 top-1.5 z-10 text-[11px] font-medium', dark ? 'text-white/50' : 'text-ink/50');
  const errText = (k) => err(k) && <p className="mt-1 text-start text-[11px] text-down">{err(k)}</p>;
  const muted = dark ? 'text-white/50' : 'text-ink/50';
  const link = cn('font-semibold underline underline-offset-2', dark ? 'text-gold-200 hover:text-white' : 'text-brand hover:text-gold-700');
  const phoneCls = cn(
    '[&_.PhoneInput]:flex [&_.PhoneInput]:h-full [&_.PhoneInput]:items-center [&_.PhoneInput]:gap-2.5 [&_.PhoneInput]:px-4 [&_.PhoneInput]:pt-4',
    '[&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountryIcon--border]:bg-transparent [&_.PhoneInputCountryIcon--border]:shadow-none [&_.PhoneInputCountrySelectArrow]:opacity-70',
    '[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-[15px] [&_.PhoneInputInput]:outline-none',
    dark ? '[&_.PhoneInputInput]:text-white [&_.PhoneInputCountrySelectArrow]:text-white/70 [&_.PhoneInputCountrySelect_option]:text-ink' : '[&_.PhoneInputInput]:text-ink [&_.PhoneInputCountrySelectArrow]:text-ink/60'
  );
  const appear = (i) => ({ initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.1 + i * 0.07, duration: 0.6, ease: EASE } });

  const textField = (name, type, i, span, autoComplete) => (
    <motion.div key={name} className={span} {...appear(i)}>
      <div className={shell(err(name))}>
        <input id={`lf-${name}`} type={type} value={values[name]} onChange={set(name)} onBlur={blur(name)} placeholder={t(name)} autoComplete={autoComplete} className={inputCls} />
        <label htmlFor={`lf-${name}`} className={floatLabel}>
          {t(name)}
        </label>
      </div>
      {errText(name)}
    </motion.div>
  );

  return (
    <form
      id="register-form"
      onSubmit={submit}
      noValidate
      className={cn(
        'grid grid-cols-2 gap-3 text-start',
        // browser autofill paints inputs light blue — keep them in the form's colours
        '[&_input:-webkit-autofill]:[transition:background-color_9999s_ease-out_0s]',
        dark ? '[&_input:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&_input:-webkit-autofill]:[caret-color:#fff]' : '[&_input:-webkit-autofill]:[-webkit-text-fill-color:#0b0b0f]',
        wide && 'md:grid-cols-3',
        className
      )}
    >
      {formTitle && <h3 className={cn('col-span-2 mb-1 text-center text-lg font-bold', wide && 'md:col-span-3', dark ? 'text-white' : 'text-ink')}>{formTitle}</h3>}

      {textField('firstName', 'text', 0, 'col-span-1', 'given-name')}
      {textField('lastName', 'text', 1, 'col-span-1', 'family-name')}
      {textField('email', 'email', 2, cn('col-span-2', wide && 'md:col-span-1'), 'email')}

      {/* country */}
      <motion.div className={cn('relative z-20 col-span-2', wide && 'md:col-span-1')} {...appear(3)}>
        <CountrySelect
          id="lf-country"
          label={t('country')}
          value={values.country}
          countries={countries}
          onChange={(code) => {
            setCountryPicked(true);
            setValues((v) => ({ ...v, country: code }));
          }}
          onBlur={blur('country')}
          dark={dark}
          placeholder={countries.length ? t('countrySelect') : failed ? t('errors.countryRequired') : t('countryLoading')}
          searchPlaceholder={t('countrySearch')}
          shellClass={shell(err('country'))}
          fixedLabel={fixedLabel}
          error={errText('country')}
        />
      </motion.div>

      {/* phone + send code */}
      <motion.div className={cn('col-span-2', wide && 'md:col-span-2')} {...appear(4)}>
        <div className="flex gap-2">
          <div className={cn(shell(err('phone')), phoneCls, 'min-w-0 flex-1')} dir="ltr">
            <span className={fixedLabel}>{t('phone')}</span>
            <PhoneInput key={phoneCountry} id="lf-phone" international countryCallingCodeEditable={false} defaultCountry={phoneCountry} value={values.phone || undefined} onChange={(v) => set('phone')(v ?? '')} onBlur={blur('phone')} autoComplete="tel" />
            {verified && <BadgeCheck className="absolute end-3 top-1/2 size-5 -translate-y-1/2 text-up" aria-label={t('verified')} />}
          </div>
          {!verified && (
            <button type="button" onClick={sendCode} disabled={codeLoading || !phoneValid} className={cn('h-14 shrink-0 rounded-2xl border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50', dark ? 'border-gold/40 text-gold-200 hover:bg-gold hover:text-white' : 'border-brand/25 text-brand hover:bg-brand hover:text-white')}>
              {codeLoading ? <LoaderCircle className="size-4 animate-spin" /> : t('sendOtp')}
            </button>
          )}
        </div>
        {errText('phone')}
      </motion.div>

      {/* verification code */}
      <AnimatePresence initial={false}>
        {codeOpen && !verified && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={cn('col-span-2 overflow-hidden', wide && 'md:col-span-3')}>
            <div className={cn('flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center', dark ? 'bg-white/[0.06] ring-1 ring-white/10' : 'bg-brand-50/60 ring-1 ring-brand/10')}>
              <span className={cn('hidden size-10 shrink-0 place-items-center rounded-xl sm:grid', dark ? 'bg-gold text-white' : 'bg-brand text-white')}>
                <ShieldCheck className="size-4" />
              </span>
              <p className={cn('min-w-0 flex-1 text-xs leading-relaxed', muted)}>
                <span className={cn('block text-sm font-semibold', dark ? 'text-white' : 'text-ink')}>{t('otpLabel')}</span>
                {t('otpHint')}
              </p>
              <input
                aria-label={t('otpLabel')}
                value={values.otp}
                onChange={onOtp}
                onBlur={blur('otp')}
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                autoComplete="one-time-code"
                className={cn(
                  'h-12 w-full shrink-0 rounded-xl border text-center text-lg font-bold tracking-[0.5em] outline-none transition-all focus:ring-4 sm:w-56',
                  err('otp') ? 'border-down/60 focus:ring-down/15' : dark ? 'border-white/15 focus:border-gold focus:ring-gold/15' : 'border-brand/15 focus:border-brand focus:ring-brand/10',
                  dark ? 'bg-white/5 text-white placeholder:text-white/30' : 'bg-white text-ink placeholder:text-ink/30'
                )}
              />
            </div>
            {errText('otp')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* disclaimer + terms */}
      <div className={cn('col-span-2 space-y-2.5', wide && 'md:col-span-3')}>
        {!hideDisclaimer && (
          <p className={cn('text-xs leading-relaxed', muted)}>
            <span className={cn('font-semibold', dark ? 'text-white/80' : 'text-ink/80')}>{t('disclaimerTitle')}</span> {t('disclaimerBefore')}{' '}
            <a href={links.clientAgreementPdf} target="_blank" rel="noopener noreferrer" className={link}>
              {t('clientAgreement')}
            </a>
            {t('disclaimerAfter')}
          </p>
        )}
        <label className={cn('flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed', muted)}>
          <input type="checkbox" checked={values.terms} onChange={set('terms')} onBlur={blur('terms')} className={cn('mt-0.5 size-4 shrink-0 cursor-pointer', dark ? 'accent-[#b68756]' : 'accent-[#293b93]')} />
          <span>
            {t('termsPrefix')}{' '}
            <a href={links.termsPdf} target="_blank" rel="noopener noreferrer" className={link}>
              {t('termsLink')}
            </a>
          </span>
        </label>
        {errText('terms')}
      </div>

      <motion.button
        type="submit"
        disabled={loading || !verified}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'shine group col-span-2 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r bg-[length:200%_auto] font-semibold text-white shadow-xl transition-[background-position,opacity] duration-700 hover:bg-right disabled:cursor-not-allowed disabled:opacity-50',
          wide && 'md:col-span-3',
          dark ? 'from-gold-600 via-gold to-gold-600 shadow-gold/25' : 'from-brand via-brand-500 to-brand shadow-brand/30'
        )}
      >
        {loading && <LoaderCircle className="size-4 animate-spin" />}
        {loading ? t('submitting') : t('submit')}
        {!loading && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />}
      </motion.button>

      {secondaryAction && (
        <button type="button" onClick={secondaryAction.onClick} className={cn('col-span-2 h-12 rounded-2xl border text-sm font-semibold transition-colors', wide && 'md:col-span-3', dark ? 'border-white/15 text-white/80 hover:bg-white/10' : 'border-brand/15 bg-brand-50 text-brand hover:bg-brand-100')}>
          {secondaryAction.label}
        </button>
      )}
    </form>
  );
}
