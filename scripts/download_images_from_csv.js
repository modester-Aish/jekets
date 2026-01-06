// Download product images from merged_products.csv and save to public/products/
// This script reads the CSV file and downloads all images

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const CSV_FILE = path.join(process.cwd(), 'merged_products.csv')
const PRODUCTS_IMAGES_DIR = path.join(process.cwd(), 'public', 'products')

// Ensure products directory exists
if (!fs.existsSync(PRODUCTS_IMAGES_DIR)) {
  fs.mkdirSync(PRODUCTS_IMAGES_DIR, { recursive: true })
  console.log(`📁 Created directory: ${PRODUCTS_IMAGES_DIR}`)
}

// Parse CSV file
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const imageUrlIndex = headers.indexOf('image_url')
  const skuIndex = headers.indexOf('sku')
  const nameIndex = headers.indexOf('name')
  
  if (imageUrlIndex === -1) {
    throw new Error('image_url column not found in CSV')
  }
  
  const products = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Handle CSV with commas in quoted fields
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    if (values.length > imageUrlIndex) {
      const imageUrl = values[imageUrlIndex]
      const sku = skuIndex !== -1 ? values[skuIndex] : ''
      const name = nameIndex !== -1 ? values[nameIndex] : ''
      
      if (imageUrl && imageUrl.trim() && imageUrl.startsWith('http')) {
        // Generate filename from SKU or name
        let filename = ''
        if (sku && sku.trim()) {
          // Use SKU, remove size suffix if present (e.g., "07356-XS" -> "07356")
          filename = sku.split('-')[0].trim()
        } else if (name && name.trim()) {
          // Use name, create slug
          filename = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 50) // Limit length
        } else {
          // Use index
          filename = `product-${i}`
        }
        
        // Ensure unique filename
        let finalFilename = `${filename}.jpg`
        let counter = 1
        while (products.some(p => p.filename === finalFilename)) {
          finalFilename = `${filename}-${counter}.jpg`
          counter++
        }
        
        products.push({
          imageUrl: imageUrl.trim(),
          filename: finalFilename,
          sku: sku || '',
          name: name || '',
          index: i
        })
      }
    }
  }
  
  return products
}

// Download image function
function downloadImage(imageUrl, filename, retries = 3) {
  return new Promise((resolve, reject) => {
    const imageUrlObj = new URL(imageUrl)
    const filepath = path.join(PRODUCTS_IMAGES_DIR, filename)
    
    // Skip if image already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Image already exists: ${filename}`)
      resolve(`/products/${filename}`)
      return
    }
    
    const protocol = imageUrlObj.protocol === 'https:' ? https : http
    
    const options = {
      hostname: imageUrlObj.hostname,
      port: imageUrlObj.port || (imageUrlObj.protocol === 'https:' ? 443 : 80),
      path: imageUrlObj.pathname + (imageUrlObj.search || ''),
      method: 'GET',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
    
    const file = fs.createWriteStream(filepath)
    
    const req = protocol.request(options, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          console.log(`✅ Downloaded: ${filename}`)
          resolve(`/products/${filename}`)
        })
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        file.close()
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
        if (retries > 0) {
          const redirectUrl = res.headers.location
          console.log(`🔄 Redirect to: ${redirectUrl}`)
          downloadImage(redirectUrl, filename, retries - 1).then(resolve).catch(reject)
        } else {
          reject(new Error(`Too many redirects`))
        }
      } else {
        file.close()
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
        reject(new Error(`Status ${res.statusCode}`))
      }
    })
    
    req.on('error', (error) => {
      file.close()
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      if (retries > 0) {
        console.log(`⚠️  Error downloading ${filename}, retrying... (${retries} attempts left)`)
        setTimeout(() => {
          downloadImage(imageUrl, filename, retries - 1).then(resolve).catch(reject)
        }, 2000)
      } else {
        reject(error)
      }
    })
    
    req.on('timeout', () => {
      req.destroy()
      file.close()
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      if (retries > 0) {
        console.log(`⚠️  Timeout downloading ${filename}, retrying... (${retries} attempts left)`)
        setTimeout(() => {
          downloadImage(imageUrl, filename, retries - 1).then(resolve).catch(reject)
        }, 2000)
      } else {
        reject(new Error('Request timeout'))
      }
    })
    
    req.end()
  })
}

// Main function to download all images
async function downloadAllImagesFromCSV() {
  console.log('📖 Reading CSV file...')
  
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`)
    return
  }
  
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8')
  const products = parseCSV(csvContent)
  
  console.log(`\n📥 Found ${products.length} products with images`)
  console.log('🖼️  Starting image downloads...\n')
  
  let downloaded = 0
  let skipped = 0
  let failed = 0
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    try {
      await downloadImage(product.imageUrl, product.filename)
      downloaded++
      
      // Small delay to avoid overwhelming the server
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } catch (error) {
      console.error(`❌ Failed to download image for ${product.filename} (${product.name || product.sku || product.index}):`, error.message)
      failed++
    }
  }
  
  console.log(`\n✅ Download complete:`)
  console.log(`   - Downloaded: ${downloaded}`)
  console.log(`   - Skipped (already exists): ${skipped}`)
  console.log(`   - Failed: ${failed}`)
  console.log(`\n💾 Images saved to: ${PRODUCTS_IMAGES_DIR}`)
}

// Run the script
downloadAllImagesFromCSV().catch(console.error)

