/** Small shared bits of the GTC News hub (icons per Strapi category, the hero's "latest of each" list). */
import { BookOpen, Building2, CalendarDays, CandlestickChart, LineChart, Newspaper } from 'lucide-react';

export const CATEGORY_ICONS = { event: CalendarDays, 'market-daily-updates': LineChart, blogs: BookOpen, 'company-news': Building2, 'technical-analysis': CandlestickChart };
export const iconFor = (slug) => CATEGORY_ICONS[slug] ?? Newspaper;

/** Hero order: event, article (blogs), company news, daily market update, then any other category. */
const HERO_ORDER = ['event', 'blogs', 'company-news', 'market-daily-updates'];

/** Latest post of each kind (event first), at most `max`, no duplicates. */
export function latestStories(sections, featured, max = 4) {
  const firsts = sections.map((s) => s.articles[0]).filter(Boolean);
  const all = [featured, ...firsts].filter(Boolean);
  const rank = (a) => (HERO_ORDER.includes(a.categorySlug) ? HERO_ORDER.indexOf(a.categorySlug) : HERO_ORDER.length);
  const seen = new Set();
  return all
    .filter((a) => !seen.has(a.id) && seen.add(a.id))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, max);
}
