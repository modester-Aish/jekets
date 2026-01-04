const https = require('https');
const config = require('./woocommerce_config');

const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

console.log('🔍 Testing WooCommerce API connection...\n');
console.log(`URL: ${WOOCOMMERCE_URL}`);
console.log(`Endpoint: /wp-json/wc/v3/products\n`);

// Test API connection
function testConnection() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    // Construct API URL - if WOOCOMMERCE_URL ends with /wp, add /wp-json, otherwise use standard path
    let apiPath = '/wp-json/wc/v3/products?per_page=1';
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      // WordPress is in /wp/ subdirectory
      apiPath = '/wp/wp-json/wc/v3/products?per_page=1';
      const baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
      var apiUrl = new URL(apiPath, baseUrl);
    } else {
      var apiUrl = new URL(apiPath, WOOCOMMERCE_URL);
    }
    
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
    
    console.log(`Testing: ${apiUrl.href}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ API connection successful!');
          try {
            const products = JSON.parse(data);
            console.log(`Found ${products.length} product(s) in WooCommerce`);
          } catch (e) {
            console.log('Response:', data.substring(0, 200));
          }
          resolve(true);
        } else {
          console.log('❌ API connection failed!');
          console.log('Response:', data.substring(0, 500));
          if (res.statusCode === 404) {
            console.log('\n⚠️  Possible issues:');
            console.log('1. WooCommerce REST API might not be enabled');
            console.log('2. WordPress might not be installed at this URL');
            console.log('3. The API endpoint path might be different');
            console.log('\nCheck: Settings > Advanced > REST API in WooCommerce');
          }
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

testConnection().catch(() => {
  process.exit(1);
});

