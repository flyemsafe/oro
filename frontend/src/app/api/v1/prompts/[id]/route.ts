import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeTagNames, summarizeRatings, toPromptResponse } from '@/lib/prompt-utils'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        executions: {
          select: {
            id: true,
            rating: true,
            success: true,
            notes: true,
            executedAt: true,
          },
          orderBy: {
            executedAt: 'desc',
          },
        },
      },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    const ratingSummary = summarizeRatings(prompt.executions)
    const response = {
      ...toPromptResponse(prompt, ratingSummary),
      executions: prompt.executions.map((execution) => ({
        id: execution.id,
        rating: execution.rating,
        success: execution.success,
        notes: execution.notes,
        executed_at: execution.executedAt.toISOString(),
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.prompt.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    const title = typeof body.title === 'string'
      ? body.title.trim()
      : typeof body.name === 'string'
        ? body.name.trim()
        : undefined

    if (title && title !== existing.name) {
      const duplicate = await prisma.prompt.findUnique({
        where: { name: title },
        select: { id: true },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Prompt with this title already exists' },
          { status: 409 }
        )
      }
    }

    const tagNames = normalizeTagNames(body.tags)
    const shouldReplaceTags = Array.isArray(body.tags)

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...(title ? { name: title } : {}),
        ...(typeof body.content === 'string' ? { content: body.content } : {}),
        ...(body.system_prompt !== undefined
          ? { systemPrompt: typeof body.system_prompt === 'string' ? body.system_prompt : null }
          : {}),
        ...(body.description !== undefined
          ? { description: typeof body.description === 'string' ? body.description : null }
          : {}),
        ...(body.is_favorite !== undefined ? { isFavorite: Boolean(body.is_favorite) } : {}),
        ...(body.is_template !== undefined ? { isTemplate: Boolean(body.is_template) } : {}),
        ...(shouldReplaceTags
          ? {
              tags: {
                deleteMany: {},
                create: tagNames.map((name) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name },
                      create: { name },
                    },
                  },
                })),
              },
            }
          : {}),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        executions: {
          select: {
            rating: true,
          },
        },
      },
    })

    const ratingSummary = summarizeRatings(updatedPrompt.executions)
    return NextResponse.json(toPromptResponse(updatedPrompt, ratingSummary))
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const existing = await prisma.prompt.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    await prisma.prompt.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Prompt deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
