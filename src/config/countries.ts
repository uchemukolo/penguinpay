export type CountryCode = 'KE' | 'NG' | 'TZ' | 'UG'

export interface Country {
  code: CountryCode
  name: string
  currency: string
  phonePrefix: string
  phoneDigits: number
  flag: string
}

/** All countries available as transfer destinations */
export const COUNTRIES: Country[] = [
  { code: 'KE', name: 'Kenya',    currency: 'KES', phonePrefix: '+254', phoneDigits: 9, flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria',  currency: 'NGN', phonePrefix: '+234', phoneDigits: 7, flag: '🇳🇬' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', phonePrefix: '+255', phoneDigits: 9, flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda',   currency: 'UGX', phonePrefix: '+256', phoneDigits: 7, flag: '🇺🇬' },
]

// Looks up a country by its code.
export const getCountry = (code: CountryCode): Country =>
  COUNTRIES.find((c) => c.code === code)!
