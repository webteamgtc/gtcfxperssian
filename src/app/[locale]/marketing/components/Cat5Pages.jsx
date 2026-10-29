'use client';
/**
 * UAE CAT 5 website, inner pages: About Us, FAQs, Contact Us (GTC Financial Consultancy L.L.C., CMA Category 5).
 * Same header, footer and look as the Home page (MarketingPage.jsx). Copy: messages/<lang>/marketingPage.json
 * (about, faqPage, contactPage), compliance-approved: change only with their approval.
 */
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BadgeCheck, CircleCheck, Clock, Eye, Headset, Landmark, Lightbulb, Mail, MapPin, Phone, RefreshCw, Scale, ShieldCheck, Users } from 'lucide-react';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { SectionIntro, AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, HeroIn } from '@/components/motion';
import { CAT5_CONTACT } from '@/config/regions';
import { cn } from '@/lib/utils';
import { Cat5Frame, CtaButton, LICENCE_NO, NetworkBackdrop, TopTitle, withLinks } from './MarketingPage';
import { cat5Href } from './cat5Links';
import EnquiryForm from './EnquiryForm';

const mail = `mailto:${CAT5_CONTACT.email}`;
const tel = CAT5_CONTACT.phone ? `tel:${CAT5_CONTACT.phone.replace(/[^+\d]/g, '')}` : '';

/* ------------------------------------------------------------------ shared: inner page hero */

