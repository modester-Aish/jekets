import fs from 'fs'
import path from 'path'
import { Product } from './products'

const CACHE_FILE = path.join(process.cwd(), 'data', 'products_cache.json')
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheData {
  products: Product[]
  timestamp: number
}

export function getCachedProducts(): Product[] | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return null
    }

    const cacheData: CacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
    const now = Date.now()

    // Check if cache is still valid (within 5 minutes)
    if (now - cacheData.timestamp < CACHE_DURATION) {
      return cacheData.products
    }

    // Cache expired
    return null
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

export function saveProductsToCache(products: Product[]): void {
  try {
    const cacheDir = path.dirname(CACHE_FILE)
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }

    const cacheData: CacheData = {
      products,
      timestamp: Date.now(),
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving cache:', error)
  }
}

