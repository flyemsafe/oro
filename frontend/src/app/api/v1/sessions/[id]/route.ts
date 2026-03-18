import { NextRequest, NextResponse } from 'next/server'
import { WorkItemStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        workItems: {
          include: {
            followUps: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
            promptLinks: {
              include: {
                prompt: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found.' },
        { status: 404 }
      )
    }

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

    return NextResponse.json({
      id: session.id,
      title: session.title,
      source: session.source,
      source_path: session.sourcePath,
      raw_content: session.rawContent,
      extracted_at: session.extractedAt ? session.extractedAt.toISOString() : null,
      created_at: session.createdAt.toISOString(),
      updated_at: session.updatedAt.toISOString(),
      counts: {
        total: session.workItems.length,
        triage: triageCount,
        open: openCount,
        done: doneCount,
      },
      work_items: session.workItems.map((item) => ({
        id: item.id,
        title: item.title,
        details: item.details,
        type: item.type,
        status: item.status,
        priority: item.priority,
        tags: item.tags,
        next_action: item.nextAction,
        source_path: item.sourcePath,
        source_line_start: item.sourceLineStart,
        source_line_end: item.sourceLineEnd,
        created_at: item.createdAt.toISOString(),
        updated_at: item.updatedAt.toISOString(),
        follow_ups: item.followUps.map((followUp) => ({
          id: followUp.id,
          title: followUp.title,
          status: followUp.status,
          due_at: followUp.dueAt ? followUp.dueAt.toISOString() : null,
        })),
        linked_prompts: item.promptLinks.map((link) => ({
          prompt_id: link.promptId,
          prompt_title: link.prompt.name,
          link_type: link.linkType,
        })),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load session detail.' },
      { status: 500 }
    )
  }
}
