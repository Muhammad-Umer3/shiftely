import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth/auth.service'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = resetPasswordSchema.parse(body)

    await AuthService.resetPassword(validated.token, validated.password)

    return NextResponse.json(
      {
        message: 'Password reset successful',
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

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
