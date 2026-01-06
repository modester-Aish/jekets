// Clear products cache to force fresh fetch from WooCommerce
const fs = require('fs')
const path = require('path')

const CACHE_FILE = path.join(process.cwd(), 'data', 'products_cache.json')

if (fs.existsSync(CACHE_FILE)) {
  fs.unlinkSync(CACHE_FILE)
  console.log('✅ Cache cleared successfully!')
  console.log('📥 Next request will fetch fresh products from WooCommerce')
} else {
  console.log('ℹ️  No cache file found')
}

