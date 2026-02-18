import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { notificationId, read } = body

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        read: read !== undefined ? read : true,
      },
    })

    return NextResponse.json({ message: 'Notification updated' }, { status: 200 })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
