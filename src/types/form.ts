import type { CountryCode } from '../config/countries'

export interface FormState {
  firstName: string
  lastName: string
  country: CountryCode | ''
  phone: string
  amount: string
}

export interface FormErrors {
  firstName?: string
  lastName?: string
  country?: string
  phone?: string
  amount?: string
}

export type SendStatus = 'idle' | 'sending' | 'success' | 'error'
