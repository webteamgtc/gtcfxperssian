'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, ChevronDown, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOCIALS } from './icons';
import NavLink from './nav/NavLink';
import { FOOTER_LINKS } from '@/config/menu';
import { StoreBadges } from './GtcGoPhone';
import { Stagger, StaggerItem, Reveal, EASE } from '../motion';
import { FOOTER_NOTICE_REGIONS, CAT5_LOCALE, regionOf } from '@/config/regions';
import { resetUaeCategory, useCountry } from './geo/geoClient';

const COLS = ['instruments', 'quick', 'platforms', 'company', 'support', 'legal'];

export default function Footer({ theme = 'light', layout = 'stacked' }) {
  const t = useTranslations('footer');
  const locale = useLocale();
  const country = useCountry();
  // legal notice for the visitor's regional site (South Africa, Mauritius, Vanuatu have their own)
  const region = regionOf(locale);
  const notice = FOOTER_NOTICE_REGIONS.includes(region) ? t.raw(`notices.${region}`) : { title: t('riskTitle'), paras: t.raw('risk') };
  const dark = theme === 'dark';

  return (
    <footer
      className={cn('relative overflow-hidden pt-20', dark ? 'bg-ink text-white' : 'bg-[#f6f7fb] text-ink')}
    >
      <div className={cn('absolute inset-0 opacity-60', dark ? 'bg-grid-dark' : 'bg-grid-light', 'mask-fade-y')} />
      <div className="absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />

      <div className="container-x relative">
        {layout === 'split' ? (
          <div className="grid gap-12 pb-12 lg:grid-cols-[1fr_2fr]">
            <Reveal x={-20} y={0}>
              <h2 className={cn('heading-title max-w-xs', dark && 'is-dark')}>
                {t('tagline').split('. ').map((part, i, arr) => (
                  <span key={i} className={i === 1 ? 'heading-accent' : ''}>
                    {part}
                    {i < arr.length - 1 ? '. ' : ''}
                  </span>
                ))}
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {SOCIALS.map((s, i) => (
                  <motion.a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={cn('grid size-10 place-items-center rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-white', dark ? 'border-white/15 text-white/80' : 'border-brand/15 bg-white text-brand')}
                  >
                    {s.icon('size-[17px]')}
                  </motion.a>
                ))}
              </div>
              <StoreBadges dark={dark} className="mt-8" />
            </Reveal>
            <Stagger className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 sm:gap-y-10 md:grid-cols-3" stagger={0.07}>
              {COLS.map((c) => {
                const col = t.raw(`columns.${c}`);
                return (
                  <StaggerItem key={c}>
                    <FooterColumn title={col.title} links={col.links} hrefs={FOOTER_LINKS[c]} dark={dark} />
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        ) : (
          <>
        <div className={cn('flex flex-col gap-6 border-b pb-10 md:flex-row md:items-center md:justify-between', dark ? 'border-white/10' : 'border-brand/10')}>
          {/* tagline on the start side, social icons on the end side, vertically centred on one line */}
          <Reveal>
            <h2 className={cn('heading-title', dark && 'is-dark')}>
              {t('tagline').split('. ').map((part, i, arr) => (
                <span key={i} className={i === 1 ? 'heading-accent' : ''}>
                  {part}
                  {i < arr.length - 1 ? '. ' : ''}
                </span>
              ))}
            </h2>
          </Reveal>
          <Stagger className="flex flex-wrap gap-2" stagger={0.06}>
            {SOCIALS.map((s) => (
              <StaggerItem key={s.name} variants={{ hidden: { opacity: 0, scale: 0.4, rotate: -30 }, show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } } }}>
                <a
                  href={s.href}
                  aria-label={s.name}
                  className={cn(
                    'grid size-10 place-items-center rounded-full border transition-all duration-300 md:size-11 hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-white',
                    dark ? 'border-white/15 text-white/80' : 'border-brand/15 bg-white text-brand'
                  )}
                >
                  {s.icon('size-[18px]')}
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Link columns */}
        <Stagger className="grid grid-cols-1 gap-x-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6" stagger={0.07}>
          {COLS.map((c) => {
            const col = t.raw(`columns.${c}`);
            return (
              <StaggerItem key={c}>
                <FooterColumn title={col.title} links={col.links} hrefs={FOOTER_LINKS[c]} dark={dark} />
              </StaggerItem>
            );
          })}
        </Stagger>

          </>
        )}

        {/* Risk warning */}
        <Reveal className={cn('border-t py-10', dark ? 'border-white/10' : 'border-brand/10')} y={16}>
          <h3 className={cn('heading-label', dark && 'is-dark')}>{notice.title}</h3>
          <div className={cn('mt-4 space-y-3 text-[13px] leading-relaxed', dark ? 'text-white/55' : 'text-ink/60')}>
            {notice.paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>

        <div className={cn('flex flex-col items-start justify-between gap-4 border-t py-6 text-sm sm:flex-row sm:items-center', dark ? 'border-white/10 text-white/50' : 'border-brand/10 text-ink/50')}>
          <p>
            © {new Date().getFullYear()} GTCFX. {t('rights')}
            {(locale === CAT5_LOCALE || country === 'AE') && (
              <button type="button" onClick={resetUaeCategory} className={cn('ms-3 underline underline-offset-4 transition-colors', dark ? 'hover:text-white' : 'hover:text-brand')}>
                {t('changeCategory')}
              </button>
            )}
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cn('group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-medium transition-all hover:border-gold', dark ? 'border-white/15 text-white' : 'border-brand/15 text-brand')}
          >
            {t('backToTop')}
            <ArrowUp className="size-4 transition-transform group-hover:-translate-y-1" />
          </button>
        </div>
      </div>

      {/* Big watermark that rises into view */}
      {/* {layout !== 'split' && <motion.div
        dir="ltr"
        aria-hidden
        style={{ y: wmY, opacity: wmOpacity }}
        className={cn(
          'pointer-events-none select-none text-center text-[22vw] font-black leading-[0.8] tracking-tighter',
          dark ? 'text-white/[0.04]' : 'text-brand/[0.07]'
        )}
      >
        GTCFX
      </motion.div>} */}

      <CookieBanner dark={dark} />
    </footer>
  );
}

function FooterColumn({ title, links, hrefs = [], dark }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('border-b py-4 sm:border-0 sm:py-0', dark ? 'border-white/10' : 'border-brand/10')}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between sm:pointer-events-none" aria-expanded={open}>
        <h4 className={cn('heading-label', dark && 'is-dark')}>{title}</h4>
        <ChevronDown className={cn('size-4 text-gold transition-transform sm:hidden', open && 'rotate-180')} />
      </button>
      <ul className={cn('mt-4 space-y-3 overflow-hidden text-[15px] sm:block', open ? 'block' : 'hidden')}>
        {links.map((l, i) => (
          <li key={l}>
            <NavLink href={hrefs[i]} className={cn('group relative inline-flex items-center transition-colors', dark ? 'text-white/70 hover:text-white' : 'text-ink/70 hover:text-brand')}>
              <span className="absolute -start-3 size-1.5 scale-0 rounded-full bg-gold transition-transform group-hover:scale-100" />
              <span className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{l}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Cookie notice. It is part of the server HTML and slides up with the page (CSS), instead of appearing
 * later from a script: a late banner becomes the page's "largest contentful paint" and hurts Core Web Vitals.
 * Visitors who already answered never see it (hidden before paint via <html data-cookie="ok">, see introScript.js).
 */
function CookieBanner({ dark }) {
  const t = useTranslations('footer');
  const [show, setShow] = useState(true);
  const close = () => {
    setShow(false);
    try {
      localStorage.setItem('gtc-cookie', '1');
    } catch {}
    setTimeout(() => (document.documentElement.dataset.cookie = 'ok'), 600);
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="gtc-cookie"
          initial={false}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-x-3 bottom-3 z-[60] md:inset-x-auto md:start-6 md:bottom-6 md:max-w-md"
        >
          <div className={cn('rounded-3xl border p-5 shadow-2xl backdrop-blur-xl', dark ? 'border-white/10 bg-[#11131c]/95 text-white' : 'border-brand/10 bg-white/95 text-ink')}>
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                <Cookie className="size-5" />
              </span>
              <p className={cn('text-[13px] leading-relaxed', dark ? 'text-white/70' : 'text-ink/70')}>{t('cookie')}</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={close} className={cn('rounded-full px-4 py-2 text-sm font-semibold', dark ? 'text-white/80 hover:bg-white/10' : 'text-brand hover:bg-brand-50')}>
                {t('cookieSettings')}
              </button>
              <button onClick={close} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                {t('cookieAccept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
