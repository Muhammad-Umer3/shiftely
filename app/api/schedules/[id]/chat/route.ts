import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/schedules/[id]/chat
 * Query: limit (default 50), cursor (message id for pagination), since (ISO date for polling - messages after this time)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: scheduleId } = await params

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId: user.organizationId },
    })
    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const since = searchParams.get('since') // ISO string for polling
    const cursor = searchParams.get('cursor')

    if (since) {
      const sinceDate = new Date(since)
      if (Number.isNaN(sinceDate.getTime())) {
        return NextResponse.json({ message: 'Invalid since parameter' }, { status: 400 })
      }
      const messages = await prisma.scheduleChatMessage.findMany({
        where: { scheduleId, createdAt: { gt: sinceDate } },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
        take: 100,
      })
      return NextResponse.json({ messages }, { status: 200 })
    }

    const messages = await prisma.scheduleChatMessage.findMany({
      where: { scheduleId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    })

    const hasMore = messages.length > limit
    const list = hasMore ? messages.slice(0, limit) : messages
    const nextCursor = hasMore ? list[list.length - 1].id : null

    return NextResponse.json(
      { messages: list.reverse(), nextCursor, hasMore },
      { status: 200 }
    )
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching schedule chat:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/schedules/[id]/chat - send a user message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: scheduleId } = await params

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId: user.organizationId },
    })
    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }

    const body = await req.json()
    const text = typeof body.body === 'string' ? body.body.trim() : ''
    if (!text || text.length > 4000) {
      return NextResponse.json(
        { message: 'Message body required (max 4000 characters)' },
        { status: 400 }
      )
    }

    const message = await prisma.scheduleChatMessage.create({
      data: {
        scheduleId,
        userId: user.id,
        body: text,
        type: 'user',
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error sending schedule chat message:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
