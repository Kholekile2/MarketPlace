import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DEMO_USER_ID, DEMO_ORDERS, DEMO_PROFILE } from '@/lib/demo-data'

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paid: z.boolean().optional(),
  courierName: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

async function ensureOwner(orderId: string, sellerId: string) {
  return prisma.order.findFirst({ where: { id: orderId, sellerId } })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (session.user.id === DEMO_USER_ID) {
    const order = DEMO_ORDERS.find((o) => o.id === id) ?? null
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    return NextResponse.json({ order, businessName: DEMO_PROFILE.businessName })
  }

  try {
    const order = await ensureOwner(id, session.user.id)
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

    const seller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessName: true },
    })
    return NextResponse.json({ order, businessName: seller?.businessName ?? 'Your Business' })
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error)
    return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const data = updateOrderSchema.parse(body)

    if (session.user.id === DEMO_USER_ID) {
      const order = DEMO_ORDERS.find((o) => o.id === id) ?? { id }
      return NextResponse.json({ order: { ...order, ...data } })
    }

    const existing = await ensureOwner(id, session.user.id)
    if (!existing) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

    const order = await prisma.order.update({ where: { id }, data })
    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 })
    }
    console.error('[PUT /api/orders/[id]]', error)
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 })
  }
}
