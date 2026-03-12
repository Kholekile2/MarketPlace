import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DEMO_USER_ID } from '@/lib/demo-data'

const manualOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  productName: z.string().min(1),
  size: z.string().optional(),
  price: z.number().positive(),
  deliveryAddress: z.string().min(1),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = manualOrderSchema.parse(body)

    if (session.user.id === DEMO_USER_ID) {
      const order = { id: `demo-order-${Date.now()}`, ...data, sellerId: 'demo', status: 'pending', paid: false, courierName: null, trackingNumber: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      return NextResponse.json({ order }, { status: 201 })
    }

    const order = await prisma.order.create({
      data: {
        ...data,
        sellerId: session.user.id,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 })
    }
    console.error('[POST /api/orders/manual]', error)
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 })
  }
}
