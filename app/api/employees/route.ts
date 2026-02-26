import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { NotificationService } from '@/server/services/notifications/notification.service'
import { setOnboardingStep } from '@/lib/onboarding'

const hasValidEmail = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const hasValidPassword = (v: unknown) => typeof v === 'string' && v.length >= 6

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

    const limitCheck = await SubscriptionService.canAddEmployee(user.organizationId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { message: limitCheck.reason, upgradeRequired: limitCheck.upgradeRequired },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      name,
      phone,
      email,
      password,
      roleType,
      hourlyRate,
      defaultHoursPerWeek,
    } = body

    const withLogin = hasValidEmail(email) && hasValidPassword(password)
    const onlyEmailOrOnlyPassword = (hasValidEmail(email) && !hasValidPassword(password)) || (!hasValidEmail(email) && hasValidPassword(password))

    if (onlyEmailOrOnlyPassword) {
      return NextResponse.json(
        { message: 'Provide both email and password to create a login, or leave both blank to add by phone only.' },
        { status: 400 }
      )
    }

    const nameStr = typeof name === 'string' ? name.trim() : ''
    const phoneStr = typeof phone === 'string' ? phone.trim() : ''

    if (withLogin) {
      const existingUser = await prisma.user.findUnique({ where: { email: email.trim() } })
      if (existingUser) {
        return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = await prisma.user.create({
        data: {
          email: email.trim(),
          name: nameStr || null,
          phone: phoneStr || null,
          passwordHash,
          role: 'EMPLOYEE',
          organizationId: user.organizationId,
          employee: {
            create: {
              organizationId: user.organizationId,
              name: nameStr || null,
              phone: phoneStr || null,
              roleType: roleType || null,
              hourlyRate: hourlyRate != null ? parseFloat(String(hourlyRate)) : null,
              defaultHoursPerWeek: defaultHoursPerWeek != null ? parseInt(String(defaultHoursPerWeek), 10) : null,
            },
          },
        },
        include: { employee: true },
      })

      await setOnboardingStep(user.organizationId, 2)

      const loginUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL.replace(/\/$/, '')}/login` : '/login'
      const organization = await prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { name: true },
      })
      const organizationName = organization?.name || 'Your organization'

      try {
        await NotificationService.sendAddedToTeamEmail(
          newUser.email,
          newUser.name,
          organizationName,
          loginUrl
        )
        const phoneForWhatsApp = newUser.employee?.phone ?? newUser.phone
        if (phoneForWhatsApp) {
          await NotificationService.sendAddedToTeamWhatsApp(phoneForWhatsApp, organizationName, loginUrl)
        }
      } catch (notifyError) {
        console.error('Failed to send added-to-team notification:', notifyError)
      }

      return NextResponse.json({ employee: newUser.employee }, { status: 201 })
    }

    if (!nameStr || !phoneStr) {
      return NextResponse.json(
        { message: 'Name and phone are required when not creating a login.' },
        { status: 400 }
      )
    }

    const newEmployee = await prisma.employee.create({
      data: {
        organizationId: user.organizationId,
        name: nameStr,
        phone: phoneStr,
        roleType: roleType || null,
        hourlyRate: hourlyRate != null ? parseFloat(String(hourlyRate)) : null,
        defaultHoursPerWeek: defaultHoursPerWeek != null ? parseInt(String(defaultHoursPerWeek), 10) : null,
      },
    })

    await setOnboardingStep(user.organizationId, 2)
    return NextResponse.json({ employee: newEmployee }, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
