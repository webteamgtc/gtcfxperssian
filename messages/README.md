# Translation files

## Folder layout (preferred)

For each locale, split copy by page or shared scope:

```
messages/
  en/
    common.json       # shared on every page: nav, menu, footer, meta, riskBar, lang picker, stats, …
    homepage.json     # hero, features, markets, drafts, register, …
    companyPage.json  # Company section: `companyPage` (/company) + one root key per subpage, e.g. `aboutUsPage`
    tradingPage.json  # Trading section: `tradingPage`, `openLiveAccountPage`, …
  ar/
    common.json
    homepage.json
    companyPage.json
```

Components keep using the same namespaces, e.g. `useTranslations('companyPage')` or `useTranslations('hero')`.

## Legacy single file

`messages/<locale>.json` still works. It is merged **under** folder bundles (folder overrides legacy for the same keys). Use this for languages that only override part of the site.

## Adding a new page or namespace

**Option A — flat keys (filename = namespace)** — e.g. `messages/en/adeela.json`:

```json
{
  "label1": "News 1",
  "label2": "News 2"
}
```

```jsx
const t = useTranslations('adeela'); // same as file name, without .json
t('label1'); // → "News 1"
```

**Option B — explicit wrapper**:

```json
{
  "adeela": {
    "label1": "News 1"
  }
}
```

Same `useTranslations('adeela')`.

Copy the file for other locales (`messages/ar/adeela.json`, etc.). Do not put flat keys in `common.json` / `homepage.json` (those files export many namespaces at once).

Files under `messages/en/` are read from disk on each request (no dev restart needed after adding a JSON file). Restart only if you change `loadMessages.js`.

## Rule: one file per menu section

Each parent page and all its subpages share one file (`companyPage.json`, `tradingPage.json`, …), with one top-level key per page. Shared content (header, menu, footer, risk warning, stats) lives in `common.json`. Never reuse a top-level key in two files.
