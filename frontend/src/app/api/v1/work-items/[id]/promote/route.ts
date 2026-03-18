import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTemplateVariables, normalizeTagNames, toPromptResponse } from '@/lib/prompt-utils'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

async function ensureUniquePromptTitle(baseTitle: string): Promise<string> {
  const sanitized = baseTitle.trim() || 'Untitled Prompt'
  let attempt = sanitized
  let suffix = 1

  // Keep checking until we find an unused prompt name.
  while (true) {
    const existing = await prisma.prompt.findUnique({
      where: { name: attempt },
      select: { id: true },
    })
    if (!existing) {
      return attempt
    }
    suffix += 1
    attempt = `${sanitized} (${suffix})`
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const workItem = await prisma.workItem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        details: true,
        sourceExcerpt: true,
        nextAction: true,
        tags: true,
      },
    })

    if (!workItem) {
      return NextResponse.json(
        { error: 'Work item not found.' },
        { status: 404 }
      )
    }

    const rawTitle = typeof body.title === 'string' ? body.title : workItem.title
    const title = await ensureUniquePromptTitle(rawTitle)
    const content = typeof body.content === 'string' && body.content.trim()
      ? body.content.trim()
      : workItem.details?.trim()
        || workItem.sourceExcerpt?.trim()
        || workItem.nextAction?.trim()
        || workItem.title

    const workItemTags = normalizeTagNames(
      (workItem.tags || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    )
    const payloadTags = normalizeTagNames(body.tags)
    const tagNames = Array.from(new Set(['promoted', ...workItemTags, ...payloadTags]))

    const isTemplate = body.is_template !== undefined
      ? Boolean(body.is_template)
      : extractTemplateVariables(content).length > 0

    const prompt = await prisma.prompt.create({
      data: {
        name: title,
        content,
        description: typeof body.description === 'string' ? body.description : null,
        isTemplate,
        tags: {
          create: tagNames.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    await prisma.workItemPromptLink.create({
      data: {
        workItemId: workItem.id,
        promptId: prompt.id,
        linkType: 'promoted',
      },
    })

    return NextResponse.json({
      work_item_id: workItem.id,
      prompt: toPromptResponse(prompt),
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to promote work item.' },
      { status: 400 }
    )
  }
}
