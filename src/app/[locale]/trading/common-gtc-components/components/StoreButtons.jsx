'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { GO_LINKS } from './links';

const STORE_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' };

function PlayGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4.2 2.4 13.6 12l-9.4 9.6a1.3 1.3 0 0 1-.7-1.2V3.6c0-.5.3-1 .7-1.2Zm10.6 10.8 2.4 2.4-11 6.3 8.6-8.7Zm3.9-4.1 2.6 1.5c.9.5.9 1.8 0 2.3l-2.6 1.5-2.7-2.7 2.7-2.6ZM6.2 2.1l11 6.3-2.4 2.4-8.6-8.7Z" />
    </svg>
  );
}

function AppleGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.4-1-2.4-4.1ZM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4Z" />
    </svg>
  );
}

export { AppleGlyph, PlayGlyph };

/**
 * App Store + Google Play buttons.
 * tone: 'navy' (navy App Store, on dark heroes) | 'white' (white App Store, on navy bands).
 * compact: plain text links separated by a divider (used inside cards).
 */
export default function StoreButtons({ tone = 'navy', compact = false, className, delay = 0 }) {
  const t = useTranslations('gtcGoApp.store');

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 text-[15px] font-semibold text-white', className)}>
        <a href={GO_LINKS.ios} {...STORE_LINK_PROPS} className="group inline-flex items-center gap-2 transition-colors hover:text-gold-200">
          <AppleGlyph className="size-4 transition-transform group-hover:-translate-y-0.5" />
          {t('appStore')}
        </a>
        <span className="h-4 w-px bg-white/30" aria-hidden />
        <a href={GO_LINKS.android} {...STORE_LINK_PROPS} className="group inline-flex items-center gap-2 transition-colors hover:text-gold-200">
          <PlayGlyph className="size-4 transition-transform group-hover:-translate-y-0.5" />
          {t('googlePlay')}
        </a>
      </div>
    );
  }

  const items = [
    { href: GO_LINKS.ios, Icon: AppleGlyph, small: t('onAppStore'), big: t('appStore'), cls: tone === 'white' ? 'bg-white text-brand-900 hover:bg-brand-50' : 'bg-brand-900 text-white ring-1 ring-white/10 hover:bg-brand-800' },
    { href: GO_LINKS.android, Icon: PlayGlyph, small: t('onPlay'), big: t('googlePlay'), cls: 'bg-gold text-white shadow-lg shadow-gold/25 hover:bg-gold-600', shine: true }
  ];

  return (
    <motion.div className={cn('flex flex-wrap gap-3', className)} initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: delay } } }}>
      {items.map(({ href, Icon, small, big, cls, shine }) => (
        <motion.a
          key={big}
          href={href}
          {...STORE_LINK_PROPS}
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ y: -3 }}
          className={cn('group relative inline-flex h-16 min-w-[200px] items-center gap-3.5 overflow-hidden rounded-2xl px-6 transition-colors', cls)}
        >
          {shine && <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ left: ['-50%', '150%'] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4 }} aria-hidden />}
          <Icon className="relative size-7 shrink-0" />
          <span className="relative text-start leading-tight">
            <span className="block text-xs opacity-80">{small}</span>
            <span className="block text-lg font-semibold">{big}</span>
          </span>
        </motion.a>
      ))}
    </motion.div>
  );
}
