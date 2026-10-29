'use client';
/**
 * UAE CAT 5 page — GTC Financial Consultancy L.L.C, licensed by the UAE CMA under Category 5:
 * financial consultations, introduction to licensed providers and promotion (only where the licence permits).
 * Not a marketing agency; no trading terms anywhere on the page. Standalone: no site menu or footer links.
 *
 * Layout follows the CMA Category 5 peer site atfxmena.com: white sticky header (logo + licence number,
 * section links, CAT 5 and language switches) → hero banner (dark) → what we do (white) → how it works (grey) →
 * why choose (white) → our approach (grey) → what we do (white) → how it works (grey) → your relationship with us (dark) →
 * financial glossary (white) → client support banner → FAQ (grey) → contact block with the enquiry form → closing banner →
 * legal footer. Copy: messages/<lang>/marketingPage.json (final, approved by compliance — change only with their approval).
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import {
  Briefcase,
  ArrowRight,
  BadgeCheck,
  Ban,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CircleCheck,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Headset,
  Info,
  Landmark,
  Languages,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquareText,
  Phone,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import Logo from '@/components/shared/Logo';
import NavLink from '@/components/shared/nav/NavLink';
import FaqAccordion from '@/components/shared/FaqAccordion';
import { SectionIntro, AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, HeroIn, EASE } from '@/components/motion';
import { CAT5_CMA_URL, CAT5_CONTACT, CAT5_LEGAL_LINKS } from '@/config/regions';
import { cat5Href } from './cat5Links';
import EnquiryForm from './EnquiryForm';
import { cn } from '@/lib/utils';

/** Icon names used in marketingPage.json → components. */
export const ICONS = {
  consult: MessageSquareText,
  introduce: Handshake,
  promote: Megaphone,
  education: GraduationCap,
  event: CalendarDays,
  shield: ShieldCheck,
  globe: Globe,
  report: FileCheck
};
const Icon = ({ name, className }) => {
  const I = ICONS[name] ?? ShieldCheck;
  return <I className={className} aria-hidden />;
};
const STEP_ICONS = [MessageCircle, BookOpen, Handshake, Headset];
export const LICENCE_NO = '20200000211';
const mail = `mailto:${CAT5_CONTACT.email}`;
const tel = CAT5_CONTACT.phone ? `tel:${CAT5_CONTACT.phone.replace(/[^+\d]/g, '')}` : '';

