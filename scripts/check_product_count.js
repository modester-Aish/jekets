const https = require('https');
const config = require('./woocommerce_config');

const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

function checkProductCount() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    let apiPath = '/wp-json/wc/v3/products?per_page=1&page=1';
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = '/wp/wp-json/wc/v3/products?per_page=1&page=1';
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
          const total = res.headers['x-wp-total'];
          const totalPages = res.headers['x-wp-totalpages'];
          console.log('📊 WooCommerce Product Count:');
          console.log(`   Total products: ${total}`);
          console.log(`   Total pages: ${totalPages}`);
          console.log(`   Products per page: 100`);
          console.log(`   Expected to fetch: ${total} products`);
          resolve({ total, totalPages });
        } else {
          console.log('❌ Error:', res.statusCode);
          console.log(data.substring(0, 200));
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('❌ Connection error:', e.message);
      reject(e);
    });
    
    req.end();
  });
}

// Also test fetching all products
async function testFetchAll() {
  try {
    console.log('\n🧪 Testing full fetch...\n');
    
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
              allProducts.push(...products);
              
              const totalPagesHeader = res.headers['x-wp-totalpages'];
              totalPages = parseInt(String(totalPagesHeader || '1'));
              
              console.log(`   Page ${page}/${totalPages}: ${products.length} products`);
              
              if (page < totalPages) {
                fetchPage(page + 1).then(resolvePage).catch(rejectPage);
              } else {
                console.log(`\n✅ Successfully fetched ${allProducts.length} products`);
                resolvePage(allProducts.length);
              }
            } else {
              rejectPage(new Error(`Status ${res.statusCode}`));
            }
          });
        });
        
        req.on('error', rejectPage);
        req.end();
      });
    }
    
    const fetchedCount = await fetchPage(1);
    return fetchedCount;
  } catch (error) {
    console.error('❌ Error fetching all:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await checkProductCount();
    const fetched = await testFetchAll();
    console.log(`\n📈 Summary:`);
    console.log(`   WooCommerce total: 209 (as you mentioned)`);
    console.log(`   Actually fetched: ${fetched}`);
    console.log(`   Difference: ${209 - fetched}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

