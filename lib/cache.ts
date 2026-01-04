// Server-side only cache using in-memory cache
// This file should only be imported in server components

import { Product } from './products'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheData {
  products: Product[]
  timestamp: number
}

// In-memory cache (server-side only)
let memoryCache: CacheData | null = null

export function getCachedProducts(): Product[] | null {
  // Only work on server-side
  if (typeof window !== 'undefined') {
    return null
  }

  if (!memoryCache) {
    return null
  }

  const now = Date.now()

  // Check if cache is still valid (within 5 minutes)
  if (now - memoryCache.timestamp < CACHE_DURATION) {
    return memoryCache.products
  }

  // Cache expired
  memoryCache = null
  return null
}

export function saveProductsToCache(products: Product[]): void {
  // Only work on server-side
  if (typeof window !== 'undefined') {
    return
  }

  memoryCache = {
    products,
    timestamp: Date.now(),
  }
}

