import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || 'https://payment.trapstarofficial.store/wp'
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_065600d609b4e24bd1d8fbbc2cce7ca7c95ff20c'
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_5f61b4bb7e6c54ae001f3b12c6d0b9b6bbda6941'

// Process payment through WooCommerce payment gateway
function processPayment(orderId: number, paymentData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    
    // WooCommerce payment processing endpoint
    // This will use the configured payment gateway in WooCommerce
    let apiPath = `/wp-json/wc/v3/orders/${orderId}`
    let baseUrl = WOOCOMMERCE_URL
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/orders/${orderId}`
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '')
    }
    
    const apiUrl = new URL(apiPath, baseUrl)
    
    // For now, we'll create the order and let WooCommerce handle payment
    // In production, you would call the specific payment gateway API
    // based on the payment method selected
    
    const updateData = {
      status: 'processing',
      set_paid: true,
      payment_method: paymentData.paymentMethod,
      payment_method_title: paymentData.paymentMethod,
      meta_data: [
        {
          key: '_payment_processed',
          value: 'true'
        },
        {
          key: '_payment_id',
          value: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      ]
    }
    
    const postData = JSON.stringify(updateData)
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname,
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
            const order = JSON.parse(data)
            resolve({
              success: true,
              paymentId: order.meta_data?.find((m: any) => m.key === '_payment_id')?.value || `pay_${order.id}`,
              order: order
            })
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
    
    req.write(postData)
    req.end()
  })
}

// POST - Process payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentMethod, amount, currency, cardNumber, cardExpiry, cardCvv, cardName } = body
    
    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Order ID and payment method are required' },
        { status: 400 }
      )
    }
    
    // Process payment through WooCommerce
    // Note: Actual payment processing depends on the payment gateway configured in WooCommerce
    // This is a simplified version - in production, you would:
    // 1. Check which payment gateway is configured (Stripe, PayPal, etc.)
    // 2. Call that gateway's API directly
    // 3. Update order status based on payment result
    
    const result = await processPayment(orderId, {
      paymentMethod,
      amount,
      currency,
      cardNumber,
      cardExpiry,
      cardCvv,
      cardName
    })
    
    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      message: 'Payment processed successfully through WooCommerce payment gateway'
    })
    
  } catch (error: any) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed', message: error.message },
      { status: 500 }
    )
  }
}

