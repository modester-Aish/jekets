const https = require('https');
const http = require('http');

function testAPI() {
  return new Promise((resolve, reject) => {
    const url = 'http://localhost:3000/api/products';
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          console.log(`\n✅ API Response:`);
          console.log(`   Total products fetched: ${products.length}`);
          console.log(`   Expected: 209 products`);
          console.log(`   Difference: ${209 - products.length}`);
          
          if (products.length > 0) {
            console.log(`\n📦 Sample products (first 5):`);
            products.slice(0, 5).forEach((p, i) => {
              console.log(`   ${i + 1}. ${p.title} - £${p.price || 'N/A'}`);
            });
          }
          
          resolve(products.length);
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          console.log('Response:', data.substring(0, 200));
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      console.log('Make sure the dev server is running on http://localhost:3000');
      reject(error);
    });
  });
}

// Wait a bit for server to start, then test
setTimeout(() => {
  testAPI().catch(() => {
    console.log('\n⚠️  Server might not be ready yet. Please wait a few seconds and try again.');
  });
}, 3000);

