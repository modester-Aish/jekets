import { NextResponse } from 'next/server'
import https from 'https'

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || 'https://payment.trapstarofficial.store/wp'
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_065600d609b4e24bd1d8fbbc2cce7ca7c95ff20c'
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_5f61b4bb7e6c54ae001f3b12c6d0b9b6bbda6941'

// Fetch available payment methods from WooCommerce
function fetchPaymentMethods(): Promise<any> {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    
    let apiPath = `/wp-json/wc/v3/payment_gateways`
    let baseUrl = WOOCOMMERCE_URL
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/payment_gateways`
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '')
    }
    
    const apiUrl = new URL(apiPath, baseUrl)
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const paymentMethods = JSON.parse(data)
            // Filter only enabled payment methods
            const enabledMethods = paymentMethods.filter((method: any) => method.enabled === true)
            resolve(enabledMethods)
          } catch (error) {
            reject(new Error('Failed to parse response'))
          }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.end()
  })
}

// GET - Fetch available payment methods
export async function GET() {
  try {
    const paymentMethods = await fetchPaymentMethods()
    return NextResponse.json(paymentMethods)
  } catch (error: any) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods', message: error.message },
      { status: 500 }
    )
  }
}

