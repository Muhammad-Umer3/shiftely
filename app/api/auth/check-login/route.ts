import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { AuthService } from '@/server/services/auth/auth.service'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { z } from 'zod'

const checkLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/**
 * Pre-login check: validates credentials and handles unverified users.
 * If credentials are valid but email is not verified, resends verification email
 * and returns requiresVerification so the client can show a message instead of logging in.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = checkLoginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { valid: false, message: 'Invalid email or password' },
        { status: 200 }
      )
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordsMatch) {
      return NextResponse.json(
        { valid: false, message: 'Invalid email or password' },
        { status: 200 }
      )
    }

    // Valid credentials - check if email is verified
    if (!user.emailVerified) {
      // Resend verification email
      const token = await AuthService.createVerificationToken(user.id)
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
      await NotificationService.sendVerificationEmail(
        user.email,
        user.name || '',
        verificationUrl
      )

      return NextResponse.json({
        valid: false,
        requiresVerification: true,
        message:
          "Your email isn't verified yet. We've sent a new verification link to your inbox. Please check your email and click the link to verify your account.",
      })
    }

    // Valid and verified - OK to proceed with login
    return NextResponse.json({ valid: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, message: 'Invalid request' },
        { status: 400 }
      )
    }
    console.error('Check login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
