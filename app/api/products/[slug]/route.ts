import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/products'

// GET single product by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    
    // Fetch all products (uses cache)
    const allProducts = await getAllProducts()
    
    // Find product by slug
    const product = allProducts.find(p => p.slug === slug)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error: any) {
    console.error('❌ Error fetching product by slug:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

