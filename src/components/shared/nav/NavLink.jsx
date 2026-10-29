'use client';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

// Review-link builds only: pages that exist in the static preview, so menu links between them work there
const PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
const PREVIEW_PAGES = {
  '/': 'home',
  '/company': 'company',
  '/company/about-us': 'about-us',
  '/company/awards': 'awards',
  '/gtc-news': 'gtc-news',
  '/gtc-news/sample-article': 'sample-article', // review link only (scripts/preview-routes)
  '/gtc-news/sample-category': 'sample-category', // review link only (scripts/preview-routes)
  '/gtc-news/market-holidays': 'market-holidays',
  '/company/why-gtc-group': 'why-gtc-group',
  '/company/global-presence': 'global-presence',
  '/company/events-and-exhibitions': 'events-and-exhibitions',
  '/company/regulations': 'regulations',
  '/company/contact-us': 'contact-us',
  '/trading': 'trading',
  '/trading/open-live-account': 'open-live-account',
  '/trading/free-demo-account': 'free-demo-account',
  '/trading/deposit': 'deposit',
  '/trading/account-types': 'account-types',
  '/trading/compensation-fund': 'compensation-fund',
  '/trading/mt5-platform': 'mt5-platform',
  '/trading/mt4-platform': 'mt4-platform',
  '/trading/metatrader-for-android': 'metatrader-for-android',
  '/trading/metatrader-for-ipad': 'metatrader-for-ipad',
  '/trading/gtc-go-app': 'gtc-go-app',
  '/trading/gtc-go-app-ipad': 'gtc-go-app-ipad',
  '/trading/gtc-go-app-android': 'gtc-go-app-android',
  '/markets': 'markets',
  '/markets/forex': 'forex',
  '/markets/energy': 'energy',
  '/markets/indices': 'indices',
  '/markets/metals': 'metals',
  '/markets/shares': 'shares',
  '/markets/future-cfds': 'future-cfds',
  '/markets/forex/eurusd': 'eurusd',
  '/markets/forex/gbpusd': 'gbpusd',
  '/markets/forex/usdjpy': 'usdjpy',
  '/markets/forex/usdchf': 'usdchf',
  '/markets/metals/xauusd': 'xauusd',
  '/markets/indices/us30': 'us30',
  '/markets/indices/spx500': 'spx500',
  '/markets/indices/nas100': 'nas100',
  '/marketing': 'marketing'
};

/** Internal routes use the locale-aware Link; '#…' and full URLs use a plain <a>. */
export default function NavLink({ href, children, prefetch, ...rest }) {
  const locale = useLocale();
  const [path, hash] = (href || '').split('#');
  // review link: every news article / category opens the sample article / category page
  const page = PREVIEW && path && (PREVIEW_PAGES[path] ?? (/^\/gtc-news\/[^/]+\/[^/]+$/.test(path) ? 'sample-article' : /^\/gtc-news\/(?!economic-calendar|earnings-calendar)[^/]+$/.test(path) ? 'sample-category' : null));
  if (page) {
    return (
      <a href={`../../${locale}/${page}/index.html${hash ? `#${hash}` : ''}`} {...rest}>
        {children}
      </a>
    );
  }
  if (!href || href.startsWith('#') || /^https?:\/\//.test(href)) {
    const ext = /^https?:\/\//.test(href || '');
    return (
      <a href={href || '#'} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...(prefetch === undefined ? {} : { prefetch })} {...rest}>
      {children}
    </Link>
  );
}

/** true when the current page is this link (or inside it) */
export function useIsActive() {
  let pathname = usePathname();
  // review build: "/forex/index.html" -> "/markets/forex", so the highlight matches the prerendered HTML
  // (only for flattened review URLs — while the pages are prerendered the pathname is already the real route)
  if (PREVIEW && pathname.endsWith('/index.html')) {
    const slug = pathname.split('/').filter(Boolean).find((x) => x !== 'index.html');
    const route = Object.keys(PREVIEW_PAGES).find((k) => PREVIEW_PAGES[k] === slug);
    if (route) pathname = route;
  }
  return (href) => !!href && href.startsWith('/') && (pathname === href || pathname.startsWith(`${href}/`));
}
