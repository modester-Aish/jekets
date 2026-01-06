// Optimized functions for homepage - fetch only limited products per category
// This prevents fetching all products when only a few are needed

import { Product } from './products'

// Fetch limited products by category for homepage (optimized)
// Only fetches what's needed, not all products
export async function getLimitedProductsByCategory(
  category: string, 
  limit: number = 8
): Promise<Product[]> {
  if (typeof window !== 'undefined') {
    // Client-side: fetch from API
    try {
      const response = await fetch(`/api/products?category=${category}&per_page=${limit}&page=1`, {
        cache: 'force-cache', // Use browser cache
        next: { revalidate: 3600 } // Revalidate every hour
      })
      if (!response.ok) {
        return []
      }
      const data = await response.json()
      return data.products || []
    } catch (error) {
      console.error('Error fetching limited products:', error)
      return []
    }
  }

  // Server-side: Check cache first, then use getAllProducts if cache is empty
  const cacheModule = await import('./cache')
  const cachedProducts = cacheModule.getCachedProducts()
  
  if (cachedProducts && cachedProducts.length > 0) {
    // Filter from cache (instant, no API call)
    const categoryProducts = cachedProducts
      .filter(p => p.category === category)
      .slice(0, limit)
    
    if (categoryProducts.length > 0) {
      console.log(`💾 Using cached products for ${category} (${categoryProducts.length} products)`)
      return categoryProducts
    }
  }

  // Cache miss - use getAllProducts which handles fetching and caching properly
  // This is better than trying to fetch by category name (WooCommerce needs category IDs)
  const { getAllProducts } = await import('./products')
  const allProducts = await getAllProducts()
  const categoryProducts = allProducts
    .filter(p => p.category === category)
    .slice(0, limit)
  
  console.log(`✅ Fetched ${categoryProducts.length} products for ${category} category`)
  return categoryProducts
}


