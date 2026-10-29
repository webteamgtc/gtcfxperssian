'use client';
/**
 * Phone / tablet navigation: full-height drawer with drill-down.
 * Level 1 = the five menus, level 2 = that menu's sections and links.
 */
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ChevronRight, LogIn, User, X } from 'lucide-react';
import { MENU, PORTAL, LIVE_ACCOUNT_HREF } from '@/config/menu';
import { getDir } from '@/i18n/locales';
import { cn } from '@/lib/utils';
import Logo from '../Logo';
import LanguagePicker from '../LanguagePicker';
import { EASE } from '../../motion';
import NavLink, { useIsActive } from './NavLink';
import DownloadsPromo from './DownloadsPromo';

const GROUP_ICONS = {
  company: MENU[0].columns[0][0].items[0].icon,
  trading: MENU[1].columns[1][0].items[0].icon,
  markets: MENU[2].columns[0][0].items[2].icon,
  learn: MENU[3].columns[1][0].items[0].icon,
  news: MENU[4].columns[0][0].items[0].icon
};

export default function MobileNav({ open, onClose }) {
  const t = useTranslations('menu');
  const tn = useTranslations('nav');
  const rtl = getDir(useLocale()) === 'rtl';
  const isActive = useIsActive();
  const [level, setLevel] = useState(null);
  const off = rtl ? '-100%' : '100%';
  const dir = rtl ? -1 : 1;

  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => setLevel(null), 400);
      return () => clearTimeout(id);
    }
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && (level ? setLevel(null) : onClose());
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, level, onClose]);

  const group = MENU.find((g) => g.id === level);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={tn('menu')}
            initial={{ x: off }}
            animate={{ x: 0 }}
            exit={{ x: off }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-white pb-[env(safe-area-inset-bottom)] text-ink shadow-2xl"
          >
            {/* top bar */}
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-brand/10 px-5">
              <AnimatePresence mode="wait" initial={false}>
                {group ? (
                  <motion.button key="back" initial={{ opacity: 0, x: -10 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onClick={() => setLevel(null)} className="inline-flex items-center gap-2 rounded-full py-2 pe-3 text-sm font-semibold text-brand">
                    <ArrowLeft className="size-4 rtl:-scale-x-100" /> {t('back')}
                  </motion.button>
                ) : (
                  <motion.div key="logo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Logo />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-2">
                <LanguagePicker />
                <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-[#f1f3f9] text-ink/70 transition hover:bg-brand hover:text-white" aria-label={tn('close')}>
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* levels */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <AnimatePresence initial={false} custom={dir}>
                {!group ? (
                  <motion.div
                    key="root"
                    custom={dir}
                    initial={{ x: -60 * dir, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60 * dir, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 overflow-y-auto overscroll-contain px-5 py-6"
                  >
                    <ul className="space-y-2">
                      {MENU.map((g, i) => {
                        const Icon = GROUP_ICONS[g.id];
                        const count = g.columns.flat().reduce((n, s) => n + s.items.length, 0);
                        return (
                          <motion.li key={g.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: EASE }}>
                            <button onClick={() => setLevel(g.id)} className="group flex w-full items-center gap-4 rounded-2xl border border-brand/10 bg-white p-4 text-start transition hover:border-brand/25 hover:shadow-lg hover:shadow-brand/10">
                              <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-500 text-white shadow-md shadow-brand/25">
                                <Icon className="size-5" strokeWidth={1.8} />
                              </span>
                              <span className="flex-1">
                                <span className="block text-lg font-semibold">{t(`groups.${g.id}`)}</span>
                                <span className="block text-xs text-ink/45">{t('allLinks', { count })}</span>
                              </span>
                              <ChevronRight className="size-5 text-ink/30 transition group-hover:translate-x-1 group-hover:text-gold rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                            </button>
                          </motion.li>
                        );
                      })}
                    </ul>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand to-brand-900 p-5 text-white">
                      <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
                      <p className="relative text-lg font-bold">{t('mobileCta')}</p>
                      <div className="relative mt-4 grid grid-cols-2 gap-2">
                        <NavLink href={LIVE_ACCOUNT_HREF} onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold">
                          <User className="size-4" /> {tn('register')}
                        </NavLink>
                        <NavLink href={PORTAL.login} onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-semibold ring-1 ring-white/20">
                          <LogIn className="size-4" /> {tn('login')}
                        </NavLink>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={group.id}
                    initial={{ x: 60 * dir, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60 * dir, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 overflow-y-auto overscroll-contain px-5 py-6"
                  >
                    {group.href ? (
                      <NavLink href={group.href} onClick={onClose} className="group inline-flex items-center gap-2">
                        <h2 className="heading-title">{t(`groups.${group.id}`)}</h2>
                        <ChevronRight className="size-5 text-gold transition-transform group-active:translate-x-1 rtl:-scale-x-100" />
                      </NavLink>
                    ) : (
                      <h2 className="heading-title">{t(`groups.${group.id}`)}</h2>
                    )}
                    <div className="mt-6 space-y-7">
                      {group.columns.flat().map((sec, si) => (
                        <motion.section key={sec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + si * 0.05 }}>
                          <h3 className="heading-label">{t(`sections.${sec.id}`)}</h3>
                          <ul className="mt-2 grid gap-1">
                            {sec.items.map((it) => {
                              const Icon = it.icon;
                              const on = isActive(it.href);
                              return (
                                <li key={it.id}>
                                  <NavLink href={it.href} onClick={onClose} aria-current={on ? 'page' : undefined} className={cn('flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition', on ? 'bg-brand-50 text-brand' : 'text-ink/80 active:bg-[#f1f3f9]')}>
                                    {Icon ? (
                                      <span className="grid size-8 place-items-center rounded-lg bg-[#f1f3f9] text-brand/70">
                                        <Icon className="size-4" strokeWidth={1.8} />
                                      </span>
                                    ) : (
                                      <span className="grid size-8 place-items-center rounded-lg bg-gold-50 text-[10px] font-bold text-gold-700" dir="ltr">
                                        {it.id.slice(0, 3)}
                                      </span>
                                    )}
                                    <span className="flex-1">{t(`links.${it.id}`)}</span>
                                  </NavLink>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.section>
                      ))}
                    </div>
                    {group.promo?.visual === 'downloads' && (
                      <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-950 p-5 text-white">
                        <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
                        <div className="relative">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-200">{t('eyebrow')}</p>
                          <p className="mt-2 font-semibold">{t(`promos.${group.promo.id}.title`)}</p>
                          <p className="mt-1 text-sm text-white/75">{t(`promos.${group.promo.id}.text`)}</p>
                          <DownloadsPromo onNavigate={onClose} />
                        </div>
                      </div>
                    )}
                    {group.promo?.href && (
                      <div className="mt-8 rounded-2xl bg-[#f4f6fb] p-5">
                        <p className="font-semibold">{t(`promos.${group.promo.id}.title`)}</p>
                        <p className="mt-1 text-sm text-ink/60">{t(`promos.${group.promo.id}.text`)}</p>
                        <NavLink href={group.promo.href} onClick={onClose} className="mt-4 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white">
                          {t(`promos.${group.promo.id}.cta`)}
                        </NavLink>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
