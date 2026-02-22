import { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { Permission } from '@/lib/permissions/permissions'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ['/schedules', '/employees', '/swaps', '/time-off', '/settings', '/onboarding', '/help', '/schedule', '/my-schedule', '/my-availability']
      const isProtected = protectedPaths.some((p) => nextUrl.pathname === p || nextUrl.pathname.startsWith(p + '/'))
      if (isProtected) {
        if (isLoggedIn) return true
        return false
      } else if (isLoggedIn && (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register'))) {
        return Response.redirect(new URL('/schedules', nextUrl))
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string
        session.user.role = token.role as string
        session.user.permissions = (token.permissions as Permission[]) || []
      }
      return session
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.organizationId = user.organizationId
        token.role = user.role
        // Fetch permissions for the user
        const permissions = await PermissionService.getUserPermissions(
          user.id,
          user.organizationId
        )
        token.permissions = permissions
      } else if (trigger === 'update' && token.id && token.organizationId) {
        // Refresh permissions on session update
        const permissions = await PermissionService.getUserPermissions(
          token.id as string,
          token.organizationId as string
        )
        token.permissions = permissions
      }
      return token
    },
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { organization: true },
        })

        if (!user) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!passwordsMatch) {
          return null
        }

        // Note: We allow login even if email is not verified
        // Email verification can be enforced in specific routes if needed

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organizationId,
          role: user.role,
        }
      },
    }),
  ],
} satisfies NextAuthConfig
