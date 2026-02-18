import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth/auth.service'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { authRateLimit } from '@/lib/middleware/rate-limit'
import { handleApiError } from '@/lib/middleware/error-handler'
import { sanitizeObject } from '@/lib/utils/validation'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await authRateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await req.json()
    const sanitized = sanitizeObject(body)
    const validated = forgotPasswordSchema.parse(sanitized)

    const result = await AuthService.createPasswordResetToken(validated.email)

    // Always return success to prevent email enumeration
    // If user exists, send reset email
    if (result) {
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${result.token}`
      await NotificationService.sendPasswordResetEmail(result.user.email, resetUrl)
    }

    return NextResponse.json(
      {
        message: 'If an account exists with that email, a password reset link has been sent.',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return handleApiError(error)
  }
}
