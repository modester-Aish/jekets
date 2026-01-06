const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./woocommerce_config');

// WooCommerce API credentials
const WOOCOMMERCE_URL = config.WOOCOMMERCE_URL;
const CONSUMER_KEY = config.CONSUMER_KEY;
const CONSUMER_SECRET = config.CONSUMER_SECRET;

// Read trapstar_london_products.csv
const csvPath = path.join(__dirname, '..', 'trapstar_london_products.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Get headers
const headers = lines[0].split(',').map(h => h.trim());

// Parse CSV and create maps by product name and category
const csvProducts = new Map(); // by name
const csvByCategory = new Map(); // by category -> array of products

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
    // Normalize name for matching (remove extra spaces, convert to lowercase, remove special chars)
    const normalizedName = row.name.trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')
      .trim();
    csvProducts.set(normalizedName, row);
    
    // Also store a simplified version (remove PRE ORDER, colors, etc.)
    const simplifiedName = normalizedName
      .replace(/\*pre order\*/g, '')
      .replace(/\s*-\s*(black|blue|grey|gray|pink|red|white|yellow|teal|purple|orange|green|brown|beige|navy|maroon|cream|tan|silver|gold|multicolor|multicolour).*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (simplifiedName && simplifiedName !== normalizedName) {
      csvProducts.set(simplifiedName, row);
    }
    
    // Store by category for category-based matching
    const category = (row.category || '').toLowerCase().trim();
    if (category) {
      if (!csvByCategory.has(category)) {
        csvByCategory.set(category, []);
      }
      csvByCategory.get(category).push(row);
    }
    
    // Debug: log first few categories
    if (i <= 5) {
      console.log(`CSV Product ${i}: ${row.name} -> Category: ${category}`);
    }
  }
}

console.log(`📦 Loaded ${csvProducts.size} products from CSV`);

// Helper function to parse price
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[£$,]/g, '')) || 0;
}

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
    
    function fetchPage(page, retries = 3) {
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
          timeout: 30000 // 30 second timeout
        };
        
        const attemptFetch = () => {
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
                  fetchPage(page + 1, 3).then(resolvePage).catch(rejectPage);
                } else {
                  resolvePage(allProducts);
                }
              } else if (res.statusCode === 502 && retries > 0) {
                // Retry on 502 error
                console.log(`⚠️  Got 502 error on page ${page}, retrying... (${retries} retries left)`);
                setTimeout(() => {
                  attemptFetch();
                }, 2000);
              } else {
                rejectPage(new Error(`Status ${res.statusCode}: ${data.substring(0, 200)}`));
              }
            });
          });
          
          req.on('error', (error) => {
            if (retries > 0 && (error.message.includes('ECONNRESET') || error.message.includes('socket'))) {
              console.log(`⚠️  Connection error on page ${page}, retrying... (${retries} retries left)`);
              setTimeout(() => {
                attemptFetch();
              }, 2000);
            } else {
              console.error(`❌ Request error on page ${page}:`, error.message);
              rejectPage(error);
            }
          });
          
          req.on('timeout', () => {
            if (retries > 0) {
              console.log(`⚠️  Timeout on page ${page}, retrying... (${retries} retries left)`);
              req.destroy();
              setTimeout(() => {
                attemptFetch();
              }, 2000);
            } else {
              console.error(`❌ Request timeout on page ${page}`);
              req.destroy();
              rejectPage(new Error('Request timeout'));
            }
          });
          
          req.end();
        };
        
        attemptFetch();
      });
    }
    
    fetchPage(1).then(resolve).catch(reject);
  });
}

