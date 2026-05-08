# PenguinPay - Send Transactions Screen

A React TypeScript prototype of the Send Transactions screen for a remittance app, built for the Zepz front end engineer take-home project.

## Getting started

```bash
npm install
```

Copy the environment file and add your OpenExchangeRates API key:

```bash
cp .env.example .env
# Then edit .env and add your app ID
```

Get a free API key at https://openexchangerates.org/signup/free

Run the development server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser. The app is designed for a mobile viewport — use your browser's device toolbar or resize to around 390px wide.

## Running tests

```bash
npm test
```

29 unit tests covering phone validation, amount validation, full form validation, currency conversion, and amount formatting.

## Tech decisions

**React (web) over React Native:** Built for mobile browser as explicitly permitted. My React and TypeScript depth is stronger than my React Native production experience and the evaluation criteria prioritise bug-free, maintainable code over framework choice.

**Exchange rate caching:** Rates are cached in memory for 5 minutes. If no API key is set, fallback rates are used so the app remains functional during review without requiring an API key.

**Inline validation on blur:** Errors appear when a field loses focus rather than on every keystroke, which is less disruptive on mobile. All errors are shown on submit attempt.

## Compromises made (3-4 hour constraint)

No component-level tests: Unit tests cover all business logic (validation, conversion, formatting). React Testing Library component tests were deprioritised in favour of ensuring the core logic was thoroughly tested and the UI polished and bug-free.

Mock send: The send button simulates a 1.5 second delay and shows a success screen. No real API endpoint was specified in the requirements.

No persistent draft: State resets on page refresh. LocalStorage persistence was deprioritised.

## Project structure

```
src/
  config/countries.ts      Country data: currencies, prefixes, digit counts
  types/form.ts            TypeScript types for form state and errors
  utils/validation.ts      Pure validation functions
  services/exchangeRate.ts API fetch, caching, conversion, formatting
  components/SendForm.tsx  Main form component
  tests/app.test.ts        Unit tests (29 passing)
```
