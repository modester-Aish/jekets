// Server-side only cache using in-memory + file-based cache
// This file should only be imported in server components

import { Product } from './products'
import fs from 'fs'
import path from 'path'

// Cache duration: 1 hour (3600000 ms) - products will be cached until webhook invalidates
export const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Extended cache duration when server errors occur (502, 503, 504)
const EXTENDED_CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours when server is down

interface CacheData {
  products: Product[]
  timestamp: number
}

// In-memory cache (server-side only) - fast access
let memoryCache: CacheData | null = null

// Flag to force cache refresh (set by webhook)
let forceRefresh = false

// File-based cache path (persists across hot reloads)
const CACHE_FILE_PATH = path.join(process.cwd(), '.next', 'products-cache.json')

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
    
    const now = Date.now()
    const age = now - cacheData.timestamp

    // Check if cache is still valid
    if (age < CACHE_DURATION) {
      console.log(`📂 Loaded cache from file (${cacheData.products.length} products, ${Math.round(age / 60000)} minutes old)`)
      return cacheData
    }

    // Cache expired - delete file
    if (age >= EXTENDED_CACHE_DURATION) {
      fs.unlinkSync(CACHE_FILE_PATH)
      return null
    }

    // Extended cache - still use it
    console.log(`⚠️  File cache expired but using extended cache (${Math.round(age / 60000)} minutes old)`)
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

    // Ensure .next directory exists
    const cacheDir = path.dirname(CACHE_FILE_PATH)
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }

    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData), 'utf-8')
    console.log(`💾 Cache saved to file: ${CACHE_FILE_PATH}`)
  } catch (error) {
    // If file write fails, continue with in-memory cache only
    console.warn('⚠️  Failed to save cache to file, using in-memory cache only')
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
  if (memoryCache) {
    const now = Date.now()
    const age = now - memoryCache.timestamp

    if (age < CACHE_DURATION) {
      return memoryCache.products
    }

    if (age < EXTENDED_CACHE_DURATION) {
      console.log(`⚠️  Memory cache expired but using extended cache (${Math.round(age / 60000)} minutes old)`)
      return memoryCache.products
    }

    // Memory cache expired
    memoryCache = null
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
  
  console.log(`💾 Products cached: ${products.length} products (cache valid for 1 hour or until webhook)`)
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
