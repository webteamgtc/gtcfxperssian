'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ChevronDown, LogIn, Menu, User } from 'lucide-react';
import { MENU, PORTAL } from '@/config/menu';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import LanguagePicker from './LanguagePicker';
import MegaMenu from './nav/MegaMenu';
import MobileNav from './nav/MobileNav';
import NavLink, { useIsActive } from './nav/NavLink';
import { EASE } from '../motion';
import { useCountry } from './geo/geoClient';

const IDS = MENU.map((g) => g.id);

/**
 * theme: 'light' | 'dark' | 'overlay'
 *  overlay = transparent over a dark hero, turns white after scrolling.
 * variant: 'bar' | 'floating'
 */
export default function Header({ theme = 'light', variant = 'bar' }) {
  const floating = variant === 'floating';
  const tn = useTranslations('nav');
  const tm = useTranslations('menu');
  const tr = useTranslations();
  const country = useCountry(); // US visitors see the US risk warning
  const isActive = useIsActive();
  const [open, setOpen] = useState(null);
  const [dirn, setDirn] = useState(1);
  const [hover, setHover] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const openTimer = useRef();
  const closeTimer = useRef();
  const navRef = useRef(null);
  const btnRefs = useRef({});

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(v > 30);
    setHidden(v > 500 && v > prev && !open && !langOpen);
  });

  const show = useCallback(
    (g) => {
      clearTimeout(closeTimer.current);
      setOpen((cur) => {
        if (cur && g && cur !== g) setDirn(IDS.indexOf(g) > IDS.indexOf(cur) ? 1 : -1);
        return g;
      });
    },
    []
  );
  const enter = (g) => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    // small intent delay so moving the mouse across the bar doesn't flash panels
    openTimer.current = setTimeout(() => show(g), open ? 40 : 90);
  };
  const leave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };
  const close = useCallback(() => {
    clearTimeout(openTimer.current);
    setOpen(null);
  }, []);

  // Esc closes and returns focus; clicking outside closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        btnRefs.current[open]?.focus();
        close();
      }
    };
    const onDoc = (e) => !navRef.current?.contains(e.target) && close();
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open, close]);

  // opening the language band closes any open mega menu
  const onLangChange = useCallback((v) => {
    setLangOpen(v);
    if (v) {
      clearTimeout(openTimer.current);
      setOpen(null);
    }
  }, []);

  const onTriggerKey = (e, g, isLink = false) => {
    if (e.key === 'ArrowDown' || (!isLink && (e.key === 'Enter' || e.key === ' '))) {
      e.preventDefault();
      show(g);
      setTimeout(() => navRef.current?.querySelector('[data-mega] a')?.focus(), 60);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const rtl = document.documentElement.dir === 'rtl';
      const step = (e.key === 'ArrowRight') !== rtl ? 1 : -1;
      const next = IDS[(IDS.indexOf(g) + step + IDS.length) % IDS.length];
      btnRefs.current[next]?.focus();
      if (open) show(next);
    }
  };
  // leaving the panel with Tab closes it
  const onPanelBlur = (e) => {
    if (!navRef.current?.contains(e.relatedTarget)) close();
  };

  const dark = theme === 'dark' || (theme === 'overlay' && !scrolled);
  const surface =
    theme === 'dark'
      ? scrolled || open
        ? 'bg-ink/85 border-white/10 shadow-2xl shadow-black/40'
        : 'bg-transparent border-transparent'
      : theme === 'overlay'
        ? scrolled
          ? 'bg-white/85 border-brand/10 shadow-xl shadow-brand/5'
          : 'bg-transparent border-transparent'
        : scrolled || open || langOpen
          ? 'bg-white/90 border-brand/10 shadow-xl shadow-brand/5'
          : 'bg-white/40 border-transparent';

  return (
    <>
      {/* page dim behind the open menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 hidden bg-ink/25 lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onMouseEnter={leave}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.header
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* Risk warning bar — always visible */}
        <div
          className={cn(
            'border-b text-[11px] leading-snug md:text-xs',
            dark ? 'border-white/10 bg-black/40 text-white/75' : 'border-brand/10 bg-brand-50/90 text-brand-800'
          )}
        >
          <div className="container-x py-2 backdrop-blur">
            <p className="line-clamp-2">{tr(country === 'US' ? 'riskBarUs' : 'riskBar')}</p>
          </div>
        </div>

        <div ref={navRef} className={cn('relative', floating && 'container-x pt-3')}>
          <div
            className={cn(
              'backdrop-blur-xl transition-all duration-500',
              floating ? 'overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white/90 shadow-xl shadow-brand/10' : cn('border-b', surface)
            )}
          >
            <nav aria-label={tn('menu')} className={cn('flex items-center justify-between gap-4 transition-all duration-500', floating ? 'px-4 md:px-6' : 'container-x', scrolled ? 'h-16' : floating ? 'h-[72px]' : 'h-20')}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: EASE }}>
                <Link href="/" aria-label="GTCFX" onClick={close}>
                  <Logo onDark={dark} />
                </Link>
              </motion.div>

              {/* desktop top-level items */}
              <ul className="relative hidden items-center gap-0.5 lg:flex" onMouseLeave={() => { leave(); setHover(null); }}>
                {MENU.map((g, i) => {
                  const on = open === g.id;
                  const current = isActive(g.href) || g.columns.flat().some((s) => s.items.some((it) => isActive(it.href)));
                  // a group with its own page (e.g. Company → /company) is a link: click opens the page, hover opens the menu
                  const Trigger = g.href ? NavLink : 'button';
                  return (
                    <motion.li
                      key={g.id}
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: EASE }}
                      onMouseEnter={() => { enter(g.id); setHover(g.id); }}
                      className="relative"
                    >
                      <Trigger
                        ref={(el) => (btnRefs.current[g.id] = el)}
                        {...(g.href ? { href: g.href, onClick: close } : { type: 'button', onClick: () => (on ? close() : show(g.id)) })}
                        aria-expanded={on}
                        aria-controls="mega-panel"
                        aria-haspopup="true"
                        onKeyDown={(e) => onTriggerKey(e, g.id, !!g.href)}
                        className={cn(
                          'relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold xl:px-4',
                          dark ? (on ? 'text-white' : 'text-white/80 hover:text-white') : on ? 'text-brand' : 'text-brand-900 hover:text-brand'
                        )}
                      >
                        {(hover === g.id || on) && (
                          <motion.span layoutId="nav-underline" className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gold xl:inset-x-4" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                        )}
                        <span className="relative">{tm(`groups.${g.id}`)}</span>
                        <ChevronDown className={cn('relative size-4 opacity-70 transition-transform duration-300', on && 'rotate-180')} />
                        {current && !on && hover !== g.id && <span className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-gold" aria-hidden />}
                      </Trigger>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-2">
                <NavLink
                  href={PORTAL.register}
                  className={cn(
                    'hidden h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all md:inline-flex',
                    dark ? 'border-white/20 text-white hover:bg-white hover:text-brand-900' : 'border-brand/15 bg-white text-brand hover:border-brand'
                  )}
                >
                  <User className="size-4" /> {tn('register')}
                </NavLink>
                <NavLink
                  href={PORTAL.login}
                  className={cn(
                    'hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-all md:inline-flex',
                    dark ? 'text-white/80 hover:text-white' : 'text-brand-900/70 hover:text-brand'
                  )}
                >
                  <LogIn className="size-4 rtl:-scale-x-100" /> {tn('login')}
                </NavLink>
                <LanguagePicker dark={dark} forceClose={!!open} onOpenChange={onLangChange} />
                <button
                  type="button"
                  onClick={() => setMobile(true)}
                  className={cn('grid size-10 place-items-center rounded-full lg:hidden', dark ? 'bg-white/10 text-white' : 'bg-brand-50 text-brand')}
                  aria-label={tm('openMenu')}
                  aria-expanded={mobile}
                >
                  <Menu className="size-5" />
                </button>
              </div>
            </nav>

            {/* desktop mega menu (attached to the bar) */}
            <div className="hidden lg:block" data-mega onMouseEnter={() => clearTimeout(closeTimer.current)} onMouseLeave={leave} onBlur={onPanelBlur}>
              <AnimatePresence>{open && <MegaMenu key="mega" id="mega-panel" group={open} direction={dirn} onNavigate={close} dark={dark} floating={floating} />}</AnimatePresence>
            </div>
          </div>

        </div>
      </motion.header>

      <MobileNav open={mobile} onClose={() => setMobile(false)} />
    </>
  );
}
