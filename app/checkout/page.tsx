'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: number
  title: string
  slug: string
  price: number | null
  discountPrice: number | null
  image: string
  woocommerceId?: number
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productSlug = searchParams.get('product')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    size: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  })
  
  useEffect(() => {
    if (productSlug) {
      fetchProduct()
      fetchPaymentMethods()
    } else {
      setLoading(false)
    }
  }, [productSlug])
  
  async function fetchPaymentMethods() {
    try {
      const response = await fetch('/api/woocommerce/payment-methods')
      const methods = await response.json()
      
      // If no methods from WooCommerce, use default methods
      if (methods.length === 0 || (methods.error && methods.error)) {
        const defaultMethods = [
          { id: 'bacs', title: 'Direct Bank Transfer', description: 'Make payment directly into our bank account' },
          { id: 'stripe', title: 'Credit/Debit Card', description: 'Pay securely with your card' },
          { id: 'paypal', title: 'PayPal', description: 'Pay via PayPal' }
        ]
        setPaymentMethods(defaultMethods)
        setSelectedPaymentMethod('bacs')
      } else {
        // Filter out COD from WooCommerce methods
        const filteredMethods = methods.filter((method: any) => method.id !== 'cod')
        setPaymentMethods(filteredMethods)
        if (filteredMethods.length > 0) {
          setSelectedPaymentMethod(filteredMethods[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      // Fallback to default methods
      const defaultMethods = [
        { id: 'bacs', title: 'Direct Bank Transfer', description: 'Make payment directly into our bank account' },
        { id: 'stripe', title: 'Credit/Debit Card', description: 'Pay securely with your card' },
        { id: 'paypal', title: 'PayPal', description: 'Pay via PayPal' }
      ]
      setPaymentMethods(defaultMethods)
      setSelectedPaymentMethod('bacs')
    }
  }
  
  async function fetchProduct() {
    try {
      const response = await fetch('/api/products')
      const products = await response.json()
      const foundProduct = products.find((p: Product) => p.slug === productSlug)
      if (foundProduct) {
        setProduct(foundProduct)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }
  
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setOrderError('')
    
    if (!product || !product.woocommerceId) {
      setOrderError('Product not found')
      setSubmitting(false)
      return
    }
    
    if (!formData.size) {
      setOrderError('Please select a size')
      setSubmitting(false)
      return
    }
    
    if (!selectedPaymentMethod) {
      setOrderError('Please select a payment method')
      setSubmitting(false)
      return
    }
    
    // For card payments, validate card details
    if (selectedPaymentMethod === 'stripe' || selectedPaymentMethod.includes('card') || selectedPaymentMethod.includes('credit')) {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName) {
        setOrderError('Please fill in all payment details')
        setSubmitting(false)
        return
      }
    }
    
    // For Bank Transfer, no card details needed
    if (selectedPaymentMethod === 'bacs') {
      // No card validation needed
    }
    
    try {
      // Create order in WooCommerce first (pending status)
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.woocommerceId,
          quantity: 1,
          size: formData.size,
          paymentMethod: selectedPaymentMethod,
          paid: false, // Will be updated after payment
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country
          }
        })
      })
      
      const orderData = await orderResponse.json()
      
      if (!orderResponse.ok || !orderData.success) {
        setOrderError(orderData.error || 'Failed to create order')
        setSubmitting(false)
        return
      }
      
      // Process payment through WooCommerce payment gateway
      const paymentResponse = await fetch('/api/woocommerce/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderData.order.id,
          paymentMethod: selectedPaymentMethod,
          amount: displayPrice,
          currency: 'USD',
          cardNumber: (selectedPaymentMethod === 'stripe' || selectedPaymentMethod.includes('card')) ? formData.cardNumber?.replace(/\s/g, '') : undefined,
          cardExpiry: (selectedPaymentMethod === 'stripe' || selectedPaymentMethod.includes('card')) ? formData.cardExpiry : undefined,
          cardCvv: (selectedPaymentMethod === 'stripe' || selectedPaymentMethod.includes('card')) ? formData.cardCvv : undefined,
          cardName: (selectedPaymentMethod === 'stripe' || selectedPaymentMethod.includes('card')) ? formData.cardName : undefined
        })
      })
      
      const paymentData = await paymentResponse.json()
      
      if (!paymentResponse.ok || !paymentData.success) {
        setOrderError(paymentData.error || 'Payment failed. Please check your payment details.')
        setSubmitting(false)
        return
      }
      
      // Payment processed successfully through WooCommerce gateway
      // Order is already updated by payment processing API
      setOrderSuccess(true)
    } catch (error: any) {
      setOrderError(error.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/store" className="text-white underline">
            Back to Store
          </Link>
        </div>
      </div>
    )
  }
  
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-400 mb-6">
            Your order has been placed and payment has been processed successfully. You will receive an order confirmation email shortly.
          </p>
          <Link
            href="/store"
            className="bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }
  
  const displayPrice = product.discountPrice || product.price || 0
  
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="flex gap-4 mb-4">
              <img
                src={product.image}
                alt={product.title}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {product.discountPrice && product.price ? (
                    <>
                      <span className="line-through text-gray-500">${product.price.toFixed(2)}</span>
                      <span className="ml-2">${product.discountPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    `$${displayPrice.toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${displayPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Checkout Form */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            
            {orderError && (
              <div className="bg-red-900 text-red-200 p-3 rounded mb-4">
                {orderError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Size Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Size <span className="text-red-500">*</span>
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="">Select Size</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="PK">Pakistan</option>
                    <option value="IN">India</option>
                  </select>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    {paymentMethods.length > 0 ? (
                      paymentMethods.map((method: any) => (
                        <option key={method.id} value={method.id}>
                          {method.title} {method.description ? `- ${method.description}` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="bacs">Direct Bank Transfer - Make payment directly into our bank account</option>
                        <option value="stripe">Credit/Debit Card - Pay securely with your card</option>
                        <option value="paypal">PayPal - Pay via PayPal</option>
                      </>
                    )}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedPaymentMethod === 'bacs' && 'You will receive bank details after order confirmation'}
                    {selectedPaymentMethod === 'stripe' && 'Payment will be processed securely through card'}
                    {selectedPaymentMethod === 'paypal' && 'You will be redirected to PayPal for payment'}
                  </p>
                </div>
                
                {/* Payment Method Specific Fields */}
                
                {/* Card Payment Details */}
                {(selectedPaymentMethod === 'stripe' || 
                  selectedPaymentMethod.includes('card') || 
                  selectedPaymentMethod.includes('credit')) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">Card Details</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Cardholder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\s/g, '')
                          if (value.length <= 16) {
                            value = value.match(/.{1,4}/g)?.join(' ') || value
                            setFormData(prev => ({ ...prev, cardNumber: value }))
                          }
                        }}
                        required
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length <= 4) {
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2)
                              }
                              setFormData(prev => ({ ...prev, cardExpiry: value }))
                            }
                          }}
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardCvv"
                          value={formData.cardCvv}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length <= 4) {
                              setFormData(prev => ({ ...prev, cardCvv: value }))
                            }
                          }}
                          required
                          placeholder="123"
                          maxLength={4}
                          className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Bank Transfer Details */}
                {selectedPaymentMethod === 'bacs' && (
                  <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">Bank Transfer Instructions</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>Please transfer the payment to the following bank account:</p>
                      <div className="mt-3 space-y-1">
                        <p><span className="font-medium text-white">Bank Name:</span> Your Bank Name</p>
                        <p><span className="font-medium text-white">Account Name:</span> Trapstar Official Store</p>
                        <p><span className="font-medium text-white">Account Number:</span> 1234567890</p>
                        <p><span className="font-medium text-white">Routing Number:</span> 987654321</p>
                        <p><span className="font-medium text-white">SWIFT/BIC:</span> BANKUS33</p>
                      </div>
                      <p className="mt-3 text-yellow-400">
                        ⚠️ Please include your order number in the payment reference. Your order will be processed once payment is confirmed.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* PayPal Details */}
                {selectedPaymentMethod === 'paypal' && (
                  <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">PayPal Payment</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>You will be redirected to PayPal to complete your payment securely.</p>
                      <div className="mt-3 space-y-1">
                        <p>✅ Secure payment through PayPal</p>
                        <p>✅ No need to enter card details here</p>
                        <p>✅ You can use PayPal balance or linked cards</p>
                      </div>
                      <p className="mt-3 text-blue-400">
                        ℹ️ After clicking "Place Order", you will be redirected to PayPal login page.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {submitting ? 'Processing Payment...' : `Pay $${displayPrice.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading checkout...</p>
      </div>
    </div>
  )
}

// Main export with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}
