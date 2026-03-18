import { NextRequest, NextResponse } from 'next/server'
import { WorkItemPriority, WorkItemStatus, WorkItemType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

function parseStatus(value: string | undefined): WorkItemStatus | undefined {
  if (!value) return undefined
  if ((Object.values(WorkItemStatus) as string[]).includes(value)) {
    return value as WorkItemStatus
  }
  return undefined
}

function parseType(value: string | undefined): WorkItemType | undefined {
  if (!value) return undefined
  if ((Object.values(WorkItemType) as string[]).includes(value)) {
    return value as WorkItemType
  }
  return undefined
}

function parsePriority(value: string | undefined): WorkItemPriority | undefined {
  if (!value) return undefined
  if ((Object.values(WorkItemPriority) as string[]).includes(value)) {
    return value as WorkItemPriority
  }
  return undefined
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.workItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Work item not found.' }, { status: 404 })
    }

    const status = parseStatus(typeof body.status === 'string' ? body.status : undefined)
    const type = parseType(typeof body.type === 'string' ? body.type : undefined)
    const priority = parsePriority(typeof body.priority === 'string' ? body.priority : undefined)

    const workItem = await prisma.workItem.update({
      where: { id },
      data: {
        title: typeof body.title === 'string' ? body.title : undefined,
        details: typeof body.details === 'string' ? body.details : undefined,
        status,
        type,
        priority,
        owner: typeof body.owner === 'string' ? body.owner : undefined,
        tags: typeof body.tags === 'string' ? body.tags : undefined,
        nextAction: typeof body.nextAction === 'string' ? body.nextAction : undefined,
        dueAt: typeof body.dueAt === 'string' && body.dueAt
          ? new Date(body.dueAt)
          : body.dueAt === null
            ? null
            : undefined,
        closedAt: status === WorkItemStatus.DONE
          ? new Date()
          : status
            ? null
            : undefined,
      },
      include: {
        session: true,
        followUps: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json(workItem)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update work item.' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const existing = await prisma.workItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Work item not found.' }, { status: 404 })
    }

    await prisma.workItem.delete({ where: { id } })
    return NextResponse.json({ message: 'Work item deleted.' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete work item.' },
      { status: 500 }
    )
  }
}
