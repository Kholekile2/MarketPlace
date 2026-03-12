import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DEMO_USER_ID, DEMO_PRODUCTS } from '@/lib/demo-data'

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional().nullable(),
  category: z.string().optional().nullable(),
  sizes: z.array(z.string()).default([]),
  stockQuantity: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  images: z.array(z.string()).default([]),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.id === DEMO_USER_ID) {
    return NextResponse.json({ products: DEMO_PRODUCTS })
  }

  try {
    const products = await prisma.product.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('[GET /api/products]', error)
    return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = productSchema.parse(body)

    if (session.user.id === DEMO_USER_ID) {
      const fake = { id: `demo-prod-${Date.now()}`, ...data, sellerId: 'demo', originalPrice: data.originalPrice ?? null, category: data.category ?? null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      return NextResponse.json({ product: fake }, { status: 201 })
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        originalPrice: data.originalPrice ?? null,
        category: data.category ?? null,
        sellerId: session.user.id,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 })
    }
    console.error('[POST /api/products]', error)
    return NextResponse.json({ error: 'Failed to create product.' }, { status: 500 })
  }
}
