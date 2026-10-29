'use client';
/** Sticky side column: "Need help?" card with phone · email · website (CONTACT in src/config/events.js). */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Globe, Headset, Mail, Phone } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { CONTACT } from '@/config/events';

const CONTACTS = [
  { key: 'phone', Icon: Phone, value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
  { key: 'email', Icon: Mail, value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { key: 'website', Icon: Globe, value: 'www.gtcfx.com', href: 'https://www.gtcfx.com', external: true }
];

export default function LiveAccountApplicationSidebar() {
  const t = useTranslations('liveAccountApplicationPage.sidebar');
  return (
    <aside className="lg:sticky lg:top-28">
      <Reveal y={24} delay={0.1} className="is-dark relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-6 text-white shadow-2xl shadow-brand/20">
        <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
        <motion.span className="absolute -end-12 -top-12 size-40 rounded-full bg-gold/25 blur-3xl" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
        <span className="relative grid size-12 place-items-center rounded-2xl bg-gold text-white shadow-lg shadow-gold/30">
          <Headset className="size-5" />
        </span>
        <h2 className="relative mt-4 text-lg font-bold">{t('needHelp')}</h2>
        <p className="relative mt-1.5 text-sm leading-relaxed text-white/65">{t('needHelpText')}</p>
        <ul className="relative mt-5 space-y-2">
          {CONTACTS.map(({ key, Icon, value, href, external }) => (
            <li key={key}>
              <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-200 transition-transform duration-300 group-hover:-rotate-6">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">{t(`labels.${key}`)}</span>
                  <span dir="ltr" className="block truncate text-sm font-semibold rtl:text-end">
                    {value}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </aside>
  );
}
