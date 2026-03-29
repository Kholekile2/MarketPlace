import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { registerRateLimit } from '@/lib/rate-limit'

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  businessName: z.string().min(1),
  businessType: z.string().optional(),
  password: z.string().min(6),
})

function generateUsername(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30)
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const { success } = await registerRateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    // Generate a unique username
    let baseUsername = generateUsername(data.businessName)
    if (!baseUsername) baseUsername = 'seller'
    let username = baseUsername
    let attempt = 0
    while (await prisma.user.findUnique({ where: { username } })) {
      attempt++
      username = `${baseUsername}-${attempt}`
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: `${data.firstName} ${data.lastName}`,
        username,
        phone: data.phone,
        businessName: data.businessName,
      },
      select: { id: true, email: true, name: true, username: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 })
    }
    console.error('[POST /api/auth/register]', error)
    return NextResponse.json({ error: 'Failed to create account.' }, { status: 500 })
  }
}