// Update product price in WooCommerce
function updateProductPrice(productId, regularPrice, salePrice) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const updateData = {
      regular_price: regularPrice > 0 ? regularPrice.toString() : '0',
      sale_price: salePrice > 0 && salePrice < regularPrice ? salePrice.toString() : ''
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
      path: apiUrl.pathname,
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000 // 30 second timeout
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
    
    req.on('error', (error) => {
      console.error(`❌ Update error for product ${productId}:`, error.message);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error(`❌ Update timeout for product ${productId}`);
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Main function to update prices
async function updatePrices() {
  console.log('🚀 Starting price update from CSV...\n');
  
  try {
    // Fetch all products from WooCommerce
    console.log('📥 Fetching all products from WooCommerce...\n');
    const wooProducts = await fetchAllProducts();
    console.log(`✅ Fetched ${wooProducts.length} products from WooCommerce\n`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    let noChangeCount = 0;
    
    console.log('🔄 Updating prices...\n');
    
    for (const wooProduct of wooProducts) {
      // Normalize product name for matching
      const normalizedName = wooProduct.name.trim().toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')
        .trim();
      
      // Try to find matching product in CSV
      let csvProduct = csvProducts.get(normalizedName);
      
      // If not found, try simplified version
      if (!csvProduct) {
        const simplifiedName = normalizedName
          .replace(/\*pre order\*/g, '')
          .replace(/\s*-\s*(black|blue|grey|gray|pink|red|white|yellow|teal|purple|orange|green|brown|beige|navy|maroon|cream|tan|silver|gold|multicolor|multicolour).*$/i, '')
          .replace(/\s+/g, ' ')
          .trim();
        csvProduct = csvProducts.get(simplifiedName);
      }
      
      if (csvProduct) {
        const csvSalePrice = parsePrice(csvProduct.price);
        const csvRegularPrice = parsePrice(csvProduct.original_price) || csvSalePrice;
        
        const currentRegularPrice = parseFloat(wooProduct.regular_price || '0');
        const currentSalePrice = parseFloat(wooProduct.sale_price || '0');
        
        // Check if prices need updating
        const regularPriceChanged = Math.abs(currentRegularPrice - csvRegularPrice) > 0.01;
        const salePriceChanged = Math.abs(currentSalePrice - csvSalePrice) > 0.01;
        
        if (regularPriceChanged || salePriceChanged) {
          try {
            await updateProductPrice(wooProduct.id, csvRegularPrice, csvSalePrice);
            console.log(`✅ Updated: ${wooProduct.name} - £${csvSalePrice}${csvRegularPrice > csvSalePrice ? ` (was £${csvRegularPrice})` : ''}`);
            updatedCount++;
            
            // Delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`❌ Failed to update ${wooProduct.name}:`, error.message);
          }
        } else {
          noChangeCount++;
        }
      } else {
        // Try category-based matching
        let found = false;
        if (wooProduct.categories && wooProduct.categories.length > 0) {
          const wooCategory = wooProduct.categories[0].name.toLowerCase().trim();
          
          // Map WooCommerce categories to CSV categories
          const categoryMap = {
            'hoodies': 'hoodies',
            'jackets': 'jackets',
            't-shirts': 't-shirts',
            'tracksuits': 'tracksuits',
            'shorts': 'shorts',
            'short sets': 'shorts',
            'bags': 'bags',
            'accessories': 'accessories'
          };
          
          const csvCategory = categoryMap[wooCategory] || wooCategory;
          const categoryProducts = csvByCategory.get(csvCategory);
          
          if (categoryProducts && categoryProducts.length > 0) {
            // Use the first product from same category as price reference
            const csvProduct = categoryProducts[0];
            const csvSalePrice = parsePrice(csvProduct.price);
            const csvRegularPrice = parsePrice(csvProduct.original_price) || csvSalePrice;
            
            const currentRegularPrice = parseFloat(wooProduct.regular_price || '0');
            const currentSalePrice = parseFloat(wooProduct.sale_price || '0');
            
            const regularPriceChanged = Math.abs(currentRegularPrice - csvRegularPrice) > 0.01;
            const salePriceChanged = Math.abs(currentSalePrice - csvSalePrice) > 0.01;
            
            if (regularPriceChanged || salePriceChanged) {
              try {
                await updateProductPrice(wooProduct.id, csvRegularPrice, csvSalePrice);
                console.log(`✅ Updated (category: ${csvCategory}): ${wooProduct.name} - £${csvSalePrice}${csvRegularPrice > csvSalePrice ? ` (was £${csvRegularPrice})` : ''}`);
                updatedCount++;
                found = true;
                
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (error) {
                console.error(`❌ Failed to update ${wooProduct.name}:`, error.message);
              }
            } else {
              noChangeCount++;
              found = true;
            }
          }
        }
        
        if (!found) {
          notFoundCount++;
          if (notFoundCount <= 10) {
            console.log(`⚠️  Not found in CSV: ${wooProduct.name}`);
          }
        }
      }
    }
    
    console.log(`\n✅ Price update complete!`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   No change needed: ${noChangeCount}`);
    console.log(`   Not found in CSV: ${notFoundCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run update
if (require.main === module) {
  updatePrices().catch(console.error);
}

module.exports = { updatePrices };

