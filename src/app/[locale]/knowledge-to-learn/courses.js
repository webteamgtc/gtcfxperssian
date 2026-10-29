/**
 * Knowledge-to-learn courses. Sections + lessons come from Strapi (src/lib/learn.js):
 *   /knowledge-to-learn/<course>                     learn-types where mainCategory = <course>
 *   /knowledge-to-learn/<course>/<section>           blogs whose learn_type = <section>
 *   /knowledge-to-learn/<course>/<section>/<article> one blog (HTML body)
 *
 *  - ns        translation namespace (courseHeader + meta) in messages/<locale>/knowledgeToLearn.json
 *  - material  key of the hub card that opens the course (knowledgePage.educationalMaterials.cards[].key)
 * App promo + closing CTA are shared from SHARED_NS.
 */
export const COURSES = {
  'for-trading-beginners': { ns: 'forTradingBeginnersPage', material: 'videoTutorials' },
  'ebooks-guides': { ns: 'ebooksGuidesPage', material: 'ebooksGuides' },
  'webinars-live': { ns: 'webinarsLivePage', material: 'webinarsLive' },
  'platform-walkthroughs': { ns: 'platformWalkthroughsPage', material: 'platformWalkthroughs' },
  'technical-analysis': { ns: 'technicalAnalysisPage', material: 'technicalAnalysis' }
};

export const SHARED_NS = 'forTradingBeginnersPage';
export const HUB_PATH = '/knowledge-to-learn';
export const courseHref = (course) => `${HUB_PATH}/${course}`;
export const sectionHref = (course, section) => `${courseHref(course)}/${section}`;
export const articleHref = (course, section, article) => `${sectionHref(course, section)}/${encodeURIComponent(article)}`;

/** Hub cards that open a page other than a course. */
const MATERIAL_PAGES = { strategyBlueprints: `${HUB_PATH}/platform-guide` };

/** Hub card key → course / page URL (null when that material has no page). */
export function materialHref(key) {
  const course = Object.keys(COURSES).find((c) => COURSES[c].material === key);
  return course ? courseHref(course) : (MATERIAL_PAGES[key] ?? null);
}
