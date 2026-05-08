/**
 * validation.ts
 *
 * Pure validation helpers for the send money form.
 * All functions are side-effect free and return simple booleans or error maps,
 * making them straightforward to unit test.
 */

import { getCountry } from '../config/countries'
import type { CountryCode } from '../config/countries'
import type { FormState, FormErrors } from '../types/form'

/**
 * Validates that a phone number has the correct digit count for the given country.
 * Non-digit characters are stripped before checking, so formatted input is accepted.
 */
export const validatePhone = (phone: string, countryCode: CountryCode): boolean => {
  const country = getCountry(countryCode)
  const digits = phone.replace(/\D/g, '')
  return digits.length === country.phoneDigits
}

/**
 * Validates the send amount.
 * Must be a positive whole number — fractional cents are not supported.
 */
export const validateAmount = (amount: string): boolean => {
  if (!amount) return false
  const num = Number(amount)
  return Number.isInteger(num) && num > 0
}

/**
 * Runs all field validations against the current form state.
 * Returns an object containing an error message for each invalid field.
 * An empty object means the form is valid and ready to submit.
 */
export const validateForm = (form: FormState): FormErrors => {
  const errors: FormErrors = {}

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!form.country) {
    errors.country = 'Please select a country'
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (form.country && !validatePhone(form.phone, form.country as CountryCode)) {
    // Show the expected format so the user knows exactly what to fix
    const country = getCountry(form.country as CountryCode)
    errors.phone = `Must be ${country.phoneDigits} digits after ${country.phonePrefix}`
  }

  if (!form.amount) {
    errors.amount = 'Amount is required'
  } else if (!validateAmount(form.amount)) {
    errors.amount = 'Enter a whole number greater than 0'
  }

  return errors
}
