const https = require('https');
const config = require('./woocommerce_config');

const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

// Fetch all products from WooCommerce
function fetchAllProducts() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    let apiPath = '/wp-json/wc/v3/products?per_page=100&page=1';
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = '/wp/wp-json/wc/v3/products?per_page=100&page=1';
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
    }
    
    const apiUrl = new URL(apiPath, baseUrl);
    
    const allProducts = [];
    let currentPage = 1;
    let totalPages = 1;
    
    function fetchPage(page) {
      return new Promise((resolvePage, rejectPage) => {
        const pagePath = `${apiUrl.pathname.split('?')[0]}?per_page=100&page=${page}`;
        
        const options = {
          hostname: apiUrl.hostname,
          port: apiUrl.port || 443,
          path: pagePath,
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const products = JSON.parse(data);
              allProducts.push(...products);
              
              const totalPagesHeader = res.headers['x-wp-totalpages'];
              totalPages = parseInt(String(totalPagesHeader || '1'));
              
              console.log(`📥 Fetched page ${page}/${totalPages} (${products.length} products)`);
              
              if (page < totalPages) {
                fetchPage(page + 1).then(resolvePage).catch(rejectPage);
              } else {
                resolvePage(allProducts);
              }
            } else {
              rejectPage(new Error(`Status ${res.statusCode}: ${data.substring(0, 200)}`));
            }
          });
        });
        
        req.on('error', rejectPage);
        req.on('timeout', () => {
          req.destroy();
          rejectPage(new Error('Request timeout'));
        });
        req.end();
      });
    }
    
    fetchPage(1).then(resolve).catch(reject);
  });
}

// Delete a product from WooCommerce
function deleteProduct(productId) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    let apiPath = `/wp-json/wc/v3/products/${productId}?force=true`;
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/products/${productId}?force=true`;
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
    }
    
    const apiUrl = new URL(apiPath, baseUrl);
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname + (apiUrl.search || ''),
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
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
          reject(new Error(`Status ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Main function to delete all products
async function deleteAllProducts() {
  console.log('⚠️  WARNING: This will delete ALL products from WooCommerce!');
  console.log('🚀 Starting deletion process...\n');
  
  try {
    // Fetch all products
    console.log('📥 Fetching all products from WooCommerce...\n');
    const products = await fetchAllProducts();
    console.log(`✅ Fetched ${products.length} products\n`);
    
    if (products.length === 0) {
      console.log('✅ No products to delete!');
      return;
    }
    
    console.log(`🗑️  Deleting ${products.length} products...\n`);
    
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const product of products) {
      try {
        await deleteProduct(product.id);
        console.log(`✅ Deleted: ${product.name} (ID: ${product.id})`);
        deletedCount++;
        
        // Delay to avoid rate limiting (500ms between deletions)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to delete ${product.name} (ID: ${product.id}):`, error.message);
        failedCount++;
      }
    }
    
    console.log(`\n✅ Deletion complete!`);
    console.log(`   Deleted: ${deletedCount}`);
    console.log(`   Failed: ${failedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run deletion
if (require.main === module) {
  deleteAllProducts().catch(console.error);
}

module.exports = { deleteAllProducts };

