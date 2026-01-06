import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pages | Trapstar Official | trapstarofficial.store',
  description: 'Browse all pages on Trapstar Official including Authenticity Service, Size Guides, FAQs, Customer Care, and more.',
  keywords: 'Trapstar pages, site pages, all pages, trapstarofficial.store',
  openGraph: {
    title: 'Pages | Trapstar Official',
    description: 'Browse all pages on Trapstar Official.',
    url: 'https://trapstarofficial.store/pages',
    siteName: 'Trapstar Official',
    type: 'website',
  },
  alternates: {
    canonical: 'https://trapstarofficial.store/pages',
  },
}

export default function Pages() {
  const pages = [
    {
      title: 'Authenticity Service',
      href: '/authenticity-service',
      description: 'Verify the authenticity of your Trapstar products using our Certilogo authentication service.',
    },
    {
      title: 'Size Guides',
      href: '/size-guides',
      description: 'Find the perfect fit with comprehensive size guides for all Trapstar products.',
    },
    {
      title: 'FAQs',
      href: '/faqs',
      description: 'Find answers to frequently asked questions about orders, shipping, returns, and more.',
    },
    {
      title: 'Customer Care',
      href: '/customer-care',
      description: 'Contact our customer care team for support with orders, products, and inquiries.',
    },
    {
      title: 'Return & Exchange',
      href: '/return-exchange',
      description: 'Learn about our return policy and how to exchange items.',
    },
    {
      title: 'Shipping Policy',
      href: '/shipping-policy',
      description: 'Information about shipping methods, delivery times, and shipping costs.',
    },
    {
      title: 'Privacy Policy',
      href: '/privacy-policy',
      description: 'Our privacy policy explaining how we collect, use, and protect your information.',
    },
    {
      title: 'About Us',
      href: '/about-us',
      description: 'Learn about Trapstar Official - our story, mission, and commitment to quality.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-4">Pages</h1>
      <p className="text-gray-400 mb-8 text-lg">
        Browse all available pages on Trapstar Official. Find information about our products, policies, and services.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {pages.map((page, index) => (
          <Link
            key={index}
            href={page.href}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-300 hover:bg-gray-900/80 group"
          >
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-gray-200 transition-colors">
              {page.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {page.description}
            </p>
            <div className="mt-4 flex items-center text-white text-sm font-medium group-hover:text-gray-300 transition-colors">
              <span>View Page</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Quick Links</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            → Home
          </Link>
          <Link href="/store" className="text-gray-400 hover:text-white transition-colors text-sm">
            → Shop / Store
          </Link>
          <Link href="/contact-us" className="text-gray-400 hover:text-white transition-colors text-sm">
            → Contact Us
          </Link>
          <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
            → Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}

