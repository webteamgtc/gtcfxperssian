/**
 * Sample articles used until Strapi is connected (STRAPI_URL not set) or when the request fails.
 * Shape = the *normalised* article (see src/lib/news.js → normaliseArticle).
 * Titles taken from the current gtcfx.com news feed; images are left empty on purpose
 * (the UI draws a branded cover when an article has none). Replace by connecting Strapi.
 */
export const SAMPLE_NEWS = [
  {
    id: 'forex-withdrawal-gtc-go',
    slug: 'how-to-make-a-forex-withdrawal-on-gtc-go',
    title: 'How to Make a Forex Withdrawal on GTC Go (GTCFX Guide)',
    excerpt: "GTC Go is GTCFX's mobile trading app, giving traders quick access to accounts, markets, and fund management. As a regulated forex broker, GTCFX aims to make every forex withdrawal on GTC Go simple and secure.",
    category: 'Guides',
    publishedAt: '2026-10-15',
    cover: null
  },
  {
    id: 'deposit-money-gtcfx',
    slug: 'how-to-deposit-money-into-gtcfx',
    title: 'How to Deposit Money into GTCFX: A Step-by-Step Guide',
    excerpt: 'Every way to fund your GTCFX account, from cards and bank transfer to e-wallets and crypto, and how long each one takes.',
    category: 'Guides',
    publishedAt: '2026-10-13',
    cover: null
  },
  {
    id: 'when-does-forex-market-open',
    slug: 'when-does-forex-market-open',
    title: 'When Does the Forex Market Open? (2026 Update)',
    excerpt: 'Session times for Sydney, Tokyo, London and New York, the overlaps that bring the most liquidity, and how holidays change them.',
    category: 'Market hours',
    publishedAt: '2026-10-10',
    cover: null
  },
  {
    id: 'best-forex-indicators',
    slug: '10-best-forex-trading-indicators',
    title: '10 Best Forex Trading Indicators and How to Use Them',
    excerpt: 'Moving averages, RSI, MACD, Bollinger Bands and more: what each indicator measures and when it helps.',
    category: 'Education',
    publishedAt: '2026-10-08',
    cover: null
  },
  {
    id: 'strongest-currency',
    slug: 'what-is-the-strongest-currency-in-the-world',
    title: 'What Is the Strongest Currency in the World?',
    excerpt: 'Why the Kuwaiti dinar tops the list, what “strong” really means for a currency, and what it means for traders.',
    category: 'Education',
    publishedAt: '2026-10-06',
    cover: null
  }
];
