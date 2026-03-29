import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { checkLoginRateLimit } from './rate-limit'

// Demo credentials for testing without a real database
const DEMO_USER = {
  id: 'demo',
  email: 'demo@samarketplace.co.za',
  name: 'Thandi Dlamini',
  username: 'demo',
  passwordHash: '$2a$10$demo', // never matches — we short-circuit below
  businessName: "Thandi's Sneaker Empire",
}
const DEMO_PASSWORD = 'demo1234'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate-limit by IP — adapt NextAuth's plain-object headers to a Request-like interface
        const rawHeaders = (req?.headers ?? {}) as Record<string, string | string[] | undefined>
        const getHeader = (name: string): string | null => {
          const val = rawHeaders[name.toLowerCase()]
          return Array.isArray(val) ? (val[0] ?? null) : (val ?? null)
        }
        const allowed = await checkLoginRateLimit({
          headers: { get: getHeader },
        } as unknown as Request)
        if (!allowed) {
        // Slow down brute force attempts
        await new Promise((resolve) => setTimeout(resolve, 1500))
        return null
      }


        // Demo login — works without a database
        if (
          credentials.email === DEMO_USER.email &&
          credentials.password === DEMO_PASSWORD
        ) {
          return { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name, username: DEMO_USER.username }
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              passwordHash: true,
            },
          })

          if (!user) return null

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) return null

          return { id: user.id, email: user.email, name: user.name, username: user.username }
        } catch {
          // Database unavailable — only demo login is allowed
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as { username?: string }).username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
