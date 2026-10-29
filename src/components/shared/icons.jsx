import {
  HandCoins,
  ArrowLeftRight,
  Zap,
  Gauge,
  MonitorSmartphone,
  ShieldCheck,
  Globe,
  Gem,
  Flame,
  ChartColumn,
  Wheat,
  Building2,
  CalendarClock
} from 'lucide-react';

export const FEATURE_ICONS = [HandCoins, ArrowLeftRight, Zap, Gauge, MonitorSmartphone, ShieldCheck];
/** Homepage market cards, by key of markets.markets in homepage.json */
export const MARKET_ICONS = {
  energy: Flame,
  commodities: Wheat,
  forex: Globe,
  indices: ChartColumn,
  metals: Gem,
  'shares-equity-cfds': Building2,
  'future-cfds': CalendarClock
};

const P = { fill: 'currentColor', 'aria-hidden': true };

export const SOCIALS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/GTCFXGlobalTradeCapital',
    icon: (c) => (
      <svg viewBox="0 0 24 24" className={c} {...P}><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3Z" /></svg>
    )
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/gtcfx-official',
    icon: (c) => (
      <svg viewBox="0 0 24 24" className={c} {...P}><path d="M6.9 8.6H3.6V20h3.3V8.6ZM5.2 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 13.4c0-3.1-1.7-4.6-3.9-4.6-1.8 0-2.6 1-3 1.7V8.6h-3.3V20h3.3v-5.6c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.7 1.8 3V20h3.3l-.3-6.6Z" /></svg>
    )
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCnKWakjm1b9Bm63xgwNFXHA',
    icon: (c) => (
      <svg viewBox="0 0 24 24" className={c} {...P}><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" /></svg>
    )
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/gtcfxofficial/',
    icon: (c) => (
      <svg viewBox="0 0 24 24" className={c} {...P}><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.1c-.1-1.5-.4-2.8-1.5-3.8-1-1-2.4-1.4-3.8-1.5H8.3c-1.5.1-2.8.4-3.8 1.5-1 1-1.4 2.3-1.5 3.8v7.8c.1 1.5.4 2.8 1.5 3.8 1 1 2.3 1.4 3.8 1.5h7.4c1.5-.1 2.8-.4 3.8-1.5 1-1 1.4-2.3 1.5-3.8V8.1Zm-2 9.2a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.3.4s-4.1.1-5.3-.4A3 3 0 0 1 5 17.3c-.5-1.2-.4-4-.4-5.3s-.1-4.1.4-5.3A3 3 0 0 1 6.7 5c1.2-.5 4-.4 5.3-.4s4.1-.1 5.3.4A3 3 0 0 1 19 6.7c.5 1.2.4 4 .4 5.3s.1 4.1-.4 5.3Z" /></svg>
    )
  },
  {
    name: 'Telegram',
    href: 'https://t.me/gtc_vip_signal',
    icon: (c) => (
      <svg viewBox="0 0 24 24" className={c} {...P}><path d="M21.4 4.2 18.3 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.2 13 1.6 11.6c-1-.3-1-1 .2-1.5L20 3c.8-.3 1.6.2 1.4 1.2Z" /></svg>
    )
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@gtcgroup_official',
    icon: (c) => (
      <svg viewBox="0 0 24 24" className={c} {...P}><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4s-1.9.1-3.2-1.6Z" /></svg>
    )
  },
  {
    name: 'X',
    href: 'https://x.com/GTC_fx',
    icon: (c) => (
      <svg viewBox="0 0 24 24" className={c} {...P}><path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.5l11.2 14.5Z" /></svg>
    )
  }
];

export function LinkedInIcon({ className }) {
  return SOCIALS[1].icon(className);
}
