/**
 * Contract details for one symbol page, server side (cached with the page, see `revalidate` in the route).
 * Source: POST /trade/symbol_info (fetchSymbolInfo). The field names of that response are not documented,
 * so each value is looked up under the usual MT5 names and a few spellings; anything missing stays null
 * and the page shows "—". Nothing is guessed.
 *
 * Returns { contractSize, baseCurrency, profitCurrency, minLot, tickSize, valuePerPip, leverage, marginRate,
 *           swapLong, swapShort, tripleSwapDay (0 = Sunday … 6), digits } — all null when unknown.
 */
import { fetchSymbolInfo } from './symbols/gtcTraderSymbolsApi';

const TIMEOUT = 4000;
const withTimeout = (p) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), TIMEOUT))]);

const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');

/** first finite number found under any of the names */
function num(info, ...names) {
  for (const n of names) {
    const v = info[norm(n)];
    // "1:100" → 100, "100,000" → 100000
    const x = typeof v === 'string' ? Number(v.split(':').pop().replace(/[^0-9.eE+-]/g, '')) : Number(v);
    if (v !== undefined && v !== null && v !== '' && Number.isFinite(x)) return x;
  }
  return null;
}
function str(info, ...names) {
  for (const n of names) {
    const v = info[norm(n)];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

const DAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

export const EMPTY_SPEC = {
  contractSize: null, baseCurrency: null, profitCurrency: null, minLot: null, tickSize: null, valuePerPip: null,
  leverage: null, marginRate: null, swapLong: null, swapShort: null, tripleSwapDay: null, digits: null
};

export function mapSymbolInfo(raw) {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SPEC };
  const info = Object.fromEntries(Object.entries(raw).map(([k, v]) => [norm(k), v]));

  const digits = num(info, 'digits');
  const tickSize = num(info, 'point', 'tick_size', 'trade_tick_size') ?? (digits != null ? 10 ** -digits : null);
  const tickValue = num(info, 'trade_tick_value', 'tick_value', 'tickvalue');
  // a "pip" is 10 points on 5/3-decimal quotes, otherwise one point
  const pipInPoints = digits === 5 || digits === 3 ? 10 : 1;
  const valuePerPip = tickValue != null ? tickValue * pipInPoints : null;

  let marginRate = num(info, 'margin_rate', 'marginrate', 'margin_initial_rate', 'margin_percent');
  if (marginRate != null && marginRate > 1) marginRate /= 100; // given as a percentage
  let leverage = num(info, 'leverage', 'max_leverage');
  if (leverage == null && marginRate) leverage = Math.round(1 / marginRate);
  if (marginRate == null && leverage) marginRate = 1 / leverage;

  let triple = num(info, 'swap_rollover3days', 'swap3day', 'swap_3days', 'triple_swap_day');
  if (triple == null) {
    const d = str(info, 'swap_rollover3days', 'triple_swap_day', 'swap3day');
    if (d && DAYS[d.toLowerCase()] != null) triple = DAYS[d.toLowerCase()];
  }

  return {
    contractSize: num(info, 'contract_size', 'contractsize', 'trade_contract_size', 'contact_size', 'lot_size'),
    baseCurrency: str(info, 'currency_base', 'base_currency', 'currencybase'),
    profitCurrency: str(info, 'currency_profit', 'profit_currency', 'quote_currency'),
    minLot: num(info, 'volume_min', 'min_volume', 'min_lot', 'minvolume'),
    tickSize,
    valuePerPip,
    leverage,
    marginRate,
    swapLong: num(info, 'swap_long', 'swaplong', 'swap_buy'),
    swapShort: num(info, 'swap_short', 'swapshort', 'swap_sell'),
    tripleSwapDay: triple != null && triple >= 0 && triple <= 6 ? triple : null,
    digits
  };
}

export async function getSymbolSpec(symbol) {
  try {
    return mapSymbolInfo(await withTimeout(fetchSymbolInfo({ symbol })));
  } catch {
    return { ...EMPTY_SPEC };
  }
}
