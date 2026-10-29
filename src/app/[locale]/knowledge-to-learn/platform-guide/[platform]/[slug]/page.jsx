import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { createSlug, getPlatformGuides, normalizePlatform } from '@/lib/platform-guide/googleDrive';
import { normalizePlatformGuideLocale } from '@/lib/platform-guide/locales';
import GuideDetail from '../../components/GuideDetail';
import { guideHref } from '../../guides';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // depends on ?lang / ?type; Drive listings are cached in memory

/** Decode the (possibly double-encoded) slug so Arabic / Chinese guide URLs still match. */
function decodeSlug(slug) {
  let value = String(slug ?? '');
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(value);
      if (next === value) break;
      value = next;
    } catch {
      break;
    }
  }
  return createSlug(value.normalize('NFC'));
}

async function load({ locale, platform: platformParam, slug }, { lang, type }) {
  const platform = normalizePlatform(platformParam);
  if (!platform) return null;
  const guideLocale = normalizePlatformGuideLocale(lang || locale);
  let guides;
  try {
    guides = await getPlatformGuides(platform, guideLocale);
  } catch (error) {
    console.error('Platform guide detail error:', error);
    return null;
  }
  const wanted = decodeSlug(slug);
  const all = [...guides.png, ...guides.pdf];
  const matches = all.filter((g) => g.slug === wanted || g.id === wanted);
  const item = matches.find((g) => g.type === type) ?? matches[0];
  if (!item) return null;
  const more = guides[item.type].filter((g) => g.id !== item.id).slice(0, 4);
  return { platform, item, more, guideLocale };
}

export async function generateMetadata({ params, searchParams }) {
  const p = await params;
  const data = await load(p, await searchParams);
  if (!data) return {};
  const t = await getTranslations({ locale: p.locale, namespace: 'platformGuidePage' });
  return pageMetadata({
    locale: p.locale,
    path: guideHref(data.platform, data.item).split('?')[0],
    title: `${data.item.title} | ${t('hero.title')}`,
    description: `${t(`platforms.${data.platform}`)} — ${data.item.title}`
  });
}

export default async function Page({ params, searchParams }) {
  const p = await params;
  const data = await load(p, await searchParams);
  if (!data) notFound();
  setRequestLocale(p.locale);
  return <GuideDetail {...data} />;
}
