import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { setOnboardingStep } from '@/lib/onboarding'

export async function GET() {
  try {
    const user = await requireAuth()
    const employees = await prisma.employee.findMany({
      where: { organizationId: user.organizationId },
      include: { user: true },
    })
    return NextResponse.json({ employees }, { status: 200 })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Check subscription limits
    const limitCheck = await SubscriptionService.canAddEmployee(user.organizationId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          message: limitCheck.reason,
          upgradeRequired: limitCheck.upgradeRequired,
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, email, phone, password, roleType, hourlyRate, defaultHoursPerWeek } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user and employee
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash,
        role: 'EMPLOYEE',
        organizationId: user.organizationId,
        employee: {
          create: {
            organizationId: user.organizationId,
            roleType: roleType || null,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
            defaultHoursPerWeek: defaultHoursPerWeek != null ? parseInt(String(defaultHoursPerWeek), 10) : null,
          },
        },
      },
      include: {
        employee: true,
      },
    })

    await setOnboardingStep(user.organizationId, 2)

    return NextResponse.json({ employee: newUser.employee }, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
