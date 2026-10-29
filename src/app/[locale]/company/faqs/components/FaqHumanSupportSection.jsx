'use client';
/**
 * "Still need help? Connect with our team" — navy panel (title, copy, animated chat window) beside the three
 * support channels; a navy highlight slides to the hovered / focused channel.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowUpRight, Headset, Mail, MessagesSquare, Phone } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';
import { CONTACT } from '@/config/events';
import { cn } from '@/lib/utils';

const CHANNELS = [
  { key: 'liveChat', Icon: MessagesSquare, href: '/company/contact-us' },
  { key: 'email', Icon: Mail, href: `mailto:${CONTACT.email}` },
  { key: 'phone', Icon: Phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` }
];

/** Decorative chat window: bubbles arrive in turn, then the agent "types". No text — shapes only. */
function ChatVisual() {
  const bubbles = [
    { side: 'in', w: 'w-[70%]', d: 0.3 },
    { side: 'out', w: 'w-[52%]', d: 0.9 },
    { side: 'in', w: 'w-[62%]', d: 1.5 }
  ];
  return (
    <div className="relative mt-10 overflow-hidden rounded-[1.5rem] bg-white/[0.06] ring-1 ring-white/10 backdrop-blur" aria-hidden>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="relative grid size-9 place-items-center rounded-full bg-gold text-white">
          <Headset className="size-4" />
          <span className="absolute -bottom-0.5 -end-0.5 size-3 rounded-full bg-up ring-2 ring-brand-900" />
        </span>
        <span className="space-y-1.5">
          <span className="block h-2 w-24 rounded-full bg-white/40" />
          <span className="block h-1.5 w-14 rounded-full bg-up/60" />
        </span>
      </div>
      <div className="space-y-3 p-4">
        {bubbles.map((b, i) => (
          <motion.div key={i} className={cn('flex', b.side === 'out' ? 'justify-end' : 'justify-start')} initial={{ opacity: 0, y: 10, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: b.d, duration: 0.5, ease: EASE }}>
            <div className={cn('space-y-1.5 rounded-2xl px-4 py-3', b.w, b.side === 'out' ? 'rounded-br-md bg-gold/90' : 'rounded-bl-md bg-white/10')}>
              <span className={cn('block h-1.5 rounded-full', b.side === 'out' ? 'bg-white/70' : 'bg-white/35')} />
              <span className={cn('block h-1.5 w-2/3 rounded-full', b.side === 'out' ? 'bg-white/50' : 'bg-white/25')} />
            </div>
          </motion.div>
        ))}
        <motion.div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-white/10 px-4 py-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.1 }}>
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="size-1.5 rounded-full bg-white/70" animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ChannelRow({ ch, on, onFocus }) {
  const t = useTranslations(`faqsPage.humanSupport.cards.${ch.key}`);
  const cls = 'group relative block rounded-[1.75rem] bg-white p-5 outline-none ring-1 ring-brand/10 transition-shadow duration-500 hover:shadow-xl hover:shadow-brand/10 focus-visible:ring-2 focus-visible:ring-gold md:p-7';
  const inner = (
    <>
      {on && (
        <motion.span layoutId="support-active" className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink shadow-2xl shadow-brand/25" transition={{ type: 'spring', stiffness: 380, damping: 34 }} aria-hidden>
          <span className="bg-grid-dark absolute inset-0 opacity-50" />
          <span className="absolute -end-12 -top-12 size-40 rounded-full bg-gold/25 blur-3xl" />
        </motion.span>
      )}
      <span className="relative flex items-start gap-4 md:gap-5">
        <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl transition-all duration-500', on ? '-rotate-6 bg-gold text-white shadow-lg shadow-gold/30' : 'bg-gradient-to-br from-brand-500 to-brand-900 text-white shadow-lg shadow-brand/20')}>
          <ch.Icon className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={cn('text-lg font-bold transition-colors md:text-xl', on ? 'text-white' : 'text-ink')}>{t('title')}</span>
            <span className={cn('inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors', on ? 'bg-white/10 text-white ring-1 ring-white/15' : 'bg-brand-50 text-brand')}>
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-up" />
              </span>
              <span dir="auto">{t('meta')}</span>
            </span>
          </span>
          <span className={cn('mt-2 block text-[15px] leading-relaxed transition-colors', on ? 'text-white/65' : 'text-ink/60')}>{t('description')}</span>
        </span>
        <span className={cn('grid size-11 shrink-0 place-items-center self-center rounded-full transition-all duration-500', on ? 'bg-white text-brand-900' : 'bg-white text-brand ring-1 ring-brand/15')}>
          <ArrowUpRight className={cn('size-5 transition-transform duration-500 rtl:-scale-x-100', on && 'rotate-45')} />
        </span>
      </span>
    </>
  );
  const events = { onMouseEnter: onFocus, onFocus };
  return ch.href.startsWith('/') ? (
    <NavLink href={ch.href} className={cls} {...events}>
      {inner}
    </NavLink>
  ) : (
    <a href={ch.href} className={cls} {...events}>
      {inner}
    </a>
  );
}

export default function FaqHumanSupportSection() {
  const t = useTranslations('faqsPage.humanSupport');
  const [active, setActive] = useState(0);
  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-20 size-[420px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[400px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-12">
        <Reveal y={24}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-7 text-white shadow-2xl shadow-brand/25 md:p-10">
            <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
            <motion.span className="absolute -end-20 -top-20 size-72 rounded-full bg-gold/25 blur-[90px]" animate={{ opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <div className="relative">
              <h2 className="heading-section">
                <AccentTitle text={t('title')} accentClassName="text-gradient-gold" />
              </h2>
              <p className="mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-white/65 md:text-base">{t('description')}</p>
              <ChatVisual />
            </div>
          </div>
        </Reveal>

        <Reveal y={24} delay={0.1}>
          <ul className="space-y-4" onMouseLeave={() => setActive(0)}>
            {CHANNELS.map((ch, i) => (
              <li key={ch.key}>
                <ChannelRow ch={ch} on={active === i} onFocus={() => setActive(i)} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
