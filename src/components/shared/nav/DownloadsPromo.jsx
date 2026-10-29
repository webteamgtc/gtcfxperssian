'use client';

import { useTranslations } from 'next-intl';
import { ArrowUpRight, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GTC_GO_APP_STORE_URL } from '@/config/gtcGoStoreLinks';
import { StoreBadges } from '../GtcGoPhone';
import NavLink from './NavLink';

const PLATFORM_LINKS = [
  ['mt4', '/trading/mt4-platform'],
  ['mt5', '/trading/mt5-platform'],
  ['gtcgo', '/trading/gtc-go-app']
];

/** MT / GTC Go shortcuts, QR, and official App Store + Play Store badges. */
export default function DownloadsPromo({ onNavigate, linkClassName }) {
  const t = useTranslations('menu.downloads');
  const linkCls =
    linkClassName ??
    'group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 text-[15px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white';

  return (
    <>
      <ul className="space-y-1">
        {PLATFORM_LINKS.map(([k, href]) => (
          <li key={k}>
            <NavLink href={href} onClick={onNavigate} className={linkCls}>
              <span className="grid size-8 place-items-center rounded-lg bg-white/10 transition group-hover:bg-gold">
                <Download className="size-4" />
              </span>
              {t(k)}
              <ArrowUpRight className="ms-auto size-4 opacity-0 transition group-hover:opacity-100 rtl:-scale-x-100" />
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-xl bg-white p-2 shadow-lg">
          <QRCodeSVG value={GTC_GO_APP_STORE_URL} size={84} level="M" fgColor="#1a245c" aria-label={t('scan')} />
        </div>
        <StoreBadges dark className="flex-col [&>a]:px-3 [&>a]:py-2" />
      </div>
    </>
  );
}
