# Strapi — Events & Exhibitions

The page `/[locale]/company/events-and-exhibitions` reads one Strapi collection type, **Event** (API id `events`).
Both the hero (upcoming events + registration form) and the archive ("The Stages We've Walked") come from it:

| Where on the page | Which events | Order |
| --- | --- | --- |
| Hero + "More Events" cards | `endDate` ≥ today | `featured` first, then soonest `startDate` |
| Archive year tabs | `endDate` < today | newest first, grouped by the year of `startDate` |

So there is nothing to move by hand: when an event ends it drops out of the hero and appears in the archive.
The fixed UI text (titles, labels, form text) stays in `messages/<locale>/companyPage.json → eventsPage`.

## 1. Content type `event` (Settings → Content-Type Builder → Collection type)

Enable **Internationalization** on the content type so each language can have its own copy.

| Field | Type | Required | Localised | Notes |
| --- | --- | --- | --- | --- |
| `title` | Text (short) | ✔ | ✔ | "Smart Vision Summit Morocco 2026: GTCFX at Booth #15" |
| `shortTitle` | Text (short) |  | ✔ | "Smart Vision Summit Morocco 2026" — used on posters/form; falls back to `title` |
| `slug` | UID (target: `title`) | ✔ |  | `smart-vision-summit-morocco-2026` |
| `summary` | Text (long) | ✔ | ✔ | 1–2 sentences, shown in hero + archive row |
| `description` | Rich text (Blocks) |  | ✔ | Long write-up shown when an archive row is opened (paragraphs) |
| `startDate` | Date | ✔ |  | `2026-10-30` |
| `endDate` | Date |  |  | `2026-10-31` (empty = one-day event) |
| `venue` | Text (short) |  | ✔ | "Hong Kong Convention and Exhibition Centre" |
| `city` | Text (short) | ✔ | ✔ | "Marrakech" |
| `country` | Text (short) |  | ✔ | "Morocco" |
| `booth` | Text (short) |  |  | "15", "23–24" (shown as "Booth #15") |
| `sponsorship` | Text (short) |  | ✔ | "Diamond Sponsor", "Gold Sponsor" |
| `featured` | Boolean |  |  | Pin this upcoming event first in the hero |
| `registrationOpen` | Boolean |  |  | Show the "Meet our team" form for this event |
| `cover` | Media (single image) | recommended |  | 1600×1000 or larger; used as hero background and card image |
| `gallery` | Media (multiple images) |  |  | Photos shown in the archive viewer |

Images: set **Alternative text** in the Media Library — it becomes the `alt` attribute (accessibility + SEO).
Without a cover the site draws a branded poster, so nothing looks broken while photos are missing.

## 2. Permissions

Settings → API Tokens → create a **Read-only** token with access to `event` → `find` / `findOne`.
(Or allow `find` for the Public role if you prefer no token.)

## 3. Environment variables (Next.js)

```bash
STRAPI_URL=https://cms.gtcfx.com          # no trailing slash
STRAPI_TOKEN=xxxxxxxx                     # the read-only token
STRAPI_REVALIDATE=300                     # cache seconds (ISR); new events appear within 5 min
```

If `STRAPI_URL` is not set (or Strapi is down) the page renders `src/data/events.sample.js`, so builds never fail.
Add the CMS/media host to `images.remotePatterns` in `next.config.mjs` if images are served from a new domain.

## 4. The request the site makes

```
GET {STRAPI_URL}/api/events
  ?sort[0]=startDate:desc
  &pagination[pageSize]=100
  &populate[cover][fields][0]=url&populate[cover][fields][1]=alternativeText …
  &populate[gallery][fields][0]=url …
  &locale=ar                     # next-intl locale (zh → zh-Hans, zh-TW → zh-Hant-TW, see src/lib/strapi.js)
Authorization: Bearer {STRAPI_TOKEN}
```

Example response item (Strapi v5, flat attributes — v4 `{ id, attributes }` is also accepted):

```json
{
  "id": 12,
  "documentId": "k3h2…",
  "title": "iFX Expo Hong Kong 2026",
  "shortTitle": "iFX Expo Hong Kong 2026",
  "slug": "ifx-expo-hong-kong-2026",
  "summary": "GTCFX strengthened its presence in Hong Kong at iFX Expo Asia 2026…",
  "description": [{ "type": "paragraph", "children": [{ "type": "text", "text": "GTCFX participated as a Gold Sponsor…" }] }],
  "startDate": "2026-10-08",
  "endDate": "2026-10-09",
  "venue": "Hong Kong Convention and Exhibition Centre",
  "city": "Hong Kong",
  "country": "",
  "booth": "14",
  "sponsorship": "Gold Sponsor",
  "featured": false,
  "registrationOpen": false,
  "cover": { "url": "https://…/ifx-cover.webp", "alternativeText": "GTCFX team at Booth 14", "width": 1600, "height": 1000, "formats": { "large": { "url": "…", "width": 1000, "height": 625 } } },
  "gallery": [{ "url": "…", "alternativeText": "…", "width": 1600, "height": 1067 }]
}
```

Mapping code: `src/lib/events.js` (`normaliseEvent`, `getEventsPageData`) and `src/lib/strapi.js` (fetch, media URLs, blocks → paragraphs).

## 5. Registration form endpoints

The hero form posts to the routes in `src/config/events.js` (not built yet — same situation as `/api/gtc/*`):

- `POST /api/gtc/event-otp` `{ phone, email }` → `{ code: 200 }`
- `POST /api/gtc/event-register` `{ eventId, eventSlug, eventTitle, firstName, lastName, email, country, phone, otp, locale, terms }` → `{ code: 200 }`

If registrations should be stored in Strapi too, create a collection `event-registration` (event: relation → Event,
plus the fields above) and have the route handler forward to `POST /api/event-registrations` with a write token
kept on the server — never expose a write token in the browser.
