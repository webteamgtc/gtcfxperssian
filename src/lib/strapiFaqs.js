import { fetchStrapiCollection, mapStrapiLocale } from "@/lib/strapi";

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "br",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "u",
  "ul",
]);

function isSafeHref(href) {
  if (!href || typeof href !== "string") return false;
  const value = href.trim();
  if (!value) return false;
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value);
}

/**
 * Keep safe rich-text tags (especially links) from Strapi CKEditor HTML.
 * Strips scripts/styles and disallows unsafe href protocols.
 */
function sanitizeFaqHtml(html, maxLen = 20000) {
  if (!html) return "";

  let input = html;
  if (typeof input !== "string") {
    // Strapi sometimes returns blocks/objects; fall back to stringified content.
    if (Array.isArray(input)) {
      input = input
        .map((block) => {
          if (typeof block === "string") return block;
          if (block?.type === "paragraph" && Array.isArray(block.children)) {
            return `<p>${block.children
              .map((child) => {
                const text = child?.text ?? "";
                if (child?.type === "link" && child.url) {
                  return `<a href="${child.url}">${text}</a>`;
                }
                return text;
              })
              .join("")}</p>`;
          }
          return block?.children?.map?.((c) => c?.text ?? "").join("") ?? "";
        })
        .join("");
    } else {
      input = String(input);
    }
  }

  let cleaned = input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(?:iframe|object|embed|form|input|button|svg|img|video|audio)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "");

  // Rebuild allowed tags only.
  cleaned = cleaned.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, rawTag, rawAttrs) => {
    const tag = String(rawTag || "").toLowerCase();
    const isClosing = /^<\//.test(full);

    if (!ALLOWED_TAGS.has(tag)) return "";

    if (isClosing) return `</${tag}>`;
    if (tag === "br") return "<br />";

    if (tag === "a") {
      const hrefMatch = String(rawAttrs || "").match(/\bhref\s*=\s*(['"])(.*?)\1/i);
      const href = hrefMatch?.[2]?.trim() || "";
      if (!isSafeHref(href)) return "";

      const isExternal = /^https?:\/\//i.test(href);
      const rel = isExternal || href.startsWith("mailto:") || href.startsWith("tel:")
        ? ' rel="noopener noreferrer"'
        : "";
      const target = isExternal ? ' target="_blank"' : "";
      return `<a href="${href}"${target}${rel}>`;
    }

    return `<${tag}>`;
  });

  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

function unwrapEntry(entry) {
  if (!entry) return null;
  const id = entry.id ?? entry.documentId ?? entry.attributes?.id;
  const attrs = entry.attributes ?? entry;
  return { id, ...attrs };
}

function unwrapRelation(node) {
  if (!node) return null;
  if (Array.isArray(node)) return unwrapEntry(node[0]);
  if (node.data != null) {
    const data = node.data;
    if (Array.isArray(data)) return unwrapEntry(data[0]);
    return unwrapEntry(data);
  }
  return unwrapEntry(node);
}

function pickCategoryFromFaq(faq) {
  return (
    unwrapRelation(faq.faqs_category) ||
    unwrapRelation(faq.faq_category) ||
    unwrapRelation(faq.category) ||
    unwrapRelation(faq.faqs_categories)
  );
}

function normalizeCategory(entry) {
  const item = unwrapEntry(entry);
  if (!item) return null;

  const label =
    item.name ||
    item.title ||
    item.label ||
    item.categoryName ||
    "";

  if (!label.trim()) return null;

  return {
    id: String(item.id),
    label: label.trim(),
    slug: item.slug || String(item.id),
    sortOrder: Number(item.sortOrder ?? item.order ?? item.rank ?? 0),
  };
}

function normalizeFaq(entry) {
  const item = unwrapEntry(entry);
  if (!item) return null;

  const category = pickCategoryFromFaq(item);
  const question = (item.question || item.title || "").trim();
  const answer = sanitizeFaqHtml(
    item.answer || item.content || item.description || item.body || ""
  );

  if (!question) return null;

  const categoryId =
    category?.id != null
      ? String(category.id)
      : item.faqs_category?.id != null
        ? String(item.faqs_category.id)
        : item.category?.id != null
          ? String(item.category.id)
          : null;

  return {
    id: String(item.id ?? question),
    question,
    answer,
    categoryId,
    sortOrder: Number(item.sortOrder ?? item.order ?? item.rank ?? 0),
  };
}

async function tryFetchCollection(collection, locale, extraParams = {}) {
  const mappedLocale = mapStrapiLocale(locale);
  const locales = mappedLocale === "en" ? ["en"] : [mappedLocale, "en"];

  for (const loc of locales) {
    try {
      const res = await fetchStrapiCollection(collection, {
        locale: loc,
        populate: null,
        sort: null,
        params: {
          "pagination[limit]": 500,
          ...extraParams,
        },
        cache: "no-store",
      });

      if (Array.isArray(res?.data) && res.data.length > 0) {
        return { data: res.data, locale: loc };
      }
    } catch (error) {
      console.error(
        `[strapiFaqs] ${collection} fetch failed (${loc}):`,
        error?.message || error
      );
    }
  }

  return { data: [], locale: mappedLocale };
}

export async function fetchFaqCategories(locale) {
  const { data } = await tryFetchCollection("faqs-categories", locale);
  return data
    .map(normalizeCategory)
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function fetchFaqs(locale) {
  const populateAttempts = [
    {
      "populate[faqs_category][fields][0]": "name",
      "populate[faqs_category][fields][1]": "slug",
    },
    {
      "populate[category][fields][0]": "name",
      "populate[category][fields][1]": "slug",
    },
    { populate: "*" },
    {},
  ];

  const mappedLocale = mapStrapiLocale(locale);
  const locales = mappedLocale === "en" ? ["en"] : [mappedLocale, "en"];

  for (const loc of locales) {
    for (const params of populateAttempts) {
      try {
        const res = await fetchStrapiCollection("faqs", {
          locale: loc,
          populate: null,
          sort: null,
          params: {
            "pagination[limit]": 500,
            ...params,
          },
          cache: "no-store",
        });

        const faqs = (res?.data ?? []).map(normalizeFaq).filter(Boolean);
        if (faqs.length > 0) {
          return faqs.sort((a, b) => a.question.localeCompare(b.question));
        }
      } catch (error) {
        console.error(
          `[strapiFaqs] faqs fetch failed (${loc}):`,
          error?.message || error
        );
      }
    }
  }

  return [];
}

/**
 * @returns {Promise<{ key: string, label: string, count: number, questions: { question: string, answer: string }[] }[]>}
 */
export async function fetchFaqQuestionGroups(locale) {
  const [categories, faqs] = await Promise.all([
    fetchFaqCategories(locale),
    fetchFaqs(locale),
  ]);

  const faqsByCategory = new Map();
  for (const faq of faqs) {
    const bucketId = faq.categoryId || "uncategorized";
    if (!faqsByCategory.has(bucketId)) {
      faqsByCategory.set(bucketId, []);
    }
    faqsByCategory.get(bucketId).push({
      question: faq.question,
      answer: faq.answer,
    });
  }

  if (categories.length > 0) {
    return categories
      .map((category) => {
        const questions = faqsByCategory.get(category.id) ?? [];
        return {
          key: category.slug,
          label: category.label,
          count: questions.length,
          questions,
        };
      })
      .filter((group) => group.questions.length > 0);
  }

  return [...faqsByCategory.entries()].map(([categoryId, questions]) => ({
    key: categoryId,
    label: "FAQs",
    count: questions.length,
    questions,
  }));
}
