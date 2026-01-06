'use client'

import { useState, useEffect } from 'react'
import { convertPrice, formatPrice, getCurrencyInfo } from '@/lib/currency'

interface PriceDisplayProps {
  price: number | null
  discountPrice?: number | null
  className?: string
  discountClassName?: string
}

export default function PriceDisplay({ 
  price, 
  discountPrice, 
  className = '', 
  discountClassName = '' 
}: PriceDisplayProps) {
  const [currency, setCurrency] = useState('USD')
  const [countryCode, setCountryCode] = useState('US')

  useEffect(() => {
    const handleCurrencyChange = (e: CustomEvent) => {
      setCurrency(e.detail.currency)
      setCountryCode(e.detail.countryCode)
    }

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener)
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener)
  }, [])

  if (!price) return null

  const currencyInfo = getCurrencyInfo(countryCode)
  const displayPrice = convertPrice(price, 'USD', currencyInfo.code)
  const displayDiscountPrice = discountPrice ? convertPrice(discountPrice, 'USD', currencyInfo.code) : null

  if (displayDiscountPrice) {
    return (
      <div className="flex items-center space-x-2">
        <span className={className}>
          {formatPrice(displayDiscountPrice, currencyInfo.code, currencyInfo.symbol)}
        </span>
        <span className={`line-through ${discountClassName}`}>
          {formatPrice(displayPrice, currencyInfo.code, currencyInfo.symbol)}
        </span>
      </div>
    )
  }

  return (
    <span className={className}>
      {formatPrice(displayPrice, currencyInfo.code, currencyInfo.symbol)}
    </span>
  )
}

