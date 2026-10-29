'use client';
/**
 * Closing navy band of the GTC News pages — swap-free activation: title, the two info points and "Contact Support Now"
 * beside a live-chat window (the answers as chat bubbles; the header opens live chat, the message box e-mails support).
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, CircleHelp, Hand, Mail, MessagesSquare, Send } from 'lucide-react';
import BandLine from '@/components/shared/BandLine';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, EASE } from '@/components/motion';
import { CONTACT } from '@/config/events';
import { cn } from '@/lib/utils';

const INFO = [
  { key: 'hand', Icon: Hand },
  { key: 'question', Icon: CircleHelp }
];
const CHANNELS = [
  { Icon: MessagesSquare, href: '/company/contact-us', live: true },
  { Icon: Mail, href: `mailto:${CONTACT.email}` }
];

function ChannelLink({ i, className, children }) {
  const { href } = CHANNELS[i] ?? CHANNELS[0];
  const Link = href.startsWith('/') ? NavLink : 'a';
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function LiveDot({ ring = 'ring-brand-900', className }) {
  return (
    <span className={cn('absolute -end-1 -top-1 flex size-4', className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-70" />
      <span className={cn('relative inline-flex size-4 rounded-full bg-up ring-2', ring)} />
    </span>
  );
}

function CtaButton({ label, className }) {
  return (
    <NavLink
      href="/company/contact-us"
      className={cn('shine group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gold px-8 text-base font-bold text-white shadow-xl shadow-gold/30 transition-colors hover:bg-gold-600', className)}
    >
      {label}
      <span className="grid size-9 place-items-center rounded-full bg-white text-gold-700 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
        <ArrowRight className="size-4 rtl:-scale-x-100" />
      </span>
    </NavLink>
  );
}

function Heading({ t, className }) {
  return (
    <h2 className={cn('heading-section text-balance', className)}>
      <AccentTitle text={t('title')} />
    </h2>
  );
}

function Bubble({ me, children, delay }) {
  return (
    <motion.div
      className={cn('flex', me ? 'justify-end' : 'justify-start')}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      <p className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed', me ? 'rounded-ee-md bg-brand text-white' : 'rounded-es-md bg-[#f1f3fa] text-ink/80')}>{children}</p>
    </motion.div>
  );
}

function ChatWindow({ t, channels }) {
  const [chat, mail] = channels;
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <div className="text-center lg:text-start">
        <Reveal y={16}>
          <Heading t={t} />
        </Reveal>
        <Stagger className="mt-8 space-y-5 text-start" stagger={0.1}>
          {INFO.map(({ key, Icon }) => (
            <StaggerItem key={key} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-200 ring-1 ring-gold/30">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="heading-small block">{t(`infoColumns.${key}.title`)}</span>
                <span className="mt-1 block text-sm leading-relaxed text-white/60">{t(`infoColumns.${key}.text`)}</span>
              </span>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal y={12} delay={0.2} className="mt-10">
          <CtaButton label={t('cta')} className="w-full sm:w-auto" />
        </Reveal>
      </div>

      <Reveal y={30} className="relative">
        <span className="absolute -inset-6 rounded-[3rem] bg-gold/20 blur-3xl" aria-hidden />
        <div className="relative overflow-hidden rounded-[2rem] bg-white text-ink shadow-[0_50px_100px_-40px_rgba(0,0,0,0.7)]">
          {/* header = live chat channel */}
          <ChannelLink i={0} className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-900 px-5 py-4 text-white transition-opacity hover:opacity-95">
            <span className="relative grid size-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
              <MessagesSquare className="size-5" />
              <LiveDot ring="ring-brand-700" className="size-3 [&>span]:size-3" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{chat?.title}</span>
              <span className="block text-xs text-white/70">{chat?.subtitle}</span>
            </span>
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </ChannelLink>
          <div className="space-y-3 p-5" aria-hidden>
            <Bubble me delay={0.2}>
              {t('infoColumns.question.title')}
            </Bubble>
            <Bubble delay={0.6}>{t('infoColumns.question.text')}</Bubble>
            <Bubble delay={1}>{t('infoColumns.hand.text')}</Bubble>
            <motion.div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-es-md bg-[#f1f3fa] py-3.5" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.4 }}>
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="size-1.5 rounded-full bg-ink/40" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
              ))}
            </motion.div>
          </div>
          {/* footer = e-mail channel, styled as the message box */}
          <ChannelLink i={1} className="group m-3 mt-0 flex items-center gap-3 rounded-2xl bg-[#f6f7fb] p-2 ps-4 ring-1 ring-brand/10 transition-colors hover:ring-brand/30">
            <Mail className="size-5 text-brand" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-ink/50">{mail?.title}</span>
              <span dir="auto" className="block truncate text-sm font-semibold text-ink">
                {mail?.subtitle}
              </span>
            </span>
            <span className="grid size-11 place-items-center rounded-xl bg-gold text-white transition-transform group-hover:-rotate-12">
              <Send className="size-4 rtl:-scale-x-100" aria-hidden />
            </span>
          </ChannelLink>
        </div>
      </Reveal>
    </div>
  );
}

export default function ActivationBand() {
  const t = useTranslations('gtcNewsPage.activation');
  const channels = t.raw('channels');
  return (
    <section className="is-dark relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 py-16 text-white md:py-20">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-60" aria-hidden />
      <motion.span className="absolute -end-24 -top-24 size-96 rounded-full bg-gold/20 blur-[110px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <motion.span className="absolute -bottom-32 -start-24 size-96 rounded-full bg-brand-400/20 blur-[110px]" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 7, repeat: Infinity }} aria-hidden />
      <BandLine />
      <div className="container-x relative">
        <ChatWindow t={t} channels={channels} />
      </div>
    </section>
  );
}
