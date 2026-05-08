/**
 * exchangeRate.ts
 *
 * Handles fetching and caching live USD exchange rates from openexchangerates.org.
 * The free plan uses USD as the base currency, so all conversions follow:
 *   amount_usd * rate = local_currency_amount
 *
 * When no API key is configured (e.g. in local dev without a .env file),
 * the service falls back to hardcoded mock rates so the UI still works.
 */

const API_KEY = import.meta.env.VITE_OPEN_EXCHANGE_APP_ID || ''
const BASE_URL = 'https://openexchangerates.org/api'

/** Map of currency code → units per 1 USD, e.g. { NGN: 1580, KES: 129.5 } */
export interface ExchangeRates {
  [currency: string]: number
}

export interface RatesResult {
  rates: ExchangeRates
  /** Unix timestamp (ms) of when the rates were fetched */
  fetchedAt: number
  /** True when falling back to mock data (no API key configured) */
  isMock: boolean
}

// Module-level cache so repeated calls within the TTL window skip the network
let cache: RatesResult | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches the latest USD-based exchange rates from openexchangerates.org.
 * Results are cached in memory for 5 minutes to avoid redundant API calls.
 * Falls back to static mock rates when VITE_OPEN_EXCHANGE_APP_ID is not set.
 */
export const fetchRates = async (): Promise<RatesResult> => {
  // Return cached rates if still within the TTL window
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache
  }

  if (!API_KEY) {
    // No API key — use hardcoded rates so the UI remains functional
    cache = {
      rates: { KES: 129.5, NGN: 1580.0, TZS: 2680.0, UGX: 3730.0 },
      fetchedAt: Date.now(),
      isMock: true,
    }
    return cache
  }

  const response = await fetch(`${BASE_URL}/latest.json?app_id=${API_KEY}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.status}`)
  }

  const data = await response.json()
  cache = {
    rates: data.rates as ExchangeRates,
    fetchedAt: Date.now(),
    isMock: false,
  }
  return cache
}

/**
 * Looks up the exchange rate for a given currency.
 * Throws if the currency is not present in the rates map.
 */
export const getRate = (currency: string, rates: ExchangeRates): number => {
  const rate = rates[currency]
  if (!rate) throw new Error(`No rate found for ${currency}`)
  return rate
}

/**
 * Converts a USD amount to the equivalent local currency amount.
 * Uses the live rate from the provided rates map.
 */
export const convertUSDToLocal = (amountUSD: number, currency: string, rates: ExchangeRates): number => {
  return amountUSD * getRate(currency, rates)
}

/**
 * Formats a local currency amount as a human-readable string.
 * e.g. formatLocalAmount(1580, 'NGN') → '1,580.00 NGN'
 */
export const formatLocalAmount = (amount: number, currency: string): string => {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}
