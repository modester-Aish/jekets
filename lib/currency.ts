// Currency conversion rates (base currency: USD)
// These are approximate rates - in production, use a real-time API
export const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,      // Base currency
  GBP: 0.79,     // British Pound
  EUR: 0.92,     // Euro
  PKR: 278.0,    // Pakistani Rupee
  INR: 83.0,     // Indian Rupee
  CAD: 1.35,     // Canadian Dollar
  AUD: 1.52,     // Australian Dollar
  AED: 3.67,     // UAE Dirham
  SAR: 3.75,     // Saudi Riyal
  JPY: 150.0,    // Japanese Yen
  CNY: 7.2,      // Chinese Yuan
}

export const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', symbol: '₨' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'IT', name: 'Italy', currency: 'EUR', symbol: '€' },
  { code: 'ES', name: 'Spain', currency: 'EUR', symbol: '€' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
  { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥' },
]

export interface CurrencyInfo {
  code: string
  symbol: string
  rate: number
}

export function getCurrencyInfo(countryCode: string): CurrencyInfo {
  const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0]
  const rate = CURRENCY_RATES[country.currency] || 1.0
  
  return {
    code: country.currency,
    symbol: country.symbol,
    rate: rate
  }
}

export function convertPrice(price: number, fromCurrency: string = 'USD', toCurrency: string): number {
  const fromRate = CURRENCY_RATES[fromCurrency] || 1.0
  const toRate = CURRENCY_RATES[toCurrency] || 1.0
  
  // Convert: USD -> Target Currency
  return (price / fromRate) * toRate
}

export function formatPrice(price: number, currency: string, symbol: string): string {
  // Round to 2 decimal places for most currencies
  const roundedPrice = Math.round(price * 100) / 100
  
  // Special formatting for some currencies
  if (currency === 'JPY' || currency === 'PKR' || currency === 'INR') {
    return `${symbol}${Math.round(roundedPrice)}`
  }
  
  return `${symbol}${roundedPrice.toFixed(2)}`
}

