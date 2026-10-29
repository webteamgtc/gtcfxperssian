/**
 * Stand-in posts for the static review-link build only (it has no Strapi access).
 * Never used on the live site: page.jsx / TrendsSection read this only when STATIC_EXPORT is on.
 */
const CATS = [
  { slug: 'market-daily-updates', name: 'Daily Market Update' },
  { slug: 'blogs', name: 'Blogs' },
  { slug: 'company-news', name: 'Company News' },
  { slug: 'technical-analysis', name: 'Technical Analysis' }
];

const POSTS = {
  'market-daily-updates': [
    ['Gold holds near record highs as traders weigh Fed signals', 'Spot gold stays firm while the dollar softens ahead of this week’s US inflation data and central bank commentary.'],
    ['EUR/USD edges higher on soft US jobs data', 'The euro gains as weaker payrolls revive rate-cut bets; traders now look to ECB speakers for direction.'],
    ['Oil steadies after OPEC+ keeps output plan unchanged', 'Brent and WTI trade in a tight range as supply worries balance a cautious demand outlook.'],
    ['US indices mixed as tech earnings season begins', 'Nasdaq futures lead while Dow futures lag; results from the big tech names set the tone for the week.'],
    ['Yen strengthens as BoJ hints at policy shift', 'USD/JPY slips from recent highs as comments from Bank of Japan officials lift rate-hike expectations.'],
    ['GBP/USD looks to UK CPI for the next move', 'Sterling trades cautiously ahead of inflation figures that could reshape Bank of England expectations.']
  ],
  blogs: [
    ['How to make a forex withdrawal on GTC Go', 'A step-by-step guide to withdrawing funds from your GTCFX account using the GTC Go mobile app.'],
    ['When does the forex market open? (2026 update)', 'Session times for Sydney, Tokyo, London and New York, and the overlaps that bring the most liquidity.'],
    ['What is a swap-free account and who is it for?', 'How swap-free trading works, what it costs, and how to request it on your GTCFX account.'],
    ['Risk management basics every trader should know', 'Position sizing, stop-losses and leverage explained in plain language, with simple worked examples.'],
    ['MT4 vs MT5: which platform suits you?', 'Compare the two MetaTrader platforms on markets, tools, order types and back-testing.'],
    ['How to read a candlestick chart', 'Bodies, wicks and the common patterns traders watch, explained for beginners.']
  ],
  'company-news': [
    ['GTCFX wins Best Multi-Asset Broker 2025', 'GTCFX has been named Best Multi-Asset Broker, recognising its trading conditions and client service.', '/awards/26.webp'],
    ['GTCFX at the Golden Falcon Awards 2025', 'Highlights from the night that celebrated the region’s leading financial brands.', '/awards/40.webp'],
    ['GTC Go app adds new charting tools', 'The latest GTC Go update brings new indicators, drawing tools and faster order entry.'],
    ['GTCFX expands its global presence', 'New offices strengthen local support for clients across key regions.', '/awards/22.webp'],
    ['GTCFX recognised for client fund security', 'An award recognising GTCFX’s segregated client funds and compensation fund cover.', '/awards/6.webp'],
    ['Meet the GTCFX team at the Money Expo', 'Visit our stand to talk to the team and see GTC Go in action.']
  ],
  'technical-analysis': [
    ['XAU/USD: key levels to watch this week', 'Gold tests resistance after a strong rally; we map the support and resistance zones in play.'],
    ['EUR/USD forms a rising wedge on the daily chart', 'What the pattern could mean for the pair and the levels that would confirm or cancel it.']
  ]
};

const iso = (n) => new Date(Date.UTC(2026, 9, 26 - n)).toISOString().slice(0, 10);
const label = (d) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));

export const PREVIEW_CATEGORIES = CATS;

export function previewArticles(slug, size = 6) {
  const cat = CATS.find((c) => c.slug === slug);
  return (POSTS[slug] ?? []).slice(0, size).map(([title, excerpt, img], i) => {
    const d = iso(i * 2 + CATS.indexOf(cat));
    const s = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return {
      id: `${slug}-${i}`,
      slug: s,
      title,
      excerpt,
      category: cat?.name ?? '',
      categorySlug: slug,
      author: 'GTCFX',
      publishedAt: d,
      dateLabel: label(d),
      cover: img ? { url: img, alt: title, width: 800, height: 800 } : null,
      href: `/gtc-news/${slug}/${s}`
    };
  });
}

export const PREVIEW_FEATURED = {
  ...previewArticles('company-news', 2)[1],
  category: 'Event',
  categorySlug: 'event',
  title: 'GTCFX shines at the Golden Falcon Awards 2025',
  excerpt:
    'GTCFX joined the region’s leading financial brands at the Golden Falcon Awards 2025 in Dubai, where the team collected awards recognising its trading platforms, client service and growth across the Middle East. Here is a look back at the night.'
};

/** Stand-in article for the review link's sample article page (scripts/preview-routes, export only). */
export const PREVIEW_ARTICLE = {
  ...previewArticles('blogs', 1)[0],
  title: 'How to make a forex withdrawal on GTC Go',
  excerpt: 'A step-by-step guide to withdrawing funds from your GTCFX account using the GTC Go mobile app, and how long each method takes.',
  cover: { url: '/awards/40.webp', alt: 'GTC Go', width: 1200, height: 800 },
  lesson: null,
  html: `<p>GTC Go is GTCFX's mobile trading app. It gives you quick access to your accounts, the markets and your funds, so you can move money in and out wherever you are. This guide walks through a withdrawal from start to finish.</p>
<h2>Before you start</h2>
<p>Make sure your account is fully verified. Withdrawals go back to the same method you used to deposit wherever possible, which keeps your funds safe and helps us meet anti-money-laundering rules.</p>
<ul><li>Your identity and address documents are approved.</li><li>You have no open positions using the margin you want to withdraw.</li><li>You know which payment method you deposited with.</li></ul>
<h2>Step-by-step withdrawal</h2>
<p>Open GTC Go and sign in. Tap <strong>Funds</strong>, then <strong>Withdraw</strong>. Choose the trading account, pick the payment method and enter the amount. Check the details and confirm with the code we send to you.</p>
<blockquote>Tip: withdrawals requested on a working day are usually processed the same day.</blockquote>
<h2>How long does it take?</h2>
<p>Card and e-wallet withdrawals usually arrive within one working day after processing. Bank transfers can take two to five working days depending on your bank and country.</p>
<h3>Need help?</h3>
<p>Our support team is available 24/7 on live chat and by email if anything looks unusual or a withdrawal takes longer than expected.</p>`
};
