import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth/auth.service'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = verifyEmailSchema.parse(body)

    await AuthService.verifyEmail(validated.token)

    return NextResponse.json(
      {
        message: 'Email verified successfully',
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

    console.error('Verify email error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
