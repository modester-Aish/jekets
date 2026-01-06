'use client'

import { useState, useEffect } from 'react'
import { COUNTRIES, getCurrencyInfo } from '@/lib/currency'

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: string, countryCode: string) => void
}

export default function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('US')

  // Load saved country from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedCountry')
    if (saved && COUNTRIES.find(c => c.code === saved)) {
      setSelectedCountry(saved)
    }
  }, [])

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0]
  const currencyInfo = getCurrencyInfo(selectedCountry)

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode)
    localStorage.setItem('selectedCountry', countryCode)
    setIsOpen(false)
    
    const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0]
    if (onCurrencyChange) {
      onCurrencyChange(country.currency, countryCode)
    }
    
    // Trigger page refresh to update prices
    window.dispatchEvent(new CustomEvent('currencyChanged', { 
      detail: { currency: country.currency, countryCode } 
    }))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
        aria-label="Select country and currency"
      >
        <span className="hidden sm:inline">{currentCountry.currency}</span>
        <span className="sm:hidden">{currencyInfo.symbol}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-black border border-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800">
                Select Country / Currency
              </div>
              {COUNTRIES.map((country) => {
                const isSelected = country.code === selectedCountry
                return (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{country.currency}</span>
                      <span className="text-gray-500">{country.symbol}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

