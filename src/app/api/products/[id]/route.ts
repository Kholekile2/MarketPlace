import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DEMO_USER_ID } from '@/lib/demo-data'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().nullable().optional(),
  category: z.string().nullable().optional(),
  sizes: z.array(z.string()).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
  images: z.array(z.string()).optional(),
})

async function ensureOwner(productId: string, sellerId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId },
  })
  return product
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

  if (session.user.id === DEMO_USER_ID) {
    return NextResponse.json({ product: { id } })
  }

  const existing = await ensureOwner(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const product = await prisma.product.update({ where: { id }, data })
    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 })
    }
    console.error('[PUT /api/products/[id]]', error)
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (session.user.id === DEMO_USER_ID) {
    return NextResponse.json({ success: true })
  }

  const existing = await ensureOwner(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  }

  try {
    await prisma.product.delete({ where: { id } })
  } catch (error) {
    console.error('[DELETE /api/products/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
