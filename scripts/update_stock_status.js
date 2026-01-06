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

// Update product stock status to in stock
function updateStockStatus(productId) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    let apiPath = `/wp-json/wc/v3/products/${productId}`;
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/products/${productId}`;
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
    }
    
    const apiUrl = new URL(apiPath, baseUrl);
    
    const updateData = JSON.stringify({
      stock_status: 'instock'
    });
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname,
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateData)
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
    req.write(updateData);
    req.end();
  });
}

// Main function to update stock status
async function updateAllStockStatus() {
  console.log('🚀 Starting stock status update...\n');
  
  try {
    // Fetch all products
    console.log('📥 Fetching all products from WooCommerce...\n');
    const products = await fetchAllProducts();
    console.log(`✅ Fetched ${products.length} products\n`);
    
    // Filter out of stock products
    const outOfStockProducts = products.filter(p => 
      p.stock_status === 'outofstock' || p.stock_status === 'out'
    );
    
    console.log(`📦 Found ${outOfStockProducts.length} out of stock products\n`);
    
    if (outOfStockProducts.length === 0) {
      console.log('✅ All products are already in stock!');
      return;
    }
    
    console.log(`🔄 Updating ${outOfStockProducts.length} products to in stock...\n`);
    
    let updatedCount = 0;
    let failedCount = 0;
    
    for (const product of outOfStockProducts) {
      try {
        await updateStockStatus(product.id);
        console.log(`✅ Updated: ${product.name} (ID: ${product.id})`);
        updatedCount++;
        
        // Delay to avoid rate limiting (500ms between updates)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to update ${product.name} (ID: ${product.id}):`, error.message);
        failedCount++;
      }
    }
    
    console.log(`\n✅ Stock status update complete!`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Failed: ${failedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run update
if (require.main === module) {
  updateAllStockStatus().catch(console.error);
}

module.exports = { updateAllStockStatus };

