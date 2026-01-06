'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { convertPrice, formatPrice, getCurrencyInfo } from '@/lib/currency'

interface Product {
  id: number
  title: string
  slug: string
  category: string
  price: number | null
  discountPrice: number | null
  image: string
  description: string
  brand?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currency, setCurrency] = useState('USD')
  const [countryCode, setCountryCode] = useState('US')

  // Listen for currency changes
  useEffect(() => {
    const saved = localStorage.getItem('selectedCountry')
    if (saved) {
      setCountryCode(saved)
      const country = require('@/lib/currency').COUNTRIES.find((c: any) => c.code === saved)
      if (country) {
        setCurrency(country.currency)
      }
    }

    const handleCurrencyChange = (e: CustomEvent) => {
      setCurrency(e.detail.currency)
      setCountryCode(e.detail.countryCode)
    }

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener)
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener)
  }, [])

  // Ensure prices are valid numbers
  const basePrice = product.price || 0
  const baseDiscountPrice = product.discountPrice || null
  
  // Convert prices to selected currency
  const currencyInfo = getCurrencyInfo(countryCode)
  const displayPrice = convertPrice(basePrice, 'USD', currencyInfo.code)
  const displayDiscountPrice = baseDiscountPrice ? convertPrice(baseDiscountPrice, 'USD', currencyInfo.code) : null
  
  // Calculate discount percentage
  const discountPercent = displayDiscountPrice && basePrice > 0
    ? Math.round(((basePrice - (baseDiscountPrice || 0)) / basePrice) * 100)
    : null

  return (
    <Link href={`/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-gray-900 rounded-lg">
        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 text-xs font-bold">
            {discountPercent}%
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full aspect-square bg-gray-800 overflow-hidden">
          <img
            src={product.image || ''}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', product.image);
              // Show placeholder instead of hiding
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="p-3 md:p-4">
          <h3 className="text-white font-medium mb-2 text-sm md:text-base group-hover:text-gray-300 transition-colors line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center space-x-2">
            {displayDiscountPrice ? (
              <>
                <span className="text-white font-semibold text-sm md:text-base">
                  {formatPrice(displayDiscountPrice, currencyInfo.code, currencyInfo.symbol)}
                </span>
                <span className="text-gray-500 line-through text-xs md:text-sm">
                  {formatPrice(displayPrice, currencyInfo.code, currencyInfo.symbol)}
                </span>
              </>
            ) : (
              <span className="text-white font-semibold text-sm md:text-base">
                {formatPrice(displayPrice, currencyInfo.code, currencyInfo.symbol)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