/** Dark hero with the moving network: label, H1, text and an optional button. */
function PageHero({ label, title, sub, text, cta }) {
  return (
    <section className="is-dark relative overflow-hidden bg-[#05081c] text-white">
      <NetworkBackdrop id="gtn-page" />
      <div className="container-x relative flex min-h-[420px] flex-col items-center justify-center py-20 text-center md:min-h-[480px]">
        {label && (
          <HeroIn>
            <TopTitle dark center>
              {label}
            </TopTitle>
          </HeroIn>
        )}
        <HeroIn as="h1" delay={0.05} className="heading-page mt-6 max-w-4xl text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <AccentTitle text={title} />
        </HeroIn>
        {sub && (
          <HeroIn as="p" delay={0.08} className="mt-4 text-lg font-semibold text-gold-200 md:text-xl">
            {sub}
          </HeroIn>
        )}
        {text && (
          <HeroIn as="p" delay={0.1} className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-white/80 drop-shadow md:text-lg">
            {text}
          </HeroIn>
        )}
        {cta && (
          <HeroIn delay={0.15} className="mt-9 flex justify-center">
            {cta}
          </HeroIn>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ About Us */

function AboutWho() {
  const t = useTranslations('marketingPage');
  return (
    <section className="bg-white py-16 text-ink">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Reveal y={16}>
          <h2 className="heading-section">
            <AccentTitle text={t('about.who.title')} />
          </h2>
          <p className="mt-6 text-pretty text-base leading-relaxed text-ink/65 md:text-lg">{t('about.who.text')}</p>
        </Reveal>
        <Reveal y={20} delay={0.1}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-[#05081c] p-8 text-center text-white shadow-2xl shadow-brand/25 md:p-12">
            <NetworkBackdrop id="gtn-who" shade={false} />
            <div className="relative mx-auto max-w-sm rounded-[1.75rem] bg-gradient-to-br from-gold-300 via-gold to-gold-700 p-[2px]">
              <div className="rounded-[calc(1.75rem-2px)] bg-[#0a1033]/95 px-6 py-9 backdrop-blur">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-600 text-white shadow-lg">
                  <Landmark className="size-8" aria-hidden />
                </span>
                <p className="mt-5 text-sm font-semibold text-gold-200">{t('hero.badge')}</p>
                <p className="mt-2 text-3xl font-black tracking-tight md:text-4xl" dir="ltr">
                  {LICENCE_NO}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const num = (i) => String(i + 1).padStart(2, '0');
const tile = (i) => (i % 2 ? 'bg-gradient-to-br from-gold to-gold-600 shadow-gold/30' : 'bg-gradient-to-br from-brand to-brand-800 shadow-brand/30');

/* ------------------------------------------------------------------ About: Our Values */

const VALUE_ICONS = { clarity: Lightbulb, integrity: Scale, transparency: Eye, client: Users, improve: RefreshCw };

/** Five tall pillars side by side; the one you point at (or tap) opens wide to show its text. Stacked on phones. */
function ValuesPillars({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <Reveal y={16} className="mt-12 flex flex-col gap-3 md:mt-14 lg:h-[400px] lg:flex-row">
      {items.map((v, i) => {
        const I = VALUE_ICONS[v.icon] ?? ShieldCheck;
        const on = open === i;
        return (
          <button
            key={v.title}
            type="button"
            aria-expanded={on}
            onClick={() => setOpen(i)}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            className={cn(
              'group relative flex flex-col justify-start overflow-hidden rounded-[1.75rem] p-7 text-start transition-all duration-500 ease-out lg:min-w-0',
              on ? 'is-dark bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white shadow-2xl shadow-brand/25 lg:flex-[3.2]' : 'bg-white text-ink ring-1 ring-brand/10 hover:ring-gold/30 lg:flex-1'
            )}
          >
            {on && <span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-3xl" aria-hidden />}
            <span className={cn('relative block text-5xl font-black leading-none transition-colors', on ? 'text-white/10' : 'text-brand/10')} aria-hidden>
              {num(i)}
            </span>
            <span className="relative mt-6 flex items-center gap-4 lg:absolute lg:inset-x-7 lg:bottom-7 lg:mt-0 lg:flex-col lg:items-start">
              <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl shadow-lg transition-colors', on ? 'bg-gradient-to-br from-gold to-gold-600 text-white' : 'bg-brand-50 text-brand')}>
                <I className="size-6" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className={cn('block text-lg font-bold leading-snug', !on && 'lg:[writing-mode:vertical-rl] lg:rotate-180 lg:text-base lg:rtl:rotate-0')}>{v.title}</span>
                <span className={cn('block overflow-hidden text-[15px] leading-relaxed transition-all duration-500', on ? 'mt-3 max-h-40 text-white/75 opacity-100' : 'max-h-0 opacity-0')}>{v.text}</span>
              </span>
            </span>
          </button>
        );
      })}
    </Reveal>
  );
}

function AboutValues() {
  const t = useTranslations('marketingPage.about.values');
  return (
    <section className="bg-[#f6f8fc] py-16 text-ink">
      <div className="container-x">
        <SectionIntro title={t('title')} />
        <ValuesPillars items={t.raw('items')} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ About: Why Choose */

/** Dark band: the seven points as glowing glass chips around the title, on the moving network. */
function WhyBand({ items }) {
  return (
    <Stagger as="ul" className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-3 md:mt-14" stagger={0.06}>
      {items.map((item, i) => (
        <StaggerItem
          as="li"
          key={item}
          className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] py-2.5 pe-6 ps-2.5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/10"
        >
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-white shadow-lg', tile(i))}>
            <CircleCheck className="size-4" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold text-white md:text-base">{item}</span>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function AboutWhy() {
  const t = useTranslations('marketingPage.about.why');
  return (
    <section className="is-dark relative overflow-hidden bg-[#05081c] py-16 text-white">
      <NetworkBackdrop id="gtn-whyband" />
      <div className="container-x relative">
        <SectionIntro title={t('title')} dark />
        <WhyBand items={t.raw('items')} />
      </div>
    </section>
  );
}

export function AboutPage() {
  const t = useTranslations('marketingPage.about');
  const locale = useLocale();
  return (
    <Cat5Frame page="about">
      <PageHero label={t('label')} title={t('title')} text={t('text')} cta={<CtaButton href={cat5Href(locale, 'home', '#services')}>{t('cta')}</CtaButton>} />
      <AboutWho />
      <AboutValues />
      <AboutWhy />
    </Cat5Frame>
  );
}

/* ------------------------------------------------------------------ FAQs */

export function FaqPage() {
  const t = useTranslations('marketingPage');
  const locale = useLocale();
  let n = 0;
  const groups = t.raw('faqPage.groups').map((g) => {
    const start = n;
    n += g.items.length;
    return { ...g, start, items: g.items.map((it) => ({ q: it.q, a: <>{withLinks(it.a)}</> })) };
  });
  const [tab, setTab] = useState('all');
  const shown = tab === 'all' ? groups : groups.filter((g) => g.key === tab);
  const tabs = [{ key: 'all', title: t('faqPage.all') }, ...groups.map((g) => ({ key: g.key, title: g.title }))];
  return (
    <Cat5Frame page="faq">
      <PageHero label={t('faqPage.label')} title={t('faqPage.title')} text={t('faqPage.text')} />
      <section className="bg-[#f6f8fc] py-16 text-ink">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_2.2fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div role="tablist" aria-label={t('faqPage.tabsLabel')} className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {tabs.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  role="tab"
                  id={`faq-tab-${g.key}`}
                  aria-selected={tab === g.key}
                  aria-controls="faq-panel"
                  onClick={() => setTab(g.key)}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-start text-sm font-semibold transition-all duration-300 lg:rounded-2xl lg:text-base',
                    tab === g.key ? 'bg-brand text-white shadow-lg shadow-brand/25' : 'bg-white text-ink/70 ring-1 ring-brand/10 hover:text-brand hover:ring-brand/30'
                  )}
                >
                  {g.title}
                </button>
              ))}
            </div>
            <div className="is-dark relative mt-8 hidden overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-7 text-white lg:block">
              <span className="absolute -end-12 -top-12 size-40 rounded-full bg-gold/25 blur-3xl" aria-hidden />
              <span className="relative grid size-12 place-items-center rounded-xl bg-gradient-to-br from-gold to-gold-600">
                <Headset className="size-6" aria-hidden />
              </span>
              <p className="heading-card relative mt-5">
                <AccentTitle text={t('support.title')} />
              </p>
              <div className="relative mt-6">
                <CtaButton light href={cat5Href(locale, 'contact', '#enquiry')}>
                  {t('support.cta')}
                </CtaButton>
              </div>
            </div>
          </div>
          <div id="faq-panel" role="tabpanel" aria-labelledby={`faq-tab-${tab}`} className="space-y-12">
            {shown.map((g) => (
              <div key={g.key}>
                {tab === 'all' && <h2 className="heading-title mb-5">{g.title}</h2>}
                <FaqAccordion key={`${tab}-${g.key}`} items={g.items} numbered start={g.start} defaultOpen={g === shown[0] ? 0 : -1} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </Cat5Frame>
  );
}

/* ------------------------------------------------------------------ Contact Us */

function ContactItem({ icon: I, label, children, href, ltr }) {
  const body = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-800 text-white shadow-lg shadow-brand/25 transition-colors group-hover:from-gold group-hover:to-gold-600">
        <I className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink/50">{label}</span>
        <span className="mt-1 block text-[15px] font-semibold leading-relaxed text-ink" dir={ltr ? 'ltr' : undefined}>
          {children}
        </span>
      </span>
    </>
  );
  const cls = 'group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand/10 transition-all hover:ring-gold/30';
  return href ? (
    <a href={href} className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function ContactPage() {
  const t = useTranslations('marketingPage');
  const map = `https://www.google.com/maps?q=${encodeURIComponent('Nassima Tower, Trade Centre First, Dubai')}&output=embed`;
  return (
    <Cat5Frame page="contact">
      <PageHero title={t('contactPage.title')} sub={t('contactPage.sub')} text={t('contactPage.text')} />
      <section id="enquiry" className="scroll-mt-32 bg-[#f6f8fc] py-16 text-ink">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
          <Reveal y={16} className="space-y-4">
            <ContactItem icon={MapPin} label={t('contactPage.labels.address')}>
              {t('contactPage.address')}
            </ContactItem>
            {tel && (
              <ContactItem icon={Phone} label={t('contactPage.labels.phone')} href={tel} ltr>
                {CAT5_CONTACT.phone}
              </ContactItem>
            )}
            <ContactItem icon={Mail} label={t('contactPage.labels.email')} href={mail}>
              {CAT5_CONTACT.email}
            </ContactItem>
            <ContactItem icon={Clock} label={t('contactPage.labels.hours')}>
              {t('support.hours')}
            </ContactItem>
            <ul className="space-y-3 px-1 pt-4">
              {t.raw('form.points').map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] text-ink/75">
                  <BadgeCheck className="size-5 shrink-0 text-gold-700" aria-hidden /> {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal y={20} delay={0.1}>
            <div className="rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-2 shadow-2xl shadow-brand/25">
              <EnquiryForm split />
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-[#f6f8fc] pb-16">
        <div className="container-x">
          <Reveal y={16}>
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-40px_rgba(13,21,58,0.45)] ring-1 ring-brand/10">
              <iframe title={t('contactPage.map')} src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block h-[360px] w-full border-0 md:h-[440px]" />
            </div>
          </Reveal>
        </div>
      </section>
    </Cat5Frame>
  );
}
