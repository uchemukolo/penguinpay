import { getCountry } from '../config/countries'
import type { CountryCode } from '../config/countries'
import type { FormState, FormErrors } from '../types/form'

/**
 * Validates the phone number based on the selected country's requirements.
 * Strips non-digit characters and checks if the remaining digits match the expected count.
 */
export const validatePhone = (phone: string, countryCode: CountryCode): boolean => {
  const country = getCountry(countryCode)
  const digits = phone.replace(/\D/g, '')
  return digits.length === country.phoneDigits
}

/**
 * Validates the amount field to ensure it's a positive whole number.
 */
export const validateAmount = (amount: string): boolean => {
  if (!amount) return false
  const num = Number(amount)
  return Number.isInteger(num) && num > 0
}

/**
 * Validates the entire form and returns an object containing error messages for any invalid fields.
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
