/**
 * Tags API Routes
 *
 * GET  /api/v1/tags - List all tags
 * POST /api/v1/tags - Create new tag
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/tags
 * List all tags
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: { prompts: true }
        }
      }
    })

    // Transform response
    const response = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      prompt_count: tag._count.prompts
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/tags
 * Create a new tag
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate
    const existing = await prisma.tag.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 409 }
      )
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: { name }
    })

    const response = {
      id: tag.id,
      name: tag.name
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
