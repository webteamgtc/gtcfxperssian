const EXCHANGE_NAME =
  process.env.NEXT_PUBLIC_SERVER_NAME || "GTCFX MT5 Live";

export function getQuotesWsUrl(loginId = "0") {
  const base =
    process.env.NEXT_PUBLIC_QUOTES_WS_URL ||
    "wss://apiv1.mygtc.app/ws?auth=1";

  const url = new URL(base);
  if (!url.searchParams.has("servername")) {
    url.searchParams.set("servername", EXCHANGE_NAME);
  }
  if (!url.searchParams.has("loginid")) {
    url.searchParams.set("loginid", String(loginId));
  }
  return url.toString();
}

/**
 * Parse a WebSocket tick line.
 * Example: "EURUSD 1.13941 1.13930 1782908808 1.14209 1.14225 1.13925 1.14211"
 * Fields: symbol, ask (buy), bid (sell), timestamp, dayHigh, dayOpen, dayLow, prevClose
 */
export function parseQuoteMessage(raw) {
  const line = String(raw).trim();
  if (!line || line.includes(";")) return null;

  const parts = line.split(/\s+/);
  if (parts.length < 3) return null;

  const [symbol, askStr, bidStr, ...rest] = parts;
  const ask = Number(askStr);
  const bid = Number(bidStr);

  if (!symbol || Number.isNaN(ask) || Number.isNaN(bid)) return null;

  return {
    symbol,
    ask,
    bid,
    timestamp: rest[0] != null ? Number(rest[0]) : undefined,
    dayHigh: rest[1] != null ? Number(rest[1]) : undefined,
    dayOpen: rest[2] != null ? Number(rest[2]) : undefined,
    dayLow: rest[3] != null ? Number(rest[3]) : undefined,
    prevClose: rest[4] != null ? Number(rest[4]) : undefined,
  };
}

export function formatQuotePrice(value, digits = 5) {
  if (value == null || Number.isNaN(value)) return "—";
  const d = Number(digits);
  if (Number.isFinite(d) && d >= 0) {
    return Number(value).toFixed(d);
  }
  const n = Number(value);
  if (n >= 1000) return n.toFixed(2);
  if (n >= 100) return n.toFixed(3);
  if (n >= 10) return n.toFixed(4);
  return n.toFixed(5);
}

export function formatSpreadFromPrices(sellNum, buyNum) {
  if (
    sellNum == null ||
    buyNum == null ||
    Number.isNaN(sellNum) ||
    Number.isNaN(buyNum)
  ) {
    return "—";
  }

  const diff = buyNum - sellNum;
  const mid = (sellNum + buyNum) / 2;

  if (mid < 50 && mid > 0.5) {
    return (diff * 10000).toFixed(1);
  }
  if (mid >= 1000) return diff.toFixed(2);
  if (mid >= 100) return diff.toFixed(3);
  return diff.toFixed(4);
}

export function mapWsTickToQuote(tick, digits = 5) {
  if (!tick) return null;

  const sellNum = tick.bid;
  const buyNum = tick.ask;

  return {
    sell: formatQuotePrice(sellNum, digits),
    buy: formatQuotePrice(buyNum, digits),
    sellNum,
    buyNum,
    spread: formatSpreadFromPrices(sellNum, buyNum),
    timestamp: tick.timestamp,
    dayHigh: tick.dayHigh,
    dayOpen: tick.dayOpen,
    dayLow: tick.dayLow,
    prevClose: tick.prevClose,
  };
}

class QuotesWsManager {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.quotes = {};
    this.subscribed = new Set();
    this.pendingSymbols = new Set();
    this.reconnectTimer = null;
    this.reconnectDelay = 2000;
  }

  /**
   * Subscribe a listener to a set of symbols. Several components can subscribe at once;
   * the socket is subscribed to the union of everyone's symbols.
   */
  subscribe(symbols, listener) {
    const own = new Set(symbols.filter(Boolean).map((s) => String(s).replace(/\//g, "")));
    this.listeners.set(listener, own);
    listener({ ...this.quotes });
    this.recomputeSymbols();
    this.ensureConnection();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.teardown();
      } else {
        this.recomputeSymbols();
      }
    };
  }

  recomputeSymbols() {
    const all = new Set();
    this.listeners.forEach((set) => set.forEach((s) => all.add(s)));
    this.pendingSymbols = all;
    this.syncSubscriptions();
  }

  ensureConnection() {
    if (typeof WebSocket === "undefined") return;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.syncSubscriptions();
      }
      return;
    }

    this.ws = new WebSocket(getQuotesWsUrl());

    this.ws.onopen = () => {
      this.reconnectDelay = 2000;
      this.syncSubscriptions();
    };

    this.ws.onmessage = (event) => {
      const tick = parseQuoteMessage(event.data);
      if (!tick) return;

      const quote = mapWsTickToQuote(tick);
      if (!quote) return;

      this.quotes[tick.symbol] = quote;
      this.notify();
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.subscribed.clear();
      if (this.listeners.size > 0) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
      this.ensureConnection();
    }, this.reconnectDelay);
  }

  syncSubscriptions() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const next = this.pendingSymbols;
    const toUnsub = [...this.subscribed].filter((s) => !next.has(s));
    const toSub = [...next].filter((s) => !this.subscribed.has(s));

    if (toUnsub.length) {
      this.ws.send(`unsub:${toUnsub.join(",")}`);
      toUnsub.forEach((s) => this.subscribed.delete(s));
    }

    if (toSub.length) {
      this.ws.send(`sub:${toSub.join(",")}`);
      toSub.forEach((s) => this.subscribed.add(s));
    }
  }

  notify() {
    const snapshot = { ...this.quotes };
    this.listeners.forEach((_, listener) => listener(snapshot));
  }

  teardown() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.subscribed.clear();
    this.pendingSymbols.clear();
    this.quotes = {};
    this.listeners.clear();
  }
}

export const quotesWsManager = new QuotesWsManager();
