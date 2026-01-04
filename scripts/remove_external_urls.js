const https = require('https');
const config = require('./woocommerce_config');

const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

// Fetch all products
function fetchProducts(page = 1, perPage = 100) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    let apiPath = `/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`;
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
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

// Update product to remove external URL
function updateProduct(productId) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const updateData = {
      external_url: '', // Clear external URL
      button_text: 'Buy Now'
    };
    
    const postData = JSON.stringify(updateData);
    
    let apiPath = `/wp-json/wc/v3/products/${productId}`;
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/products/${productId}`;
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
    }
    
    const apiUrl = new URL(apiPath, baseUrl);
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname + (apiUrl.search || ''),
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Remove external URLs from all products
async function removeExternalUrls() {
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
  
  console.log(`\n✅ Total products found: ${allProducts.length}`);
  console.log(`\n🗑️  Removing external URLs from all products...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    try {
      await updateProduct(product.id);
      console.log(`✅ Updated: ${product.name} (ID: ${product.id})`);
      successCount++;
      // Delay to avoid rate limiting
      if (i < allProducts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${product.name} (ID: ${product.id}) - ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n✅ Update complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
}

// Run
if (require.main === module) {
  removeExternalUrls().catch(console.error);
}

module.exports = { removeExternalUrls };

