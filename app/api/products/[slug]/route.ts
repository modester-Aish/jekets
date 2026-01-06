import { NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/products'

// GET single product by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    
    // Use getProductBySlug which handles cache and direct fetch
    const product = await getProductBySlug(slug)
    
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

