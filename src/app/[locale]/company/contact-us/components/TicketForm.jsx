'use client';
/**
 * Contact ticket form.
 * 1) POST /api/sales-force-with-auth  — Salesforce Contact Us case (required for success)
 * 2) POST /api/send-support-email     — support mailbox copy with the attachment (non-blocking)
 * Option values below are the exact strings Salesforce expects; only their labels are translated.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { toast } from 'react-toastify';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Banknote, Briefcase, ChevronDown, Clock, Globe, Hash, LoaderCircle, Mail, Paperclip, TriangleAlert, Type, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavLink from '@/components/shared/nav/NavLink';
import { EMAIL_RE, Field, fieldBox as box, fieldInput as input, fieldState as boxState, useGtcCountries } from '@/components/shared/formKit';

const MAX = 5 * 1024 * 1024;
const CLIENT_AGREEMENT_PDF = 'https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/Website+Client+Document/GTC+Global+Trade+Capital+Co.+Ltd+(VANUATU)/T%26S+-+GTC+GLOBAL+TRADE+CAPITAL+CO.+LTD.pdf';

// countries this form does not serve (country list + phone picker)
const EXCLUDED = new Set(['AU', 'US']);
const PHONE_COUNTRIES = getCountries().filter((c) => !EXCLUDED.has(c));

const GENERAL = 'General Query';
const COMPLIANCE = 'Compliance Query';
const QUERY_TYPES = [
  { value: GENERAL, key: 'general' },
  { value: COMPLIANCE, key: 'compliance' }
];
const TICKET_TYPES = [
  { value: 'Account/Registration', key: 'accountRegistration' },
  { value: 'Deposits', key: 'deposits' },
  { value: 'Withdrawals', key: 'withdrawals' },
  { value: 'Trading account queries', key: 'tradingAccountQueries' },
  { value: 'Add account opening links', key: 'accountOpeningLinks' },
  { value: 'Partner / Client Transfer Request', key: 'partnerClientTransfer' },
  { value: 'Promotions/Bonuses', key: 'promotionsBonuses' },
  { value: 'Trading investigation', key: 'tradingInvestigation' },
  { value: 'KYC queries', key: 'kycQueries' },
  { value: 'Other', key: 'other' }
];
const PROMOTION_TYPES = [
  { value: 'Issue', key: 'issue' },
  { value: 'Request', key: 'request' }
];
const TRADE_ACCOUNT_REQUIRED = ['Add account opening links', 'Partner / Client Transfer Request', 'Trading investigation', 'KYC queries'];

const EMPTY = {
  registration_status: '',
  query_type: GENERAL,
  ticket_type: '',
  promotion_bonus_type: '',
  trade_account: '',
  transaction_ids: '',
  trade_order_ids: '',
  date_time_incident: '',
  deposit_amount: '',
  subject: '',
  first_name: '',
  last_name: '',
  email: '',
  country: '',
  phone: '',
  message: ''
};
// cleared whenever the query or ticket type changes, so stale answers are never sent
const DEPENDENT = { ticket_type: '', promotion_bonus_type: '' };

const fileToBase64 = (f) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });

function Select({ id, value, onChange, onBlur, err, placeholder, options, disabled, icon: Icon }) {
  return (
    <span className={cn(box, boxState(err), 'relative')}>
      {Icon && <Icon className="size-4 shrink-0 text-ink/35" />}
      <select id={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} className={cn(input, 'cursor-pointer appearance-none pe-6 disabled:cursor-wait', !options.some((o) => o.value === value) && 'text-ink/40')}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3.5 size-4 text-ink/35" />
    </span>
  );
}

function TextField({ id, label, required, error, icon: Icon, ...rest }) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <span className={cn(box, boxState(error))}>
        <Icon className="size-4 shrink-0 text-ink/35" />
        <input id={id} className={input} placeholder={label} {...rest} />
      </span>
    </Field>
  );
}

/* PhoneInput (react-phone-number-input) restyled to match the other fields */
const phoneCls =
  '[&_.PhoneInput]:flex [&_.PhoneInput]:h-full [&_.PhoneInput]:w-full [&_.PhoneInput]:items-center [&_.PhoneInput]:gap-2.5 ' +
  '[&_.PhoneInputCountry]:me-0 [&_.PhoneInputCountry]:border-e [&_.PhoneInputCountry]:border-brand/10 [&_.PhoneInputCountry]:pe-2.5 ' +
  '[&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountryIcon--border]:bg-transparent [&_.PhoneInputCountryIcon--border]:shadow-none ' +
  '[&_.PhoneInputCountrySelectArrow]:text-ink/50 [&_.PhoneInputCountrySelectArrow]:opacity-80 ' +
  '[&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-ink [&_.PhoneInputInput]:outline-none';

