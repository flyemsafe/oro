import { NextRequest, NextResponse } from 'next/server'
import { WorkItemStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

function parseNumber(value: string | null, fallback: number): number {
  const parsed = parseInt(value || '', 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skip = Math.max(parseNumber(searchParams.get('skip'), 0), 0)
    const limit = Math.min(Math.max(parseNumber(searchParams.get('limit'), 30), 1), 200)
    const search = (searchParams.get('search') || '').trim()
    const source = (searchParams.get('source') || '').trim()

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { source: { contains: search } },
        { sourcePath: { contains: search } },
      ]
    }

    if (source) {
      where.source = {
        equals: source,
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { updatedAt: 'desc' },
        ],
        include: {
          _count: {
            select: {
              workItems: true,
            },
          },
          workItems: {
            select: {
              status: true,
            },
          },
        },
      }),
      prisma.session.count({ where }),
    ])

    const transformed = sessions.map((session) => {
      let triageCount = 0
      let openCount = 0
      let doneCount = 0

      session.workItems.forEach((item) => {
        if (item.status === WorkItemStatus.TRIAGE) {
          triageCount += 1
        } else if (item.status === WorkItemStatus.DONE) {
          doneCount += 1
        } else {
          openCount += 1
        }
      })

      return {
        id: session.id,
        title: session.title,
        source: session.source,
        source_path: session.sourcePath,
        extracted_at: session.extractedAt ? session.extractedAt.toISOString() : null,
        created_at: session.createdAt.toISOString(),
        updated_at: session.updatedAt.toISOString(),
        work_items_count: session._count.workItems,
        triage_count: triageCount,
        open_count: openCount,
        done_count: doneCount,
      }
    })

    return NextResponse.json({
      sessions: transformed,
      total,
      skip,
      limit,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load sessions.' },
      { status: 500 }
    )
  }
}
