/**
 * Prompts API Routes
 *
 * GET  /api/v1/prompts - List prompts with pagination, search, and filters
 * POST /api/v1/prompts - Create new prompt
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/prompts
 * List prompts with optional pagination, search, and tag filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Search
    const search = searchParams.get('search') || ''

    // Tag filter
    const tagsParam = searchParams.get('tags') || ''
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : []

    // Build where clause
    const where: any = {}

    // Search filter (name, content, or description)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { content: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Tag filter
    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: tags
            }
          }
        }
      }
    }

    // Execute queries in parallel
    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        skip,
        take: limit,
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          executions: {
            select: {
              id: true,
              rating: true,
              executedAt: true
            },
            orderBy: {
              executedAt: 'desc'
            },
            take: 5  // Only last 5 executions
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.prompt.count({ where })
    ])

    // Transform response to match FastAPI format
    const transformedPrompts = prompts.map(prompt => ({
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      system_prompt: prompt.systemPrompt,
      description: prompt.description,
      created_at: prompt.createdAt.toISOString(),
      updated_at: prompt.updatedAt.toISOString(),
      tags: prompt.tags.map(pt => pt.tag),
      executions: prompt.executions.map(e => ({
        id: e.id,
        rating: e.rating,
        executed_at: e.executedAt.toISOString()
      }))
    }))

    return NextResponse.json({
      prompts: transformedPrompts,
      total,
      skip,
      limit
    })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/prompts
 * Create a new prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, content, system_prompt, description, tag_ids = [] } = body

    // Validation
    if (!name || !content) {
      return NextResponse.json(
        { error: 'name and content are required' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existing = await prisma.prompt.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Prompt with this name already exists' },
        { status: 409 }
      )
    }

    // Create prompt with tags
    const prompt = await prisma.prompt.create({
      data: {
        name,
        content,
        systemPrompt: system_prompt,
        description,
        tags: {
          create: tag_ids.map((tagId: number) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Transform response
    const response = {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      system_prompt: prompt.systemPrompt,
      description: prompt.description,
      created_at: prompt.createdAt.toISOString(),
      updated_at: prompt.updatedAt.toISOString(),
      tags: prompt.tags.map(pt => pt.tag)
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
