const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./woocommerce_config');

// WooCommerce API credentials
const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

// Read trapstar.csv
const csvPath = path.join(__dirname, '..', 'data', 'trapstar.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Get headers
const headers = lines[0].split(',').map(h => h.trim());

// Parse CSV
const products = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || '';
  });
  
  if (row.name && row.name.trim()) {
    products.push(row);
  }
}

console.log(`📦 Found ${products.length} products to import`);

// WooCommerce API function
function createProduct(product, index) {
  return new Promise((resolve, reject) => {
    const price = parseFloat((product.price || '').replace(/[£$,]/g, '')) || 0;
    const regularPrice = parseFloat((product.original_price || product.price || '').replace(/[£$,]/g, '')) || price;
    
    const categoryMap = {
      'Bags': 'bags',
      'Hoodies': 'hoodies',
      'Jackets': 'jackets',
      'Short Sets': 'shorts',
      'T-Shirts': 't-shirts',
      'Tracksuits': 'tracksuits'
    };
    
    const category = categoryMap[product.category] || 'hoodies';
    
    // First, get or create category in WooCommerce
    // For now, we'll use category name - WooCommerce will create if doesn't exist
    const categoryName = product.category || 'Uncategorized';
    
    const woocommerceProduct = {
      name: product.name,
      type: 'external', // External product type
      regular_price: regularPrice.toString(),
      sale_price: price < regularPrice ? price.toString() : '',
      description: product.description || product.name,
      short_description: product.description || '',
      categories: [{ name: categoryName }], // Category will be created if doesn't exist
      images: product.image_url ? [{ src: product.image_url }] : [],
      external_url: '', // Empty - user will add external links manually in WooCommerce
      button_text: 'Buy Now',
      manage_stock: false,
      stock_status: product.in_stock === 'In Stock' ? 'instock' : 'outofstock',
      sku: product.sku || `trapstar-${index + 1}`,
      meta_data: [
        { key: '_original_category', value: categoryName } // Store original category
      ]
    };
    
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const postData = JSON.stringify(woocommerceProduct);
    
    // Construct full URL - if WOOCOMMERCE_URL ends with /wp, WordPress is in subdirectory
    let apiPath = '/wp-json/wc/v3/products';
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      // WordPress is in /wp/ subdirectory, so API is at /wp/wp-json
      apiPath = '/wp/wp-json/wc/v3/products';
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
    }
    
    const apiUrl = new URL(apiPath, baseUrl);
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname + (apiUrl.search || ''),
      method: 'POST',
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
          const created = JSON.parse(data);
          console.log(`✅ Imported: ${product.name} (ID: ${created.id})`);
          resolve(created);
        } else {
          console.error(`❌ Failed: ${product.name} - ${res.statusCode} - ${data}`);
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Error importing ${product.name}:`, error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Import products one by one with delay
async function importProducts() {
  console.log('🚀 Starting WooCommerce import...\n');
  
  if (WOOCOMMERCE_URL === 'https://your-woocommerce-site.com') {
    console.log('⚠️  Please update WOOCOMMERCE_URL in scripts/woocommerce_config.js first!\n');
    process.exit(1);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  console.log(`\n📝 Importing ${products.length} products with categories...\n`);
  
  for (let i = 0; i < products.length; i++) {
    try {
      await createProduct(products[i], i);
      successCount++;
      // Delay to avoid rate limiting (2 seconds between requests)
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      failCount++;
      // Continue even if one fails
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
}

// Run import
if (require.main === module) {
  importProducts().catch(console.error);
}

module.exports = { importProducts };

