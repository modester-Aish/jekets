const https = require('https');
const config = require('./woocommerce_config');

const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

console.log('🧪 Testing WooCommerce connection...\n');
console.log('URL:', WOOCOMMERCE_URL);
console.log('Consumer Key:', CONSUMER_KEY.substring(0, 10) + '...');

const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

let apiPath = '/wp-json/wc/v3/products?per_page=10&page=1';
let baseUrl = WOOCOMMERCE_URL;

if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
  apiPath = '/wp/wp-json/wc/v3/products?per_page=10&page=1';
  baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
}

const apiUrl = new URL(apiPath, baseUrl);

console.log('Full URL:', apiUrl.href);
console.log('Hostname:', apiUrl.hostname);
console.log('Path:', apiUrl.pathname + apiUrl.search);
console.log('\n');

const options = {
  hostname: apiUrl.hostname,
  port: apiUrl.port || 443,
  path: apiUrl.pathname + (apiUrl.search || ''),
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', {
    'x-wp-total': res.headers['x-wp-total'],
    'x-wp-totalpages': res.headers['x-wp-totalpages']
  });
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const products = JSON.parse(data);
        console.log(`\n✅ Success! Fetched ${products.length} products`);
        if (products.length > 0) {
          console.log('\nFirst product:', {
            id: products[0].id,
            name: products[0].name,
            price: products[0].regular_price,
            stock_status: products[0].stock_status
          });
        }
      } catch (error) {
        console.error('❌ Parse error:', error.message);
        console.log('Response:', data.substring(0, 500));
      }
    } else {
      console.error(`❌ Error: Status ${res.statusCode}`);
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  if (error.code === 'ENOTFOUND') {
    console.error('   DNS lookup failed - check the URL');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('   Connection refused - server might be down');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('   Connection timeout');
  }
});

req.on('timeout', () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.end();

