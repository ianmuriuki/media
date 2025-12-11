import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const email = credentials.email.toLowerCase().trim()

          // Try admin user by email
          const admin = await prisma.user.findUnique({
            where: { email },
          })

          if (admin) {
            const isPasswordValid = await compare(credentials.password, admin.password)
            if (isPasswordValid) {
              return {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
              }
            }
            return null
          }

          // If not found as admin, try to find as client by email
          const client = await prisma.client.findUnique({
            where: { email },
          })

          if (client && client.password) {
            const isPasswordValid = await compare(credentials.password, client.password)
            if (isPasswordValid) {
              return {
                id: client.id,
                email: client.email,
                name: client.name,
                role: 'client',
              }
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: process.env.NODE_ENV === 'development',
}
