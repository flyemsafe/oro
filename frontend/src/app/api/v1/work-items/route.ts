import { NextRequest, NextResponse } from 'next/server'
import { WorkItemPriority, WorkItemStatus, WorkItemType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { listWorkItems } from '@/lib/work-items'

export const runtime = 'nodejs'

function parseStatus(value: string | null): WorkItemStatus | undefined {
  if (!value) return undefined
  if ((Object.values(WorkItemStatus) as string[]).includes(value)) {
    return value as WorkItemStatus
  }
  return undefined
}

function parseType(value: string | undefined): WorkItemType {
  if (!value) return WorkItemType.TASK
  if ((Object.values(WorkItemType) as string[]).includes(value)) {
    return value as WorkItemType
  }
  return WorkItemType.TASK
}

function parsePriority(value: string | undefined): WorkItemPriority {
  if (!value) return WorkItemPriority.MEDIUM
  if ((Object.values(WorkItemPriority) as string[]).includes(value)) {
    return value as WorkItemPriority
  }
  return WorkItemPriority.MEDIUM
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const viewParam = searchParams.get('view')
    const view = viewParam === 'open' || viewParam === 'triage' || viewParam === 'all'
      ? viewParam
      : 'open'

    const search = searchParams.get('search') || undefined
    const status = parseStatus(searchParams.get('status'))
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const result = await listWorkItems({
      view,
      search,
      status,
      limit: Number.isNaN(limit) ? 50 : limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list work items.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const title = String(body.title || '').trim()
    const details = typeof body.details === 'string' ? body.details : undefined

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const workItem = await prisma.workItem.create({
      data: {
        title,
        details,
        type: parseType(typeof body.type === 'string' ? body.type : undefined),
        status: parseStatus(typeof body.status === 'string' ? body.status : null) || WorkItemStatus.TRIAGE,
        priority: parsePriority(typeof body.priority === 'string' ? body.priority : undefined),
        nextAction: typeof body.nextAction === 'string' ? body.nextAction : undefined,
        tags: typeof body.tags === 'string' ? body.tags : undefined,
      },
      include: {
        session: true,
        followUps: true,
      },
    })

    return NextResponse.json(workItem, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create work item.' },
      { status: 400 }
    )
  }
}
