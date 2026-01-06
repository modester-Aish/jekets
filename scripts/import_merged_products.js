const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./woocommerce_config');

const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

// Read merged_products.csv
const csvPath = path.join(__dirname, '..', 'merged_products.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Get headers
const headers = lines[0].split(',').map(h => h.trim());

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line) {
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
  return values;
}

// Parse CSV
const products = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = parseCSVLine(line);
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || '';
  });
  
  if (row.name && row.name.trim()) {
    products.push(row);
  }
}

console.log(`📦 Loaded ${products.length} products from merged_products.csv\n`);

// Category mapping
const categoryMap = {
  'Hoodies': 'Hoodies',
  'T-Shirts': 'T-Shirts',
  'Tracksuits': 'Tracksuits',
  'Shorts': 'Shorts',
  'Short Sets': 'Shorts',
  'Bags': 'Bags',
  'Jackets': 'Jackets',
  'Accessories': 'Accessories',
  'Outerwear': 'Jackets'
};

// Create category in WooCommerce if it doesn't exist
function createCategory(categoryName) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    let apiPath = '/wp-json/wc/v3/products/categories';
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = '/wp/wp-json/wc/v3/products/categories';
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
    }
    
    const apiUrl = new URL(apiPath, baseUrl);
    const postData = JSON.stringify({ name: categoryName });
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
          const category = JSON.parse(data);
          resolve(category.id);
        } else if (res.statusCode === 400) {
          // Category might already exist, try to find it
          findCategory(categoryName).then(resolve).catch(reject);
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
    req.write(postData);
    req.end();
  });
}

// Find category by name
function findCategory(categoryName) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    let apiPath = `/wp-json/wc/v3/products/categories?search=${encodeURIComponent(categoryName)}`;
    let baseUrl = WOOCOMMERCE_URL;
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/products/categories?search=${encodeURIComponent(categoryName)}`;
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
          const categories = JSON.parse(data);
          const found = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
          if (found) {
            resolve(found.id);
          } else {
            createCategory(categoryName).then(resolve).catch(reject);
          }
        } else {
          createCategory(categoryName).then(resolve).catch(reject);
        }
      });
    });
    
    req.on('error', () => createCategory(categoryName).then(resolve).catch(reject));
    req.on('timeout', () => {
      req.destroy();
      createCategory(categoryName).then(resolve).catch(reject);
    });
    req.end();
  });
}

// Import product to WooCommerce
function importProduct(product) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    // Parse prices
    const price = parseFloat((product.price || '').replace(/[£$,]/g, '')) || 0;
    const originalPrice = parseFloat((product.original_price || '').replace(/[£$,]/g, '')) || 0;
    
    // Determine regular and sale price
    let regularPrice = price;
    let salePrice = '';
    if (originalPrice > 0 && originalPrice > price) {
      regularPrice = originalPrice;
      salePrice = price > 0 ? price : '';
    }
    
    // Get category
    const categoryName = categoryMap[product.category] || product.category || 'Hoodies';
    
    // Create product data
    const productData = {
      name: product.name,
      type: 'simple',
      regular_price: regularPrice > 0 ? regularPrice.toString() : '',
      sale_price: salePrice > 0 ? salePrice.toString() : '',
      description: product.description || product.name,
      short_description: product.description || product.name,
      sku: product.sku || '',
      manage_stock: false,
      stock_status: (product.in_stock || '').toLowerCase().includes('in stock') ? 'instock' : 'outofstock',
      categories: [], // Will be set after category is created
      images: product.image_url ? [{ src: product.image_url }] : [],
      meta_data: [
        { key: '_original_category', value: product.category || '' }
      ]
    };
    
    // First create/get category, then create product
    findCategory(categoryName)
      .then(categoryId => {
        productData.categories = [{ id: categoryId }];
        
        const postData = JSON.stringify(productData);
        
        let apiPath = '/wp-json/wc/v3/products';
        let baseUrl = WOOCOMMERCE_URL;
        
        if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
          apiPath = '/wp/wp-json/wc/v3/products';
          baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '');
        }
        
        const apiUrl = new URL(apiPath, baseUrl);
        
        const options = {
          hostname: apiUrl.hostname,
          port: apiUrl.port || 443,
          path: apiUrl.pathname,
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
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
        req.write(postData);
        req.end();
      })
      .catch(reject);
  });
}

// Main import function
async function importAllProducts() {
  const START_FROM_INDEX = 167; // Start from 168th product (0-indexed, so 167 = 168th)
  
  console.log(`🚀 Starting import to WooCommerce from product ${START_FROM_INDEX + 1}...\n`);
  
  let importedCount = 0;
  let failedCount = 0;
  
  for (let i = START_FROM_INDEX; i < products.length; i++) {
    const product = products[i];
    try {
      await importProduct(product);
      console.log(`✅ [${i + 1}/${products.length}] Imported: ${product.name}`);
      importedCount++;
      
      // Delay to avoid rate limiting (2 seconds between imports)
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ [${i + 1}/${products.length}] Failed: ${product.name} - ${error.message}`);
      failedCount++;
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${importedCount}`);
  console.log(`   Failed: ${failedCount}`);
}

// Run import
importAllProducts().catch(console.error);


