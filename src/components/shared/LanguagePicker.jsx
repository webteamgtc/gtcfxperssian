'use client';
/**
 * Language picker for the header: a small dropdown under the button (English / Farsi).
 * Portalled to <body> so a header with overflow-hidden can't clip it. Light or dark, following the header.
 * Keyboard: Esc closes, arrow keys move between options.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Globe } from 'lucide-react';
// import only the flags we use (keeps the bundle small)
import { AE, IR } from 'country-flag-icons/react/1x1';
const Flags = { AE, IR };
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALES, getLocale } from '@/i18n/locales';
import { COOKIES, REGION_LOCALES, REMEMBER_DAYS } from '@/config/regions';
import { cn } from '@/lib/utils';
import { EASE } from '../motion';

export function LocaleFlag({ code, className }) {
  const l = getLocale(code);
  const Flag = l.flag ? Flags[l.flag] : null;
  return (
    <span className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-black/10', !Flag && 'bg-brand-50 text-brand', className)} aria-hidden>
      {Flag ? <Flag className="size-full" /> : <Globe className="size-[62%]" strokeWidth={1.75} />}
    </span>
  );
}

const OPTIONS = LOCALES.filter((l) => !l.hideInLanguageSelector);
const WIDTH = 208;

export default function LanguagePicker({ dark = false, className, onOpenChange, forceClose = false }) {
  const t = useTranslations('lang');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const current = getLocale(locale);
  // regional English (en-ae, en-za…) counts as the English option
  const activeCode = current.lang === 'en' ? 'en-intl' : locale;

  useEffect(() => setMounted(true), []);
  useEffect(() => onOpenChange?.(open), [open, onOpenChange]);
  // the header closes the picker when a mega menu opens
  useEffect(() => {
    if (forceClose) setOpen(false);
  }, [forceClose]);

  // keep the dropdown under the button, lined up with its end edge (start edge in RTL)
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const rtl = document.documentElement.dir === 'rtl';
      const left = rtl ? r.left : r.right - WIDTH;
      setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(left, window.innerWidth - WIDTH - 8)) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place);
    };
  }, [open]);

  // close on outside click / Esc, focus the selected option
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    const id = setTimeout(() => panelRef.current?.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true }), 60);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      clearTimeout(id);
    };
  }, [open]);

  const choose = (code) => {
    setOpen(false);
    if (code === activeCode) return;
    // picking a regional English site on purpose: the proxy must not send the visitor back to their own region
    if (REGION_LOCALES.includes(code)) document.cookie = `${COOKIES.regionDismissed}=${code}; path=/; max-age=${60 * 60 * 24 * REMEMBER_DAYS}; SameSite=Lax`;
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === '1') {
      window.location.href = window.location.pathname.replace(`/${locale}/`, `/${code}/`);
    } else {
      router.replace(pathname, { locale: code, scroll: false });
    }
  };

  const onListKey = (e) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const items = [...(panelRef.current?.querySelectorAll('[role="option"]') ?? [])];
    const i = items.indexOf(document.activeElement);
    items[(i + step + items.length) % items.length]?.focus();
  };

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('open')}: ${current.native}`}
        className={cn(
          'group inline-flex h-10 items-center gap-2 rounded-full py-1 pe-3 ps-1 text-sm font-semibold transition-all',
          dark ? 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15' : 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-700',
          open && (dark ? 'bg-white/20' : 'bg-brand-700')
        )}
      >
        <LocaleFlag code={locale} className={cn('size-8', !current.flag && 'bg-white text-brand ring-0')} />
        <span dir="ltr" className="uppercase">{locale.split('-')[0]}</span>
        <ChevronDown className={cn('size-4 opacity-70 transition-transform duration-300', open && 'rotate-180')} />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.ul
                key="lang-menu"
                ref={panelRef}
                role="listbox"
                aria-label={t('title')}
                onKeyDown={onListKey}
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, ease: EASE }}
                style={{ top: pos.top, left: pos.left, width: WIDTH }}
                className={cn(
                  'fixed z-[100] origin-top space-y-0.5 rounded-2xl border p-1.5 shadow-[0_20px_50px_-12px_rgba(10,14,38,0.45)] backdrop-blur-xl',
                  dark ? 'border-white/10 bg-ink/95 text-white' : 'border-brand/10 bg-white text-ink'
                )}
              >
                {OPTIONS.map((l) => {
                  const on = l.code === activeCode;
                  return (
                    <li key={l.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={on}
                        lang={l.lang ?? l.code}
                        onClick={() => choose(l.code)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-start text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold',
                          dark ? (on ? 'bg-white/10 text-gold-300' : 'text-white hover:bg-white/[0.06]') : on ? 'bg-brand-50 text-brand' : 'text-ink hover:bg-brand-50'
                        )}
                      >
                        <LocaleFlag code={l.code} className="size-7" />
                        <bdi className="min-w-0 flex-1 truncate">{l.native}</bdi>
                        {on && <Check className="size-4 shrink-0" strokeWidth={2.5} />}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