export function TicketForm() {
  const t = useTranslations('contactPage.form');
  const { countries: allCountries, failed, suggested } = useGtcCountries();
  const countries = useMemo(() => allCountries.filter((c) => !EXCLUDED.has(c.code)), [allCountries]);
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState('AE');
  const fileRef = useRef(null);

  // preselect the visitor's country (unless it is one we don't serve)
  useEffect(() => {
    if (!suggested || EXCLUDED.has(suggested.code)) return;
    setValues((v) => (v.country ? v : { ...v, country: suggested.name }));
    setPhoneCountry(suggested.code);
  }, [suggested]);

  const { query_type: query, ticket_type: ticket } = values;
  const general = query === GENERAL;
  const show = {
    tradeAccount: query === COMPLIANCE || TICKET_TYPES.some((x) => x.value === ticket),
    transactionIds: ticket === 'Deposits' || ticket === 'Withdrawals',
    tradeOrderIds: ticket === 'Trading investigation',
    dateTimeIncident: ticket === 'Trading investigation',
    promotionBonusType: ticket === 'Promotions/Bonuses',
    depositAmount: ticket === 'Promotions/Bonuses'
  };
  const tradeAccountRequired = TRADE_ACCOUNT_REQUIRED.includes(ticket);

  const errors = useMemo(() => {
    const e = {};
    const need = (k, msg) => {
      if (!String(values[k] ?? '').trim()) e[k] = t(`errors.${msg}`);
    };
    need('registration_status', 'registrationStatus');
    need('query_type', 'queryType');
    if (general) need('ticket_type', 'ticketType');
    if (show.promotionBonusType) need('promotion_bonus_type', 'promotionBonusType');
    if (tradeAccountRequired) need('trade_account', 'tradeAccount');
    if (show.tradeOrderIds) need('trade_order_ids', 'tradeOrderIds');
    if (show.dateTimeIncident) need('date_time_incident', 'dateTimeIncident');
    need('subject', 'subject');
    ['first_name', 'last_name'].forEach((k) => {
      const v = values[k].trim();
      if (!v) e[k] = t(k === 'first_name' ? 'errors.firstName' : 'errors.lastName');
      else if (v.length < 2) e[k] = t('errors.minLetters');
    });
    if (!values.email.trim()) e.email = t('errors.emailRequired');
    else if (!EMAIL_RE.test(values.email.trim())) e.email = t('errors.email');
    need('phone', 'phone');
    need('country', 'countryRequired');
    need('message', 'description');
    if (file && file.size > MAX) e.file = t('errors.file');
    return e;
  }, [values, file, general, show.promotionBonusType, show.tradeOrderIds, show.dateTimeIncident, tradeAccountRequired, t]);

  // the phone's calling code follows the chosen country until a number has been typed
  useEffect(() => {
    const code = countries.find((c) => c.name === values.country)?.code;
    if (code && PHONE_COUNTRIES.includes(code) && !values.phone) setPhoneCountry(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.country, countries]);

  const err = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: typeof e === 'string' ? e : e.target.value }));
  const blur = (k) => () => setTouched((x) => ({ ...x, [k]: true }));
  const pickFile = (f) => {
    setFile(f ?? null);
    setTouched((x) => ({ ...x, file: true }));
  };

  // existing client: "No" files the ticket as a Lead
  const setExisting = (registered) =>
    setValues((v) => (registered ? { ...v, registration_status: 'Registered', ticket_type: '' } : { ...v, ...DEPENDENT, registration_status: 'Not Registered', ticket_type: 'Lead' }));
  const setQuery = (e) => {
    const q = e.target.value;
    setValues((v) => ({ ...v, query_type: q, ...(q === COMPLIANCE ? DEPENDENT : {}) }));
  };
  const setTicket = (e) => setValues((v) => ({ ...v, ticket_type: e.target.value, promotion_bonus_type: '' }));

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(Object.fromEntries([...Object.keys(EMPTY), 'file'].map((k) => [k, true])));
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      const attachmentBase64 = file?.size > 0 ? await fileToBase64(file) : null;
      const additionalFields = {};
      const extra = { promotionBonusType: 'promotion_bonus_type', tradingAccount: 'trade_account', transactionId: 'transaction_ids', tradeOrderIds: 'trade_order_ids', dateTimeIncident: 'date_time_incident', depositAmount: 'deposit_amount', queryType: 'query_type' };
      Object.entries(extra).forEach(([k, field]) => values[field] && (additionalFields[k] = values[field]));

      const res = await fetch('/api/sales-force-with-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          firstName: values.first_name,
          lastName: values.last_name,
          phone: values.phone,
          country: values.country,
          // a Compliance Query has no ticket type of its own
          ticketType: query === COMPLIANCE ? COMPLIANCE : ticket,
          subject: values.subject,
          description: values.message,
          registeredClient: values.registration_status,
          additionalFields,
          query_type: query,
          files: attachmentBase64 ? [{ fileName: file.name, contentType: file.type || 'application/octet-stream', base64Data: attachmentBase64 }] : [],
          recaptchaToken: ''
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === 'error') throw new Error(data.message || t('toastError'));

      // support mailbox copy — never blocks the success message
      fetch('/api/send-support-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, attachment_name: file?.name || null, attachment_base64: attachmentBase64 })
      }).catch(() => {});

      toast.success(t('toastSubmitted'));
      if (typeof window.gtag_report_conversion === 'function') window.gtag_report_conversion();
      setValues({ ...EMPTY, country: values.country });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setTouched({});
    } catch (error) {
      toast.error(error?.message || t('toastError'));
    } finally {
      setLoading(false);
    }
  }

  const existing = values.registration_status === 'Registered' ? 'yes' : values.registration_status === 'Not Registered' ? 'no' : '';

  return (
    <div id="ticket" className="scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white text-ink shadow-[0_40px_100px_-40px_rgba(41,59,147,0.45)]">
      <div className="relative overflow-hidden bg-gradient-to-r from-brand via-brand-800 to-brand-950 px-5 py-4 text-white md:px-7">
        <span className="absolute -end-10 -top-10 size-32 rounded-full bg-gold/30 blur-2xl" aria-hidden />
        <h2 className="heading-card is-dark relative">{t('title')}</h2>
      </div>
      <form className="space-y-4 p-5 md:p-7" onSubmit={onSubmit} noValidate>
        {/* existing client */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink/80">
              {t('existing')} <span className="text-down">*</span>
            </span>
            <div className="relative flex rounded-full bg-[#f3f5fb] p-1 ring-1 ring-brand/10" role="radiogroup" aria-label={t('existing')}>
              {['yes', 'no'].map((k) => (
                <button key={k} type="button" role="radio" aria-checked={existing === k} onClick={() => setExisting(k === 'yes')} className={cn('relative min-w-[4.5rem] rounded-full px-4 py-1.5 text-sm font-semibold transition-colors', existing === k ? 'text-white' : 'text-ink/60 hover:text-brand')}>
                  {existing === k && <motion.span layoutId="existing-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="relative">{t(k)}</span>
                </button>
              ))}
            </div>
          </div>
          {err('registration_status') && <p className="mt-1 text-[11px] text-down">{err('registration_status')}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ct-query" label={t('queryType')} required error={err('query_type')} className={cn(!general && 'sm:col-span-2')}>
            <Select id="ct-query" value={query} onChange={setQuery} onBlur={blur('query_type')} err={err('query_type')} placeholder={t('queryTypeSelect')} options={QUERY_TYPES.map((o) => ({ value: o.value, label: t(`queryTypeOptions.${o.key}`) }))} />
          </Field>
          {general && (
            <Field id="ct-ticket" label={t('ticketType')} required error={err('ticket_type')}>
              <Select id="ct-ticket" value={ticket === 'Lead' ? '' : ticket} onChange={setTicket} onBlur={blur('ticket_type')} err={err('ticket_type')} placeholder={t('ticketSelect')} options={TICKET_TYPES.map((o) => ({ value: o.value, label: t(`ticketTypeOptions.${o.key}`) }))} />
            </Field>
          )}
        </div>

        {/* fields that depend on the query / ticket type */}
        {(show.tradeAccount || show.transactionIds || show.tradeOrderIds || show.dateTimeIncident || show.promotionBonusType || show.depositAmount) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {show.tradeAccount && <TextField id="ct-account" label={t('tradeAccount')} required={tradeAccountRequired} error={err('trade_account')} icon={Briefcase} value={values.trade_account} onChange={set('trade_account')} onBlur={blur('trade_account')} />}
            {show.transactionIds && <TextField id="ct-txn" label={t('transactionIds')} icon={Hash} value={values.transaction_ids} onChange={set('transaction_ids')} />}
            {show.tradeOrderIds && <TextField id="ct-orders" label={t('tradeOrderIds')} required error={err('trade_order_ids')} icon={Hash} value={values.trade_order_ids} onChange={set('trade_order_ids')} onBlur={blur('trade_order_ids')} />}
            {show.dateTimeIncident && <TextField id="ct-when" label={t('dateTimeIncident')} required error={err('date_time_incident')} icon={Clock} value={values.date_time_incident} onChange={set('date_time_incident')} onBlur={blur('date_time_incident')} placeholder={t('dateTimeIncidentPlaceholder')} />}
            {show.promotionBonusType && (
              <Field id="ct-promo" label={t('promotionBonusType')} required error={err('promotion_bonus_type')}>
                <Select id="ct-promo" value={values.promotion_bonus_type} onChange={set('promotion_bonus_type')} onBlur={blur('promotion_bonus_type')} err={err('promotion_bonus_type')} placeholder={t('promotionBonusSelect')} options={PROMOTION_TYPES.map((o) => ({ value: o.value, label: t(`promotionBonusOptions.${o.key}`) }))} />
              </Field>
            )}
            {show.depositAmount && <TextField id="ct-amount" label={t('depositAmount')} icon={Banknote} value={values.deposit_amount} onChange={set('deposit_amount')} inputMode="decimal" />}
          </div>
        )}

        <TextField id="ct-subject" label={t('subject')} required error={err('subject')} icon={Type} value={values.subject} onChange={set('subject')} onBlur={blur('subject')} maxLength={150} />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="ct-first" label={t('firstName')} required error={err('first_name')} icon={User} value={values.first_name} onChange={set('first_name')} onBlur={blur('first_name')} autoComplete="given-name" />
          <TextField id="ct-last" label={t('lastName')} required error={err('last_name')} icon={User} value={values.last_name} onChange={set('last_name')} onBlur={blur('last_name')} autoComplete="family-name" />
          <TextField id="ct-email" type="email" label={t('email')} required error={err('email')} icon={Mail} value={values.email} onChange={set('email')} onBlur={blur('email')} autoComplete="email" />
          <Field id="ct-country" label={t('country')} required error={err('country')}>
            <Select id="ct-country" icon={Globe} value={values.country} onChange={set('country')} onBlur={blur('country')} err={err('country')} disabled={!countries.length} placeholder={countries.length ? t('countrySelect') : failed ? t('errors.country') : t('countryLoading')} options={countries.map((c) => ({ value: c.name, label: c.name }))} />
          </Field>
        </div>

        <Field id="ct-phone" label={t('phone')} required error={err('phone')}>
          <span className={cn(box, boxState(err('phone')), phoneCls)} dir="ltr">
            <PhoneInput key={phoneCountry} id="ct-phone" international countryCallingCodeEditable={false} countries={PHONE_COUNTRIES} defaultCountry={phoneCountry} value={values.phone || undefined} onChange={(v) => set('phone')(v ?? '')} onBlur={blur('phone')} autoComplete="tel" />
          </span>
        </Field>

        <Field id="ct-desc" label={t('description')} required error={err('message')}>
          <textarea id="ct-desc" rows={5} value={values.message} onChange={set('message')} onBlur={blur('message')} placeholder={t('descriptionPlaceholder')} maxLength={4000} className={cn('w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:ring-4', err('message') ? 'border-down/60 focus:border-down focus:ring-down/10' : 'border-brand/15 focus:border-brand focus:ring-brand/10')} />
        </Field>

        {(ticket === 'Deposits' || ticket === 'Withdrawals') && (
          <p className="flex items-start gap-2 rounded-xl bg-gold/10 px-3.5 py-3 text-xs font-medium text-gold-700 ring-1 ring-gold/25">
            <TriangleAlert className="mt-px size-4 shrink-0" />
            {t(ticket === 'Deposits' ? 'depositDisclaimer' : 'withdrawalDisclaimer')}
          </p>
        )}

        {/* attachment */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink/65">
            {t('attachment')} <span className="text-ink/40">{t('optional')}</span>
          </span>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn('flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition-colors', drag ? 'border-brand bg-brand-50' : 'border-brand/15 bg-[#f8f9fc] hover:border-brand/30')}
          >
            <input ref={fileRef} type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx" onChange={(e) => pickFile(e.target.files?.[0])} />
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white">
              <Paperclip className="size-4" />
              {t('choose')}
            </span>
            {file ? (
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink/75">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    pickFile(null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  aria-label={t('remove')}
                  className="grid size-6 place-items-center rounded-full bg-white text-ink/50 ring-1 ring-brand/10 hover:text-down"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ) : (
              <span className="text-sm text-ink/45">{t('drop')}</span>
            )}
          </label>
          {err('file') ? <p className="mt-1 text-[11px] text-down">{err('file')}</p> : <p className="mt-1 text-[11px] text-ink/45">{t('attachmentHint')}</p>}
        </div>

        <p className="text-center text-xs italic text-ink/55">{t('note')}</p>

        <button type="submit" disabled={loading} className="shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-900 text-sm font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60">
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {loading ? t('submitting') : t('submit')}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-ink/50">
          {t('termsPrefix')}{' '}
          <NavLink href="/legal/privacy-policy" target="_blank" className="font-semibold text-brand underline underline-offset-2 hover:text-gold-700">
            {t('privacyPolicy')}
          </NavLink>{' '}
          {t('termsMiddle')}{' '}
          <a href={CLIENT_AGREEMENT_PDF} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-2 hover:text-gold-700">
            {t('clientAgreement')}
          </a>{' '}
          {t('termsSuffix')}
        </p>
      </form>
    </div>
  );
}
