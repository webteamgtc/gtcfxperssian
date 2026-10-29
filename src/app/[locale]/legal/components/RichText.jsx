/**
 * Plain document text → React: blank lines become paragraphs, **bold** is supported,
 * and URLs / e-mail addresses become links.
 */
const INLINE = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+[^\s).,;:]|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;

function inline(text) {
  return String(text)
    .split(INLINE)
    .map((part, i) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
      if (/^https?:\/\//.test(part))
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">
            {part}
          </a>
        );
      if (/^[\w.+-]+@[\w-]+\.[\w.-]*\w$/.test(part))
        return (
          <a key={i} href={`mailto:${part}`} className="font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">
            {part}
          </a>
        );
      return part;
    });
}

export function RichText({ text, className }) {
  const paras = String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length <= 1) return <p className={className}>{inline(paras[0] ?? '')}</p>;
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i} className={i ? 'mt-3' : undefined}>
          {inline(p)}
        </p>
      ))}
    </div>
  );
}

const ACRONYMS = new Set(['aml', 'cfd', 'cfds', 'eu', 'gtc', 'gtcfx', 'id', 'kyc', 'mt4', 'mt5', 'otp', 'pep', 'peps', 'uae', 'uk', 'us', 'usa', 'vps']);
const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);

/** "COMPANY, CONTROLLER AND SCOPE" → "Company, Controller and Scope" (only for all-caps Latin titles). */
export function tidyTitle(title) {
  const s = String(title ?? '').trim();
  if (!/[A-Z]/.test(s) || s !== s.toUpperCase()) return s;
  return s
    .toLowerCase()
    .split(' ')
    .map((w, i) => {
      if (ACRONYMS.has(w.replace(/\W/g, ''))) return w.toUpperCase();
      return i > 0 && SMALL.has(w) ? w : w.replace(/^(\W*)(\w)/, (_, p, c) => p + c.toUpperCase());
    })
    .join(' ');
}
