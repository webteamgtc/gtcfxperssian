'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { MessagesSquare, Mail, Ticket, Headset } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';

/** A support agent avatar with chat bubbles popping up one after another. */
function ChatOrb({ bubbles }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x + 1) % (bubbles.length + 1)), 1800);
    return () => clearInterval(id);
  }, [bubbles.length]);
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {/* start side: visitor questions */}
      <div className="absolute start-[4%] top-[34%] flex w-56 flex-col items-start gap-2.5">
        <AnimatePresence>
          {bubbles.slice(0, n).map((b) => (
            <motion.span key={b} initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="rounded-2xl rounded-es-md border border-white/12 bg-white/[0.07] px-3.5 py-2 text-sm text-white/80 backdrop-blur">
              {b}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      {/* end side: agent typing */}
      <div className="absolute end-[5%] top-[42%] flex items-center gap-3">
        <span className="flex items-center gap-1 rounded-2xl rounded-ee-md bg-gold/90 px-4 py-3 shadow-lg shadow-gold/30">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="size-1.5 rounded-full bg-white" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }} />
          ))}
        </span>
        <span className="relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-900 ring-1 ring-white/20">
          <Headset className="size-6 text-gold-200" />
          <span className="absolute -bottom-0.5 end-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-ink" />
        </span>
      </div>
    </div>
  );
}

export function ContactHero() {
  const t = useTranslations('contactPage.hero');
  const tb = useTranslations('contactPage.breadcrumb');
  const quick = [
    { id: 'chat', href: '#channels', Icon: MessagesSquare },
    { id: 'email', href: '#channels', Icon: Mail },
    { id: 'ticket', href: '#ticket', Icon: Ticket, gold: true }
  ];
  return (
    <section className="is-dark relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <HeroBackdrop />
      <ChatOrb bubbles={t.raw('bubbles')} />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
            <span className="relative size-2 rounded-full bg-emerald-400">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />
            </span>
            {t('status')}
          </motion.span>
          <motion.h1 className="heading-page mt-6" initial={{ y: 18 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <AccentTitle text={t('title')} />
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg">{t('description')}</p>
          <motion.div className="mt-9 flex flex-wrap justify-center gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE }}>
            {quick.map(({ id, href, Icon, gold }) => (
              <a key={id} href={href} className={gold ? 'inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gold/30 transition-all hover:-translate-y-0.5 hover:bg-gold-600' : 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:text-brand-900'}>
                <Icon className="size-4" />
                {t(`quick.${id}`)}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
