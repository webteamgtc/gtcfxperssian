# GTCFX Website

The new gtcfx.com, built page by page.

| Route | Page |
| --- | --- |
| `/en` | Homepage |
| `/en/company` | Company hub |
| `/en/company/about-us` · `why-gtc-group` · `global-presence` · `events-and-exhibitions` · `regulations` · `contact-us` | Company pages |
| `/en/trading` · `/en/trading/open-live-account` | Trading pages |

Replace `en` with `ar` to preview the Arabic right-to-left version.

## Stack

- Next.js 16 (App Router), **JavaScript only** (no TypeScript)
- Tailwind CSS v4 (brand tokens in `src/app/globals.css`)
- `next-intl` for i18n, with locale routing via `src/proxy.js`
- Motion (Framer Motion) for all animation
- shadcn/ui-style components (`src/components/ui`, `components.json` set to `tsx: false`), Radix Accordion, lucide icons
- Font: Inter (Latin), IBM Plex Sans Arabic (Arabic), both self-hosted via Fontsource
- Brand colours: `#293b93` (brand), `#b68756` (gold), black, white and grays

## Run it

```bash
npm install
npm run dev      # http://localhost:3000/en
npm run build && npm start
```

Deploys to Vercel as-is.

## Languages (i18n)

All text lives in `/messages/<locale>.json`, so nothing is hard-coded in the components.

To add a language:

1. Copy `messages/en.json` to `messages/fr.json` (for example) and translate the values. Keep the keys unchanged.
2. Add it to `src/i18n/locales.js`, e.g. `{ code: 'fr', label: 'French', native: 'Français', dir: 'ltr' }`.
   Use `dir: 'rtl'` for Arabic, Urdu, Farsi and Hebrew. The layout flips automatically.

The language switcher, routes, `hreflang` links and static pages all pick up the new language automatically.

## Folder map

```
messages/                 en.json, ar.json (+ the other 20 languages)
src/app/[locale]/         layout, homepage (components/), company/ and trading/ pages
src/i18n/                 locales list, routing, request config, navigation helpers
src/proxy.js              locale detection / redirect (Next 16 "proxy" = middleware)
src/components/motion/    reusable animations (Reveal, WordReveal, CountUp, Marquee,
                          TiltCard, SpotlightCard, Magnetic, Parallax, MaskReveal, …)
src/components/shared/    Header (mega menu, language switcher, mobile drawer), Footer,
                          live ticker, device mockups and charts, form, icons
src/components/ui/        shadcn-style Button and Accordion
```

## Placeholders to replace before launch

- **Logo**: `public/images/gtc-logo.png` is cropped from a screenshot. Replace it with the official SVG, plus a white version for dark headers.
- **Hero photo**: no longer used (heroes are now animated). `public/images/hero-trader.jpg` can be deleted.
- **CEO & GM**: names, photos, quotes and LinkedIn links (`leaders` in the JSON files, and the `Portrait` component).
- **Prices**: `src/components/shared/ticker.jsx` uses a simulated feed. Connect your real quotes API or WebSocket there.
- **Market descriptions**: only Forex had copy on the current site. The other seven are draft copy for review.
- **FAQ answers**: draft copy. Compliance should review it.
- **Links**: menu, footer, download and register links are `#`. Connect them to the real pages and the client portal.
- **Registration form**: front-end only. Connect it to your CRM or client portal.
- **Arabic**: drafted for layout testing. A native speaker should review it.
