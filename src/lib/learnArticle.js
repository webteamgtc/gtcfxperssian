/**
 * Parses the Strapi lesson template (`<div class="gtc-blog">` … gtc-hero, gtc-toc, gtc-section, gtc-summary,
 * gtc-faq, gtc-risk) into data the theme renders with its own components. Section bodies stay HTML
 * (notes, card grids, tables… styled by `.learn-article` in globals.css) after cleaning.
 *
 * Returns null when the HTML doesn't follow the template — callers then render the cleaned HTML as-is.
 * No DOM on the server, so this walks balanced tags of the (machine-generated, consistent) template.
 */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…' };

export function decode(s) {
  return String(s ?? '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Plain text of an HTML fragment (tags removed, entities decoded, whitespace collapsed). */
export function text(html) {
  return decode(String(html ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Leading emoji / symbols ("⏰  12 min read", "🔖 Summary") → plain label. */
const stripSymbols = (s) => s.replace(/^[^\p{L}\p{N}]+/u, '').trim();

/** Remove scripts, styles, external links, inline styles/handlers, comments and javascript: URLs. */
// `keepStyles`: keep inline style="" (designed CMS layouts, e.g. GTC News posts); handlers / scripts still go.
export function cleanHtml(html, { keepStyles = false } = {}) {
  const attrs = keepStyles ? /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi : /\s(?:on[a-z]+|style)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
  return String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<(iframe|object|embed)(?![^>]*\b(?:youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\b)[\s\S]*?(?:<\/\1>|\/>)/gi, '')
    .replace(attrs, '')
    .replace(/url\(\s*(["']?)\s*javascript:[^)]*\)/gi, 'none')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .trim();
}

/* ------------------------------------------------------------ balanced-tag walker */

const OPEN = /<([a-z][a-z0-9]*)\b([^>]*)>/gi;
const VOID = new Set(['br', 'hr', 'img', 'input', 'link', 'meta', 'source', 'wbr']);

const classesOf = (attrs) => (/\bclass\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] ?? '').split(/\s+/).filter(Boolean);
const attrOf = (attrs, name) => new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(attrs)?.[1] ?? '';

/** Element opening at `start` → { tag, attrs, classes, inner, end } (end = index after its closing tag). */
function elementAt(html, start) {
  OPEN.lastIndex = start;
  const m = OPEN.exec(html);
  if (!m || m.index !== start) return null;
  const tag = m[1].toLowerCase();
  const attrs = m[2];
  const bodyStart = m.index + m[0].length;
  if (VOID.has(tag) || attrs.trim().endsWith('/')) return { tag, attrs, classes: classesOf(attrs), inner: '', end: bodyStart };
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = bodyStart;
  let depth = 1;
  let t;
  while ((t = re.exec(html))) {
    depth += t[1] ? -1 : 1;
    if (!depth) return { tag, attrs, classes: classesOf(attrs), inner: html.slice(bodyStart, t.index), end: t.index + t[0].length };
  }
  return { tag, attrs, classes: classesOf(attrs), inner: html.slice(bodyStart), end: html.length };
}

/** Top-level child elements of an HTML fragment (text between them is ignored). */
function children(html) {
  const out = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt < 0) break;
    if (html.startsWith('<!--', lt)) {
      const c = html.indexOf('-->', lt);
      i = c < 0 ? html.length : c + 3;
      continue;
    }
    const el = html[lt + 1] === '/' ? null : elementAt(html, lt);
    if (!el) {
      i = lt + 1;
      continue;
    }
    out.push(el);
    i = el.end;
  }
  return out;
}

/** First element with class `cls` at or after index `from` (searches the whole fragment). */
function find(html, cls, from = 0) {
  if (!html) return null;
  const re = new RegExp(`<[a-z][a-z0-9]*\\b[^>]*\\bclass\\s*=\\s*"[^"]*${cls}[^"]*"[^>]*>`, 'gi');
  re.lastIndex = from;
  let m;
  while ((m = re.exec(html))) {
    const el = elementAt(html, m.index);
    if (el?.classes.includes(cls)) return el;
  }
  return null;
}

/** Every element with class `cls`, in order (nested matches inside a match are skipped). */
function findAll(html, cls) {
  const out = [];
  for (let el = find(html, cls); el; el = find(html, cls, el.end)) out.push(el);
  return out;
}

const firstTag = (html, tag) => children(html).find((c) => c.tag === tag) ?? null;
const paragraphs = (html) => {
  const ps = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => text(m[1])).filter(Boolean);
  return ps.length ? ps : [text(html)].filter(Boolean);
};
const safeId = (id) => String(id ?? '').replace(/[^a-z0-9_-]/gi, '');

/** Section body: the element's children minus the eyebrow row and the first h2. */
function sectionBody(inner) {
  let droppedH2 = false;
  return cleanHtml(
    children(inner)
      .filter((c) => {
        if (c.classes.includes('gtc-eyebrow')) return false;
        if (c.tag === 'h2' && !droppedH2) return !(droppedH2 = true);
        return true;
      })
      .map((c) => `<${c.tag}${c.attrs}>${c.inner}${VOID.has(c.tag) ? '' : `</${c.tag}>`}`)
      .join('\n')
  );
}

/* ------------------------------------------------------------ parse */

/**
 * → { hero: { badge, eyebrow, title, description, pills[] },
 *     toc: { label, title, items: [{ id, num, label }] },
 *     blocks: [ { type: 'intro', html } | { type: 'section', id, num, title, html }
 *             | { type: 'summary', id, title, html } | { type: 'faq', id, num, title, items: [{ q, a[] }] }
 *             | { type: 'risk', title, paragraphs[] } ] }
 */
export function parseLesson(html) {
  const root = find(String(html ?? ''), 'gtc-blog');
  if (!root) return null;

  const heroEl = find(root.inner, 'gtc-hero');
  const h1 = heroEl && firstTag(heroEl.inner, 'h1');
  const hero = heroEl && {
    badge: stripSymbols(text(find(heroEl.inner, 'gtc-badge')?.inner)),
    eyebrow: text(find(heroEl.inner, 'gtc-hero-eyebrow')?.inner),
    // "<h1>What Are the Key Risks of<br><span>CFD Trading?</span></h1>" → "What Are the Key Risks of [CFD Trading?]"
    title: h1 ? text(h1.inner.replace(/<span\b[^>]*>([\s\S]*?)<\/span>/i, (_, s) => `[${text(s)}]`)) : '',
    description: text(find(heroEl.inner, 'gtc-hero-desc')?.inner),
    pills: findAll(heroEl.inner, 'gtc-pill').map((p) => stripSymbols(text(p.inner))).filter(Boolean)
  };

  const tocEl = find(root.inner, 'gtc-toc');
  const toc = tocEl && {
    label: text(find(tocEl.inner, 'gtc-toc-label')?.inner),
    title: text(find(tocEl.inner, 'gtc-toc-title')?.inner),
    items: [...tocEl.inner.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
      .map(([, attrs, inner]) => ({
        id: safeId(attrOf(attrs, 'href').replace(/^#/, '')),
        num: text(find(inner, 'gtc-toc-num')?.inner),
        label: text(inner.replace(/<span\b[^>]*class="[^"]*gtc-toc-(?:num|arrow)[^"]*"[^>]*>[\s\S]*?<\/span>/gi, ''))
      }))
      .filter((it) => it.id && it.label)
  };

  const blocks = [];
  for (const el of children(root.inner)) {
    const c = el.classes;
    const id = safeId(attrOf(el.attrs, 'id'));
    if (c.includes('gtc-faq')) {
      blocks.push({
        type: 'faq',
        id,
        num: text(find(el.inner, 'gtc-sec-num')?.inner),
        title: text(firstTag(el.inner, 'h2')?.inner),
        items: findAll(el.inner, 'gtc-faq-item')
          .map((d) => ({ q: text(firstTag(d.inner, 'summary')?.inner), a: paragraphs(find(d.inner, 'gtc-faq-body')?.inner ?? '') }))
          .filter((it) => it.q)
      });
    } else if (c.includes('gtc-section')) {
      const title = text(firstTag(el.inner, 'h2')?.inner);
      const body = sectionBody(el.inner);
      if (title) blocks.push({ type: 'section', id, num: text(find(el.inner, 'gtc-sec-num')?.inner), title, html: body });
      else if (body) blocks.push({ type: 'intro', html: body });
    } else if (c.includes('gtc-summary')) {
      blocks.push({ type: 'summary', id, title: stripSymbols(text(firstTag(el.inner, 'h2')?.inner)), html: sectionBody(el.inner) });
    } else if (c.includes('gtc-risk')) {
      const head = find(el.inner, 'gtc-risk-head');
      blocks.push({ type: 'risk', title: text(head && firstTag(head.inner, 'h2')?.inner), paragraphs: paragraphs(find(el.inner, 'gtc-risk-body')?.inner ?? '') });
    }
  }

  if (!blocks.some((b) => b.type === 'section')) return null;
  return { hero: hero ?? null, toc: toc?.items.length ? toc : null, blocks };
}
