import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { AuthService } from '@/server/services/auth/auth.service'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Check if already verified
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (userData.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Create new verification token
    const token = await AuthService.createVerificationToken(user.id)

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
    await NotificationService.sendVerificationEmail(
      userData.email,
      userData.name || '',
      verificationUrl
    )

    return NextResponse.json(
      {
        message: 'Verification email sent',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
