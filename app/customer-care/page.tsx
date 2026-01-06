import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Customer Care | Trapstar Official | trapstarofficial.store',
  description: 'Contact Trapstar Official customer care for support with orders, products, shipping, returns, and more. We\'re here to help.',
  keywords: 'Trapstar customer care, customer support, help, contact Trapstar, trapstarofficial.store',
  openGraph: {
    title: 'Customer Care | Trapstar Official',
    description: 'Contact Trapstar Official customer care for support with orders, products, and more.',
    url: 'https://trapstarofficial.store/customer-care',
    siteName: 'Trapstar Official',
    type: 'website',
  },
  alternates: {
    canonical: 'https://trapstarofficial.store/customer-care',
  },
}

export default function CustomerCare() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Customer Care</h1>
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-400 space-y-6">
          <p className="text-lg">
            At Trapstar Official, we're committed to providing exceptional customer service. Whether you have questions about your order, need help with sizing, or want to report an issue, our customer care team is here to assist you.
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-semibold text-white">Email Support</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Send us an email and we'll get back to you within 24-48 hours.
              </p>
              <a
                href="mailto:support@trapstarofficial.store"
                className="text-white font-semibold hover:text-gray-300 transition-colors"
              >
                support@trapstarofficial.store
              </a>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2 className="text-xl font-semibold text-white">Live Chat</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Chat with our team in real-time during business hours.
              </p>
              <p className="text-sm text-gray-400">
                Available: Monday - Friday, 9 AM - 6 PM (GMT)
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Contact Form</h2>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 my-6">
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="order" className="block text-sm font-semibold text-gray-300 mb-2">
                  Order Number (if applicable)
                </label>
                <input
                  type="text"
                  id="order"
                  name="order"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="Order #12345"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="order">Order Inquiry</option>
                  <option value="shipping">Shipping & Delivery</option>
                  <option value="return">Returns & Exchanges</option>
                  <option value="product">Product Question</option>
                  <option value="sizing">Sizing Help</option>
                  <option value="payment">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                  placeholder="Please provide as much detail as possible so we can assist you better..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black px-8 py-4 font-bold text-lg rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Common Topics</h2>
          
          <div className="grid md:grid-cols-2 gap-4 my-6">
            <Link
              href="/faqs"
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Frequently Asked Questions</h3>
              <p className="text-gray-400 text-sm">
                Find answers to common questions about orders, shipping, returns, and more.
              </p>
            </Link>

            <Link
              href="/size-guides"
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Size Guides</h3>
              <p className="text-gray-400 text-sm">
                Need help finding the right size? Check our comprehensive sizing charts.
              </p>
            </Link>

            <Link
              href="/authenticity-service"
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Authenticity Service</h3>
              <p className="text-gray-400 text-sm">
                Verify the authenticity of your Trapstar products using Certilogo.
              </p>
            </Link>

            <Link
              href="/return-exchange"
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Returns & Exchanges</h3>
              <p className="text-gray-400 text-sm">
                Learn about our return policy and how to exchange items.
              </p>
            </Link>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Response Times</h2>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 my-6">
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Email:</strong> We typically respond within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Live Chat:</strong> Immediate response during business hours</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Urgent Issues:</strong> Please mark as urgent in your message for priority handling</span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Business Hours</h2>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 my-6">
            <div className="space-y-2 text-gray-300">
              <p><strong className="text-white">Monday - Friday:</strong> 9:00 AM - 6:00 PM (GMT)</p>
              <p><strong className="text-white">Saturday:</strong> 10:00 AM - 4:00 PM (GMT)</p>
              <p><strong className="text-white">Sunday:</strong> Closed</p>
              <p className="text-sm text-gray-400 mt-4">
                *Response times may be longer during holidays and peak periods
              </p>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-6 my-8">
            <p className="text-yellow-200 font-semibold mb-2">⚠️ Reporting Counterfeit Products</p>
            <p className="text-gray-300">
              If you encounter a counterfeit Trapstar product or suspicious website, please contact us immediately with details including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-300 mt-3 ml-4">
              <li>Website URL or retailer name and location</li>
              <li>Product images (if available)</li>
              <li>Any other relevant information</li>
            </ul>
            <p className="text-white mt-4 font-medium">
              Our official website is <span className="text-yellow-300">trapstarofficial.store</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

