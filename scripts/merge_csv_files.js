const fs = require('fs');
const path = require('path');

// File paths
const londonCsvPath = path.join(__dirname, '..', 'trapstar_london_products.csv');
const simpleCsvPath = path.join(__dirname, '..', 'data', 'trapstar.csv');
const outputCsvPath = path.join(__dirname, '..', 'merged_products.csv');

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

// Read and parse CSV file
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

// Normalize product name for matching
function normalizeName(name) {
  return name.trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// Main merge function
function mergeCSVFiles() {
  console.log('🔄 Merging CSV files...\n');
  
  // Read both CSV files
  console.log('📥 Reading trapstar_london_products.csv...');
  const londonData = readCSV(londonCsvPath);
  console.log(`   Found ${londonData.rows.length} products\n`);
  
  console.log('📥 Reading data/trapstar.csv...');
  const simpleData = readCSV(simpleCsvPath);
  console.log(`   Found ${simpleData.rows.length} products\n`);
  
  // Create a map of London products by normalized name (for price lookup)
  const londonPriceMap = new Map();
  londonData.rows.forEach(row => {
    if (row.name) {
      const normalized = normalizeName(row.name);
      londonPriceMap.set(normalized, {
        price: row.price || '',
        original_price: row.original_price || ''
      });
    }
  });
  
  // Start with London products (they have priority)
  const mergedProducts = new Map();
  const seenNames = new Set();
  
  // Add all London products first
  londonData.rows.forEach(row => {
    if (row.name) {
      const normalized = normalizeName(row.name);
      mergedProducts.set(normalized, row);
      seenNames.add(normalized);
    }
  });
  
  console.log(`✅ Added ${londonData.rows.length} products from trapstar_london_products.csv`);
  
  // Add products from simple CSV, updating prices if found in London CSV
  let addedFromSimple = 0;
  let updatedPrices = 0;
  
  simpleData.rows.forEach(row => {
    if (row.name) {
      const normalized = normalizeName(row.name);
      
      // If product already exists (from London CSV), skip
      if (seenNames.has(normalized)) {
        return;
      }
      
      // Check if we can find a price match in London CSV (by category and similar name)
      let priceMatch = null;
      const simpleCategory = (row.category || '').toLowerCase().trim();
      
      // First try exact name match
      for (const [londonName, londonPrices] of londonPriceMap.entries()) {
        if (normalized === londonName) {
          priceMatch = londonPrices;
          break;
        }
      }
      
      // If not found, try partial match with same category
      if (!priceMatch && simpleCategory) {
        for (const londonRow of londonData.rows) {
          const londonCategory = (londonRow.category || '').toLowerCase().trim();
          if (londonCategory === simpleCategory) {
            const londonNormalized = normalizeName(londonRow.name || '');
            // Check if product types match (e.g., both have "Hoodie" or "Tee")
            const simpleType = normalized.match(/(hoodie|tee|jacket|tracksuit|shorts|bag)/i);
            const londonType = londonNormalized.match(/(hoodie|tee|jacket|tracksuit|shorts|bag)/i);
            
            if (simpleType && londonType && simpleType[0].toLowerCase() === londonType[0].toLowerCase()) {
              priceMatch = {
                price: londonRow.price || '',
                original_price: londonRow.original_price || ''
              };
              break;
            }
          }
        }
      }
      
      // If still not found, use first product from same category in London CSV
      if (!priceMatch && simpleCategory) {
        for (const londonRow of londonData.rows) {
          const londonCategory = (londonRow.category || '').toLowerCase().trim();
          if (londonCategory === simpleCategory) {
            priceMatch = {
              price: londonRow.price || '',
              original_price: londonRow.original_price || ''
            };
            break;
          }
        }
      }
      
      // Always update prices from London CSV based on category
      // Priority: 1) Exact match, 2) Category match, 3) Keep original if no match
      let priceUpdated = false;
      
      if (simpleCategory) {
        // First use price match if found
        if (priceMatch && (priceMatch.price || priceMatch.original_price)) {
          row.price = priceMatch.price;
          row.original_price = priceMatch.original_price;
          priceUpdated = true;
        } else {
          // Use category-based pricing from London CSV
          for (const londonRow of londonData.rows) {
            const londonCategory = (londonRow.category || '').toLowerCase().trim();
            if (londonCategory === simpleCategory && (londonRow.price || londonRow.original_price)) {
              row.price = londonRow.price || '';
              row.original_price = londonRow.original_price || '';
              priceUpdated = true;
              break;
            }
          }
        }
        
        // If still no price found, calculate average price for category
        if (!priceUpdated) {
          const categoryPrices = [];
          const categoryOriginalPrices = [];
          
          for (const londonRow of londonData.rows) {
            const londonCategory = (londonRow.category || '').toLowerCase().trim();
            if (londonCategory === simpleCategory) {
              if (londonRow.price) {
                const price = parseFloat(londonRow.price.replace(/[£$,]/g, ''));
                if (price > 0) categoryPrices.push(price);
              }
              if (londonRow.original_price) {
                const origPrice = parseFloat(londonRow.original_price.replace(/[£$,]/g, ''));
                if (origPrice > 0) categoryOriginalPrices.push(origPrice);
              }
            }
          }
          
          if (categoryPrices.length > 0) {
            const avgPrice = categoryPrices.reduce((a, b) => a + b, 0) / categoryPrices.length;
            row.price = `£${avgPrice.toFixed(2)}`;
            priceUpdated = true;
          }
          
          if (categoryOriginalPrices.length > 0) {
            const avgOrigPrice = categoryOriginalPrices.reduce((a, b) => a + b, 0) / categoryOriginalPrices.length;
            row.original_price = `£${avgOrigPrice.toFixed(2)}`;
          }
        }
        
        // If category doesn't exist in London CSV, use reasonable default prices
        if (!priceUpdated) {
          const defaultPrices = {
            'bags': { price: '£50.00', original_price: '£80.00' },
            'jackets': { price: '£199.00', original_price: '£350.00' },
            'accessories': { price: '£25.00', original_price: '' }
          };
          
          const defaultPrice = defaultPrices[simpleCategory];
          if (defaultPrice) {
            row.price = defaultPrice.price;
            row.original_price = defaultPrice.original_price;
            priceUpdated = true;
          } else {
            // For any other category, use average of all London prices
            const allPrices = [];
            for (const londonRow of londonData.rows) {
              if (londonRow.price) {
                const price = parseFloat(londonRow.price.replace(/[£$,]/g, ''));
                if (price > 0) allPrices.push(price);
              }
            }
            if (allPrices.length > 0) {
              const avgPrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
              row.price = `£${avgPrice.toFixed(2)}`;
              priceUpdated = true;
            }
          }
        }
      }
      
      if (priceUpdated) {
        updatedPrices++;
      }
      
      mergedProducts.set(normalized, row);
      seenNames.add(normalized);
      addedFromSimple++;
    }
  });
  
  console.log(`✅ Added ${addedFromSimple} products from data/trapstar.csv`);
  console.log(`✅ Updated prices for ${updatedPrices} products from trapstar_london_products.csv\n`);
  
  // Convert map to array
  const mergedArray = Array.from(mergedProducts.values());
  
  // Write merged CSV
  const headers = londonData.headers.length > 0 ? londonData.headers : simpleData.headers;
  const csvLines = [headers.join(',')];
  
  mergedArray.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes in values
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvLines.push(values.join(','));
  });
  
  fs.writeFileSync(outputCsvPath, csvLines.join('\n'), 'utf-8');
  
  console.log(`✅ Merged CSV created: merged_products.csv`);
  console.log(`   Total products: ${mergedArray.length}`);
  console.log(`   - From trapstar_london_products.csv: ${londonData.rows.length}`);
  console.log(`   - From data/trapstar.csv: ${addedFromSimple}`);
  console.log(`   - Prices updated: ${updatedPrices}`);
}

// Run merge
mergeCSVFiles();

