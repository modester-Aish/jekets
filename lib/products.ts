import productsData from '@/data/products.json'
import { getCachedProducts, saveProductsToCache } from './cache'

export interface Product {
  id: number
  title: string
  slug: string
  category: string
  price: number | null
  discountPrice: number | null
  image: string
  description: string
  brand?: string
  woocommerceId?: number
  externalUrl?: string
  buttonText?: string
}

// Fetch products directly from WooCommerce API (server-side only)
async function fetchProductsFromWooCommerceDirect(): Promise<Product[]> {
  const https = await import('https')
  const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || 'https://payment.trapstarofficial.store/wp'
  const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_065600d609b4e24bd1d8fbbc2cce7ca7c95ff20c'
  const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_5f61b4bb7e6c54ae001f3b12c6d0b9b6bbda6941'

  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    
    let apiPath = `/wp-json/wc/v3/products?per_page=100`
    let baseUrl = WOOCOMMERCE_URL
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/products?per_page=100`
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '')
    }
    
    const apiUrl = new URL(apiPath, baseUrl)
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname + (apiUrl.search || ''),
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    }
    
    let allProducts: any[] = []
    let page = 1
    let totalPages = 1
    
    function fetchPage(pageNum: number) {
      const pagePath = `${apiUrl.pathname}?page=${pageNum}&per_page=100${apiUrl.search ? '&' + apiUrl.search.substring(1) : ''}`
      const pageOptions = { ...options, path: pagePath }
      
      const req = https.request(pageOptions, (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => {
          data += chunk
        })
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const products = JSON.parse(data)
              allProducts = allProducts.concat(products)
              totalPages = parseInt(res.headers['x-wp-totalpages'] || '1')
              
              if (pageNum < totalPages) {
                fetchPage(pageNum + 1)
              } else {
                // Convert to our format
                const categoryMap: Record<string, string> = {
                  'Bags': 'bags',
                  'Hoodies': 'hoodies',
                  'Jackets': 'jackets',
                  'Short Sets': 'shorts',
                  'Shorts': 'shorts',
                  'T-Shirts': 't-shirts',
                  'T-Shirt': 't-shirts',
                  'Tracksuits': 'tracksuits',
                  'Tracksuit': 'tracksuits'
                }
                
                const converted = allProducts.map((product: any) => {
                  let category = 'hoodies'
                  if (product.categories && product.categories.length > 0) {
                    const wooCategoryName = product.categories[0].name
                    category = categoryMap[wooCategoryName] || categoryMap[wooCategoryName.toLowerCase()] || 'hoodies'
                  }
                  
                  if (product.meta_data) {
                    const originalCategory = product.meta_data.find((m: any) => m.key === '_original_category')
                    if (originalCategory && categoryMap[originalCategory.value]) {
                      category = categoryMap[originalCategory.value]
                    }
                  }
                  
                  const slug = product.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                  
                  const regularPrice = parseFloat(product.regular_price || '0')
                  const salePrice = parseFloat(product.sale_price || '0')
                  const price = salePrice > 0 ? salePrice : regularPrice
                  const discountPrice = salePrice > 0 && salePrice < regularPrice ? salePrice : null
                  
                  return {
                    id: product.id,
                    title: product.name,
                    slug: slug,
                    category: category,
                    price: regularPrice > 0 ? regularPrice : 299.99,
                    discountPrice: discountPrice,
                    image: product.images && product.images.length > 0 ? product.images[0].src : '',
                    description: product.description || product.short_description || product.name,
                    brand: 'Trapstar',
                    woocommerceId: product.id,
                    externalUrl: product.external_url || '',
                    buttonText: product.button_text || 'Buy Now'
                  }
                })
                
                resolve(converted)
              }
            } catch (error) {
              reject(new Error('Failed to parse response'))
            }
          } else {
            reject(new Error(`Status ${res.statusCode}: ${data}`))
          }
        })
      })
      
      req.on('error', (error: any) => {
        reject(error)
      })
      
      req.end()
    }
    
    fetchPage(1)
  })
}

// Get all products - uses cache first, then fetches from WooCommerce
export async function getAllProducts(): Promise<Product[]> {
  // Try to get from cache first
  const cachedProducts = getCachedProducts()
  if (cachedProducts) {
    return cachedProducts
  }

  // Cache miss or expired - fetch from WooCommerce
  try {
    const products = await fetchProductsFromWooCommerceDirect()
    // Save to cache for next time
    saveProductsToCache(products)
    return products
  } catch (error) {
    console.error('Error fetching from WooCommerce, using fallback:', error)
    // Fallback to local data
    const fallbackProducts = productsData as Product[]
    // Save fallback to cache so we don't keep trying
    saveProductsToCache(fallbackProducts)
    return fallbackProducts
  }
}

// Synchronous version for backward compatibility (uses local data)
export function getAllProductsSync(): Product[] {
  return productsData as Product[]
}

// Get product by slug - async version
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts()
  return products.find((product) => product.slug === slug)
}

// Get product by slug - sync version (for backward compatibility)
export function getProductBySlugSync(slug: string): Product | undefined {
  return productsData.find((product) => product.slug === slug) as Product | undefined
}

// Get products by category - async version
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((product) => product.category === category)
}

// Get products by category - sync version
export function getProductsByCategorySync(category: string): Product[] {
  return productsData.filter((product) => product.category === category) as Product[]
}

// Search products by title - async version
export async function searchProducts(query: string): Promise<Product[]> {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []
  
  const products = await getAllProducts()
  return products.filter((product) =>
    product.title.toLowerCase().includes(lowerQuery)
  )
}

// Search products by title - sync version
export function searchProductsSync(query: string): Product[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []
  
  return productsData.filter((product) =>
    product.title.toLowerCase().includes(lowerQuery)
  ) as Product[]
}

// Get products by brand (Trapstar only) - async version
export async function getProductsByBrand(brand: 'hellstar' | 'trapstar'): Promise<Product[]> {
  if (brand.toLowerCase() !== 'trapstar') {
    return []
  }
  return await getAllProducts()
}

// Get products by brand - sync version
export function getProductsByBrandSync(brand: 'hellstar' | 'trapstar'): Product[] {
  if (brand.toLowerCase() !== 'trapstar') {
    return []
  }
  return productsData as Product[]
}

// Get products by category and brand (Trapstar only) - async version
export async function getProductsByCategoryAndBrand(category: string, brand: 'hellstar' | 'trapstar'): Promise<Product[]> {
  if (brand.toLowerCase() !== 'trapstar') {
    return []
  }
  const products = await getAllProducts()
  return products.filter((product) => {
    return product.category === category
  })
}

// Get products by category and brand - sync version
export function getProductsByCategoryAndBrandSync(category: string, brand: 'hellstar' | 'trapstar'): Product[] {
  if (brand.toLowerCase() !== 'trapstar') {
    return []
  }
  return productsData.filter((product) => {
    return product.category === category
  }) as Product[]
}

