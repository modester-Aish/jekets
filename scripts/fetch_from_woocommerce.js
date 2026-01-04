const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./woocommerce_config');

// WooCommerce API credentials
const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

// Fetch products from WooCommerce
function fetchProducts(page = 1, perPage = 100) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    // Construct API URL - if WOOCOMMERCE_URL ends with /wp, WordPress is in subdirectory
    let apiPath = `/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`;
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      // WordPress is in /wp/ subdirectory, so API is at /wp/wp-json
      apiPath = `/wp/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`;
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
    }
    
    const apiUrl = new URL(apiPath, baseUrl);
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname + (apiUrl.search || ''),
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const products = JSON.parse(data);
          const totalPages = parseInt(res.headers['x-wp-totalpages'] || '1');
          resolve({ products, totalPages, currentPage: page });
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Fetch all products
async function fetchAllProducts() {
  console.log('🔄 Fetching products from WooCommerce...\n');
  
  let allProducts = [];
  let page = 1;
  let totalPages = 1;
  
  do {
    try {
      const result = await fetchProducts(page, 100);
      allProducts = allProducts.concat(result.products);
      totalPages = result.totalPages;
      console.log(`📦 Fetched page ${page}/${totalPages} (${result.products.length} products)`);
      page++;
    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error.message);
      break;
    }
  } while (page <= totalPages);
  
  console.log(`\n✅ Total products fetched: ${allProducts.length}`);
  return allProducts;
}

// Convert WooCommerce products to our format
function convertToOurFormat(wooProducts) {
  // Map WooCommerce category names to our category slugs
  const categoryMap = {
    'Bags': 'bags',
    'Hoodies': 'hoodies',
    'Jackets': 'jackets',
    'Short Sets': 'shorts',
    'Shorts': 'shorts',
    'T-Shirts': 't-shirts',
    'T-Shirt': 't-shirts',
    'Tracksuits': 'tracksuits',
    'Tracksuit': 'tracksuits'
  };
  
  return wooProducts.map((product) => {
    // Get category from WooCommerce product
    let category = 'hoodies'; // default
    if (product.categories && product.categories.length > 0) {
      const wooCategoryName = product.categories[0].name;
      category = categoryMap[wooCategoryName] || categoryMap[wooCategoryName.toLowerCase()] || 'hoodies';
    }
    
    // Also check meta_data for original category
    if (product.meta_data) {
      const originalCategory = product.meta_data.find(m => m.key === '_original_category');
      if (originalCategory && categoryMap[originalCategory.value]) {
        category = categoryMap[originalCategory.value];
      }
    }
    
    // Generate slug from name
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const regularPrice = parseFloat(product.regular_price || '0');
    const salePrice = parseFloat(product.sale_price || '0');
    const price = salePrice > 0 ? salePrice : regularPrice;
    const discountPrice = salePrice > 0 && salePrice < regularPrice ? salePrice : null;
    
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
      externalUrl: product.external_url || product.meta_data?.find(m => m.key === '_external_url')?.value || '',
      buttonText: product.button_text || 'Buy Now'
    };
  });
}

// Save to products.json
async function saveProducts() {
  try {
    const wooProducts = await fetchAllProducts();
    const ourProducts = convertToOurFormat(wooProducts);
    
    const jsonPath = path.join(__dirname, '..', 'data', 'products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(ourProducts, null, 2));
    
    console.log(`\n💾 Saved ${ourProducts.length} products to data/products.json`);
    console.log(`\n📊 Products by category:`);
    
    const byCategory = {};
    ourProducts.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });
    
    Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  if (WOOCOMMERCE_URL === 'https://your-woocommerce-site.com') {
    console.log('⚠️  Please update WOOCOMMERCE_URL in scripts/woocommerce_config.js first!\n');
    process.exit(1);
  }
  saveProducts();
}

module.exports = { fetchAllProducts, convertToOurFormat };

