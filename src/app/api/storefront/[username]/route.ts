import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Demo store returned when username === 'demo' or the database is unavailable
const DEMO_STORE = {
  business: {
    id: 'demo',
    businessName: "Thandi's Sneaker Empire",
    username: 'demo',
    whatsapp: '27820000000',
    instagramHandle: '@thandisneakers',
    tiktokHandle: '@thandisneakers_za',
  },
  products: [
    {
      id: 'demo-1',
      name: 'Nike Air Force 1 Low',
      description: 'Classic white leather sneakers. Authentic, deadstock condition.',
      price: 1899,
      originalPrice: 2199,
      category: 'Sneakers',
      sizes: ['7', '8', '9', '10', '11'],
      stockQuantity: 5,
      images: [],
    },
    {
      id: 'demo-2',
      name: 'Jordan 1 Retro High OG',
      description: 'Iconic silhouette in Chicago colourway. Brand new with box.',
      price: 3499,
      originalPrice: null,
      category: 'Sneakers',
      sizes: ['8', '9', '10'],
      stockQuantity: 2,
      images: [],
    },
    {
      id: 'demo-3',
      name: 'Adidas Yeezy Boost 350',
      description: 'Authentic Cinder colourway. Perfect for everyday wear.',
      price: 4200,
      originalPrice: 4800,
      category: 'Sneakers',
      sizes: ['8', '9', '10', '11'],
      stockQuantity: 3,
      images: [],
    },
  ],
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  // Always serve demo store for the 'demo' username
  if (username === 'demo') {
    return NextResponse.json(DEMO_STORE)
  }

  try {
    const seller = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        businessName: true,
        username: true,
        whatsapp: true,
        instagramHandle: true,
        tiktokHandle: true,
      },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id, isVisible: true, stockQuantity: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        category: true,
        sizes: true,
        stockQuantity: true,
        images: true,
      },
    })

    return NextResponse.json({ business: seller, products })
  } catch (error) {
    console.error('[GET /api/storefront]', error)
    return NextResponse.json(
      { error: 'Could not load store. Please try again later.' },
      { status: 503 }
    )
  }
}
