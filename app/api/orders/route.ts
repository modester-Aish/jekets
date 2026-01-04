import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || 'https://payment.trapstarofficial.store/wp'
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_065600d609b4e24bd1d8fbbc2cce7ca7c95ff20c'
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_5f61b4bb7e6c54ae001f3b12c6d0b9b6bbda6941'

// Update existing order in WooCommerce
function updateOrderInWooCommerce(orderId: number, updateData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    
    let apiPath = `/wp-json/wc/v3/orders/${orderId}`
    let baseUrl = WOOCOMMERCE_URL
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/orders/${orderId}`
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '')
    }
    
    const apiUrl = new URL(apiPath, baseUrl)
    
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
            resolve(order)
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

// Create order in WooCommerce
function createOrderInWooCommerce(orderData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    
    let apiPath = `/wp-json/wc/v3/orders`
    let baseUrl = WOOCOMMERCE_URL
    
    if (WOOCOMMERCE_URL.endsWith('/wp') || WOOCOMMERCE_URL.endsWith('/wp/')) {
      apiPath = `/wp/wp-json/wc/v3/orders`
      baseUrl = WOOCOMMERCE_URL.replace(/\/wp\/?$/, '')
    }
    
    const apiUrl = new URL(apiPath, baseUrl)
    
    const postData = JSON.stringify(orderData)
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: apiUrl.pathname,
      method: 'POST',
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
            resolve(order)
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

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, size, customer, paymentId, paymentMethod, paid } = body
    
    if (!productId || !customer) {
      return NextResponse.json(
        { error: 'Product ID and customer information are required' },
        { status: 400 }
      )
    }
    
    // Prepare order data for WooCommerce
    const orderData = {
      payment_method: paymentMethod || 'card',
      payment_method_title: paymentMethod === 'card' ? 'Credit/Debit Card' : 'Direct Bank Transfer',
      set_paid: paid === true, // Set to true if payment is already received
      billing: {
        first_name: customer.firstName || '',
        last_name: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address_1: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postcode: customer.postcode || '',
        country: customer.country || 'US'
      },
      shipping: {
        first_name: customer.firstName || '',
        last_name: customer.lastName || '',
        address_1: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postcode: customer.postcode || '',
        country: customer.country || 'US'
      },
      line_items: [
        {
          product_id: productId,
          quantity: quantity || 1,
          meta_data: size ? [
            {
              key: 'Size',
              value: size
            }
          ] : []
        }
      ],
      meta_data: [
        {
          key: '_order_source',
          value: 'trapstarofficial.store'
        },
        ...(paymentId ? [{
          key: '_payment_id',
          value: paymentId
        }] : [])
      ]
    }
    
    const order = await createOrderInWooCommerce(orderData)
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.number,
        status: order.status,
        total: order.total,
        currency: order.currency
      }
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', message: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, paid, paymentId } = body
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    const updateData: any = {}
    if (status) updateData.status = status
    if (paid !== undefined) updateData.set_paid = paid
    
    if (paymentId) {
      updateData.meta_data = [
        {
          key: '_payment_id',
          value: paymentId
        }
      ]
    }
    
    const order = await updateOrderInWooCommerce(orderId, updateData)
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        paid: order.status === 'processing' || order.status === 'completed'
      }
    })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order', message: error.message },
      { status: 500 }
    )
  }
}


