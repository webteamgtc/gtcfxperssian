# Strapi — Market News

The **Market News** section on `/[locale]/markets` (the newest 5 articles: 1 featured + 4 cards) reads one
Strapi collection type, **Article** (API id `articles`). Each card links to `/news/<slug>`.
The fixed UI text (section title, "View all news") stays in `messages/<locale>/marketsPage.json → marketsPage.news`.

## 1. Content type `article`

Enable **Internationalization** so each language can have its own copy.

| Field | Type | Required | Localised | Notes |
| --- | --- | --- | --- | --- |
| `title` | Text (short) | ✔ | ✔ | "How to Make a Forex Withdrawal on GTC Go (GTCFX Guide)" |
| `slug` | UID (target: `title`) | ✔ |  | `how-to-make-a-forex-withdrawal-on-gtc-go` |
| `excerpt` | Text (long) | ✔ | ✔ | 1–2 sentences; shown on the featured card and used as the page description |
| `body` | Rich text (Blocks) | ✔ | ✔ | The article itself (for the article page, built later) |
| `publishedDate` | Date | ✔ |  | Shown on the card; falls back to Strapi's `publishedAt` |
| `category` | Relation → `category` (many-to-one) or Text |  |  | "Guides", "Market hours", "Analysis" |
| `cover` | Media (single image) | recommended |  | 1600×1000 or larger. Set **Alternative text** — it becomes the `alt` attribute |

Without a cover the site draws a branded cover with the title, so nothing looks broken while images are missing.

## 2. Permissions

Settings → API Tokens → create a **Read-only** token with `find` + `findOne` on Article (and Category).
Put it in `STRAPI_TOKEN` (see `.env.example`). Responses are cached for `STRAPI_REVALIDATE` seconds.

## 3. Request the site sends

```
GET /api/articles?locale=en
  &sort[0]=publishedDate:desc&sort[1]=publishedAt:desc
  &pagination[pageSize]=5
  &fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedDate&fields[4]=publishedAt
  &populate[cover][fields][0]=url&…&populate[category][fields][0]=name
```

Normalisation lives in `src/lib/news.js → normaliseArticle` (works with Strapi v5 flat responses and v4 `attributes`).
