import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeTagNames, summarizeRatings, toPromptResponse } from '@/lib/prompt-utils'

export const runtime = 'nodejs'

function parseBoolean(value: string | null): boolean | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function parseTagFilter(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skip = Math.max(parseInt(searchParams.get('skip') || '0', 10), 0)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 250)
    const search = (searchParams.get('search') || '').trim()
    const tags = parseTagFilter(searchParams.get('tags'))
    const isFavorite = parseBoolean(searchParams.get('is_favorite'))

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { content: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags },
          },
        },
      }
    }

    if (typeof isFavorite === 'boolean') {
      where.isFavorite = isFavorite
    }

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.prompt.count({ where }),
    ])

    const transformed = prompts.map((prompt) => {
      const ratingSummary = summarizeRatings(prompt.executions)
      return toPromptResponse(prompt, ratingSummary)
    })

    return NextResponse.json({
      prompts: transformed,
      total,
      skip,
      limit,
    })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const title = String(body.title || body.name || '').trim()
    const content = String(body.content || '').trim()
    const systemPrompt = typeof body.system_prompt === 'string' ? body.system_prompt : null
    const description = typeof body.description === 'string' ? body.description : null
    const isFavorite = Boolean(body.is_favorite)
    const isTemplate = Boolean(body.is_template)

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      )
    }

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

    const tagNames = normalizeTagNames(body.tags)
    const tagIds = Array.isArray(body.tag_ids)
      ? body.tag_ids.filter((value: unknown) => typeof value === 'number')
      : []

    const prompt = await prisma.prompt.create({
      data: {
        name: title,
        content,
        systemPrompt,
        description,
        isFavorite,
        isTemplate,
        tags: {
          create: [
            ...tagNames.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
            ...tagIds.map((tagId: number) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          ],
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    return NextResponse.json(toPromptResponse(prompt), { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
