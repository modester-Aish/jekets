import { NextResponse } from 'next/server'
import https from 'https'

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || 'https://payment.trapstarofficial.store/wp'
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_065600d609b4e24bd1d8fbbc2cce7ca7c95ff20c'
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_5f61b4bb7e6c54ae001f3b12c6d0b9b6bbda6941'

// Fetch products from WooCommerce
function fetchProductsFromWooCommerce(page = 1, perPage = 100): Promise<any> {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    
    let apiPath = `/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`
    let baseUrl = WOOCOMMERCE_URL
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`
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
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const products = JSON.parse(data)
            const totalPages = parseInt(res.headers['x-wp-totalpages'] || '1')
            resolve({ products, totalPages, currentPage: page })
          } catch (error) {
            reject(new Error('Failed to parse response'))
          }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.end()
  })
}

// Convert WooCommerce products to our format
function convertToOurFormat(wooProducts: any[]) {
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
  
  return wooProducts.map((product) => {
    let category = 'hoodies' // default
    if (product.categories && product.categories.length > 0) {
      const wooCategoryName = product.categories[0].name
      category = categoryMap[wooCategoryName] || categoryMap[wooCategoryName.toLowerCase()] || 'hoodies'
    }
    
    // Check meta_data for original category
    if (product.meta_data) {
      const originalCategory = product.meta_data.find((m: any) => m.key === '_original_category')
      if (originalCategory && categoryMap[originalCategory.value]) {
        category = categoryMap[originalCategory.value]
      }
    }
    
    // Generate slug from name
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
}

// GET all products from WooCommerce
export async function GET() {
  try {
    let allProducts: any[] = []
    let page = 1
    let totalPages = 1
    
    do {
      const result = await fetchProductsFromWooCommerce(page, 100)
      allProducts = allProducts.concat(result.products)
      totalPages = result.totalPages
      page++
    } while (page <= totalPages)
    
    const convertedProducts = convertToOurFormat(allProducts)
    
    return NextResponse.json(convertedProducts, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
  } catch (error: any) {
    console.error('Error fetching from WooCommerce:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products from WooCommerce', message: error.message },
      { status: 500 }
    )
  }
}

