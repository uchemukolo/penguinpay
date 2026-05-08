import { describe, it, expect } from 'vitest'
import { validatePhone, validateAmount, validateForm } from '../utils/validation'
import { convertUSDToLocal, formatLocalAmount } from '../services/exchangeRate'

// --- validatePhone ---
describe('validatePhone', () => {
  it('accepts 9 digits for Kenya', () => {
    expect(validatePhone('712345678', 'KE')).toBe(true)
  })

  it('rejects 8 digits for Kenya', () => {
    expect(validatePhone('71234567', 'KE')).toBe(false)
  })

  it('accepts 7 digits for Nigeria', () => {
    expect(validatePhone('8012345', 'NG')).toBe(true)
  })

  it('rejects 6 digits for Nigeria', () => {
    expect(validatePhone('801234', 'NG')).toBe(false)
  })

  it('accepts 9 digits for Tanzania', () => {
    expect(validatePhone('712345678', 'TZ')).toBe(true)
  })

  it('accepts 7 digits for Uganda', () => {
    expect(validatePhone('7123456', 'UG')).toBe(true)
  })

  it('strips non-numeric characters before counting', () => {
    expect(validatePhone('712-345-678', 'KE')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validatePhone('', 'KE')).toBe(false)
  })
})

// --- validateAmount ---
describe('validateAmount', () => {
  it('accepts a positive integer', () => {
    expect(validateAmount('100')).toBe(true)
  })

  it('accepts 1', () => {
    expect(validateAmount('1')).toBe(true)
  })

  it('rejects 0', () => {
    expect(validateAmount('0')).toBe(false)
  })

  it('rejects negative numbers', () => {
    expect(validateAmount('-50')).toBe(false)
  })

  it('rejects decimal amounts', () => {
    expect(validateAmount('10.5')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateAmount('')).toBe(false)
  })

  it('rejects non-numeric strings', () => {
    expect(validateAmount('abc')).toBe(false)
  })
})

// --- validateForm ---
describe('validateForm', () => {
  const validForm = {
    firstName: 'Ada',
    lastName: 'Okonkwo',
    country: 'NG' as const,
    phone: '8012345',
    amount: '100',
  }

  it('returns no errors for a valid form', () => {
    expect(validateForm(validForm)).toEqual({})
  })

  it('returns firstName error when empty', () => {
    const errors = validateForm({ ...validForm, firstName: '' })
    expect(errors.firstName).toBeDefined()
  })

  it('returns lastName error when empty', () => {
    const errors = validateForm({ ...validForm, lastName: '' })
    expect(errors.lastName).toBeDefined()
  })

  it('returns country error when empty', () => {
    const errors = validateForm({ ...validForm, country: '' })
    expect(errors.country).toBeDefined()
  })

  it('returns phone error for wrong digit count', () => {
    const errors = validateForm({ ...validForm, phone: '123' })
    expect(errors.phone).toBeDefined()
  })

  it('returns amount error for decimal', () => {
    const errors = validateForm({ ...validForm, amount: '10.5' })
    expect(errors.amount).toBeDefined()
  })

  it('returns amount error for zero', () => {
    const errors = validateForm({ ...validForm, amount: '0' })
    expect(errors.amount).toBeDefined()
  })
})

// --- currency conversion ---
describe('convertUSDToLocal', () => {
  const mockRates = { KES: 129.5, NGN: 1580.0, TZS: 2680.0, UGX: 3730.0 }

  it('converts USD to KES correctly', () => {
    expect(convertUSDToLocal(100, 'KES', mockRates)).toBeCloseTo(12950)
  })

  it('converts USD to NGN correctly', () => {
    expect(convertUSDToLocal(50, 'NGN', mockRates)).toBeCloseTo(79000)
  })

  it('converts USD to TZS correctly', () => {
    expect(convertUSDToLocal(1, 'TZS', mockRates)).toBeCloseTo(2680)
  })

  it('converts USD to UGX correctly', () => {
    expect(convertUSDToLocal(200, 'UGX', mockRates)).toBeCloseTo(746000)
  })

  it('throws when currency is not found', () => {
    expect(() => convertUSDToLocal(100, 'XYZ', mockRates)).toThrow()
  })
})

describe('formatLocalAmount', () => {
  it('formats to 2 decimal places with currency code', () => {
    expect(formatLocalAmount(12950.5555, 'KES')).toBe('12,950.56 KES')
  })

  it('pads to 2 decimal places', () => {
    expect(formatLocalAmount(100, 'NGN')).toBe('100.00 NGN')
  })
})