export function CtaButton({ children, className, light = false, href = '#enquiry' }) {
  return (
    <a
      href={href}
      className={cn(
        'group inline-flex h-13 items-center gap-3 rounded-full ps-7 pe-2 text-base font-semibold shadow-lg transition-colors',
        light ? 'bg-white text-brand-900 shadow-black/20 hover:bg-gold hover:text-white' : 'bg-gold text-white shadow-gold/30 hover:bg-gold-600',
        className
      )}
    >
      {children}
      <span className={cn('grid size-9 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100', light ? 'bg-brand text-white' : 'bg-white text-gold-700')}>
        <ArrowRight className="size-4" />
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ header */

/** English / Farsi switch for the CAT 5 page. */
function LanguageSwitch() {
  const t = useTranslations('marketingPage.version');
  const locale = useLocale();
  const langs = [
    { code: 'en-ae', label: 'EN', lang: 'en' },
    { code: 'fa', label: 'فارسی', lang: 'fa' }
  ];
  const page = useCat5Page();
  const hrefs = { 'en-ae': cat5Href('en-ae', page), fa: cat5Href('fa', page) };
  return (
    <nav aria-label={t('language')} className="flex h-9 items-center rounded-full bg-[#eef1f8] p-0.5" dir="ltr">
      {langs.map((l) => {
        const on = locale === l.code;
        return (
          <a
            key={l.code}
            href={hrefs[l.code]}
            lang={l.lang}
            hrefLang={l.lang}
            aria-current={on ? 'true' : undefined}
            className={cn('grid h-full min-w-10 place-items-center rounded-full px-3 text-xs font-semibold transition-colors sm:text-sm', on ? 'bg-brand text-white shadow' : 'text-ink/60 hover:text-brand')}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}

/** The CAT 5 page being shown ('home' | 'about' | 'faq' | 'contact'), set by Cat5Frame. */
const Cat5PageCtx = createContext('home');
export const useCat5Page = () => useContext(Cat5PageCtx);

/** Where "talk to us" buttons go: the form on this page (Home, Contact Us) or the Contact Us page. */
export function useEnquiryHref() {
  const page = useCat5Page();
  const locale = useLocale();
  return page === 'home' || page === 'contact' ? '#enquiry' : cat5Href(locale, 'contact', '#enquiry');
}

/** Page links in the header. */
function usePageLinks() {
  const t = useTranslations('marketingPage.nav');
  const locale = useLocale();
  return ['home', 'about', 'faq', 'contact'].map((key) => ({ key, href: cat5Href(locale, key), label: t(key) }));
}

function Header() {
  const t = useTranslations('marketingPage');
  const links = usePageLinks();
  const page = useCat5Page();
  const enquiry = useEnquiryHref();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <>
      {/* licence notice (scrolls away; only the bar below stays on screen) */}
      <div className="bg-brand-950 text-[11px] text-white/75 md:text-xs">
        <p className="container-x flex items-start gap-2 py-2 sm:items-center">
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-gold-200 sm:mt-0" aria-hidden />
          {t('notice')}
        </p>
      </div>
      <header className={cn('sticky top-0 z-30 border-b bg-white/95 backdrop-blur transition-shadow', scrolled ? 'border-brand/10 shadow-[0_10px_30px_-18px_rgba(13,21,58,0.35)]' : 'border-transparent')}>
        <div className="container-x flex h-[72px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
          </div>
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t('version.menu')}>
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                aria-current={page === l.key ? 'page' : undefined}
                className={cn('whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors', page === l.key ? 'bg-brand-50 text-brand' : 'text-ink/70 hover:bg-brand-50 hover:text-brand')}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <a href={enquiry} className="hidden h-9 items-center whitespace-nowrap rounded-full bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 md:inline-flex">
              {t('cta')}
            </a>
            <LanguageSwitch />
            <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={t('version.menu')} className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef1f8] text-brand lg:hidden">
              {menu ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.nav initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden border-t border-brand/10 bg-white lg:hidden">
              <div className="container-x grid gap-1 py-3">
                {links.map((l) => (
                  <a
                    key={l.key}
                    href={l.href}
                    onClick={() => setMenu(false)}
                    aria-current={page === l.key ? 'page' : undefined}
                    className={cn('rounded-xl px-3 py-3 text-[15px] font-semibold active:bg-brand-50', page === l.key ? 'bg-brand-50 text-brand' : 'text-ink/80')}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

/* ------------------------------------------------------------------ hero banner */

/**
 * Connected network behind the hero: points of light joined by thin lines drift gently while light pulses run
 * along the lines; a gold hub (GTC Financial Consultancy) sends pulses to the points around it, i.e. introducing
 * clients to licensed providers. SVG + CSS only (no image, script or blur filter cost); frozen for visitors who
 * turn off animations.
 */
const VW = 1600;
const VH = 800;
const GX = VW / 2;
const GY = VH / 2 + 10;
const seeded = (seed) => {
  let n = seed;
  return () => ((n = (n * 16807) % 2147483647) - 1) / 2147483646;
};
const r1 = (v) => Math.round(v * 10) / 10;
const makeNet = (seed, count, minR, maxR) => {
  const rnd = seeded(seed);
  const nodes = Array.from({ length: count }, () => ({ x: Math.round(rnd() * VW), y: Math.round(rnd() * VH), r: r1(minR + rnd() * (maxR - minR)), d: r1(rnd() * 4) }));
  const edges = [];
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, dist: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((o) => o.j > i)
      .sort((p, q) => p.dist - q.dist)
      .slice(0, 2)
      .forEach((o) => edges.push([i, o.j]));
  });
  return { nodes, edges };
};
const NET_BACK = makeNet(5, 34, 1.2, 2.4);
const NET_FRONT = makeNet(23, 18, 2.6, 4.2);
const HUB = { x: GX + 470, y: GY + 210 };
const HUB_LINKS = NET_FRONT.nodes
  .map((n, i) => ({ i, dist: Math.hypot(n.x - HUB.x, n.y - HUB.y) }))
  .sort((p, q) => p.dist - q.dist)
  .slice(0, 6)
  .map((o) => NET_FRONT.nodes[o.i]);

function NetLayer({ net, color, lineOpacity, pulse, cls }) {
  return (
    <g className={cls}>
      {net.edges.map(([a, b], i) => {
        const A = net.nodes[a];
        const B = net.nodes[b];
        return (
          <g key={i}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={color} strokeOpacity={lineOpacity} strokeWidth={1} />
            {pulse && i % 3 === 0 && (
              <line
                className="gtn-pulse"
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                pathLength={100}
                stroke="#fff"
                strokeOpacity="0.9"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="4 96"
                style={{ animationDelay: `${-(i % 7) * 0.6}s` }}
              />
            )}
          </g>
        );
      })}
      {net.nodes.map((n, i) => (
        <circle key={i} className="gtn-node" cx={n.x} cy={n.y} r={n.r} fill={i % 4 ? color : '#f0d2ad'} style={{ animationDelay: `${-n.d}s` }} />
      ))}
    </g>
  );
}

/** Network backdrop; `id` keeps the SVG gradient ids unique when it is used in more than one section. */
export function NetworkBackdrop({ id = 'gtn', shade = true }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes gtn-drift-a { from { transform: translate(-24px, -10px) } to { transform: translate(24px, 12px) } }
        @keyframes gtn-drift-b { from { transform: translate(30px, 14px) } to { transform: translate(-30px, -12px) } }
        @keyframes gtn-pulse { from { stroke-dashoffset: 100 } to { stroke-dashoffset: 0 } }
        @keyframes gtn-twinkle { 0%, 100% { opacity: .45 } 50% { opacity: 1 } }
        @keyframes gtn-ping { from { transform: scale(.4); opacity: .9 } to { transform: scale(3.4); opacity: 0 } }
        .gtn-back { animation: gtn-drift-a 22s ease-in-out infinite alternate; }
        .gtn-front { animation: gtn-drift-b 16s ease-in-out infinite alternate; }
        .gtn-pulse { animation: gtn-pulse 3.6s linear infinite; }
        .gtn-node { animation: gtn-twinkle 4s ease-in-out infinite; }
        .gtn-ping { transform-box: fill-box; transform-origin: center; animation: gtn-ping 2.8s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .gtn-back, .gtn-front, .gtn-pulse, .gtn-node, .gtn-ping { animation: none } .gtn-pulse { opacity: 0 } }
      `}</style>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`${id}-wash`} x1="0" x2="1">
            <stop offset="0" stopColor="#1d4fe0" stopOpacity="0.5" />
            <stop offset="0.4" stopColor="#0a1240" stopOpacity="0" />
            <stop offset="0.6" stopColor="#3a1606" stopOpacity="0" />
            <stop offset="1" stopColor="#c86a22" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <rect width={VW} height={VH} fill={`url(#${id}-wash)`} />
        <NetLayer net={NET_BACK} color="#6f93ff" lineOpacity={0.18} cls="gtn-back" />
        <NetLayer net={NET_FRONT} color="#8fb0ff" lineOpacity={0.32} pulse cls="gtn-front" />
        {/* the gold hub: GTC Financial Consultancy introducing clients onwards */}
        <g className="gtn-front">
          {HUB_LINKS.map((n, i) => (
            <g key={i}>
              <line x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} stroke="#d9a86c" strokeOpacity="0.5" strokeWidth={1.4} />
              <line className="gtn-pulse" x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} pathLength={100} stroke="#f0d2ad" strokeWidth={3} strokeLinecap="round" strokeDasharray="5 95" style={{ animationDelay: `${-i * 0.6}s` }} />
            </g>
          ))}
          <circle className="gtn-ping" cx={HUB.x} cy={HUB.y} r={10} fill="none" stroke="#d9a86c" strokeWidth={2} />
          <circle className="gtn-ping" cx={HUB.x} cy={HUB.y} r={10} fill="none" stroke="#d9a86c" strokeWidth={2} style={{ animationDelay: '-1.4s' }} />
          <circle cx={HUB.x} cy={HUB.y} r={14} fill="#b68756" fillOpacity="0.3" />
          <circle cx={HUB.x} cy={HUB.y} r={6} fill="#f0d2ad" />
        </g>
      </svg>
      {/* keeps the text readable over the network */}
      {shade && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_center,rgba(4,6,26,0.55),transparent_75%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(4,6,26,0.6)_100%)]" />
        </>
      )}
    </div>
  );
}

function Hero() {
  const locale = useLocale();
  const t = useTranslations('marketingPage.hero');
  return (
    <section className="is-dark relative overflow-hidden bg-[#05081c] text-white">
      <NetworkBackdrop />
      <div className="container-x relative flex min-h-[560px] flex-col items-center justify-center py-20 text-center md:min-h-[640px]">
        <HeroIn as="p" className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/30 px-4 py-1.5 text-xs font-semibold text-gold-200 backdrop-blur">
          <ShieldCheck className="size-3.5" aria-hidden /> {t('badge')}
        </HeroIn>
        <HeroIn
          as="h1"
          delay={0.05}
          className={cn(
            'heading-display mt-6 max-w-4xl text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]',
            locale === 'fa' && '!leading-[1.55] md:!leading-[1.5] lg:!leading-[1.45]'
          )}
        >
          <AccentTitle text={t('title')} />
        </HeroIn>
        <HeroIn as="p" delay={0.1} className="mt-6 max-w-3xl text-pretty text-base leading-relaxed text-white/80 drop-shadow md:text-lg">
          {t('text')}
        </HeroIn>
        <HeroIn delay={0.15} className="mt-10 flex flex-wrap justify-center gap-3">
          <CtaButton>{t('primary')}</CtaButton>
          <a href="#services" className="inline-flex h-13 items-center rounded-full border border-white/30 bg-black/20 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
            {t('secondary')}
          </a>
        </HeroIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section top titles */

/** Small top title above a section heading ("Our Approach", "What We Do"…). */
export function TopTitle({ children, dark = false, center = false, className }) {
  return (
    <p className={cn('flex', center && 'justify-center', className)}>
      <span className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold', dark ? 'border-gold/40 bg-white/5 text-gold-200' : 'border-gold/30 bg-gold/[0.06] text-gold-700')}>
        <span className="size-1.5 rounded-full bg-gold" aria-hidden />
        {children}
      </span>
    </p>
  );
}

/** Centred section intro with its top title. */
export function Intro({ top, title, description, dark = false }) {
  return (
    <>
      <Reveal y={10}>
        <TopTitle dark={dark} center>
          {top}
        </TopTitle>
      </Reveal>
      <SectionIntro title={title} description={description} dark={dark} className="mt-5" />
    </>
  );
}

const num = (i) => String(i + 1).padStart(2, '0');

/* ------------------------------------------------------------------ section 2: what we do (white) */

const cardShadow = 'shadow-[0_20px_50px_-35px_rgba(13,21,58,0.4)]';
const iconTile = (i) => (i % 2 ? 'bg-gradient-to-br from-gold to-gold-600 shadow-gold/30' : 'bg-gradient-to-br from-brand to-brand-800 shadow-brand/30');

/** One full-width row per service: number · icon, title + tagline · description. */
function ServicesList({ items }) {
  return (
    <div className="mt-12 border-t border-brand/10 md:mt-14">
      {items.map((s, i) => (
        <Reveal key={s.title} y={14} delay={i * 0.06}>
          <article className="group relative grid gap-4 border-b border-brand/10 px-2 py-8 transition-colors duration-300 hover:bg-[#f6f8fc] md:grid-cols-[6rem_1fr_1.25fr] md:items-center md:gap-10 md:px-8 md:py-10">
            <span className="absolute inset-y-0 start-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-gold to-brand transition-transform duration-500 group-hover:scale-y-100" aria-hidden />
            <span className="text-5xl font-black tracking-tight text-brand/15 transition-colors duration-300 group-hover:text-gold md:text-6xl" aria-hidden>
              {num(i)}
            </span>
            <div className="flex items-center gap-4">
              <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-lg', iconTile(i))}>
                <Icon name={s.icon} className="size-5" />
              </span>
              <div>
                <h3 className="heading-card">{s.title}</h3>
                <p className="mt-1 text-sm font-semibold text-gold-700">{s.tagline}</p>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-ink/60">{s.text}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

function Services() {
  const t = useTranslations('marketingPage.services');
  const tm = useTranslations('marketingPage');
  return (
    <section id="services" className="scroll-mt-32 bg-white py-16 text-ink">
      <div className="container-x">
        <Intro top={t('top')} title={t('title')} description={t('text')} />
        <ServicesList items={t.raw('items')} />
        <Reveal y={12} className="mt-12 flex justify-center">
          <CtaButton>{tm('cta')}</CtaButton>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section 3: how it works (grey) */

/** Horizontal timeline (stacked on phones); the line fills in as it scrolls into view. */
function StepsTimeline({ steps }) {
  return (
    <div className="relative mt-14">
      <div className="absolute inset-x-[12.5%] top-8 hidden h-0.5 bg-brand/10 lg:block" aria-hidden>
        <motion.span
          className="block h-full origin-left bg-gradient-to-r from-brand via-gold to-brand rtl:origin-right"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </div>
      <Stagger as="ol" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" stagger={0.12}>
        {steps.map((s, i) => {
          const I = STEP_ICONS[i] ?? Check;
          return (
            <StaggerItem as="li" key={s.title} className="group relative text-center">
              <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-white text-brand shadow-[0_16px_40px_-16px_rgba(13,21,58,0.45)] ring-8 ring-[#f6f8fc] transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                <I className="size-6" aria-hidden />
                <span className="absolute -end-1 -top-1 grid size-6 place-items-center rounded-full bg-gold text-[11px] font-bold text-white">{i + 1}</span>
              </span>
              <div className={cn('mt-6 rounded-[1.5rem] bg-white p-6 ring-1 ring-brand/10 transition-all duration-300 group-hover:-translate-y-1', cardShadow)}>
                <h3 className="heading-card">{s.title}</h3>
                <p className="mt-1 text-sm font-semibold text-gold-700">{s.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{s.text}</p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}

function HowItWorks() {
  const t = useTranslations('marketingPage.process');
  return (
    <section id="how-it-works" className="scroll-mt-32 bg-[#f6f8fc] py-16 text-ink">
      <div className="container-x">
        <Intro top={t('top')} title={t('title')} description={t('text')} />
        <StepsTimeline steps={t.raw('steps')} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section 2: why choose (white) */

const WHY_ICONS = [ShieldCheck, Handshake, Building2, Eye, GraduationCap, MessageSquareText];

/** C: hub: three points either side of a central GTC badge, joined to it by lines (a list on phones). */
function WhyHub({ tiles }) {
  const sides = [tiles.slice(0, 3), tiles.slice(3)];
  const Item = ({ title, i, end }) => {
    const I = WHY_ICONS[i] ?? ShieldCheck;
    return (
      <li
        className={cn(
          'group relative flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-brand/10 transition-all duration-300 hover:ring-gold/40 hover:shadow-[0_24px_50px_-30px_rgba(41,59,147,0.5)] lg:p-5',
          end && 'lg:flex-row-reverse lg:text-end'
        )}
      >
        <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-md', iconTile(i))}>
          <I className="size-5" aria-hidden />
        </span>
        <span className="text-[15px] font-bold leading-snug text-ink md:text-base">{title}</span>
        {/* connector to the centre badge (desktop) */}
        <span className={cn('absolute top-1/2 hidden h-px w-10 bg-gradient-to-r from-brand/30 to-gold/60 lg:block', end ? '-start-10 rtl:bg-gradient-to-l' : '-end-10 bg-gradient-to-l rtl:bg-gradient-to-r')} aria-hidden />
      </li>
    );
  };
  return (
    <div className="mt-12 grid items-center gap-6 md:mt-14 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
      <Stagger as="ul" className="space-y-4" stagger={0.08}>
        {sides[0].map((title, i) => (
          <StaggerItem key={title}>
            <Item title={title} i={i} />
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal y={12} scale={0.9} className="order-first mx-auto lg:order-none" aria-hidden>
        <div className="relative grid size-44 place-items-center lg:size-56">
          <motion.span className="absolute inset-0 rounded-full border-2 border-dashed border-gold/40" animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} />
          <span className="absolute inset-4 rounded-full bg-[radial-gradient(circle,#eef1f8_0%,transparent_70%)]" />
          <span className="relative grid size-28 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-900 text-white shadow-2xl shadow-brand/30 lg:size-32">
            <ShieldCheck className="size-12" />
          </span>
        </div>
      </Reveal>
      <Stagger as="ul" className="space-y-4" stagger={0.08}>
        {sides[1].map((title, k) => (
          <StaggerItem key={title}>
            <Item title={title} i={k + 3} end />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

function WhyChoose() {
  const t = useTranslations('marketingPage.why');
  return (
    <section className="bg-white py-16 text-ink">
      <div className="container-x">
        <Intro top={t('top')} title={t('title')} description={t('text')} />
        <WhyHub tiles={t.raw('tiles')} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section 3: our approach (grey) */

/** "We do not hold client money…" shown as a highlighted note. */
export function ApproachNote({ text, dark = false }) {
  return (
    <p className={cn('flex items-start gap-3 rounded-2xl px-5 py-4 text-[15px] font-semibold leading-relaxed', dark ? 'border border-gold/30 bg-gold/[0.08] text-white/90' : 'bg-white text-ink/80 ring-1 ring-gold/30')}>
      <Ban className={cn('mt-0.5 size-5 shrink-0', dark ? 'text-gold-200' : 'text-gold-700')} aria-hidden />
      {text}
    </p>
  );
}

/** C: navy panel with the moving network behind it and the firm's name as a large outline in the background. */
function ApproachPanel() {
  const t = useTranslations('marketingPage.approach');
  const [body, note] = t.raw('text');
  return (
    <Reveal y={20}>
      <div className="is-dark relative overflow-hidden rounded-[2rem] bg-[#05081c] text-white shadow-2xl shadow-brand/25">
        <NetworkBackdrop id="gtn-approach" />
        <p
          className="pointer-events-none absolute inset-x-0 -bottom-4 select-none overflow-hidden whitespace-nowrap text-center text-[5rem] font-black leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] md:text-[8rem]"
          aria-hidden
        >
          {t('label')}
        </p>
        <div className="relative grid gap-10 p-8 md:p-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <TopTitle dark>{t('top')}</TopTitle>
            <h2 className="heading-section mt-5">
              <AccentTitle text={t('title')} accentClassName="heading-accent block" />
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-pretty text-base leading-relaxed text-white/75 md:text-lg">{body}</p>
            <ApproachNote text={note} dark />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Approach() {
  return (
    <section className="bg-[#f6f8fc] py-16 text-ink">
      <div className="container-x">
        <ApproachPanel />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section 6: your relationship with us (dark) */

/** Licence line ("You can verify our licence…", linked to the CMA site) + the Legal Documents button. */
function RelationshipActions({ center = false }) {
  const t = useTranslations('marketingPage.relationship');
  return (
    <div className={cn('mt-8 flex flex-col gap-5', center && 'items-center')}>
      <a href={CAT5_CMA_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm font-semibold text-gold-200 underline-offset-4 hover:underline">
        <BadgeCheck className="size-5 shrink-0" aria-hidden /> {t('line')}
        <ExternalLink className="size-3.5 opacity-70" aria-hidden />
      </a>
      <NavLink
        href={CAT5_LEGAL_LINKS.legalDocuments}
        className={cn(
          'inline-flex h-12 items-center gap-2.5 rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900',
          center ? 'self-center' : 'self-start'
        )}
      >
        <FileText className="size-4" aria-hidden /> {t('cta')}
      </NavLink>
    </div>
  );
}

/** Three open columns split by gold lines (the layout you chose for the trust points). */
function TrustPoints({ items }) {
  return (
    <Stagger className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0" stagger={0.12}>
      {items.map((w, i) => (
        <StaggerItem key={w.title} className="group relative text-center md:px-10">
          {i > 0 && <span className="absolute inset-y-4 start-0 hidden w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent md:block" aria-hidden />}
          <span className="relative mx-auto grid size-20 place-items-center">
            <span className="absolute inset-0 rounded-full border border-gold/30 transition-transform duration-700 group-hover:scale-110" aria-hidden />
            <span className="absolute inset-2 rounded-full bg-gradient-to-br from-brand-500/40 to-gold/30 blur-md" aria-hidden />
            <Icon name={w.icon} className="relative size-8 text-gold-200" />
          </span>
          <h3 className="heading-card mt-6">{w.title}</h3>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-white/65">{w.text}</p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** B: split: title, text and links on one side; the three points as glass cards on the other. */
function RelationshipSplit() {
  const t = useTranslations('marketingPage.relationship');
  return (
    <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <Reveal y={16} className="lg:sticky lg:top-32">
        <TopTitle dark>{t('top')}</TopTitle>
        <h2 className="heading-section mt-5">
          <AccentTitle text={t('title')} />
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-white/75 md:text-lg">{t('text')}</p>
        <RelationshipActions />
      </Reveal>
      <Stagger className="space-y-4" stagger={0.1}>
        {t.raw('items').map((w, i) => (
          <StaggerItem key={w.title} className="group rounded-[1.75rem] bg-gradient-to-r from-gold/40 via-white/10 to-brand-400/30 p-px">
            <article className="flex gap-5 rounded-[calc(1.75rem-1px)] bg-[#0a1033]/95 p-6 md:p-7">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-gold-600 text-white shadow-lg shadow-black/30">
                <Icon name={w.icon} className="size-5" />
              </span>
              <div>
                <h3 className="heading-card">
                  <span className="me-2 text-gold-300">{num(i)}</span>
                  {w.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/65">{w.text}</p>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

function Relationship() {
  return (
    <section className="is-dark relative overflow-hidden bg-[#05081c] py-16 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span className="absolute -start-40 top-0 size-[36rem] rounded-full bg-brand-600/45 blur-[120px]" />
        <span className="absolute -end-40 bottom-0 size-[30rem] rounded-full bg-gold/25 blur-[120px]" />
        <div className="bg-grid-dark absolute inset-0 opacity-30" />
      </div>
      <div className="container-x relative">
        <RelationshipSplit />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section 5: financial glossary (white) */

const TERM_ICONS = [Landmark, ShieldAlert, FileText, Briefcase];

/** Four term cards with a large outlined initial. */
function GlossaryCards({ items }) {
  return (
    <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4" stagger={0.08}>
      {items.map((g, i) => {
        const I = TERM_ICONS[i] ?? BookOpen;
        return (
          <StaggerItem key={g.term}>
            <article
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#f6f8fc] p-7 ring-1 ring-brand/5 transition-all duration-500 hover:-translate-y-1.5 hover:bg-white hover:ring-gold/30',
                'hover:shadow-[0_30px_70px_-35px_rgba(41,59,147,0.55)]'
              )}
            >
              <span
                className="pointer-events-none absolute end-6 top-4 select-none text-7xl font-black leading-none text-transparent transition-all duration-500 [-webkit-text-stroke:1.5px_rgba(41,59,147,0.1)] group-hover:[-webkit-text-stroke:1.5px_rgba(182,135,86,0.45)]"
                aria-hidden
              >
                {g.term.charAt(0)}
              </span>
              <span className="relative grid size-12 place-items-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-brand/10 transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                <I className="size-5" aria-hidden />
              </span>
              <h3 className="heading-card relative mt-6">{g.term}</h3>
              <span className="relative mt-3 h-0.5 w-10 rounded-full bg-gold transition-all duration-500 group-hover:w-16" aria-hidden />
              <p className="relative mt-4 text-[15px] leading-relaxed text-ink/60">{g.text}</p>
            </article>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

function Glossary() {
  const t = useTranslations('marketingPage.glossary');
  return (
    <section id="glossary" className="scroll-mt-32 bg-white py-16 text-ink">
      <div className="container-x">
        <Intro top={t('top')} title={t('title')} description={t('text')} />
        <GlossaryCards items={t.raw('items')} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section 6: support banner (mid-page CTA) */

/** "Monday to Friday, 9:00 to 18:00 GST" with a clock. */
export function SupportHours({ dark = false, className }) {
  const t = useTranslations('marketingPage.support');
  return (
    <p className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold', dark ? 'border border-white/15 bg-white/5 text-gold-200' : 'bg-white text-brand ring-1 ring-brand/10', className)}>
      <Clock className="size-4" aria-hidden /> {t('hours')}
    </p>
  );
}

/** Dark band with the hero's network moving behind it, and floating chat bubbles. */
function SupportBand() {
  const t = useTranslations('marketingPage.support');
  const bubbles = [
    { I: MessageCircle, cls: 'start-[8%] top-[18%] size-14', d: 0 },
    { I: Headset, cls: 'end-[9%] top-[22%] size-16', d: 1.2 },
    { I: MessageSquareText, cls: 'start-[14%] bottom-[16%] size-12', d: 2.1 },
    { I: Languages, cls: 'end-[15%] bottom-[18%] size-12', d: 0.6 }
  ];
  return (
    <div className="is-dark relative overflow-hidden rounded-[2rem] bg-[#05081c] text-white shadow-2xl shadow-brand/25">
      <NetworkBackdrop id="gtn-support" />
      {bubbles.map(({ I, cls, d }, i) => (
        <motion.span
          key={i}
          className={cn('pointer-events-none absolute hidden place-items-center rounded-2xl border border-white/15 bg-white/5 text-gold-200 backdrop-blur md:grid', cls)}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, delay: d, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          <I className="size-1/2" />
        </motion.span>
      ))}
      <Reveal y={16} className="relative px-6 py-16 text-center md:px-16 md:py-20">
        <TopTitle dark center>
          {t('top')}
        </TopTitle>
        <h2 className="heading-section mx-auto mt-4 max-w-3xl">
          <AccentTitle text={t('title')} />
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/75 md:text-lg">{t('text')}</p>
        <SupportHours dark className="mt-6" />
        <div className="mt-8 flex justify-center">
          <CtaButton>{t('cta')}</CtaButton>
        </div>
      </Reveal>
    </div>
  );
}

function Support() {
  return (
    <section className="bg-white pb-16">
      <div className="container-x">
        <SupportBand />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ section 7: FAQ (grey) */

/**
 * Links inside answers: "…our <privacy>Privacy Policy</privacy>." → the policy page, "<cma>…</cma>" → the CMA website.
 * A link without a URL yet shows as plain text.
 */
const TAG_LINKS = { privacy: () => CAT5_LEGAL_LINKS.privacy, cma: () => CAT5_CMA_URL };
export const withLinks = (text, linkClass = 'font-semibold text-brand underline underline-offset-4 hover:text-gold-700') =>
  String(text)
    .split(/(<(?:privacy|cma)>.*?<\/(?:privacy|cma)>)/)
    .map((part, i) => {
      const m = part.match(/^<(privacy|cma)>(.*)<\/\1>$/);
      if (!m) return part;
      const href = TAG_LINKS[m[1]]();
      return href ? (
        <a key={i} href={href} {...(m[1] === 'cma' ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={linkClass}>
          {m[2]}
        </a>
      ) : (
        <span key={i} className="font-semibold text-ink/80">
          {m[2]}
        </span>
      );
    });
const useFaqItems = () => {
  const t = useTranslations('marketingPage.faq');
  return t.raw('items').map((it) => ({ q: it.q, a: <>{withLinks(it.a)}</> }));
};

/** Title and a "talk to our team" box on one side, the accordion on the other. */
function FaqSplit() {
  const t = useTranslations('marketingPage');
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <Reveal y={16} className="lg:sticky lg:top-32 lg:self-start">
        <TopTitle>{t('faq.top')}</TopTitle>
        <h2 className="heading-section mt-4">
          <AccentTitle text={t('faq.title')} />
        </h2>
        <div className="is-dark relative mt-8 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-7 text-white">
          <span className="absolute -end-12 -top-12 size-40 rounded-full bg-gold/25 blur-3xl" aria-hidden />
          <span className="relative grid size-12 place-items-center rounded-xl bg-gradient-to-br from-gold to-gold-600">
            <Headset className="size-6" aria-hidden />
          </span>
          <p className="heading-card relative mt-5">
            <AccentTitle text={t('support.title')} />
          </p>
          <div className="relative mt-6">
            <CtaButton light>{t('support.cta')}</CtaButton>
          </div>
        </div>
      </Reveal>
      <FaqAccordion items={useFaqItems()} numbered />
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-32 bg-[#f6f8fc] py-16 text-ink">
      <div className="container-x">
        <FaqSplit />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ contact (support block + form) */

function Enquiry() {
  const t = useTranslations('marketingPage.form');
  return (
    <section id="enquiry" className="scroll-mt-32 bg-white py-16">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
        <Reveal y={16}>
          <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-600 text-white shadow-lg shadow-gold/30">
            <Headset className="size-8" aria-hidden />
          </span>
          <TopTitle className="mt-6">{t('top')}</TopTitle>
          <h2 className="heading-section mt-4">
            <AccentTitle text={t('title')} />
          </h2>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-ink/65">{t('text')}</p>
          <ul className="mt-8 space-y-3">
            {t.raw('points').map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-ink/80">
                <CircleCheck className="size-5 shrink-0 text-gold-700" aria-hidden /> {p}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-[1.5rem] bg-[#f6f8fc] p-5 ring-1 ring-brand/10 md:p-6">
            <p className="text-sm font-semibold text-ink/75">{t('orContact')}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={mail} className="group flex items-center gap-3 font-semibold text-brand">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-brand/15 transition-colors group-hover:bg-brand group-hover:text-white">
                    <Mail className="size-4" aria-hidden />
                  </span>
                  {CAT5_CONTACT.email}
                </a>
              </li>
              {tel && (
                <li>
                  <a href={tel} className="group flex items-center gap-3 font-semibold text-brand">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-brand/15 transition-colors group-hover:bg-brand group-hover:text-white">
                      <Phone className="size-4" aria-hidden />
                    </span>
                    <span dir="ltr" className="[unicode-bidi:isolate]">
                      {CAT5_CONTACT.phone}
                    </span>
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3 text-ink/70">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-brand ring-1 ring-brand/15">
                  <MapPin className="size-4" aria-hidden />
                </span>
                <span className="pt-2 leading-relaxed">{t('address')}</span>
              </li>
            </ul>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.1}>
          <div className="rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-2 shadow-2xl shadow-brand/25">
            <EnquiryForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ closing banner (pre-footer) */

function ClosingBanner() {
  const t = useTranslations('marketingPage.closing');
  const title = t('title');
  return (
    <section className="bg-white pb-16">
      <div className="container-x">
        <Reveal y={20}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-[#05081c] px-6 py-14 text-center text-white shadow-2xl shadow-brand/25 md:px-16 md:py-20">
            <NetworkBackdrop id="gtn-closing" />
            <span className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
            <div className="relative mx-auto max-w-3xl">
              {title && (
                <h2 className="heading-section">
                  <AccentTitle text={title} />
                </h2>
              )}
              <p className={cn('text-pretty leading-relaxed', title ? 'mt-5 text-base text-white/75 md:text-lg' : 'text-xl font-semibold text-white md:text-2xl')}>{t('text')}</p>
              <div className="mt-9 flex justify-center">
                <CtaButton>{t('cta')}</CtaButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ legal footer */

function LegalFooter() {
  const t = useTranslations('marketingPage');
  const links = Object.keys(CAT5_LEGAL_LINKS);
  return (
    <footer id="legal" className="is-dark scroll-mt-32 bg-ink pb-28 pt-14 text-white md:pb-12">
      <div className="container-x">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <Logo onDark />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label={t('footer.title')}>
            {links.map((k) =>
              CAT5_LEGAL_LINKS[k] ? (
                <NavLink key={k} href={CAT5_LEGAL_LINKS[k]} className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline">
                  {t(`footer.links.${k}`)}
                </NavLink>
              ) : (
                <span key={k} className="text-white/70">
                  {t(`footer.links.${k}`)}
                </span>
              )
            )}
          </nav>
        </div>
        <h2 className="heading-label mt-10 flex items-center gap-2">
          <Info className="size-4" aria-hidden /> {t('footer.title')}
        </h2>
        <p className="mt-4 max-w-5xl text-[13px] leading-relaxed text-white/60">{t('footer.text')}</p>
        <p className="mt-3 max-w-5xl text-[13px] leading-relaxed text-white/60">
          {t('footer.verifyPrefix')}
          <a
            href={CAT5_CMA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold-200 underline underline-offset-4 hover:text-white"
          >
            {t('footer.verifyLink')}
          </a>
          {t('footer.verifySuffix')}
        </p>
        <p className="mt-5 max-w-5xl rounded-2xl border border-gold/25 bg-gold/[0.06] px-5 py-4 text-[13px] leading-relaxed text-white/70">{t('footer.risk')}</p>
        <p className="mt-10 border-t border-white/10 pt-6 text-sm text-white/50">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

/** Phones: a "Speak to the Team" bar appears once the hero is scrolled past, hidden again at the form. */
function StickyCta() {
  const t = useTranslations('marketingPage');
  const enquiry = useEnquiryHref();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const form = document.getElementById('enquiry')?.getBoundingClientRect();
      setShow(window.scrollY > 600 && !(form && form.top < window.innerHeight && form.bottom > 0));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ duration: 0.35, ease: EASE }} className="fixed inset-x-3 bottom-3 z-40 md:hidden">
          <a href={enquiry} className="flex h-13 items-center justify-center gap-2 rounded-full bg-gold text-base font-semibold text-white shadow-2xl">
            {t('cta')} <ArrowRight className="size-4 rtl:-scale-x-100" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Shell of every CAT 5 page: licence notice + header, the page, the legal footer and (phones) the sticky button. */
export function Cat5Frame({ page = 'home', children }) {
  return (
    <Cat5PageCtx.Provider value={page}>
      <div className="bg-white text-ink">
        <Header />
        <main className="overflow-x-clip">{children}</main>
        <LegalFooter />
        <StickyCta />
      </div>
    </Cat5PageCtx.Provider>
  );
}

export default function MarketingPage() {
  return (
    <Cat5Frame page="home">
      <Hero />
      <WhyChoose />
      <Approach />
      <Services />
      <HowItWorks />
      <Relationship />
      <Glossary />
      <Support />
      <Faq />
      <Enquiry />
      <ClosingBanner />
    </Cat5Frame>
  );
}
