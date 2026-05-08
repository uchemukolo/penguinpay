/**
 * countries.ts
 *
 * Static configuration for the countries supported by PenguinPay.
 * Each entry defines the data needed to display the country in the UI,
 * validate the recipient's phone number, and look up the correct exchange rate.
 *
 * To add a new country: append an entry to COUNTRIES and extend CountryCode.
 */

export type CountryCode = 'KE' | 'NG' | 'TZ' | 'UG'

export interface Country {
  /** ISO 3166-1 alpha-2 country code */
  code: CountryCode
  name: string
  /** ISO 4217 currency code used to look up the exchange rate */
  currency: string
  /** International dialling prefix shown in the phone input, e.g. '+234' */
  phonePrefix: string
  /** Expected number of local digits after the prefix */
  phoneDigits: number
  /** Emoji flag for display in the country selector */
  flag: string
}

/** All countries available as transfer destinations */
export const COUNTRIES: Country[] = [
  { code: 'KE', name: 'Kenya',    currency: 'KES', phonePrefix: '+254', phoneDigits: 9, flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria',  currency: 'NGN', phonePrefix: '+234', phoneDigits: 7, flag: '🇳🇬' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', phonePrefix: '+255', phoneDigits: 9, flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda',   currency: 'UGX', phonePrefix: '+256', phoneDigits: 7, flag: '🇺🇬' },
]

/**
 * Looks up a country by its code.
 * The non-null assertion is safe as long as only valid CountryCodes are passed.
 */
export const getCountry = (code: CountryCode): Country =>
  COUNTRIES.find((c) => c.code === code)!
