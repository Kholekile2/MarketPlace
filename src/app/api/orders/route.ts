import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DEMO_USER_ID, DEMO_ORDERS } from '@/lib/demo-data'

const createOrderSchema = z.object({
  sellerUsername: z.string(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  productName: z.string().min(1),
  size: z.string().optional(),
  price: z.number().positive(),
  deliveryAddress: z.string().min(1),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.id === DEMO_USER_ID) {
    return NextResponse.json({ orders: DEMO_ORDERS })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createOrderSchema.parse(body)

    // Demo store: acknowledge the order without writing to the database
    if (data.sellerUsername === 'demo') {
      return NextResponse.json({ order: { id: `demo-order-${Date.now()}` } }, { status: 201 })
    }

    const seller = await prisma.user.findUnique({
      where: { username: data.sellerUsername },
      select: { id: true },
    })
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found.' }, { status: 404 })
    }

    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        productName: data.productName,
        size: data.size,
        price: data.price,
        deliveryAddress: data.deliveryAddress,
        notes: data.notes,
        sellerId: seller.id,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 })
    }
    console.error('[POST /api/orders]', error)
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 })
  }
}
