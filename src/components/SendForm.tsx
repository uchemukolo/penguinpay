import { useState, useEffect, useCallback } from 'react'
import { COUNTRIES, getCountry } from '../config/countries'
import type { CountryCode } from '../config/countries'
import type { FormState, FormErrors, SendStatus } from '../types/form'
import { validateForm } from '../utils/validation'
import { fetchRates, convertUSDToLocal, formatLocalAmount } from '../services/exchangeRate'
import type { ExchangeRates, RatesResult } from '../services/exchangeRate'

const INITIAL_FORM: FormState = {
  firstName: '',
  lastName: '',
  country: '',
  phone: '',
  amount: '',
}

export default function SendForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [ratesError, setRatesError] = useState(false)
  const [ratesMock, setRatesMock] = useState(false)
  const [ratesFetchedAt, setRatesFetchedAt] = useState<number | null>(null)
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null)
  const [marketRate, setMarketRate] = useState<string | null>(null)
  const [status, setStatus] = useState<SendStatus>('idle')

  /**
   * Fetch live exchange rates once when the component mounts.
   * The service handles caching, so subsequent renders won't trigger a network call.
   */
  useEffect(() => {
    fetchRates()
      .then((result: RatesResult) => {
        setRates(result.rates)
        setRatesMock(result.isMock)
        setRatesFetchedAt(result.fetchedAt)
      })
      .catch(() => setRatesError(true))
  }, [])

  /**
   * Recalculates the market rate label and converted amount whenever
   * the selected country, entered amount, or fetched rates change.
   * Clears both values if inputs are incomplete or invalid.
   */
  useEffect(() => {
    if (!rates || !form.country) {
      setConvertedAmount(null)
      setMarketRate(null)
      return
    }

    // Always show the market rate as soon as a country is selected
    try {
      const country = getCountry(form.country as CountryCode)
      const rate = rates[country.currency]
   
      if (rate) {
        setMarketRate(`1 USD = ${formatLocalAmount(rate, country.currency)}`)
      } else {
        setMarketRate(null)
      }
    } catch {
      setMarketRate(null)
    }

    // Only calculate the converted total once a valid amount is entered
    if (!form.amount) {
      setConvertedAmount(null)
      return
    }
    const amountNum = Number(form.amount)
    if (!Number.isInteger(amountNum) || amountNum <= 0) {
      setConvertedAmount(null)
      return
    }
    try {
      const country = getCountry(form.country as CountryCode)
      const local = convertUSDToLocal(amountNum, country.currency, rates)
      setConvertedAmount(formatLocalAmount(local, country.currency))
    } catch {
      setConvertedAmount(null)
    }
  }, [form.amount, form.country, rates])

  /**
   * Updates a single form field and marks it as touched.
   * Resetting the phone number when the country changes prevents stale values
   * from passing validation for the newly selected country's digit count.
   */
  const handleChange = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((prev) => {
        const updated = { ...prev, [field]: value }
        if (field === 'country') {
          updated.phone = ''
        }
        return updated
      })
      setTouched((prev) => new Set(prev).add(field))
    },
    []
  )

  /** Marks a field as touched on blur so its error becomes visible */
  const handleBlur = useCallback((field: keyof FormState) => {
    setTouched((prev) => new Set(prev).add(field))
  }, [])

  // Run full validation on every render, but only expose errors for touched fields
  const allErrors = validateForm(form)
  const visibleErrors: FormErrors = {}
  for (const key of Object.keys(allErrors) as (keyof FormErrors)[]) {
    if (touched.has(key)) {
      visibleErrors[key] = allErrors[key]
    }
  }

  /**
   * Handles the Send button click. Marks all fields as touched to reveal any hidden errors.
   * If validation passes, simulates sending the transfer and shows the success screen.
   */
  const handleSubmit = async () => {
    setTouched(new Set(['firstName', 'lastName', 'country', 'phone', 'amount']))
    const errs = validateForm(form)
    setErrors(errs)

    if (Object.keys(errs).length > 0) return

    setStatus('sending')
    // Simulated send — replace with a real API call when the backend is ready
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStatus('success')
  }

  /** Resets the form to its initial state so the user can send another transfer */
  const handleReset = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setTouched(new Set())
    setConvertedAmount(null)
    setMarketRate(null)
    setStatus('idle')
  }

  const selectedCountry = form.country ? getCountry(form.country as CountryCode) : null

  // ── Success screen ───────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="screen">
        <div className="success-card">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2>Transfer Sent</h2>
          <p>
            Your transfer of <strong>${form.amount}</strong> to{' '}
            <strong>
              {form.firstName} {form.lastName}
            </strong>{' '}
            is on its way.
          </p>
          {convertedAmount && (
            <p className="success-amount">
              They will receive approximately <strong>{convertedAmount}</strong>
            </p>
          )}
          <button className="btn btn-primary" onClick={handleReset}>
            Send Another
          </button>
        </div>
      </div>
    )
  }

  // ── Send form ─────────────────────────────────────────────────────────────
  return (
    <div className="screen">
      <header className="app-header">
        <div className="logo">🐧 PenguinPay</div>
        <p className="tagline">Send money home</p>
      </header>

      <div className="form-card">
        <h1 className="form-title">Send Money</h1>

        {ratesError && (
          <div className="alert alert-warning">
            Could not load live exchange rates. Displaying estimated rates.
          </div>
        )}
        <div className="field-row">
          <div className="field">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Ada"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              className={visibleErrors.firstName ? 'input-error' : ''}
              autoComplete="given-name"
            />
            {visibleErrors.firstName && <span className="error-msg">{visibleErrors.firstName}</span>}
          </div>
          <div className="field">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Okonkwo"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              className={visibleErrors.lastName ? 'input-error' : ''}
              autoComplete="family-name"
            />
            {visibleErrors.lastName && <span className="error-msg">{visibleErrors.lastName}</span>}
          </div>
        </div>
        <div className="field">
          <label htmlFor="country">Recipient's Country</label>
          <select
            id="country"
            value={form.country}
            onChange={(e) => handleChange('country', e.target.value)}
            onBlur={() => handleBlur('country')}
            className={visibleErrors.country ? 'input-error' : ''}
          >
            <option value="">Select country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.currency})
              </option>
            ))}
          </select>
          {visibleErrors.country && <span className="error-msg">{visibleErrors.country}</span>}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone Number</label>
          <div className="phone-input-wrapper">
            <span className="phone-prefix">
              {selectedCountry ? selectedCountry.phonePrefix : (
                <svg className="phone-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
                </svg>
              )}
            </span>
            <input
              id="phone"
              type="tel"
              placeholder={
                selectedCountry
                  ? `${selectedCountry.phoneDigits} digits`
                  : 'Select country first'
              }
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
              onBlur={() => handleBlur('phone')}
              className={visibleErrors.phone ? 'input-error' : ''}
              disabled={!form.country}
              maxLength={selectedCountry ? selectedCountry.phoneDigits : 10}
              inputMode="numeric"
            />
          </div>
          {visibleErrors.phone && <span className="error-msg">{visibleErrors.phone}</span>}
        </div>
        <div className="field">
          <label htmlFor="amount">Amount to Send (USD)</label>
          <div className="amount-input-wrapper">
            <span className="currency-prefix">$</span>
            <input
              id="amount"
              type="number"
              placeholder="100"
              min="1"
              step="1"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              onBlur={() => handleBlur('amount')}
              className={visibleErrors.amount ? 'input-error' : ''}
              inputMode="numeric"
            />
          </div>
          {visibleErrors.amount && <span className="error-msg">{visibleErrors.amount}</span>}
        </div>

        {/* Market rate — appears as soon as a country is selected */}
        {marketRate && (
          <div className="market-rate">
            <div className="market-rate-left">
              <span className="market-rate-label">Current market rate</span>
              <span className="market-rate-value">{marketRate}</span>
            </div>
            <div className="market-rate-right">
              {ratesMock ? (
                <span className="rate-badge rate-badge-mock">Estimated</span>
              ) : (
                <span className="rate-badge rate-badge-live">● Live</span>
              )}
              {ratesFetchedAt && (
                <span className="rate-updated">
                  Updated {new Date(ratesFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        )}
        {convertedAmount && (
          <div className="conversion-display">
            <span className="conversion-label">Recipient receives</span>
            <span className="conversion-amount">{convertedAmount}</span>
            <span className="conversion-note">based on current market rate</span>
          </div>
        )}
        <button
          className={`btn btn-primary btn-full ${status === 'sending' ? 'btn-loading' : ''}`}
          onClick={handleSubmit}
          disabled={status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              <span className="spinner" /> Sending...
            </>
          ) : (
            'Send Money'
          )}
        </button>
      </div>
    </div>
  )
}
