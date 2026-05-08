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

export interface ExchangeRates {
  [currency: string]: number
}

export interface RatesResult {
  rates: ExchangeRates
  fetchedAt: number
  isMock: boolean
}

// In-memory cache for the latest fetched rates, along with a timestamp and a flag indicating if they are mock rates.
let cache: RatesResult | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches the latest exchange rates from the API, or returns cached rates if they are still valid.
 * If no API key is configured, returns hardcoded mock rates.
 * Throws an error if the API request fails.
 */
export const fetchRates = async (): Promise<RatesResult> => {
  // Return cached rates if they are still valid
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache
  }

  if (!API_KEY) {
    // No API key configured, return hardcoded mock rates for the supported currencies
    cache = {
      rates: 
      { KES: 129.5,
        NGN: 1580.0,
        TZS: 2680.0,
        UGX: 3730.0
      },
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
 * Looks up the exchange rate for a given currency code in the provided rates map.
 * Throws an error if the currency code is not found.
 */
export const getRate = (currency: string, rates: ExchangeRates): number => {
  const rate = rates[currency]
  if (!rate) throw new Error(`No rate found for ${currency}`)
  return rate
}

/**
 * Converts a USD amount to the local currency using the provided exchange rates.
 * Throws an error if the currency code is not found in the rates.
 */
export const convertUSDToLocal = (amountUSD: number, currency: string, rates: ExchangeRates): number => {
  return amountUSD * getRate(currency, rates)
}

/**
 * Formats a local currency amount for display, e.g. "1,234.56 KES".
 */
export const formatLocalAmount = (amount: number, currency: string): string => {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}
