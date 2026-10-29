/** Base path of the news section: /gtc-news, /gtc-news/<category>, /gtc-news/<category>/<slug>. Safe to import in client components. */
export const NEWS_PATH = '/gtc-news';
export const newsCategoryHref = (category) => `${NEWS_PATH}/${category}`;
export const newsArticleHref = (category, slug) => `${NEWS_PATH}/${category}/${encodeURIComponent(slug)}`;
