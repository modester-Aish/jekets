import { getAllProducts } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'
import Pagination from '@/components/Pagination'
import type { Metadata } from 'next'

// Force dynamic rendering - always fetch fresh data from WooCommerce
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Shop All Trapstar Products | Complete Collection | trapstarofficial.store',
  description: 'Browse the complete Trapstar collection featuring tracksuits, jackets, shorts, t-shirts, bags, and hoodies. Premium streetwear with bold designs. Free shipping available.',
  keywords: 'Trapstar, shop Trapstar, Trapstar collection, streetwear, tracksuits, jackets, hoodies, t-shirts, bags, trapstarofficial.store',
  openGraph: {
    title: 'Shop All Trapstar Products | Complete Collection',
    description: 'Browse the complete Trapstar collection featuring tracksuits, jackets, shorts, t-shirts, bags, and hoodies. Premium streetwear with bold designs.',
    url: 'https://trapstarofficial.store/store',
    siteName: 'Trapstar Official',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop All Trapstar Products | Complete Collection',
    description: 'Browse the complete Trapstar collection featuring premium streetwear.',
  },
  alternates: {
    canonical: 'https://trapstarofficial.store/store',
  },
}

interface StorePageProps {
  searchParams: { page?: string }
}

export default async function StorePage({ searchParams }: StorePageProps) {
  // Fetch all products ONCE (same as homepage) - uses cache
  const allProducts = await getAllProducts()
  
  // Pagination logic
  const currentPage = parseInt(searchParams.page || '1')
  const perPage = 12
  const totalProducts = allProducts.length
  const totalPages = Math.ceil(totalProducts / perPage)
  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage
  const products = allProducts.slice(startIndex, endIndex)
  
  const pagination = {
    page: currentPage,
    perPage,
    totalProducts,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">Shop</h1>
        <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
          Browse our complete Trapstar collection
          {pagination.totalProducts > 0 && (
            <span className="ml-2">({pagination.totalProducts} products available)</span>
          )}
        </p>
      </div>

      {/* Trapstar Products Section */}
      {products.length > 0 ? (
        <>
          <section className="mb-16 md:mb-20">
            <ProductGrid products={products} />
          </section>
          
          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            basePath="/store"
          />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found.</p>
        </div>
      )}
      
      {/* Content Section - After Products */}
      <div className="mt-12 md:mt-16">
        <div className="text-gray-400 space-y-3 md:space-y-4 max-w-4xl text-sm md:text-base leading-relaxed">
          <p>
            The official site is the heart of the brand trapstarofficial.store. Trapstar manages its releases here first, so if you want to stay ahead of the curve, it's where you want to be. Plus, you get authenticity guarantees and direct access to the latest drops.
          </p>
          <p>
            Trapstar sells hoodies, T-shirts, shorts, sweatpants, socks, and accessories like bandanas and hats. Their collection features bold urban designs with vivid or dark aesthetics.
          </p>
        </div>
      </div>

      {/* Structured Data - CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Trapstar Complete Collection',
            description: 'Browse the complete Trapstar collection featuring tracksuits, jackets, shorts, t-shirts, bags, and hoodies.',
            url: 'https://trapstarofficial.store/store',
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: pagination.totalProducts,
              itemListElement: products.slice(0, 20).map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Product',
                  name: product.title,
                  url: `https://trapstarofficial.store/${product.slug}`,
                  image: product.image.startsWith('http') ? product.image : `https://trapstarofficial.store${product.image}`,
                },
              })),
            },
          }),
        }}
      />
    </div>
  )
}

