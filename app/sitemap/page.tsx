import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProducts } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Sitemap - Trapstar Official',
  description: 'Complete sitemap of Trapstar Official Store. Find all products, categories, and pages.',
  alternates: {
    canonical: 'https://trapstarofficial.store/sitemap',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function SitemapPage() {
  const products = await getAllProducts()
  const categories = ['tracksuits', 'jackets', 'shorts', 't-shirts', 'bags', 'hoodies']
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Sitemap</h1>
      
      <div className="space-y-8">
        {/* Main Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Main Pages</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/store" className="text-gray-400 hover:text-white transition-colors">
                Shop / Store
              </Link>
            </li>
            <li>
              <Link href="/about-us" className="text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Categories</h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <Link 
                  href={`/${category}`} 
                  className="text-gray-400 hover:text-white transition-colors capitalize"
                >
                  {category.replace('-', ' ')}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Products */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Products ({products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/${product.slug}`}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {product.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

