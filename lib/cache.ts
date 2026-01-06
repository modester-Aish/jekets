// Server-side only cache using in-memory + file-based cache
// This file should only be imported in server components

import { Product } from './products'
import fs from 'fs'
import path from 'path'

// Cache duration: UNLIMITED - products will be cached until webhook invalidates
// Only webhook can invalidate cache, not time-based expiration
export const CACHE_DURATION = Infinity // Never expire - only webhook invalidates

// Extended cache duration when server errors occur (502, 503, 504)
const EXTENDED_CACHE_DURATION = Infinity // Never expire

interface CacheData {
  products: Product[]
  timestamp: number
}

// In-memory cache (server-side only) - fast access
let memoryCache: CacheData | null = null

// Flag to force cache refresh (set by webhook)
let forceRefresh = false

// File-based cache path (persists across server restarts)
// Use root data folder instead of .next (which gets cleaned)
const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'products-cache.json')

// Load cache from file on module load
function loadCacheFromFile(): CacheData | null {
  try {
    if (typeof window !== 'undefined') {
      return null
    }

    if (!fs.existsSync(CACHE_FILE_PATH)) {
      return null
    }

    const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8')
    const cacheData: CacheData = JSON.parse(fileContent)
    
    // Cache never expires - only webhook can invalidate
    // Always use cached data if file exists
    const now = Date.now()
    const age = now - cacheData.timestamp
    console.log(`📂 Loaded cache from file (${cacheData.products.length} products, ${Math.round(age / 60000)} minutes old) - Cache valid until webhook`)
    return cacheData
  } catch (error) {
    // If file read fails, return null (will fetch fresh)
    return null
  }
}

// Save cache to file
function saveCacheToFile(products: Product[]): void {
  try {
    if (typeof window !== 'undefined') {
      return
    }

    const cacheData: CacheData = {
      products,
      timestamp: Date.now(),
    }

    // Ensure data directory exists (persists across server restarts)
    const cacheDir = path.dirname(CACHE_FILE_PATH)
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
      console.log(`📁 Created data directory: ${cacheDir}`)
    }

    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf-8')
    console.log(`💾 Cache saved to file: ${CACHE_FILE_PATH} (${products.length} products)`)
  } catch (error) {
    // If file write fails, continue with in-memory cache only
    console.warn('⚠️  Failed to save cache to file, using in-memory cache only:', error)
  }
}

// Initialize memory cache from file on first access
if (typeof window === 'undefined' && !memoryCache) {
  const fileCache = loadCacheFromFile()
  if (fileCache) {
    memoryCache = fileCache
  }
}

export function getCachedProducts(): Product[] | null {
  // Only work on server-side
  if (typeof window !== 'undefined') {
    return null
  }

  // If force refresh is set, clear cache
  if (forceRefresh) {
    memoryCache = null
    forceRefresh = false
    // Also delete file cache
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        fs.unlinkSync(CACHE_FILE_PATH)
      }
    } catch (error) {
      // Ignore file deletion errors
    }
    return null
  }

  // First check in-memory cache
  // Cache never expires - only webhook can invalidate
  if (memoryCache) {
    return memoryCache.products
  }

  // If memory cache is empty, try loading from file
  const fileCache = loadCacheFromFile()
  if (fileCache) {
    memoryCache = fileCache
    return fileCache.products
  }

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
  
  // Also save to file for persistence across hot reloads
  saveCacheToFile(products)
  
  console.log(`💾 Products cached: ${products.length} products (cache valid until webhook - NEVER expires)`)
}

// Invalidate cache (called by webhook when products change)
export function invalidateCache(): void {
  // Only work on server-side
  if (typeof window !== 'undefined') {
    return
  }

  memoryCache = null
  forceRefresh = true
  
  // Also delete file cache
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      fs.unlinkSync(CACHE_FILE_PATH)
      console.log('🗑️  File cache deleted')
    }
  } catch (error) {
    // Ignore file deletion errors
  }
  
  console.log('🗑️  Products cache invalidated - next fetch will get fresh data')
}
