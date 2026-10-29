import { CAT5_PAGES, CAT5_PATH, CAT5_SITE } from '@/config/regions';

const PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

/**
 * Link to a CAT 5 page ('home' | 'about' | 'faq' | 'contact') in a locale ('en-ae' | 'fa'), optionally with a #hash.
 * Live with the CAT 5 site on: the public address (/en-ae/about-us). Otherwise: the folder address
 * (/en-ae/marketing/about). Review link (flattened static pages): ../../<locale>/<folder>/index.html.
 */
export function cat5Href(locale, page = 'home', hash = '') {
  const p = CAT5_PAGES[page] ?? CAT5_PAGES.home;
  if (PREVIEW) return `../../${locale}/${p.dir ? p.dir.slice(1) : CAT5_PATH.slice(1)}/index.html${hash}`;
  if (CAT5_SITE) return `/${locale}${p.path}${hash}` || `/${locale}`;
  return `/${locale}${CAT5_PATH}${p.dir}${hash}`;
}
