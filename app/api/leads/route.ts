import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = leadSchema.parse(body)

    const existing = await prisma.lead.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Thanks for your interest' },
        { status: 200 }
      )
    }

    await prisma.lead.create({
      data: {
        email: validated.email,
        name: validated.name ?? null,
        phone: validated.phone ?? null,
        source: validated.source ?? null,
      },
    })

    return NextResponse.json(
      { message: 'Thanks for your interest' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 }
      )
    }
    console.error('Leads API error:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}
