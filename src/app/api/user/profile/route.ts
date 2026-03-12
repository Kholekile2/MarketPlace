import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DEMO_USER_ID, DEMO_PROFILE } from '@/lib/demo-data'

const updateProfileSchema = z.object({
  businessName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  instagramHandle: z.string().nullable().optional(),
  tiktokHandle: z.string().nullable().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.id === DEMO_USER_ID) {
    return NextResponse.json({ user: DEMO_PROFILE })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        phone: true,
        businessName: true,
        whatsapp: true,
        instagramHandle: true,
        tiktokHandle: true,
      },
    })
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (error) {
    console.error('[GET /api/user/profile]', error)
    return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    if (session.user.id === DEMO_USER_ID) {
      return NextResponse.json({ user: { ...DEMO_PROFILE, ...data } })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        phone: true,
        businessName: true,
        whatsapp: true,
        instagramHandle: true,
        tiktokHandle: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 })
    }
    console.error('[PUT /api/user/profile]', error)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}
